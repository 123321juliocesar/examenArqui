import { bad } from '../utils/errors.js';
import { decimalCents,intQuery,positiveId } from '../utils/validation.js';
export function parseFilters(query={}) {
  const q=query.q??'';
  if(typeof q!=='string'||q.length>100) throw bad('Búsqueda demasiado larga');
  const f={q:q.trim(), limit:intQuery(query.limit,'limit',1,50,30)};
  const cat=query.categoria??query.idCategoria;
  if(cat!==undefined&&cat!=='') f.categoria=positiveId(cat,'categoria');
  const min=query.precioMin??query.precio_min;
  const max=query.precioMax??query.precio_max;
  if(min!==undefined&&min!=='')f.precioMin=(decimalCents(min,'precioMin')/100).toFixed(2);
  if(max!==undefined&&max!=='')f.precioMax=(decimalCents(max,'precioMax')/100).toFixed(2);
  if(f.precioMin!==undefined&&f.precioMax!==undefined&&Number(f.precioMin)>Number(f.precioMax))throw bad('precioMin no puede superar precioMax');
  const disp=query.disponible;
  if(disp!==undefined){
    if(!['true','false','1','0'].includes(String(disp)))throw bad('disponible debe ser true o false');
    f.disponible=disp==='true'||disp==='1';
  }
  return f;
}
