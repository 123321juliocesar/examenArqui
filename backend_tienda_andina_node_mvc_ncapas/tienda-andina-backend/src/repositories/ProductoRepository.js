import { pool } from '../config/db.js';
export class ProductoRepository {
  static async list(filters={},db=pool){
    const where=['1=1']; const params=[];
    if(filters.q){where.push('nombre LIKE ?');params.push(`%${filters.q}%`);}
    if(filters.categoria){where.push('id_categoria=?');params.push(filters.categoria);}
    if(filters.precioMin!==undefined){where.push('precio>=?');params.push(filters.precioMin);}
    if(filters.precioMax!==undefined){where.push('precio<=?');params.push(filters.precioMax);}
    if(filters.disponible){where.push('stock>0');}
    const limit=filters.limit??50;
    // LIMIT se valida a entero en servicio, no se usa entrada arbitraria.
    const [rows]=await db.query(`SELECT * FROM vw_catalogo WHERE ${where.join(' AND ')} ORDER BY id_producto LIMIT ${limit}`,params);
    return rows;
  }
  static async byId(id,db=pool){
    const [r]=await db.execute('SELECT * FROM vw_catalogo WHERE id_producto=?',[id]);return r[0]||null;
  }
  static async lockIds(ids,db){
    // Orden ascendente evita interbloqueos en compras simultáneas.
    const [rows]=await db.query(`SELECT id_producto,precio,stock,activo FROM productos WHERE id_producto IN (${ids.map(()=>'?').join(',')}) ORDER BY id_producto FOR UPDATE`,ids);
    return rows;
  }
  static async changeStock(id,amount,db){
    const [r]=await db.execute('UPDATE productos SET stock=stock+? WHERE id_producto=? AND stock+?>=0',[amount,id,amount]);
    return r.affectedRows;
  }
  static async lowStock(db=pool){const [r]=await db.query('SELECT * FROM vw_stock_bajo ORDER BY stock,id_producto');return r;}
}
