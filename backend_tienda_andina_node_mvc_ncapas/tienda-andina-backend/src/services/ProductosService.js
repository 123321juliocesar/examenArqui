import { ProductoRepository } from '../repositories/ProductoRepository.js';
import { CategoriaRepository } from '../repositories/CategoriaRepository.js';
import { productDTO } from '../models/Producto.js';
import { notFound } from '../utils/errors.js';
import { positiveId } from '../utils/validation.js';
import { parseFilters } from '../models/Filtro.js';
export class ProductosService {
 static async list(query){return (await ProductoRepository.list(parseFilters(query))).map(productDTO);}
 static async search(query){
  if(typeof query.q!=='string'||query.q.trim().length<2) return [];
  return this.list({...query,limit:8});
 }
 static async byId(id){const p=await ProductoRepository.byId(positiveId(id));if(!p)throw notFound('Producto no encontrado');return productDTO(p);}
 static async categories(){return CategoriaRepository.list();}
 static async low(){return ProductoRepository.lowStock();}
}
