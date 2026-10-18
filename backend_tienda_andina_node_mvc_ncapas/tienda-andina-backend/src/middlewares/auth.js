import jwt from 'jsonwebtoken';
import { UsuarioRepository } from '../repositories/UsuarioRepository.js';
import { forbidden, unauthorized } from '../utils/errors.js';
export async function requireAuth(req,_res,next){
 try {
  const match=/^Bearer (.+)$/i.exec(req.headers.authorization||'');
  if(!match)throw unauthorized();
  const token=jwt.verify(match[1],process.env.JWT_SECRET,{algorithms:['HS256']});
  const id=Number(token.sub);
  if(!Number.isSafeInteger(id)||id<1)throw unauthorized();
  const user=await UsuarioRepository.findById(id);
  if(!user)throw unauthorized();
  req.usuario=user; // Nunca confiar en el rol pasado por el cliente.
  next();
 } catch(e){
  if(e instanceof jwt.JsonWebTokenError||e instanceof jwt.TokenExpiredError) next(unauthorized());
  else next(e);
 }
}
export const requireAdmin=(req,_res,next)=>req.usuario?.rol==='ADMIN'?next():next(forbidden());
