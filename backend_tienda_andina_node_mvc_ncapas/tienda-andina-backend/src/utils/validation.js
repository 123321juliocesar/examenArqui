import { bad } from './errors.js';
export function positiveId(raw,field='id') {
  const n=Number(raw);
  if(!Number.isSafeInteger(n)||n<1) throw bad(`${field} debe ser un entero positivo`);
  return n;
}
export function quantity(raw,field='cantidad') {
  const n=Number(raw);
  if(!Number.isSafeInteger(n)||n<1||n>100000) throw bad(`${field} debe ser entero entre 1 y 100000`);
  return n;
}
export function stringValue(raw,field,max=255,required=true) {
  if((raw===undefined||raw===null||String(raw).trim()==='')&&!required) return null;
  if(typeof raw!=='string'||!raw.trim()||raw.trim().length>max) throw bad(`${field} debe tener entre 1 y ${max} caracteres`);
  return raw.trim();
}
export function optionalString(raw,field,max=255) { return stringValue(raw,field,max,false); }
export function emailValue(email){
  const e=stringValue(email,'email',190).toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) throw bad('Correo electrónico inválido');
  return e;
}
export function decimalCents(value,field='precio') {
  if(typeof value!=='number' && typeof value!=='string') throw bad(`${field} inválido`);
  if(typeof value==='string'&&!/^\d+(\.\d{1,2})?$/.test(value)) throw bad(`${field} debe tener como máximo dos decimales`);
  if(typeof value==='number'&&!Number.isFinite(value)) throw bad(`${field} inválido`);
  const cents=Math.round(Number(value)*100);
  if(!Number.isSafeInteger(cents)||cents<0||Math.abs(cents/100-Number(value))>0.0000001) throw bad(`${field} inválido`);
  return cents;
}
export const centsToMoney=c=> (c/100).toFixed(2);
export function itemsNormalized(items, idField='idProducto', extraField='cantidad') {
  if(!Array.isArray(items)||items.length===0||items.length>30) throw bad('Debe enviar entre 1 y 30 productos');
  const ids=new Set();
  const result=items.map(item=>{
    if(!item||typeof item!=='object') throw bad('Artículo inválido');
    const idProducto=positiveId(item[idField]??item.id, 'idProducto');
    const cantidad=quantity(item[extraField]??item.qty);
    if(ids.has(idProducto)) throw bad('No repita el mismo producto; consolide las cantidades');
    ids.add(idProducto);
    return {idProducto,cantidad};
  });
  return result.sort((a,b)=>a.idProducto-b.idProducto);
}
export function costItemsNormalized(items) {
  const normalized=itemsNormalized(items);
  return normalized.map((v,index)=>{
    const item=items.find(i=>Number(i.idProducto??i.id)===v.idProducto);
    const cost=decimalCents(item.costoUnitario,'costoUnitario');
    return {...v,costoUnitario:centsToMoney(cost)};
  });
}
export function intQuery(raw,field,min,max,defaultValue) {
  if(raw===undefined||raw==='') return defaultValue;
  const n=Number(raw);
  if(!Number.isSafeInteger(n)||n<min||n>max) throw bad(`${field} debe estar entre ${min} y ${max}`);
  return n;
}
