import type { User } from '../types'

interface Props {
  user: User | null
  cartCount: number
  onCartClick: () => void
  onLoginClick: () => void
  onLogout: () => void
  onOrders: () => void
  onInventory: () => void
  onProfile: () => void
}

export default function Navbar({ user, cartCount, onCartClick, onLoginClick, onLogout, onOrders, onInventory, onProfile }: Props) {

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const links = [
    { label: 'Inicio', id: 'inicio' },
    { label: 'Nosotros', id: 'nosotros' },
    { label: 'Tienda', id: 'tienda' },
    { label: 'Marcas', id: 'marcas' },
    { label: 'Contacto', id: 'contacto' },
  ]

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      backgroundColor: 'rgba(253,250,244,0.92)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--color-warm-100)',
    }}>
      <nav style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <button onClick={() => scrollTo('inicio')} style={{ display: 'flex', alignItems: 'center', gap: 12, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--color-red-mid), var(--color-red-deep))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'white', fontSize: 13, letterSpacing: '-0.5px' }}>TG</span>
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--color-red-deep)', lineHeight: 1 }}>Tambo Grande</div>
            <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.15em', color: 'var(--color-gold)', marginTop: 2 }}>DESDE 1985</div>
          </div>
        </button>

        {/* Center links */}
        <ul style={{ display: 'flex', gap: 32, listStyle: 'none', margin: 0, padding: 0 }} className="hidden-mobile">
          {links.map(l => (
            <li key={l.id}>
              <button
                onClick={() => scrollTo(l.id)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 14,
                  color: 'var(--color-ink-60)', letterSpacing: '0.01em',
                  padding: '4px 0', position: 'relative',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-red-mid)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-ink-60)')}
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user && <div className="nav-tools">
            <button className="nav-tool" onClick={onProfile}>Mi perfil</button>
            <button className="nav-tool" onClick={onOrders}>{user.rol==='ADMIN'?'Pedidos recibidos':'Mis pedidos'}</button>
            {user.rol==='ADMIN' && <button className="nav-tool" onClick={onInventory}>Inventario</button>}
          </div>}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: user.tipo === 'juridica' ? 10 : '50%',
                  background: user.tipo === 'juridica'
                    ? 'linear-gradient(135deg, #1a4a6b, #0e2d45)'
                    : 'linear-gradient(135deg, var(--color-red-mid), var(--color-red-deep))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 11, color: 'white', flexShrink: 0,
                }}>
                  {user.tipo === 'juridica' ? '🏢' : `${user.nombre?.[0] ?? ''}${user.apellido?.[0] ?? ''}`}
                </div>
                <div style={{ display: 'none' }} className="user-info-desktop">
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-ink)', lineHeight: 1 }}>
                    {user.displayName.length > 18 ? user.displayName.slice(0, 18) + '…' : user.displayName}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--color-ink-40)', marginTop: 2 }}>
                    {user.tipo === 'juridica' ? `RUC ${user.ruc}` : `DNI ${user.dni}`}
                  </div>
                </div>
              </div>
              <button
                onClick={onLogout}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--color-ink-40)', textDecoration: 'underline' }}
              >
                Salir
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              style={{
                background: 'none', border: '1.5px solid var(--color-warm-200)', cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 13,
                color: 'var(--color-ink-60)', borderRadius: 8, padding: '7px 16px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-red-mid)'; e.currentTarget.style.color = 'var(--color-red-mid)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-warm-200)'; e.currentTarget.style.color = 'var(--color-ink-60)' }}
            >
              Iniciar sesión
            </button>
          )}

          <button
            onClick={onCartClick}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'linear-gradient(135deg, var(--color-red-mid), var(--color-red-deep))',
              border: 'none', cursor: 'pointer', borderRadius: 10, padding: '9px 18px',
              fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, color: 'white',
              boxShadow: '0 2px 12px rgba(122,21,21,0.25)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(122,21,21,0.35)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 12px rgba(122,21,21,0.25)' }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Pedido
            {cartCount > 0 && (
              <span style={{
                minWidth: 20, height: 20, borderRadius: 10, padding: '0 5px',
                backgroundColor: 'var(--color-gold-light)', color: '#1a0a00',
                fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </nav>
    </header>
  )
}
