import { PedidosService } from '../services/PedidosService.js';
export class PedidosController {
 static async create(req,res){res.status(201).json({pedido:await PedidosService.create(req.usuario.id_usuario,req.body)});}
 static async mine(req,res){res.json({pedidos:await PedidosService.listMine(req.usuario.id_usuario)});}
 static async all(_req,res){res.json({pedidos:await PedidosService.listAll()});}
 static async byId(req,res){res.json({pedido:await PedidosService.byId(req.params.id,req.usuario)});}
 static async close(req,res){res.json({pedido:await PedidosService.close(req.params.id,req.usuario.id_usuario,req.body)});}
}
