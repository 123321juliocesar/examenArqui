import { pool } from '../config/db.js';
const fields='id_usuario,tipo_persona,rol,nombre,apellido,dni,fecha_nacimiento,razon_social,ruc,representante,cargo,rubro,direccion,telefono,email,activo';
export class UsuarioRepository {
  static async findByEmail(email,db=pool){
    const [rows]=await db.execute('SELECT * FROM usuarios WHERE email=? LIMIT 1',[email]);
    return rows[0]||null;
  }
  static async findById(id,db=pool){
    const [rows]=await db.execute(`SELECT ${fields} FROM usuarios WHERE id_usuario=? AND activo=1 LIMIT 1`,[id]);
    return rows[0]||null;
  }
  static async create(data,db=pool){
    const cols=Object.keys(data);
    const [result]=await db.execute(`INSERT INTO usuarios (${cols.join(',')}) VALUES (${cols.map(()=>'?').join(',')})`,Object.values(data));
    return result.insertId;
  }
}
// Actualiza únicamente campos no sensibles del perfil autenticado.
UsuarioRepository.updateProfile = async (id,data,db=pool)=>{
  const allowed=['telefono','direccion'];
  const keys=allowed.filter(key=>data[key]!==undefined);
  if(keys.length===0)return;
  await db.execute(`UPDATE usuarios SET ${keys.map(key=>`${key}=?`).join(',')} WHERE id_usuario=?`,[
    ...keys.map(key=>data[key]),id
  ]);
};
