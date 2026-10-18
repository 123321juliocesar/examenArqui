import { withTransaction } from '../config/db.js';
import { ProductoRepository } from '../repositories/ProductoRepository.js';
import { PedidoRepository } from '../repositories/PedidoRepository.js';
import { orderAmount } from '../models/Pedido.js';
import { bad, notFound, conflict, forbidden } from '../utils/errors.js';
import { centsToMoney, decimalCents, itemsNormalized, optionalString, positiveId } from '../utils/validation.js';
export class PedidosService {
 static async create(idUsuario,body){
  if(!body||typeof body!=='object')throw bad('Cuerpo del pedido inválido');
  const items=itemsNormalized(body.items??body.articulos??body.productos);
  const direccion=optionalString(body.direccionEntrega??body.direccion,'direccionEntrega');
  const notas=optionalString(body.notas,'notas');
  const created=await withTransaction(async db=>{
    const rows=await ProductoRepository.lockIds(items.map(i=>i.idProducto),db);
    const byId=new Map(rows.map(row=>[row.id_producto,row]));
    for(const item of items){
      const product=byId.get(item.idProducto);
      if(!product||!product.activo)throw conflict(`Producto ${item.idProducto} no disponible`);
      if(product.stock<item.cantidad)throw conflict(`Stock insuficiente para producto ${item.idProducto}: disponible ${product.stock}`);
    }
    const {total,detail}=orderAmount(items,byId);
    if(decimalCents(total)===0)throw bad('No se puede crear un pedido con total cero');
    const idPedido=await PedidoRepository.create({idUsuario,total,direccion,notas},db);
    for(const item of detail){
      const original=byId.get(item.idProducto);
      await PedidoRepository.insertDetail(idPedido,item,db);
      const updated=await ProductoRepository.changeStock(item.idProducto,-item.cantidad,db);
      if(updated!==1) throw conflict('Se agotó un producto. No se registró el pedido');
      await PedidoRepository.insertStockMovement(idPedido,item,original.stock,original.stock-item.cantidad,db);
    }
    return {idPedido,total,estado:'CONFIRMADO',items:detail};
  });
  return created;
 }
 static async listMine(idUsuario){return PedidoRepository.listByUser(idUsuario);}
 static async listAll(){return PedidoRepository.listAll();}
 static async byId(id,actor){
  const order=await PedidoRepository.byId(positiveId(id,'idPedido'));
  if(!order)throw notFound('Pedido no encontrado');
  if(actor.rol!=='ADMIN'&&order.id_usuario!==actor.id_usuario)throw forbidden();
  return order;
 }
 static async close(id,adminId,body){
  const orderId=positiveId(id,'idPedido');
  const medio=String(body?.medio??'').toUpperCase();
  if(!['EFECTIVO','TRANSFERENCIA','SIMULADO'].includes(medio))throw bad('medio debe ser EFECTIVO, TRANSFERENCIA o SIMULADO');
  const cents=decimalCents(body?.monto,'monto');
  if(cents<=0)throw bad('El monto debe ser positivo');
  const referencia=optionalString(body?.referencia,'referencia',100);
  const observacion=optionalString(body?.observacion,'observacion');
  if(medio==='TRANSFERENCIA'&&!referencia)throw bad('Referencia requerida para transferencia');
  const resultado=await withTransaction(async db=>{
    const pedido=await PedidoRepository.lockById(orderId,db);
    if(!pedido)throw notFound('Pedido no encontrado');
    if(pedido.estado!=='CONFIRMADO')throw conflict('El pedido ya fue cerrado o cancelado');
    if(decimalCents(pedido.total)!==cents)throw bad('Monto cobrado no coincide con el total del pedido');
    await PedidoRepository.insertPayment(orderId,adminId,medio,centsToMoney(cents),referencia,observacion,db);
    if(await PedidoRepository.close(orderId,adminId,db)!==1)throw conflict('No se pudo cerrar el pedido');
    return {idPedido:orderId,estado:'ENTREGADO',monto:centsToMoney(cents),medio,
      advertencia:medio==='SIMULADO'?'Pago simulado: no equivale a dinero realmente recibido':undefined};
  });
  return resultado;
 }
}
