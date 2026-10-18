// MODELO: transforma el registro relacional a un objeto utilizable por React.
export function productDTO(row) {
  return {
    id:row.id_producto, name:row.nombre, description:row.descripcion,
    price:Number(row.precio), stock:Number(row.stock), image:row.imagen_url,
    category:row.categoria, categoryId:row.id_categoria, badge:row.etiqueta,
    available:Number(row.stock)>0
  };
}
