import { pool } from '../config/db.js';
export class CategoriaRepository {
  static async list(){
    const [rows]=await pool.query('SELECT id_categoria AS id,nombre FROM categorias WHERE activa=1 ORDER BY nombre');
    return rows;
  }
}
