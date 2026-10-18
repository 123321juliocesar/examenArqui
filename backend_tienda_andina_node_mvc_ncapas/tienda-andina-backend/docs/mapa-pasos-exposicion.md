# Guion técnico de exposición — cinco procesos reales

Cada integrante expone un evento de negocio, la secuencia hasta la venta entregada/cobrada o inventario actualizado y el código que participa. Las rutas son propuestas implementadas en este backend. En la demostración usar `medio=SIMULADO` si no se percibe dinero real.

## Proceso 1 — Registro → primer pedido → venta cerrada

1. Cliente envía nombre, DNI, teléfono y email al `AuthModal.tsx` (frontend externo).
2. `POST /api/auth/registro` llega a `routes/auth.routes.js`.
3. `AuthController.register` llama a `AuthService.register`.
4. `models/Usuario.createUsuarioModel` valida campos, `bcrypt` genera hash.
5. `UsuarioRepository.create` inserta en `usuarios` (sin rol ADMIN).
6. `AuthService` devuelve JWT + perfil (sin hash de contraseña).
7. React consulta productos `GET /api/productos`.
8. El cliente arma carrito y lo envía a `POST /api/pedidos` con JWT.
9. `PedidosService.create` valida inventario y almacena `pedidos`, `pedido_detalles`, `movimientos_stock`.
10. Tras entregar y cobrar, ADMIN llama `POST /api/pedidos/:id/cerrar`.
11. `PedidosService.close` inserta `pagos` y marca `ENTREGADO` en una transacción.
12. Resultado: usuario + pedido + cobro registrados; evidencia SQL en `vw_ventas_cerradas`.

**Dato rastreable:** email usuario → `usuarios.id_usuario` → `pedidos.id_usuario` → `pagos.id_pedido`.

## Proceso 2 — Necesidad → autocompletado → venta

1. Cliente escribe `qui` en `SearchBar.tsx` (por crear).
2. React espera unos 250 ms (debounce) y envía `GET /api/productos/buscar?q=qui`.
3. `productos.routes.js` enruta a `ProductosController.search`.
4. `ProductosService.search` exige al menos 2 caracteres.
5. `ProductoRepository.list` consulta `vw_catalogo` con `nombre LIKE ?`.
6. `Producto.productDTO` adapta datos a React.
7. React presenta sugerencias, cliente selecciona `Quinua Orgánica 500g`.
8. Cliente confirma cantidad en carrito vía `POST /api/pedidos`.
9. `PedidosService` valida y descuenta stock y registra pedido.
10. ADMIN cierra pedido contraentrega en `/api/pedidos/:id/cerrar`.
11. Resultado: sugerencia convertida en pedido entregado; hay filas en `pedidos` y `pagos`.

**Dato rastreable:** `q=qui` → SQL `LIKE '%qui%'` → `id_producto=4` → `pedido_detalles.id_producto=4`.

## Proceso 3 — Necesidad → filtros combinados → venta

1. Cliente elige categoría lácteos, precio máximo S/15, disponibilidad.
2. Frontend envía `GET /api/productos?categoria=1&precioMax=15&disponible=true`.
3. `ProductosController.list` recibe `req.query`.
4. `models/Filtro.parseFilters` valida parámetros.
5. `ProductoRepository.list` construye `WHERE id_categoria=? AND precio<=? AND stock>0`.
6. `vw_catalogo` recupera resultados desde `productos` y `categorias`.
7. `Producto.productDTO` devuelve arreglo `productos` JSON.
8. Cliente selecciona producto y lo añade al carrito.
9. `POST /api/pedidos` valida existencias y genera pedido.
10. ADMIN entrega, registra el cobro y cierra el pedido.
11. Resultado: venta basada en múltiples criterios, registrada en `pedidos`, `pagos`.

**Dato rastreable:** `categoria=1` → `productos.id_categoria` → `id_producto` → `pedido_detalles`.

## Proceso 4 — Carrito → pedido → stock → entrega → cobro

1. Cliente selecciona dos unidades producto 4 y una del producto 1 en `Products.tsx`.
2. `App.tsx` guarda estado carrito y `CartSidebar.tsx` presenta la cantidad.
3. React ejecuta `POST /api/pedidos` con `{items:[{idProducto:4,cantidad:2},{idProducto:1,cantidad:1}]}`.
4. `PedidosController.create` entrega datos a `PedidosService.create`.
5. `withTransaction` inicia `BEGIN` en una sola conexión.
6. `ProductoRepository.lockIds` realiza `SELECT...FOR UPDATE` y valida stock.
7. `models/Pedido.orderAmount` calcula total con precios de MySQL.
8. `PedidoRepository.create/insertDetail` crean `pedidos` y `pedido_detalles`.
9. `ProductoRepository.changeStock` y `PedidoRepository.insertStockMovement` descuentan y auditan.
10. `COMMIT` publica ID de pedido.
11. ADMIN ejecuta `/api/pedidos/:id/cerrar`; `PedidoRepository.insertPayment/close` guardan cobro + entrega.
12. Resultado: pedido ENTREGADO, total registrado y stock disminuido.

**Si falla:** cantidad excesiva provoca `409` y `ROLLBACK` (sin pedido/stock parcial). Monto distinto en cierre provoca `400` y no cierra.

## Proceso 5 — Stock bajo → proveedor → recepción → venta

1. Responsable consulta `GET /api/inventario/stock-bajo` (consulta `vw_stock_bajo`).
2. Prepara reposición y envía `POST /api/reposiciones` con `idProveedor`, `items` y costos.
3. `ComprasController.create` llama a `ComprasService.create`.
4. `CompraRepository.create/addDetail` escribe `compras_proveedor`, `compra_detalles` en transacción.
5. Proveedor entrega mercadería (evento del mundo real).
6. Responsable ejecuta `POST /api/reposiciones/:id/recibir`.
7. `ComprasService.receive` bloquea orden `FOR UPDATE`, inserta `recepciones_proveedor`.
8. `CompraRepository.findDetails` + `ProductoRepository.lockIds` bloquean productos.
9. `ProductoRepository.changeStock` suma unidades y `CompraRepository.recordEntry` registra entradas.
10. `CompraRepository.markReceived` marca `RECIBIDA`; `COMMIT` deja stock actualizado.
11. Cliente compra vía `PedidosService.create`; se vuelve a descontar stock.
12. ADMIN cierra pedido; resultado stock final auditable y venta terminada.

**Si falla:** segunda recepción genera `409` sin incrementar stock; evita duplicación mediante estado y UNIQUE.

## Preguntas de arquitectura

- **¿Por qué N capas y MVC?**: MVC separa interfaz React (vista), controladores y modelos; N capas añade servicios de negocio y repositorios. Un monolito evita la complejidad de desplegar 5 servicios.
- **¿Cómo viaja el dato?**: React → HTTP JSON → routes → controller → service → model/repositorio → SQL, luego vuelve en JSON.
- **¿Alternativa descartada?**: consultar SQL desde controller / React; complica pruebas, seguridad y mantenimiento.
- **¿Dónde se manejan errores?**: servicios lanzan `AppError`, `middlewares/errorHandler.js` la convierte en HTTP 400/401/403/404/409/500 y `withTransaction` hace rollback.
- **¿Qué capas consultan base?**: exclusivamente repositorios y `config/db.js` incluidas categorías y salud; los controladores nunca ejecutan SQL.
