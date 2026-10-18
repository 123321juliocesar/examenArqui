import { ComprasService } from '../services/ComprasService.js';
export class ComprasController {
 static async suppliers(_req,res){res.json({proveedores:await ComprasService.suppliers()});}
 static async byId(req,res){res.json({compra:await ComprasService.byId(req.params.id)});}
 static async create(req,res){res.status(201).json({compra:await ComprasService.create(req.usuario.id_usuario,req.body)});}
 static async receive(req,res){res.json({recepcion:await ComprasService.receive(req.params.id,req.usuario.id_usuario,req.body)});}
 static async movements(req,res){res.json({movimientos:await ComprasService.movements(req.params.idProducto)});}
}
