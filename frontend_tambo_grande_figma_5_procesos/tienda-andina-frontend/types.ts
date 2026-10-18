export type TipoPersona = 'natural' | 'juridica'

export interface User {
  id: number
  tipo: TipoPersona
  tipoPersona?: TipoPersona
  rol: 'CLIENTE' | 'ADMIN'
  nombre?: string | null
  apellido?: string | null
  dni?: string | null
  fechaNacimiento?: string | null
  razonSocial?: string | null
  ruc?: string | null
  representante?: string | null
  cargo?: string | null
  rubro?: string | null
  direccion?: string | null
  telefono: string
  email: string
  displayName: string
}

export interface CartItem {
  id: number
  name: string
  price: number
  image: string
  qty: number
  stock: number
}

export interface Product {
  id: number
  name: string
  description: string
  price: number
  image: string
  category: string
  categoryId: number
  badge?: string | null
  stock: number
  available: boolean
}

export interface Category { id: number; nombre: string }
export interface Supplier { id_proveedor: number; nombre: string; ruc?: string; contacto?: string }

export interface OrderShort {
  id_pedido: number; id_usuario?: number; estado: string
  total: number | string; creado_en: string; entregado_en?: string | null
}
export interface OrderDetail extends OrderShort {
  items: { id_producto: number; nombre: string; cantidad: number; precio_unitario: number | string; subtotal: number | string }[]
  direccion_entrega?: string | null; notas?: string | null
  pago?: { medio: string; monto: number | string; registrado_en: string } | null
}
export interface Purchase {
  id_compra?: number; idCompra?: number; idProveedor?: number
  estado: string; items: Array<{ id_producto?: number; idProducto?: number; cantidad: number; costo_unitario?: number }>
}
export interface StockMovement {
  id_movimiento: number; tipo: string; cantidad: number
  stock_anterior: number; stock_nuevo: number; id_compra?: number | null
  id_pedido?: number | null; registrado_en: string
}
