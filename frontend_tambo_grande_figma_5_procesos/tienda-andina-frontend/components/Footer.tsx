interface Props { onRegisterClick: () => void }

export default function Footer({ onRegisterClick }: Props) {
  return (
    <footer>
      {/* CTA band */}
      <section style={{
        padding: '100px 24px',
        background: 'linear-gradient(135deg, #5A0E0E 0%, #7A1515 40%, #9B1C1C 100%)',
        position: 'relative', overflow: 'hidden',
        textAlign: 'center',
      }}>
        {/* Pattern */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06 }} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="12" cy="12" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', color: '#E8C84A', textTransform: 'uppercase', marginBottom: 20 }}>
            Únete a la comunidad Tambo
          </p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'white', marginBottom: 16, lineHeight: 1.1 }}>
            ¿Aún no tienes cuenta?
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginBottom: 32 }}>
            Regístrate gratis como persona natural o empresa — colegios, restaurantes, hoteles y más pueden hacer pedidos al por mayor.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
            {[
              { icon: '👤', label: 'Persona Natural' },
              { icon: '🏫', label: 'Centro Educativo' },
              { icon: '🍽️', label: 'Restaurante' },
              { icon: '🏢', label: 'Empresa' },
            ].map(t => (
              <span key={t.label} style={{
                padding: '6px 14px', borderRadius: 99,
                backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.8)',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {t.icon} {t.label}
              </span>
            ))}
          </div>
          <button
            onClick={onRegisterClick}
            style={{
              padding: '16px 40px', borderRadius: 14, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #D4A017, #B8860B)',
              fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 16, color: '#1a0800',
              boxShadow: '0 4px 24px rgba(184,134,11,0.4)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(184,134,11,0.5)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 24px rgba(184,134,11,0.4)' }}
          >
            Crear cuenta gratis →
          </button>
        </div>
      </section>

      {/* Bottom bar */}
      <div id="contacto" style={{ backgroundColor: '#1a0800', padding: '28px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 9,
              background: 'linear-gradient(135deg, var(--color-red-mid), var(--color-red-deep))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 800, color: 'white', fontSize: 12,
            }}>TG</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'white' }}>Tambo Grande</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Tamburco, Abancay, Apurímac — Perú</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 32 }}>
            {['Tienda', 'Nosotros', 'Marcas', 'Contacto'].map(link => (
              <a key={link} href={`#${link.toLowerCase()}`} style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
              >{link}</a>
            ))}
          </div>

          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', margin: 0 }}>
            © 2025 Tambo Grande · Todos los derechos reservados
          </p>
        </div>
      </div>
    </footer>
  )
}
