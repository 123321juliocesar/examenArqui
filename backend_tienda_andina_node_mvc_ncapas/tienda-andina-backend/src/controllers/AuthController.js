import { AuthService } from '../services/AuthService.js';
export class AuthController {
 static async register(req,res){res.status(201).json(await AuthService.register(req.body));}
 static async login(req,res){res.json(await AuthService.login(req.body));}
 static async me(req,res){res.json({usuario:await AuthService.me(req.usuario.id_usuario)});}
 static async updateMe(req,res){res.json({usuario:await AuthService.updateProfile(req.usuario.id_usuario,req.body)});}
}
