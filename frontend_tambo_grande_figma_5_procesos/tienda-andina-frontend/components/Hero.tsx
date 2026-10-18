interface Props { onShopClick: () => void }

const stats = [
  { value: '40+', label: 'Años de historia' },
  { value: '27+', label: 'Productos' },
  { value: '3', label: 'Marcas propias' },
]

export default function Hero({ onShopClick }: Props) {
  return (
    <section id="inicio" style={{ position: 'relative', overflow: 'hidden', minHeight: '92vh', display: 'flex', alignItems: 'center' }}>
      {/* Background */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, #5A0E0E 0%, #7A1515 35%, #9B1C1C 65%, #7A1515 100%)',
      }} />

      {/* Texture overlay — fine diamond pattern */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.07 }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="diamond" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="1" height="1" fill="white" x="13.5" y="13.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#diamond)" />
      </svg>

      {/* Warm vignette bottom */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%',
        background: 'linear-gradient(to top, rgba(28,10,8,0.4), transparent)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 10, maxWidth: 1280, margin: '0 auto', padding: '80px 24px', width: '100%' }}>
        <div className="hero-main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          {/* Left: copy */}
          <div>
            {/* Pill badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '7px 16px', borderRadius: 99,
              border: '1px solid rgba(212,160,23,0.4)',
              backgroundColor: 'rgba(212,160,23,0.1)',
              marginBottom: 36,
            }}>
              <span style={{ fontSize: 15 }}>🦙</span>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', color: '#E8C84A', textTransform: 'uppercase' }}>
                Tamburco · Abancay · Apurímac · Perú
              </span>
            </div>

            {/* Headline */}
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              lineHeight: 1.05,
              marginBottom: 0,
              fontSize: 'clamp(3rem, 5.5vw, 5rem)',
            }}>
              <span style={{ display: 'block', color: 'white' }}>Lo mejor de los</span>
              <span style={{ display: 'block', color: '#E8C84A', fontStyle: 'italic' }}>Andes Peruanos</span>
              <span style={{ display: 'block', color: 'white' }}>en tu mesa</span>
            </h1>

            {/* Divider rule */}
            <div style={{ width: 64, height: 2, backgroundColor: 'rgba(212,160,23,0.5)', margin: '32px 0' }} />

            <p style={{
              fontSize: 17, lineHeight: 1.75, color: 'rgba(255,255,255,0.72)',
              maxWidth: 460, marginBottom: 44,
            }}>
              Lácteos artesanales, cereales andinos y miel pura de Apurímac.
              Productos 100% peruanos con más de cuatro décadas de tradición familiar.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <button
                onClick={onShopClick}
                style={{
                  padding: '14px 32px', borderRadius: 12,
                  background: 'linear-gradient(135deg, #D4A017, #B8860B)',
                  border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 15, color: '#1a0a00',
                  boxShadow: '0 4px 24px rgba(184,134,11,0.4)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(184,134,11,0.5)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 24px rgba(184,134,11,0.4)' }}
              >
                Explorar tienda →
              </button>
              <button
                onClick={() => document.getElementById('nosotros')?.scrollIntoView({ behavior: 'smooth' })}
                style={{
                  padding: '14px 32px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1.5px solid rgba(255,255,255,0.2)', cursor: 'pointer',
                  fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 15, color: 'rgba(255,255,255,0.85)',
                  backdropFilter: 'blur(8px)',
                  transition: 'background 0.2s, border-color 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
              >
                Nuestra historia
              </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 40, marginTop: 56 }}>
              {stats.map((s, i) => (
                <div key={s.value}>
                  {i > 0 && <div style={{ position: 'absolute', width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.15)', transform: 'translateX(-20px) translateY(2px)' }} />}
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, color: '#E8C84A', lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4, fontWeight: 400 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: visual collage */}
          <div style={{ position: 'relative', height: 520, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 14 }}>
            {/* Large image top-left */}
            <div style={{
              gridRow: '1 / 3', borderRadius: 20, overflow: 'hidden',
              boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}>
              <img
                src="https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=600&h=700&fit=crop&auto=format"
                alt="Yogur artesanal andino"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            {/* Top right */}
            <div style={{
              borderRadius: 20, overflow: 'hidden',
              boxShadow: '0 16px 40px rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.10)',
            }}>
              <img
                src="https://images.unsplash.com/photo-1571748982800-fa51082c2224?w=400&h=320&fit=crop&auto=format"
                alt="Cereales andinos quinua kiwicha"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            {/* Bottom right with badge */}
            <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', boxShadow: '0 16px 40px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.10)' }}>
              <img
                src="https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&h=320&fit=crop&auto=format"
                alt="Miel pura de Apurímac"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {/* Badge */}
              <div style={{
                position: 'absolute', bottom: 14, left: 14,
                backgroundColor: 'rgba(26,10,0,0.8)', backdropFilter: 'blur(8px)',
                borderRadius: 10, padding: '8px 14px',
                border: '1px solid rgba(255,255,255,0.15)',
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#E8C84A', letterSpacing: '0.08em' }}>100% PERUANO 🇵🇪</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
