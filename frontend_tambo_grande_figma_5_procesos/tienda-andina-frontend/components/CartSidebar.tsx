import { useEffect, useState } from 'react'
import type { CartItem, User } from '../types'

interface Props {
  cart: CartItem[]
  user: User | null
  onClose: () => void
  onRemove: (id: number) => void
  onUpdateQty: (id: number, qty: number) => void
  onCheckout: (direccion: string, notas: string) => Promise<void>
  checkoutLoading: boolean
  checkoutError: string
}

export default function CartSidebar({ cart, user, onClose, onRemove, onUpdateQty, onCheckout, checkoutLoading, checkoutError }: Props) {
  const [direccion, setDireccion] = useState(user?.direccion ?? '')
  const [notas, setNotas] = useState('')
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0)
  const count = cart.reduce((s, c) => s + c.qty, 0)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 150, backgroundColor: 'rgba(28,10,8,0.5)', backdropFilter: 'blur(4px)' }}
      />

      {/* Panel */}
      <aside style={{
        position: 'fixed', right: 0, top: 0, bottom: 0, zIndex: 151,
        width: '100%', maxWidth: 400,
        backgroundColor: 'var(--color-cream)',
        display: 'flex', flexDirection: 'column',
        boxShadow: '-8px 0 48px rgba(28,10,8,0.15)',
        borderLeft: '1px solid var(--color-warm-100)',
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 24px 20px',
          borderBottom: '1px solid var(--color-warm-100)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--color-red-deep)', margin: 0 }}>
              Mi Pedido
            </h2>
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <span style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
                  padding: '2px 8px', borderRadius: 6,
                  backgroundColor: user.tipo === 'juridica' ? 'rgba(14,45,69,0.08)' : 'rgba(155,28,28,0.08)',
                  color: user.tipo === 'juridica' ? '#1a4a6b' : 'var(--color-red-mid)',
                }}>
                  {user.tipo === 'juridica' ? '🏢 Empresa' : '👤 Personal'}
                </span>
                <span style={{ fontSize: 12, color: 'var(--color-ink-40)' }}>
                  {user.displayName.length > 22 ? user.displayName.slice(0, 22) + '…' : user.displayName}
                </span>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {count > 0 && (
              <span style={{
                padding: '3px 10px', borderRadius: 20,
                backgroundColor: 'var(--color-parchment)', border: '1px solid var(--color-warm-200)',
                fontSize: 12, fontWeight: 600, color: 'var(--color-ink-60)',
              }}>
                {count} {count === 1 ? 'producto' : 'productos'}
              </span>
            )}
            <button
              onClick={onClose}
              style={{
                width: 36, height: 36, borderRadius: 10, border: '1px solid var(--color-warm-100)',
                backgroundColor: 'var(--color-parchment)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-warm-100)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--color-parchment)')}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-ink-60)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {cart.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', padding: '40px 0' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                backgroundColor: 'var(--color-parchment)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, marginBottom: 20,
              }}>🛍️</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--color-ink)', margin: '0 0 8px' }}>
                Tu carrito está vacío
              </h3>
              <p style={{ fontSize: 14, color: 'var(--color-ink-40)', lineHeight: 1.6 }}>
                Agrega productos desde nuestra tienda para comenzar tu pedido.
              </p>
              <button
                onClick={onClose}
                style={{
                  marginTop: 24, padding: '11px 24px', borderRadius: 10, cursor: 'pointer',
                  background: 'linear-gradient(135deg, var(--color-red-mid), var(--color-red-deep))',
                  border: 'none', color: 'white', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14,
                }}
              >
                Explorar tienda
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {cart.map(item => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex', gap: 14, alignItems: 'flex-start',
                    padding: 14, borderRadius: 14,
                    backgroundColor: 'white',
                    border: '1px solid var(--color-warm-100)',
                  }}
                >
                  <div style={{ width: 60, height: 60, borderRadius: 10, overflow: 'hidden', flexShrink: 0, backgroundColor: 'var(--color-parchment)' }}>
                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-ink)', margin: '0 0 6px', lineHeight: 1.3 }}>
                      {item.name}
                    </h4>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--color-red-deep)', margin: '0 0 10px' }}>
                      S/ {item.price.toFixed(2)}
                    </p>
                    {/* Qty controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <button
                        onClick={() => onUpdateQty(item.id, item.qty - 1)}
                        style={{
                          width: 28, height: 28, borderRadius: 8, border: '1px solid var(--color-warm-200)',
                          backgroundColor: 'var(--color-parchment)', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 16, color: 'var(--color-ink-60)', fontWeight: 500,
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-warm-100)')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--color-parchment)')}
                      >−</button>
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-ink)', minWidth: 18, textAlign: 'center' }}>{item.qty}</span>
                      <button
                        onClick={() => onUpdateQty(item.id, Math.min(item.qty + 1, item.stock))}
                        style={{
                          width: 28, height: 28, borderRadius: 8, border: '1px solid var(--color-warm-200)',
                          backgroundColor: 'var(--color-parchment)', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 16, color: 'var(--color-ink-60)', fontWeight: 500,
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-warm-100)')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--color-parchment)')}
                      >+</button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    <button
                      onClick={() => onRemove(item.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-ink-40)', padding: 4, transition: 'color 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#DC2626')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-ink-40)')}
                    >
                      <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-ink-60)' }}>
                      S/ {(item.price * item.qty).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div style={{ padding: '20px 24px 28px', borderTop: '1px solid var(--color-warm-100)' }}>
            <div style={{marginBottom:16}}>
              <label className="field-label" htmlFor="direccion-entrega">Dirección de entrega</label>
              <input className="form-input" id="direccion-entrega" placeholder="Ej.: Av. Arenas 123, Abancay" value={direccion} onChange={e=>setDireccion(e.target.value)} maxLength={255} />
              <label className="field-label" htmlFor="notas-pedido" style={{marginTop:12}}>Indicaciones (opcional)</label>
              <textarea id="notas-pedido" className="form-input" rows={2} placeholder="Referencia de entrega..." value={notas} onChange={e=>setNotas(e.target.value)} maxLength={255}/>
            </div>
            {cart.some(i=>i.qty>i.stock) && <div className="inline-error">La cantidad excede el stock disponible. Ajusta el carrito.</div>}
            {/* Subtotal row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: 'var(--color-ink-40)' }}>Subtotal ({count} items)</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--color-red-deep)' }}>
                S/ {total.toFixed(2)}
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--color-ink-40)', marginBottom: 20 }}>
              Pago contraentrega. No se realiza ningún pago en línea.
            </p>

            {checkoutError && <div className="inline-error" role="alert">{checkoutError}</div>}
            <button
              onClick={()=>void onCheckout(direccion,notas)}
              disabled={checkoutLoading || !user || !direccion.trim() || cart.some(i=>i.qty>i.stock)}
              style={{
                width: '100%', padding: '15px', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, var(--color-red-mid), var(--color-red-deep))',
                fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 15, color: 'white',
                boxShadow: '0 4px 20px rgba(122,21,21,0.3)',
                transition: 'box-shadow 0.2s, transform 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 28px rgba(122,21,21,0.45)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(122,21,21,0.3)'; e.currentTarget.style.transform = '' }}
            >
              {checkoutLoading ? 'Registrando pedido...' : 'Confirmar pedido →'}
            </button>
            <button
              onClick={onClose}
              style={{
                width: '100%', padding: '10px', marginTop: 10, border: 'none',
                background: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--color-ink-40)',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-ink-60)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-ink-40)')}
            >
              Seguir comprando
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
