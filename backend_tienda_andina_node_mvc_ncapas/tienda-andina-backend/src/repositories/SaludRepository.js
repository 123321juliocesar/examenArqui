import { pool } from '../config/db.js';
export class SaludRepository {
  static async checkDatabase() { await pool.query('SELECT 1'); return true; }
}
