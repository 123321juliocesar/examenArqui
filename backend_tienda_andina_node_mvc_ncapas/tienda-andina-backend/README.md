# Tienda Andina — backend Node.js (5 procesos, N capas + MVC)

API REST para conectar el frontend React + TypeScript exportado de Figma a la base relacional **`tienda_andina_5_procesos`**. Diseñada como **monolito organizado por capas**, no microservicios. Cubre los 5 diagramas compartidos: registro→compra; buscador→compra; filtros→compra; carrito→entrega/cobro; reposición→recepción→venta/stock.

## Requisitos

- Node.js **20 o superior** y npm.
- MySQL 8.0.16+ (o MariaDB 10.6+) funcionando localmente.
- Un usuario de MySQL con permisos sobre `tienda_andina_5_procesos`.
- Internet **solo durante `npm install`**, para descargar dependencias desde npm.

## 1. Importar base de datos (antes de ejecutar API)

En MySQL Workbench: `File → Open SQL Script → db/tienda_andina_5_procesos.sql → Execute`.

O por consola, si está instalado `mysql`:

```bash
mysql -u root -p < db/tienda_andina_5_procesos.sql
```

La BD tiene **11 tablas** y **3 vistas**, con 8 productos y un proveedor de demostración. El script `CREATE IF NOT EXISTS` no elimina datos existentes.

## 2. Instalar / iniciar (Windows PowerShell)

```powershell
cd tienda-andina-backend
npm install
Copy-Item .env.example .env
notepad .env
npm run dev
```

Editar `.env`:

```ini
PORT=4000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=TU_CLAVE_MYSQL
DB_NAME=tienda_andina_5_procesos
JWT_SECRET=REEMPLAZAR_CON_UNA_CADENA_ALEATORIA_SEGURA_DE_32_CARACTERES
CLIENT_ORIGIN=http://localhost:5173
```

**Importante:** reemplazar `JWT_SECRET` por un valor aleatorio propio de por lo menos 32 caracteres, no reutilizar el ejemplo. Se puede generar en PowerShell:

```powershell
[Convert]::ToHexString([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

Y luego copiar la salida como `JWT_SECRET`. No subir `.env` a GitHub.

Prueba: abrir `http://localhost:4000/api/salud`. La respuesta debe ser:

```json
{"estado":"ok","baseDeDatos":"conectada"}
```

Si falla conexión, revise contraseña, `DB_NAME` y que MySQL esté encendido (puerto 3306).

## 3. Arquitectura N capas + MVC

```text
FRONTEND (React + TypeScript; proyecto Figma)
           ↓ JSON / HTTP
src/routes/                  Enruta las peticiones y protege endpoints
           ↓
src/controllers/             Controllers (MVC): req → service → res
           ↓
src/services/                Reglas de negocio y transacciones
           ↓                       ↘
src/repositories/            src/models/ (MVC): validación / estructuras / DTO
           ↓
src/config/db.js             Pool y transacciones MySQL
           ↓
MySQL: 11 tablas de tienda_andina_5_procesos
```

El **modelo de MVC** está representado por los objetos de dominio (`src/models`) y el modelo relacional SQL, el **controlador** por `src/controllers`, y la **vista** es React, que está en otro proyecto. Los `Services` coordinan los `Repositories` y los modelos.

## 4. Mapa de archivos por integrante

| Proceso | Controller | Service | Repository | Model / tablas |
|---|---|---|---|---|
| 1. Registro y compra | `AuthController`, `PedidosController` | `AuthService`, `PedidosService` | `UsuarioRepository`, `PedidoRepository` | `Usuario`, `Pedido` / usuarios, pedidos |
| 2. Búsqueda y compra | `ProductosController`, `PedidosController` | `ProductosService`, `PedidosService` | `ProductoRepository`, `PedidoRepository` | `Producto`, `Filtro` / vw_catalogo |
| 3. Filtrado y compra | `ProductosController`, `PedidosController` | `ProductosService`, `PedidosService` | `ProductoRepository`, `PedidoRepository` | `Filtro`, `Producto` / productos, categorias |
| 4. Carrito y cobro | `PedidosController` | `PedidosService` | `PedidoRepository`, `ProductoRepository` | `Pedido` / pedidos, pedido_detalles, pagos, movimientos_stock |
| 5. Reposición y stock | `ComprasController`, `PedidosController` | `ComprasService`, `PedidosService` | `CompraRepository`, `ProductoRepository` | productos, compras_proveedor, recepciones_proveedor, movimientos_stock |

## 5. Endpoints (URL base http://localhost:4000)

| Método y ruta | Qué hace | Acceso |
|---|---|---|
| `GET /api/salud` | Diagnóstico MySQL | Público |
| `POST /api/auth/registro` | Crea cuenta natural / jurídica, bcrypt y JWT | Público |
| `POST /api/auth/login` | Verifica credenciales y genera JWT | Público |
| `GET /api/auth/me` | Devuelve perfil propio | Cliente/Admin |
| `PATCH /api/auth/me` | Cambia teléfono y dirección propios | Cliente/Admin |
| `GET /api/productos` | Catálogo / filtros (`categoria`, `precioMin`, `precioMax`, `disponible`, `q`) | Público |
| `GET /api/productos/buscar?q=qui` | Hasta 8 sugerencias tras mínimo 2 caracteres | Público |
| `GET /api/productos/categorias` | Lista categorías | Público |
| `GET /api/productos/:id` | Detalle producto | Público |
| `GET /api/productos/stock-bajo` | Productos ≤ 5 unidades | Admin |
| `POST /api/pedidos` | Crea pedido, descuenta inventario en transacción | Cliente/Admin |
| `GET /api/pedidos/mios` | Mis pedidos | Cliente/Admin |
| `GET /api/pedidos/:id` | Detalle para dueño o admin | Cliente/Admin |
| `GET /api/pedidos/admin/todos` | Lista operativa de pedidos | Admin |
| `POST /api/pedidos/:id/cerrar` | Registra cobro y entrega | Admin |
| `GET /api/reposiciones/proveedores` | Lista de proveedores | Admin |
| `POST /api/reposiciones` | Orden de compra al proveedor | Admin |
| `GET /api/reposiciones/:id` | Detalle de compra al proveedor | Admin |
| `POST /api/reposiciones/:id/recibir` | Recibe mercancía, aumenta stock | Admin |
| `GET /api/inventario/stock-bajo` | Consulta stock bajo | Admin |
| `GET /api/inventario/movimientos/:idProducto` | Auditoría de stock | Admin |

Un **JWT** se envía con cabecera `Authorization: Bearer TOKEN`. Todos los roles se determinan consultando el usuario activo en MySQL; no desde la entrada del navegador.

## 6. Crear un ADMIN de demostración

Para impedir que cualquiera se haga administrador, **registrar primero una cuenta normal** por `/api/auth/registro` y luego, únicamente para la demostración, ejecutar en Workbench con permisos de la BD:

```sql
USE tienda_andina_5_procesos;
UPDATE usuarios SET rol='ADMIN' WHERE email='admin.demo@ejemplo.com';
SELECT id_usuario,email,rol FROM usuarios;
```

**Asegúrate de haber registrado `admin.demo@ejemplo.com` previamente**. Inicia sesión con esa cuenta para obtener `tokenAdmin`. No existe ruta pública para cambiar `rol` ni para crear administradores.

## 7. JSON de ejemplo (5 procesos)

**Proceso 1: registro**

```http
POST /api/auth/registro
Content-Type: application/json

{"tipo":"natural","nombre":"Ana","apellido":"Quispe","dni":"12345678","telefono":"987654321","email":"ana.demo@ejemplo.com","password":"ClaveSegura123"}
```

Responde con `token` y `usuario`. Para perfil jurídico: `tipo: juridica`, `razonSocial`, `ruc`, `representante`, `telefono`, `email`, `password`, con `cargo`, `rubro`, `direccion` opcionales.

**Proceso 2: buscador**

```http
GET /api/productos/buscar?q=qui
```

**Proceso 3: filtros**

```http
GET /api/productos?categoria=1&precioMax=15&disponible=true
```

**Proceso 4: crear pedido** (JWT cliente)

```http
POST /api/pedidos
Authorization: Bearer TOKEN_CLIENTE
Content-Type: application/json

{"items":[{"idProducto":4,"cantidad":2},{"idProducto":1,"cantidad":1}],"direccionEntrega":"Abancay centro"}
```

El servicio consulta los precios vigentes, valida stock, crea cabecera+detalles, descuenta stock y deja movimientos en **una sola transacción**. Con los precios originales, devuelve **S/ 26.30** (si los productos conservan los precios iniciales).

**Cerrar pedido después de entregar y cobrar** (JWT ADMIN; sin pasarela):

```http
POST /api/pedidos/1/cerrar
Authorization: Bearer TOKEN_ADMIN
Content-Type: application/json

{"medio":"SIMULADO","monto":"26.30","observacion":"Demo sin dinero real"}
```

`EFECTIVO` y `TRANSFERENCIA` se usan cuando realmente se ha verificado el cobro. `SIMULADO` es sólo prueba; jamás se debe describir como dinero realmente recibido. Este endpoint comprueba el importe real del pedido y marca `ENTREGADO` en la misma transacción.

**Proceso 5: orden al proveedor** (JWT ADMIN)

```http
POST /api/reposiciones
Authorization: Bearer TOKEN_ADMIN
Content-Type: application/json

{"idProveedor":1,"items":[{"idProducto":3,"cantidad":20,"costoUnitario":"8.00"}],"observacion":"Reponer queso"}
```

Al recibir la mercadería:

```http
POST /api/reposiciones/1/recibir
Authorization: Bearer TOKEN_ADMIN
Content-Type: application/json

{"observacion":"20 unidades verificadas"}
```

Aumenta la existencia **una vez**. Una segunda recepción de la misma orden devuelve `409 CONFLICT` y no cambia el inventario.

El archivo `docs/ejemplos.http` contiene todas las solicitudes completas para la extensión **REST Client** de VS Code (también se pueden copiar a Postman o Thunder Client). No asumas los ID `1` de pedidos y compras: usa los ID que devuelva cada operación.

## 8. Fallos importantes para explicar al docente

| Fallo | Qué pasa | Dónde se maneja |
|---|---|---|
| Correo / DNI duplicado | HTTP 409 | `AuthService`, índice único, `errorHandler` |
| Token ausente o cliente usando ruta de administrador | 401 / 403 | `middlewares/auth.js` |
| Buscador sin coincidencias | Array `sugerencias: []` | `ProductosService` |
| Filtro sin productos | Array `productos: []` | `ProductosService` |
| Carrito sin stock suficiente | HTTP 409 y no se crea pedido | `PedidosService` + ROLLBACK |
| Dos compras simultáneas del mismo producto | Bloqueo `FOR UPDATE`, se valida stock bajo transacción | `ProductoRepository` + `PedidosService` |
| Doble cierre de pedido / doble pago | HTTP 409, sin segundo cobro | `PedidosService` + UNIQUE pagos.id_pedido |
| Segunda recepción al proveedor | HTTP 409, no entra doble stock | `ComprasService` + UNIQUE recepciones.id_compra |
| Error de SQL dentro de un proceso | ROLLBACK deja transacción completa sin aplicar | `config/db.js` |

**Decisiones técnicas:** monolito por capas (en lugar de microservicios, menor complejidad), MySQL relacional (en lugar de archivos JSON o datos estáticos), `bcrypt` y `JWT` (en lugar de login simulado), consultas con parámetros (en lugar de interpolar datos), transacciones `FOR UPDATE` (en lugar de descontar stock en React) y búsqueda por `LIKE` (en lugar de IA/predicción estadística). Aquí *predictivo* significa **autocompletado por coincidencia de texto**, no un modelo de ML.

## 9. Pruebas

```powershell
npm test
```

Se incluyen pruebas unitarias sin BD (modelos, cantidades, precios, filtros). **Las pruebas de integración de endpoints requieren `npm install` y una instancia MySQL importada y accesible**. Para hacerlas manualmente usa `docs/ejemplos.http`. Ejecuta rutas de cambio de datos en una BD de demostración, no en producción.

## 10. Alcance explícito

Incluido: registro/login, perfil, catálogo, búsqueda/autocompletado, filtros, carrito→pedido, cobro registrado manual o simulado, órdenes de proveedor, recepción de una sola vez, control de stock y movimientos. **No implementa** panel Dashboard, pasarela online, emisión SUNAT, recomendaciones con IA, buscador ML, analíticas o envíos con transportistas. La **vista (frontend) aún debe conectarse**, porque tu archivo `src.zip` tenía inicio de sesión y productos simulados; la API es un proyecto backend independiente.

Para la integración React lee `docs/INTEGRACION-FRONTEND.md`.
