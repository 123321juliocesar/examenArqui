# Guía de prueba manual (para entregar y exponer)

**Antes de comenzar:** en dos terminales distintas, ejecutar backend `npm run dev` en puerto 4000 y frontend `npm run dev` en 5173. Importar previamente `db/tienda_andina_5_procesos.sql` del backend.

### Integrante 1 — Crear perfil y primera venta
1. Abrir `http://localhost:5173` y seleccionar «Iniciar sesión» > «Registrarse».
2. Registrar una persona natural con DNI de prueba (o una persona jurídica con RUC), correo no duplicado, teléfono y contraseña.
3. Comprobar tabla `usuarios` con `SELECT id_usuario,email,rol,tipo_persona FROM usuarios ORDER BY id_usuario DESC;`.
4. Desde la tienda agregar un producto y generar un pedido. Iniciar sesión de administrador y cerrarlo como SIMULADO; comprobar tablas `pedidos` y `pagos`.
5. Probar rechazo de correo duplicado (409).

### Integrante 2 — Búsqueda predictiva
1. En Tienda, escribir `qui`. Debe sugerir el producto de quinua sin pulsar Enter.
2. Elegir la sugerencia: el catálogo se filtra y puede agregarse al carrito.
3. Hacer un pedido, cerrar entrega/cobro con el usuario admin (SIMULADO).
4. Probar `zzzz`; no debe haber sugerencias.

### Integrante 3 — Filtros combinados
1. Elegir `Lácteos`, rango `0` a `15`, activar «Solo con stock».
2. Verificar que cada resultado cumple condiciones.
3. Agregar uno al carrito, confirmar y completar entrega/cobro con admin.
4. Probar precio mínimo mayor al máximo: mensaje de error, sin modificar la base.

### Integrante 4 — Carrito y pedido
1. Iniciar sesión; agregar dos productos, cambiar cantidades y quitar uno.
2. Escribir dirección de entrega y confirmar pedido. Se mostrará un número de pedido real.
3. Abrir «Mis pedidos» y consultar detalles. La lista procede de la tabla `pedidos`.
4. Abrir «Pedidos recibidos» con cuenta admin. Seleccionar pedido y simular entrega/cobro. Estado ENTREGADO.
5. Verificar stock inicial y final, y registros en `movimientos_stock`.
6. Forzar stock insuficiente desde MySQL o vender todas las unidades disponibles. Se debe mostrar 409 sin pedido parcial.

### Integrante 5 — Recepción y stock
1. Usar un usuario con `rol='ADMIN'` y pulsar «Inventario».
2. Revisar alertas de stock bajo, elegir proveedor, producto, cantidad 10 y costo S/ 4.00.
3. Crear orden y anotar el ID. Stock no cambia todavía.
4. En «Recibir mercadería», consultar el ID y confirmar recepción. Stock aumenta 10, se inserta movimiento `ENTRADA_PROVEEDOR`.
5. Intentar recibir por segunda vez. Debe ser rechazado porque la orden ya está RECIBIDA.
6. Vender una unidad en la tienda (cliente), comprobar movimiento de salida y stock final. Admin cierra venta.

## Consultas SQL para la presentación

```sql
USE tienda_andina_5_procesos;
SELECT id_usuario,tipo_persona,rol,email FROM usuarios ORDER BY id_usuario DESC LIMIT 10;
SELECT id_producto,nombre,precio,stock FROM productos ORDER BY id_producto;
SELECT id_pedido,id_usuario,estado,total FROM pedidos ORDER BY id_pedido DESC LIMIT 10;
SELECT id_pedido,id_producto,cantidad,precio_unitario FROM pedido_detalles ORDER BY id_detalle DESC LIMIT 10;
SELECT id_compra,estado,id_proveedor,creado_en,recibido_en FROM compras_proveedor ORDER BY id_compra DESC LIMIT 10;
SELECT id_producto,tipo,cantidad,stock_anterior,stock_nuevo,id_compra,id_pedido FROM movimientos_stock ORDER BY id_movimiento DESC LIMIT 20;
SELECT id_pedido,medio,monto FROM pagos ORDER BY id_pago DESC LIMIT 10;
```

Todas las operaciones de pedidos y recepciones requieren que el backend reciba un JWT válido. No se puede comprar como anónimo ni recibir mercancía siendo CLIENTE. Verifica la cuenta administrador en el README.
