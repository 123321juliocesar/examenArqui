import { withTransaction } from '../config/db.js';
import { CompraRepository } from '../repositories/CompraRepository.js';
import { ProductoRepository } from '../repositories/ProductoRepository.js';
import { bad, conflict, notFound } from '../utils/errors.js';
import { costItemsNormalized, optionalString, positiveId } from '../utils/validation.js';
export class ComprasService {
 static async suppliers(){return CompraRepository.suppliers();}
 static async byId(id){const r=await CompraRepository.byId(positiveId(id,'idCompra'));if(!r)throw notFound('Compra no encontrada');return r;}
 static async create(idAdmin,body){
  const idProveedor=positiveId(body?.idProveedor,'idProveedor');
  const items=costItemsNormalized(body?.items);
  const observacion=optionalString(body?.observacion,'observacion');
  return withTransaction(async db=>{
    if(!await CompraRepository.existsSupplier(idProveedor,db))throw notFound('Proveedor no encontrado');
    const rows=await ProductoRepository.lockIds(items.map(i=>i.idProducto),db);
    if(rows.length!==items.length)throw bad('Uno de los productos no existe');
    const idCompra=await CompraRepository.create(idProveedor,idAdmin,observacion,db);
    for(const item of items)await CompraRepository.addDetail(idCompra,item,db);
    return {idCompra,idProveedor,estado:'GENERADA',items};
  });
 }
 static async receive(id,idAdmin,body){
  const idCompra=positiveId(id,'idCompra');
  const observacion=optionalString(body?.observacion,'observacion');
  return withTransaction(async db=>{
    const compra=await CompraRepository.lockById(idCompra,db);
    if(!compra)throw notFound('Orden de compra no encontrada');
    if(compra.estado!=='GENERADA')throw conflict('Esta orden ya fue recibida o anulada');
    const items=await CompraRepository.findDetails(idCompra,db);
    if(!items.length)throw bad('La orden no tiene productos');
    const rows=await ProductoRepository.lockIds(items.map(i=>i.id_producto),db);
    const byId=new Map(rows.map(i=>[i.id_producto,i]));
    if(byId.size!==items.length)throw conflict('Producto de la compra no encontrado');
    // UNIQUE(id_compra) en recepciones también impide una segunda recepción.
    await CompraRepository.receive(idCompra,idAdmin,observacion,db);
    for(const item of items){
      const product=byId.get(item.id_producto);
      if(!product.activo)throw conflict(`Producto ${item.id_producto} inactivo`);
      const nuevo=product.stock+item.cantidad;
      if(!Number.isSafeInteger(nuevo)||nuevo>2147483647)throw bad('Stock fuera de rango');
      const affected=await ProductoRepository.changeStock(item.id_producto,item.cantidad,db);
      if(affected!==1)throw conflict('No se pudo ingresar el stock');
      await CompraRepository.recordEntry(idCompra,item.id_producto,item.cantidad,product.stock,nuevo,db);
    }
    if(await CompraRepository.markReceived(idCompra,db)!==1)throw conflict('No se pudo marcar la recepción');
    return {idCompra,estado:'RECIBIDA',items:items.map(i=>({idProducto:i.id_producto,cantidad:i.cantidad}))};
  });
 }
 static async movements(id){return CompraRepository.movements(positiveId(id,'idProducto'));}
}
