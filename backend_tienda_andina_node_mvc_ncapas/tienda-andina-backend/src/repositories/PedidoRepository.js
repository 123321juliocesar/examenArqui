import { pool } from '../config/db.js';
export class PedidoRepository {
 static async create({idUsuario,total,direccion,notas},db){
  const [r]=await db.execute(`INSERT INTO pedidos (id_usuario,estado,total,direccion_entrega,notas) VALUES (?,'CONFIRMADO',?,?,?)`,[idUsuario,total,direccion,notas]);
  return r.insertId;
 }
 static async insertDetail(idPedido,item,db){await db.execute(
  'INSERT INTO pedido_detalles(id_pedido,id_producto,cantidad,precio_unitario) VALUES (?,?,?,?)',
  [idPedido,item.idProducto,item.cantidad,item.precioUnitario]);}
 static async insertStockMovement(idPedido,item,anterior,nuevo,db){await db.execute(
  `INSERT INTO movimientos_stock(id_producto,tipo,cantidad,stock_anterior,stock_nuevo,id_pedido) VALUES (?,'SALIDA_VENTA',?,?,?,?)`,
  [item.idProducto,item.cantidad,anterior,nuevo,idPedido]);}
 static async lockById(id,db){const [r]=await db.execute('SELECT * FROM pedidos WHERE id_pedido=? FOR UPDATE',[id]);return r[0]||null;}
 static async close(id,idAdmin,db){const [r]=await db.execute(`UPDATE pedidos SET estado='ENTREGADO',entregado_en=NOW(),id_usuario_cierra=? WHERE id_pedido=? AND estado='CONFIRMADO'`,[idAdmin,id]);return r.affectedRows;}
 static async insertPayment(idPedido,idAdmin,medio,monto,referencia,observacion,db){
  await db.execute('INSERT INTO pagos(id_pedido,id_usuario_registra,medio,monto,referencia,observacion) VALUES (?,?,?,?,?,?)',[idPedido,idAdmin,medio,monto,referencia,observacion]);
 }
 static async byId(id,db=pool){
  const [h]=await db.execute('SELECT * FROM pedidos WHERE id_pedido=?',[id]);
  if(!h.length)return null;
  const [d]=await db.execute(`SELECT pd.id_producto,p.nombre,pd.cantidad,pd.precio_unitario,pd.subtotal FROM pedido_detalles pd JOIN productos p ON p.id_producto=pd.id_producto WHERE pd.id_pedido=? ORDER BY pd.id_producto`,[id]);
  const [p]=await db.execute('SELECT medio,monto,referencia,registrado_en FROM pagos WHERE id_pedido=?',[id]);
  return {...h[0],items:d,pago:p[0]||null};
 }
 static async listByUser(id,db=pool){const [r]=await db.execute('SELECT id_pedido,estado,total,creado_en,entregado_en FROM pedidos WHERE id_usuario=? ORDER BY id_pedido DESC LIMIT 100',[id]);return r;}
 static async listAll(db=pool){const [r]=await db.query('SELECT id_pedido,id_usuario,estado,total,creado_en,entregado_en FROM pedidos ORDER BY id_pedido DESC LIMIT 100');return r;}
}
