const features = [
  { icon: '🥛', title: 'Lácteos artesanales', desc: 'Yogur, queso fresco y mantequilla elaborados con leche entera de Abancay.' },
  { icon: '🌾', title: 'Cereales andinos', desc: 'Quinua y kiwicha del altiplano, ricas en proteína y sin aditivos.' },
  { icon: '🍯', title: 'Miel pura', desc: 'Cosechada directamente de las colmenas de las alturas de Apurímac.' },
  { icon: '🏔️', title: 'Origen garantizado', desc: 'Trazabilidad completa desde la comunidad productora hasta tu hogar.' },
]

export default function About() {
  return (
    <section id="nosotros" style={{ backgroundColor: 'var(--color-parchment)', padding: '100px 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
        <div className="about-main-grid" style={{ display: 'grid', gridTemplateColumns: '5fr 7fr', gap: 80, alignItems: 'start' }}>
          {/* Text */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', color: 'var(--color-gold)', textTransform: 'uppercase', marginBottom: 16 }}>
              Nuestra historia
            </p>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: 'clamp(2rem, 3.5vw, 3rem)', lineHeight: 1.12,
              color: 'var(--color-red-deep)', marginBottom: 28,
            }}>
              Desde 1985,<br />sabor andino<br />en cada familia
            </h2>
            <div style={{ width: 48, height: 2, backgroundColor: 'var(--color-gold-light)', marginBottom: 28 }} />
            <p style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--color-ink-60)', marginBottom: 20 }}>
              Nuestro nombre viene del quechua <strong style={{ color: 'var(--color-ink)' }}>"HATUN TAMPU"</strong>, que significa gran depósito. Nacimos en Tamburco, Abancay, con la misión de llevar lo mejor de los Andes a las mesas peruanas.
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--color-ink-60)' }}>
              Cuatro décadas después, seguimos trabajando con comunidades locales para garantizar la más alta calidad nutricional en cada producto que llega a tu familia.
            </p>

            <div style={{ display: 'flex', gap: 32, marginTop: 44 }}>
              {[['40+', 'Años'], ['27+', 'Productos'], ['3', 'Marcas']].map(([n, l]) => (
                <div key={n} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 32, color: 'var(--color-red-mid)', lineHeight: 1 }}>{n}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-ink-40)', marginTop: 4 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {features.map(f => (
              <div
                key={f.title}
                style={{
                  backgroundColor: 'var(--color-cream)',
                  borderRadius: 18, padding: '28px 24px',
                  border: '1px solid var(--color-warm-100)',
                  boxShadow: '0 2px 12px rgba(122,21,21,0.05)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'default',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(122,21,21,0.1)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(122,21,21,0.05)' }}
              >
                <div style={{ fontSize: 28, marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--color-red-deep)', marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--color-ink-60)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
