import { centsToMoney, decimalCents } from '../utils/validation.js';
// MODELO: el cliente nunca establece los precios oficiales.
export function orderAmount(items, productsById){
  let totalCents=0;
  const detail=items.map(({idProducto,cantidad})=>{
    const p=productsById.get(idProducto);
    const precioCents=decimalCents(p.precio,'precio en BD');
    const subtotal=precioCents*cantidad;
    if(!Number.isSafeInteger(subtotal)||subtotal>1e12) throw new Error('Total excede límite admitido');
    totalCents+=subtotal;
    return {idProducto,cantidad,precioUnitario:centsToMoney(precioCents),subtotal:centsToMoney(subtotal)};
  });
  if(!Number.isSafeInteger(totalCents)||totalCents>999999999999) throw new Error('Total inválido');
  return {total:centsToMoney(totalCents),detail};
}
