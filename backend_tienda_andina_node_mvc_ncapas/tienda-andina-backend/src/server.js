import 'dotenv/config';
import { app } from './app.js';
import { pool } from './config/db.js';
const secret=process.env.JWT_SECRET;
if(!secret||secret.length<32||secret==='CAMBIA_ESTE_SECRETO_POR_UNO_ALEATORIO_DE_32_CARACTERES'){
  console.error('Configure JWT_SECRET aleatorio de mínimo 32 caracteres en .env');process.exit(1);
}
try {
 await pool.query('SELECT 1');
 const port=Number(process.env.PORT||4000);
 app.listen(port,()=>console.log(`API Tienda Andina iniciada en http://localhost:${port}`));
} catch(e){
 console.error('No se pudo conectar a MySQL. Revise .env, servidor MySQL y base importada:',e.message);
 process.exitCode=1;await pool.end();
}
