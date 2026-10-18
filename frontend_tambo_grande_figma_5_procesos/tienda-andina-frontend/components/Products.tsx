import { useEffect, useRef, useState } from 'react'
import { api } from '../lib/api'
import type { CartItem, Category, Product } from '../types'

const badgeColors: Record<string, string> = { 'Más vendido': 'var(--color-red-mid)', Nuevo: '#1D6A3B', Premium: 'var(--color-gold)' }

interface Props { onAddToCart: (item: CartItem) => void; reloadKey: number }

export default function Products({ onAddToCart, reloadKey }: Props) {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [category, setCategory] = useState(0)
  const [min, setMin] = useState('')
  const [max, setMax] = useState('')
  const [available, setAvailable] = useState(false)
  const [search, setSearch] = useState('')
  const [stableQuery, setStableQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Product[]>([])
  const [showSuggest, setShowSuggest] = useState(false)
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState('')
  const [added, setAdded] = useState<number | null>(null)
  const searchBox = useRef<HTMLDivElement>(null)

  useEffect(() => { api.categories().then(r => setCategories(r.categorias)).catch(() => { /* visible error from products request */ }) }, [])
  useEffect(() => {
    const timer = window.setTimeout(() => setStableQuery(search.trim()), 320)
    return () => window.clearTimeout(timer)
  }, [search])
  useEffect(() => {
    if (stableQuery.length < 2) { setSuggestions([]); return }
    const abort = new AbortController()
    api.suggest(stableQuery, abort.signal).then(r => setSuggestions(r.sugerencias)).catch(e => {
      if (e?.name !== 'AbortError') setSuggestions([])
    })
    return () => abort.abort()
  }, [stableQuery, reloadKey])
  useEffect(() => {
    const abort = new AbortController()
    const query = new URLSearchParams({ limit: '50' })
    if (stableQuery) query.set('q', stableQuery)
    if (category) query.set('categoria', String(category))
    if (min !== '' && Number(min) >= 0) query.set('precioMin', min)
    if (max !== '' && Number(max) >= 0) query.set('precioMax', max)
    if (available) query.set('disponible', 'true')
    setBusy(true); setError('')
    api.products(query, abort.signal)
      .then(r => setProducts(r.productos))
      .catch(e => { if (e?.name !== 'AbortError') setError(e instanceof Error ? e.message : 'Error cargando catálogo') })
      .finally(() => { if (!abort.signal.aborted) setBusy(false) })
    return () => abort.abort()
  }, [stableQuery, category, min, max, available, reloadKey])
  useEffect(() => {
    const handle = (e: MouseEvent) => { if (!searchBox.current?.contains(e.target as Node)) setShowSuggest(false) }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])
  const selectSuggestion = (p: Product) => {
    setSearch(p.name)
    setCategory(0); setMin(''); setMax(''); setAvailable(false)
    setShowSuggest(false)
    document.getElementById('tienda')?.scrollIntoView({ behavior: 'smooth' })
  }
  const handleAdd = (p: Product) => {
    if (p.stock <= 0) return
    onAddToCart({ id:p.id,name:p.name,price:p.price,image:p.image,qty:1,stock:p.stock })
    setAdded(p.id)
    window.setTimeout(() => setAdded(v => v === p.id ? null : v), 1200)
  }
  const reset = () => {setSearch(''); setCategory(0);setMin('');setMax('');setAvailable(false);setShowSuggest(false)}
  return (
    <section id="tienda" style={{ padding: '96px 0', background: 'var(--color-cream)', scrollMarginTop: 72 }}>
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px' }}>
        <div className="shop-heading" style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:30,flexWrap:'wrap',gap:24}}>
          <div>
            <p className="eyebrow">TIENDA ONLINE</p>
            <h2 style={{fontFamily:'var(--font-display)',fontWeight:800,fontSize:'clamp(2rem,3.5vw,3rem)',lineHeight:1.1,color:'var(--color-red-deep)'}}>Nuestros productos</h2>
            <p style={{fontSize:13,color:'var(--color-ink-40)',marginTop:12}}>Sabores artesanales de Apurímac, directo a tu mesa.</p>
          </div>
          <span style={{fontSize:12,color:'var(--color-ink-40)'}}>{busy ? 'Buscando...' : `${products.length} productos encontrados`}</span>
        </div>

        <div className="search-panel" style={{padding:24,background:'white',border:'1px solid var(--color-warm-100)',borderRadius:20,boxShadow:'0 4px 20px rgba(28,10,8,0.035)',marginBottom:34}}>
          <div ref={searchBox} style={{position:'relative',marginBottom:18}}>
            <label htmlFor="search-productos" className="field-label">Buscar productos en tiempo real</label>
            <div className="search-line">
              <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" aria-hidden><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>
              <input id="search-productos" value={search} onChange={e => {setSearch(e.target.value);setShowSuggest(true)}} onFocus={() => setShowSuggest(true)} placeholder="Prueba: quinua, queso, yogur..." autoComplete="off" aria-label="Buscar productos" aria-expanded={showSuggest && suggestions.length>0} aria-controls="lista-sugerencias"/>
              {search && <button className="clear-search" onClick={() => {setSearch('');setShowSuggest(false)}} aria-label="Limpiar búsqueda">×</button>}
            </div>
            {showSuggest && stableQuery.length >= 2 && (
              <div id="lista-sugerencias" role="listbox" className="suggestions">
                <div className="suggestions-label">SUGERENCIAS · {suggestions.length} coincidencias</div>
                {suggestions.length===0 ? <p className="suggestions-empty">No se encontraron coincidencias.</p> : suggestions.map(p => (
                  <button key={p.id} className="suggestion" type="button" onClick={() => selectSuggestion(p)} role="option" aria-selected={false}>
                    {p.image ? <img src={p.image} alt=""/> : <div className="img-placeholder">🌾</div>}
                    <span style={{flex:1,textAlign:'left'}}><strong>{p.name}</strong><small>{p.category} · {p.stock} en stock</small></span>
                    <span style={{color:'var(--color-red-mid)',fontWeight:700}}>S/ {Number(p.price).toFixed(2)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="filters-grid">
            <div className="categories-wrap">
              <label className="field-label">Categoría</label>
              <div className="category-buttons">
                {[{id:0,nombre:'Todos'}, ...categories].map(c => <button key={c.id} className={`category-pill ${category===c.id?'selected':''}`} onClick={()=>setCategory(c.id)}>{c.nombre}</button>)}
              </div>
            </div>
            <div className="prices-wrap">
              <label className="field-label">Rango de precios (S/)</label>
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <input className="filter-input" type="number" min="0" step="0.1" placeholder="Mín." aria-label="Precio mínimo" value={min} onChange={e=>setMin(e.target.value)} />
                <span style={{color:'var(--color-ink-40)'}}>—</span>
                <input className="filter-input" type="number" min="0" step="0.1" placeholder="Máx." aria-label="Precio máximo" value={max} onChange={e=>setMax(e.target.value)} />
              </div>
            </div>
            <div className="availability-wrap">
              <label className="field-label">Disponibilidad</label>
              <label className="stock-check"><input type="checkbox" checked={available} onChange={e=>setAvailable(e.target.checked)}/> Solo con stock</label>
            </div>
            <button className="reset-filters" onClick={reset}>Limpiar filtros ↺</button>
          </div>
          {min!=='' && max!=='' && Number(min)>Number(max) && <div role="alert" className="inline-error">El precio mínimo no puede superar al máximo.</div>}
        </div>

        {error && <div className="inline-error" role="alert">{error} <button onClick={()=>window.location.reload()}>Reintentar</button></div>}
        {!error && busy && <div className="loading-catalog" role="status">Consultando productos en MySQL...</div>}
        {!error && !busy && products.length===0 && <div className="empty-catalog"><span>🌾</span><h3>No encontramos productos</h3><p>Prueba con otra búsqueda o rango de precios.</p><button className="primary-btn" onClick={reset}>Mostrar todos</button></div>}
        {!error && !busy && <div className="products-grid">
          {products.map(p => <article key={p.id} className="product-card" style={{backgroundColor:'white',borderRadius:20,overflow:'hidden',border:'1px solid var(--color-warm-100)',boxShadow:'0 2px 8px rgba(28,10,8,0.04)',display:'flex',flexDirection:'column'}}>
            <div style={{position:'relative',height:200,background:'var(--color-parchment)',overflow:'hidden'}}>
              {p.image ? <img src={p.image} alt={p.name} loading="lazy" style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <div className="product-no-image">🌾</div>}
              {p.badge && <span style={{position:'absolute',top:14,left:14,padding:'5px 11px',borderRadius:8,fontSize:11,fontWeight:700,background:badgeColors[p.badge] ?? 'var(--color-red-mid)',color:p.badge==='Premium'?'#1a0a00':'white'}}>{p.badge}</span>}
              <span style={{position:'absolute',top:14,right:14,padding:'4px 10px',borderRadius:6,fontSize:10,fontWeight:600,background:'rgba(253,250,244,0.92)',color:'var(--color-ink-60)'}}>{p.category}</span>
            </div>
            <div style={{padding:'20px 20px 24px',display:'flex',flexDirection:'column',gap:8,flex:1}}>
              <h3 style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:16,color:'var(--color-ink)',lineHeight:1.3}}>{p.name}</h3>
              <p style={{fontSize:13,lineHeight:1.6,color:'var(--color-ink-40)',flex:1}}>{p.description}</p>
              <span style={{fontSize:11,color:p.stock>0?'#357653':'#a12626',fontWeight:600}}>{p.stock>0?`${p.stock} unidades disponibles`:'Agotado'}</span>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:6,gap:6}}>
                <div><span style={{fontSize:11,color:'var(--color-ink-40)'}}>S/ </span><span style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:24,color:'var(--color-red-deep)'}}>{Number(p.price).toFixed(2)}</span></div>
                <button disabled={p.stock<=0} onClick={()=>handleAdd(p)} className={`add-button ${added===p.id?'added':''}`}>{p.stock<=0?'Agotado':added===p.id?'✓ Agregado':'+ Agregar'}</button>
              </div>
            </div>
          </article>)}
        </div>}
      </div>
    </section>
  )
}
