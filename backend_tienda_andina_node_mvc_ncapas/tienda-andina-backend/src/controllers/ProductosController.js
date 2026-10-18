import { ProductosService } from '../services/ProductosService.js';
export class ProductosController {
 static async list(req,res){res.json({productos:await ProductosService.list(req.query)});}
 static async search(req,res){res.json({sugerencias:await ProductosService.search(req.query)});}
 static async byId(req,res){res.json({producto:await ProductosService.byId(req.params.id)});}
 static async categories(_req,res){res.json({categorias:await ProductosService.categories()});}
 static async lowStock(_req,res){res.json({productos:await ProductosService.low()});}
}
