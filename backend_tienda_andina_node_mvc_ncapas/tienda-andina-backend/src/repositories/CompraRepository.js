import { pool } from '../config/db.js';
export class CompraRepository {
 static async suppliers(db=pool){const [r]=await db.query('SELECT id_proveedor,nombre,ruc,contacto,telefono FROM proveedores WHERE activo=1 ORDER BY nombre');return r;}
 static async existsSupplier(id,db){const [r]=await db.execute('SELECT id_proveedor FROM proveedores WHERE id_proveedor=? AND activo=1',[id]);return r.length>0;}
 static async create(idProveedor,idAdmin,observacion,db){const [r]=await db.execute(
  'INSERT INTO compras_proveedor(id_proveedor,id_responsable,observacion) VALUES (?,?,?)',[idProveedor,idAdmin,observacion]);return r.insertId;}
 static async addDetail(idCompra,item,db){await db.execute('INSERT INTO compra_detalles(id_compra,id_producto,cantidad,costo_unitario) VALUES (?,?,?,?)',[idCompra,item.idProducto,item.cantidad,item.costoUnitario]);}
 static async lockById(id,db){const [r]=await db.execute('SELECT * FROM compras_proveedor WHERE id_compra=? FOR UPDATE',[id]);return r[0]||null;}
 static async findDetails(id,db){const [r]=await db.execute('SELECT id_producto,cantidad,costo_unitario FROM compra_detalles WHERE id_compra=? ORDER BY id_producto',[id]);return r;}
 static async receive(id,idAdmin,observation,db){const [r]=await db.execute('INSERT INTO recepciones_proveedor(id_compra,id_usuario_recibe,observacion) VALUES (?,?,?)',[id,idAdmin,observation]);return r.insertId;}
 static async markReceived(id,db){const [r]=await db.execute(`UPDATE compras_proveedor SET estado='RECIBIDA',recibido_en=NOW() WHERE id_compra=? AND estado='GENERADA'`,[id]);return r.affectedRows;}
 static async recordEntry(idCompra,idProducto,cantidad,antes,despues,db){await db.execute(
  `INSERT INTO movimientos_stock (id_producto,tipo,cantidad,stock_anterior,stock_nuevo,id_compra) VALUES (?,'ENTRADA_PROVEEDOR',?,?,?,?)`,
  [idProducto,cantidad,antes,despues,idCompra]);}
 static async byId(id,db=pool){const [r]=await db.execute('SELECT * FROM compras_proveedor WHERE id_compra=?',[id]);if(!r.length)return null;
  const [items]=await db.execute('SELECT id_producto,cantidad,costo_unitario,subtotal FROM compra_detalles WHERE id_compra=?',[id]);return {...r[0],items};}
 static async movements(idProducto,db=pool){const [r]=await db.execute('SELECT * FROM movimientos_stock WHERE id_producto=? ORDER BY id_movimiento DESC LIMIT 100',[idProducto]);return r;}
}
