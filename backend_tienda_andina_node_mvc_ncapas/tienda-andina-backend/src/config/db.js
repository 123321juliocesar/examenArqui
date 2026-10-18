import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tienda_andina_5_procesos',
  waitForConnections: true,
  connectionLimit: 10,
  decimalNumbers: false,
  dateStrings: true,
  timezone: 'Z'
});

// Misma conexión en todas las operaciones de una transacción.
export async function withTransaction(work) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    try { await connection.rollback(); } catch (rollbackError) { console.error('Error ROLLBACK:', rollbackError); }
    throw error;
  } finally { connection.release(); }
}
