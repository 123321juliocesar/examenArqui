# Conectar a `src.zip` (React + TypeScript exportado de Figma)

El ZIP original **no incluye un backend**. Este servidor no modifica automáticamente sus pantallas; debes conectar las funciones existentes.

1. En el proyecto React, crear `.env` con:

   ```ini
   VITE_API_URL=http://localhost:4000
   ```

2. Crear `src/lib/api.ts` (adaptar a ruta real; si el proyecto React mantiene componentes directamente en raíz, crear `lib/api.ts`):

   ```ts
   const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

   export async function api<T>(ruta: string, options: RequestInit = {}, token?: string): Promise<T> {
     const response = await fetch(`${BASE}${ruta}`, {
       ...options,
       headers: {
         'Content-Type': 'application/json',
         ...(token ? { Authorization: `Bearer ${token}` } : {}),
         ...options.headers,
       },
     });
     const data = await response.json();
     if (!response.ok) throw new Error(data.error ?? 'Error en la API');
     return data as T;
   }
   ```

3. `components/AuthModal.tsx`: sustituir `setTimeout` que simula login por llamada a `POST /api/auth/login` o `/api/auth/registro`. La respuesta contiene `{token,usuario}`. Usar `setLoading(false)` en `finally` y mostrar `error.message` cuando falle. El objeto `usuario` ya incluye `displayName` y `tipo` como espera `types.ts`. En `App.tsx` manejar tanto `User` como el JWT; para MVP basta mantener token en estado React. **No guardar contraseñas en localStorage**.

   ```ts
   // Ejemplo conceptual dentro de handleSubmit asíncrono:
   const ruta = mode === 'login' ? '/api/auth/login' : '/api/auth/registro';
   const datos = mode === 'login' ? loginForm : tipo === 'natural' ? { ...natural, tipo } : { ...juridica, tipo };
   const { usuario, token } = await api<{usuario: User; token: string}>(ruta, {
      method: 'POST', body: JSON.stringify(datos)
   });
   onSuccess(usuario);
   // Guardar token en estado React, por ejemplo mediante un callback adicional.
   ```

4. `components/Products.tsx`: sustituir la constante local de productos por `GET /api/productos`. La respuesta es `{productos:[...]}`, cada objeto contiene `id,name,description,price,image,category,badge,stock` igual que la interfaz `Product` y con `stock` adicional. Crear un input controlado con `q` y `useEffect` con debounce de unos 250 ms para autocompletado `GET /api/productos/buscar?q=...`; mostrar las `sugerencias`. Para filtros usa `GET /api/productos?categoria=1&precioMax=15&disponible=true`.

5. `components/CartSidebar.tsx`: actualmente el botón Confirmar pedido carece de `onClick`. Añadir callback `onCheckout`, recibido desde `App.tsx`, que haga:

   ```ts
   const {pedido} = await api<{pedido:{idPedido:number;total:string;estado:string}}>(
     '/api/pedidos',
     { method:'POST', body:JSON.stringify({
       items: cart.map(c=>({idProducto:c.id,cantidad:c.qty})),
       direccionEntrega: 'Abancay',
     }) },
     token
   );
   // Mostrar el número de pedido devuelto; vaciar carrito sólo después del éxito.
   ```

6. Crear pantalla administrativa **pequeña, no dashboard** para los dos actos de administración necesarios en los diagramas: `POST /api/pedidos/:id/cerrar` cuando la mercadería haya sido entregada/cobrada y `POST /api/reposiciones/:id/recibir` cuando llegue el proveedor. El administrador puede comprobar pedidos con `GET /api/pedidos/admin/todos` y stock bajo con `GET /api/inventario/stock-bajo`. No necesitan una pasarela real.

## Es importante

- El precio oficial y el total los decide el backend consultando MySQL, no `CartSidebar`.
- Si el pedido falla con 409, conservar el carrito y mostrar mensaje de stock insuficiente.
- Buscar o filtrar no garantiza disponibilidad; el backend revalida al confirmar.
- Un React iniciado en otra dirección necesita ajustar `CLIENT_ORIGIN` en el `.env` del backend.
- Estas son instrucciones de integración, **no se ha editado el frontend original**.
