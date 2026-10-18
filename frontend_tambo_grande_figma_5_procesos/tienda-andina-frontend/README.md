# Tambo Grande – Tienda virtual (frontend Figma + API Node.js)

Esta versión **mantiene los componentes originales** de `src.zip` exportado de Figma: logo TG, hero rojo vino, fondo crema, tipografías Playfair Display/Inter, bloque «Nuestra historia», tarjetas de productos con imágenes y barra lateral «Mi Pedido».

Se conectó la UI a la API REST que entregamos en `backend_tienda_andina_node_mvc_ncapas.zip`, sin cambiar el stack React + TypeScript.

## Requisitos
- Node.js 20.19+ o 22+
- MySQL 8 o MariaDB 10.6+ con el archivo `tienda_andina_5_procesos.sql` importado
- API de Node.js/Express de la entrega anterior, ejecutándose en `http://localhost:4000`

## Cómo ejecutar en Windows (PowerShell)

### 1. Base de datos y backend (solo una vez)
Importar el archivo SQL incluido en el ZIP anterior del backend en MySQL Workbench.

En otra terminal, en la carpeta del **backend**:

```powershell
npm install
Copy-Item .env.example .env
```

Editar `.env`: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` y `JWT_SECRET` seguros, y comprobar `CLIENT_ORIGIN=http://localhost:5173`.

```powershell
npm run dev
```

Verificar `http://localhost:4000/api/salud` para confirmar que la base está conectada.

### 2. Frontend React
Dentro de la carpeta **tienda-andina-frontend**:

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Abrir `http://localhost:5173`.

`VITE_API_URL` en `.env` se debe cambiar si el backend utiliza otra IP/puerto.

**Importante:** el archivo `.env` del frontend contiene solamente la URL pública de la API. Jamás pongas contraseñas de MySQL o claves JWT en variables `VITE_`.

## Proceso 1: Usuarios y perfiles

- `components/AuthModal.tsx` conserva las pestañas de registro de persona natural/jurídica e inicio de sesión; ahora llama `api.register` / `api.login`.
- `App.tsx` guarda el JWT solo durante la sesión del navegador (`sessionStorage`) y lo valida en `/api/auth/me` al recargar; el perfil se carga desde el backend.
- `components/ProfilePanel.tsx` permite modificar teléfono y dirección mediante `PATCH /api/auth/me`.
- Un usuario nuevo puede buscar y hacer su primer pedido. El cobro y entrega se registran desde «Pedidos recibidos» por un administrador.

## Proceso 2: Buscador predictivo

- `components/Products.tsx` usa un input de búsqueda, debounce de 320 ms y `GET /api/productos/buscar?q=...`.
- Se muestran sugerencias obtenidas de MySQL (no IA); al seleccionar una, se filtra el catálogo. El cliente agrega el producto y confirma la compra.

## Proceso 3: Filtros combinados

- En `Products.tsx`: categorías desde `/api/productos/categorias`, precio mínimo/máximo, disponible.
- `GET /api/productos?categoria=1&precioMax=15&disponible=true` se ejecuta en backend; no hay filtros falsos sobre datos hardcodeados.
- El cliente puede comprar los productos encontrados y seguir el pedido.

## Proceso 4: Carrito y pedidos

- `App.tsx` coordina el carrito y lo conserva por usuario en `localStorage` (NO se guarda ningún secreto en el carrito).
- `components/CartSidebar.tsx` conserva el diseño lateral, permite editar cantidades/eliminar, recoge dirección y envía los artículos a `POST /api/pedidos`.
- Solo al confirmarse la operación se vacía el carrito. El total oficial lo calcula el backend usando MySQL y descuenta stock dentro de una transacción.
- `components/OrdersPanel.tsx`: Mis pedidos y detalle; el administrador puede marcar entregado + cobrado con `POST /api/pedidos/:id/cerrar`.

## Proceso 5: Reposición e inventario

- `components/InventoryPanel.tsx` visible únicamente a los usuarios con `rol=ADMIN`.
- Obtiene proveedores desde `GET /api/reposiciones/proveedores`.
- Genera orden `POST /api/reposiciones` y consulta por ID `GET /api/reposiciones/:id`.
- Confirma recepción mediante `POST /api/reposiciones/:id/recibir` para aumentar stock UNA vez.
- Muestra stock bajo `/api/inventario/stock-bajo` y movimientos `/api/inventario/movimientos/:idProducto`.
- Al recibir mercadería, `App` actualiza el catálogo.

## Crear administrador para la exposición

El registro público siempre crea `CLIENTE`. Tras registrar una cuenta propia de prueba desde la interfaz, ejecutar con usuario autorizado de la base:

```sql
USE tienda_andina_5_procesos;
UPDATE usuarios SET rol = 'ADMIN' WHERE email = 'admin-de-prueba@ejemplo.com';
```

Usa aquí **el email con el que acabas de registrarte**, no uno inexistente. Cierra sesión y vuelve a iniciar para acceder a las acciones de administración. Nunca permitir que el visitante se dé rol administrador desde React.

## Restricciones del MVP

- No hay pasarela online, facturación electrónica, recomendador, analítica integrada ni Dashboard.
- El registro de cobro `SIMULADO` es **solo demostrativo** y no equivale a dinero real. `EFECTIVO` y `TRANSFERENCIA` deben usarse solo cuando el encargado haya verificado el cobro fuera del sistema.
- El buscador usa coincidencias por nombre; no tiene ML, ni predicción estadística. Para la exposición, 'predictivo' se refiere a sugerencias en vivo.
- El catálogo proviene de MySQL. Si la API no está disponible, se muestra un mensaje de error en lugar de simular éxito con productos estáticos.
- `sessionStorage` simplifica la sesión para este MVP académico. Para producción considerar cookies `HttpOnly` protegidas y controles CSRF, CSP y expiración de sesión.

## Archivos importantes

```
App.tsx                  coordinación del flujo y estado de sesión/carrito
lib/api.ts               solicitudes HTTP a Node.js / Express
components/AuthModal.tsx registro/login originales conectados a API
components/ProfilePanel.tsx edición perfil
components/Products.tsx  sugerencias + filtros + catálogo API
components/CartSidebar.tsx carrito lateral + POST /api/pedidos
components/OrdersPanel.tsx pedidos, detalle y cobro contraentrega
components/InventoryPanel.tsx compras proveedor, recepciones y movimientos
components/Navbar.tsx    navegación original + accesos de procesos
components/Hero.tsx      portada Figma original
components/About.tsx     historia Figma original
components/Footer.tsx    pie Figma original
index.css                paleta original + estilos añadidos
```

Ver `docs/MAPA_5_PROCESOS.md` para seguir un dato desde el frontend, controlador, servicio, repositorio y tabla.
