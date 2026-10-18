import type { User, Product, Category, OrderShort, OrderDetail, Supplier, Purchase, StockMovement } from '../types'

const BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); this.name = 'ApiError' }
}

// Centralización de las peticiones REST (interfaz React -> controlador Express).
export async function request<T>(path: string, options: RequestInit = {}, token?: string, signal?: AbortSignal): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${BASE}${path}`, {
      ...options, signal: signal ?? options.signal,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    throw new ApiError('No se pudo conectar con el backend. Verifica que Node.js esté ejecutándose en el puerto 4000.', 0)
  }
  const data: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const payload = data as { error?: string; mensaje?: string } | null
    throw new ApiError(payload?.error || payload?.mensaje || `Error HTTP ${response.status}`, response.status)
  }
  return data as T
}

export const api = {
  register: (body: object) => request<{ usuario: User; token: string }>('/api/auth/registro', { method: 'POST', body: JSON.stringify(body) }),
  login: (email: string, password: string) => request<{ usuario: User; token: string }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: (token: string) => request<{ usuario: User }>('/api/auth/me', {}, token),
  editProfile: (token: string, body: { telefono: string; direccion: string }) => request<{ usuario: User }>('/api/auth/me', { method: 'PATCH', body: JSON.stringify(body) }, token),
  products: (qs: URLSearchParams, signal?: AbortSignal) => request<{ productos: Product[] }>(`/api/productos${qs.size ? '?' + qs : ''}`, {}, undefined, signal),
  categories: () => request<{ categorias: Category[] }>('/api/productos/categorias'),
  suggest: (q: string, signal?: AbortSignal) => request<{ sugerencias: Product[] }>(`/api/productos/buscar?q=${encodeURIComponent(q)}`, {}, undefined, signal),
  product: (id: number) => request<{ producto: Product }>(`/api/productos/${id}`),
  placeOrder: (token: string, body: { items: { idProducto: number; cantidad: number }[]; direccionEntrega: string; notas?: string }) => request<{ pedido: { idPedido: number; total: number | string; estado: string } }>('/api/pedidos', { method: 'POST', body: JSON.stringify(body) }, token),
  myOrders: (token: string) => request<{ pedidos: OrderShort[] }>('/api/pedidos/mios', {}, token),
  allOrders: (token: string) => request<{ pedidos: OrderShort[] }>('/api/pedidos/admin/todos', {}, token),
  orderDetail: (token: string, id: number) => request<{ pedido: OrderDetail }>(`/api/pedidos/${id}`, {}, token),
  closeOrder: (token: string, id: number, body: { medio: 'EFECTIVO' | 'TRANSFERENCIA' | 'SIMULADO'; monto: number; referencia?: string }) => request<{ pedido: { idPedido: number; estado: string; advertencia?: string } }>(`/api/pedidos/${id}/cerrar`, { method: 'POST', body: JSON.stringify(body) }, token),
  suppliers: (token: string) => request<{ proveedores: Supplier[] }>('/api/reposiciones/proveedores', {}, token),
  lowStock: (token: string) => request<{ productos: Array<Record<string, unknown>> }>('/api/inventario/stock-bajo', {}, token),
  createPurchase: (token: string, body: { idProveedor: number; items: { idProducto: number; cantidad: number; costoUnitario: number }[]; observacion?: string }) => request<{ compra: Purchase }>('/api/reposiciones', { method: 'POST', body: JSON.stringify(body) }, token),
  purchaseById: (token: string, id: number) => request<{ compra: Purchase }>(`/api/reposiciones/${id}`, {}, token),
  receivePurchase: (token: string, id: number) => request<{ recepcion: { idCompra: number; estado: string } }>(`/api/reposiciones/${id}/recibir`, { method: 'POST', body: JSON.stringify({}) }, token),
  movements: (token: string, productId: number) => request<{ movimientos: StockMovement[] }>(`/api/inventario/movimientos/${productId}`, {}, token),
}
