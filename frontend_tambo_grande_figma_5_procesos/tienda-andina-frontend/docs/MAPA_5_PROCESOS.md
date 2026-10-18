# Exposición — trazabilidad de los cinco procesos

Cada integrante debe demostrar desde el mismo frontend un **proceso de negocio completo**, incluidos los pasos de pedido y cierre manual de entrega/cobro. Los archivos de backend citados pertenecen al ZIP `backend_tienda_andina_node_mvc_ncapas.zip` entregado anteriormente.

## 1. Registro → primer pedido → entrega/cobro
1. Cliente escribe nombre, DNI, correo, contraseña (`AuthModal.tsx`).
2. `api.register` → `POST /api/auth/registro`.
3. `AuthController.register` → `AuthService.register` → `createUsuarioModel`.
4. `UsuarioRepository.create` → tabla `usuarios` (`password_hash`, no contraseña plana).
5. API devuelve `{token, usuario}`; App guarda sesión.
6. Cliente selecciona productos → `CartSidebar.tsx` → `api.placeOrder`.
7. `PedidosService.create` → `PedidoRepository` → `pedidos` y `pedido_detalles`; transacción actualiza `productos` y `movimientos_stock`.
8. El administrador confirma entrega/cobro desde `OrdersPanel.tsx` → `PedidosService.close` → `pagos` y `pedidos.estado=ENTREGADO`.
**Resultado:** cliente registrado y compra entregada/cobrada. Error de correo duplicado es 409; stock insuficiente es 409 y no descuenta.

## 2. Necesidad → autocompletado → compra cerrada
1. Cliente escribe `qui` (`Products.tsx`).
2. React espera 320ms y envía `GET /api/productos/buscar?q=qui`.
3. `ProductosController.search` → `ProductosService.search` → `ProductoRepository.list`.
4. SELECT SQL `nombre LIKE '%qui%'` en vista `vw_catalogo`, que usa `productos`/`categorias`.
5. JSON `{sugerencias}` → React muestra Quinua Orgánica.
6. Cliente selecciona, añade al carrito, crea pedido.
7. Administrador registra entrega/cobro como proceso 1.
**Resultado:** un producto encontrado y vendido. Para 0 coincidencias React muestra mensaje sin error.

## 3. Condiciones → filtro combinado → compra cerrada
1. Cliente elige Lácteos + precio máximo S/15 + disponible.
2. `Products.tsx` construye URLSearchParams y solicita `GET /api/productos?...`.
3. `ProductosController.list` → `ProductosService.list` → `parseFilters`.
4. `ProductoRepository.list` construye WHERE con parámetros seguros.
5. MySQL filtra `vw_catalogo`, devuelve productos.
6. Cliente elige y agrega al carrito, confirma pedido.
7. Administrador registra entrega/cobro.
**Resultado:** compra completada usando criterios de filtro. Error de rango inválido devuelve 400.

## 4. Carrito → validación → descuento → pedido entregado
1. `Products.tsx` añade un `CartItem` a `App.tsx`.
2. `CartSidebar.tsx` modifica cantidades y dirección.
3. Envía solo `{idProducto,cantidad}` y dirección a `POST /api/pedidos`.
4. `PedidosController.create` → `PedidosService.create` → `ProductoRepository.lockIds` con `FOR UPDATE`.
5. SQL valida existencias y precios; `PedidoRepository.create` y `insertDetail`.
6. Actualiza `productos.stock` y agrega `movimientos_stock` en la misma transacción.
7. React muestra ID pedido devuelto y `OrdersPanel` lo detalla.
8. Admin verifica entrega/cobro, `/api/pedidos/:id/cerrar` → `pagos` y estado ENTREGADO.
**Resultado:** pedido y cobro registrados; si falla SQL se hace rollback y carrito permanece.

## 5. Stock bajo → proveedor → recepción → venta → stock final
1. Admin entra a `InventoryPanel.tsx`, consulta stock bajo `/api/inventario/stock-bajo`.
2. Elige proveedor y productos/cantidades, `POST /api/reposiciones`.
3. `ComprasController.create` → `ComprasService.create` → `CompraRepository.create`.
4. MySQL inserta `compras_proveedor` + `compra_detalles` estado GENERADA.
5. El proveedor entrega; administrador localiza ID y registra `POST /api/reposiciones/:id/recibir`.
6. `ComprasService.receive` ejecuta transacción con bloqueo y anti-duplicación `recepciones_proveedor.UNIQUE(id_compra)`.
7. MySQL actualiza `productos.stock`, inserta `movimientos_stock` tipo ENTRADA_PROVEEDOR.
8. Cliente compra el producto; `PedidosService.create` descuenta y genera movimiento SALIDA_VENTA.
9. Administrador entrega y registra cobro; consulta la trazabilidad en `/api/inventario/movimientos/:idProducto`.
**Resultado:** stock final verificable, orden recibida una sola vez y venta registrada.

**Decisión técnica común:** arquitectura N capas MVC en backend (rutas → controlador → servicio → repositorio → MySQL) frente a concentrar SQL y lógica en React. React nunca accede directamente a MySQL. La lógica crítica de inventario y cobro está en el servicio y las transacciones del servidor.
