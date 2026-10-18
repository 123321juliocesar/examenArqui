import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UsuarioRepository } from '../repositories/UsuarioRepository.js';
import { createUsuarioModel, publicUsuario } from '../models/Usuario.js';
import { emailValue, stringValue, optionalString, positiveId } from '../utils/validation.js';
import { bad, conflict, notFound, unauthorized } from '../utils/errors.js';
const sign = (id)=>jwt.sign({sub:String(id)},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN||'8h'});
export class AuthService {
  static async register(body){
    const password=body.password;
    if(typeof password!=='string'||password.length<6||password.length>72) throw bad('Contraseña: entre 6 y 72 caracteres');
    const hash=await bcrypt.hash(password,12);
    const model=createUsuarioModel(body,hash);
    if(await UsuarioRepository.findByEmail(model.email)) throw conflict('El correo ya está registrado');
    const id=await UsuarioRepository.create(model);
    return {token:sign(id),usuario:publicUsuario(await UsuarioRepository.findById(id))};
  }
  static async login(body){
    const email=emailValue(body.email);
    const password=body.password;
    if(typeof password!=='string') throw bad('Contraseña requerida');
    const user=await UsuarioRepository.findByEmail(email);
    if(!user||!user.activo||!(await bcrypt.compare(password,user.password_hash))) throw unauthorized();
    return {token:sign(user.id_usuario),usuario:publicUsuario(user)};
  }
  static async me(id){
    const user=await UsuarioRepository.findById(positiveId(id));
    if(!user) throw notFound('Usuario no encontrado');
    return publicUsuario(user);
  }
  static async updateProfile(id,body){
    if(!body||typeof body!=='object'||Array.isArray(body)) throw bad('Datos de perfil inválidos');
    const update={};
    if('telefono' in body) update.telefono=stringValue(body.telefono,'telefono',20);
    if('direccion' in body) update.direccion=optionalString(body.direccion,'direccion',255);
    if(!Object.keys(update).length)throw bad('Envíe telefono o direccion para actualizar');
    await UsuarioRepository.updateProfile(id,update);
    return this.me(id);
  }
}
