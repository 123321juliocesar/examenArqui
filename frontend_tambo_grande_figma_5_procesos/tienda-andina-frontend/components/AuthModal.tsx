import { api } from '../lib/api'
import { useState, useRef, useEffect } from 'react'
import type { User, TipoPersona } from '../types'

interface Props {
  mode: 'login' | 'register'
  onClose: () => void
  onModeChange: (m: 'login' | 'register') => void
  onSuccess: (user: User, token: string) => void
}

const emptyNatural = {
  nombre: '', apellido: '', dni: '', fechaNacimiento: '', telefono: '', email: '', password: '',
}
const emptyJuridica = {
  razonSocial: '', ruc: '', representante: '', cargo: '', rubro: '', direccion: '', telefono: '', email: '', password: '',
}

type NaturalForm = typeof emptyNatural
type JuridicaForm = typeof emptyJuridica

const RUBROS = [
  'Centro Educativo / Institución', 'Restaurante / Cafetería', 'Empresa Privada',
  'Organización Pública', 'Hotel / Hostal', 'Supermercado / Bodega', 'ONG / Asociación', 'Otro',
]

export default function AuthModal({ mode, onClose, onModeChange, onSuccess }: Props) {
  const [tipo, setTipo] = useState<TipoPersona>('natural')
  const [natural, setNatural] = useState(emptyNatural)
  const [juridica, setJuridica] = useState(emptyJuridica)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const setN = (k: keyof NaturalForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setNatural(p => ({ ...p, [k]: e.target.value }))

  const setJ = (k: keyof JuridicaForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setJuridica(p => ({ ...p, [k]: e.target.value }))

  const validateRegister = (): Record<string, string> => {
    const errs: Record<string, string> = {}
    if (tipo === 'natural') {
      if (!natural.nombre.trim()) errs.nombre = 'Requerido'
      if (!natural.apellido.trim()) errs.apellido = 'Requerido'
      if (!/^\d{8}$/.test(natural.dni)) errs.dni = 'DNI: 8 dígitos exactos'
      if (!natural.fechaNacimiento) errs.fechaNacimiento = 'Requerido'
      if (!/^\d{9}$/.test(natural.telefono)) errs.telefono = '9 dígitos sin +51'
      if (!natural.email || !/\S+@\S+\.\S+/.test(natural.email)) errs.email = 'Email inválido'
      if (!natural.password || natural.password.length < 6) errs.password = 'Mínimo 6 caracteres'
    } else {
      if (!juridica.razonSocial.trim()) errs.razonSocial = 'Requerido'
      if (!/^\d{11}$/.test(juridica.ruc)) errs.ruc = 'RUC: 11 dígitos exactos'
      if (!juridica.representante.trim()) errs.representante = 'Requerido'
      if (!juridica.rubro) errs.rubro = 'Selecciona un rubro'
      if (!/^\d{9,11}$/.test(juridica.telefono)) errs.telefono = 'Teléfono inválido'
      if (!juridica.email || !/\S+@\S+\.\S+/.test(juridica.email)) errs.email = 'Email inválido'
      if (!juridica.password || juridica.password.length < 6) errs.password = 'Mínimo 6 caracteres'
    }
    return errs
  }

  const validateLogin = (): Record<string, string> => {
    const errs: Record<string, string> = {}
    if (!loginForm.email || !/\S+@\S+\.\S+/.test(loginForm.email)) errs.email = 'Email inválido'
    if (!loginForm.password || loginForm.password.length < 6) errs.password = 'Mínimo 6 caracteres'
    return errs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = mode === 'login' ? validateLogin() : validateRegister()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      const result = mode === 'login'
        ? await api.login(loginForm.email, loginForm.password)
        : await api.register(tipo === 'natural' ? { ...natural, tipoPersona: 'natural' } : { ...juridica, tipoPersona: 'juridica' })
      onSuccess(result.usuario, result.token)
    } catch (err) {
      setErrors({ api: err instanceof Error ? err.message : 'No se pudo completar la solicitud' })
    } finally {
      setLoading(false)
    }
  }

  const resetAll = () => { setErrors({}); setLoading(false) }

  return (
    <div
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        backgroundColor: 'rgba(28,10,8,0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
    >
      <div style={{
        width: '100%', maxWidth: mode === 'register' && tipo === 'juridica' ? 580 : 500,
        backgroundColor: 'var(--color-cream)',
        borderRadius: 24, overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(28,10,8,0.35)',
        border: '1px solid var(--color-warm-100)',
        animation: 'fadeUp 0.25s ease',
        transition: 'max-width 0.3s ease',
      }}>
        <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:none } } @keyframes spin { to { transform: rotate(360deg) } }`}</style>

        {/* Header */}
        <div style={{
          padding: '28px 32px 24px',
          background: 'linear-gradient(135deg, #6B1212 0%, #9B1C1C 100%)',
          position: 'relative',
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 16, right: 16, border: 'none',
              background: 'rgba(255,255,255,0.12)', cursor: 'pointer',
              width: 32, height: 32, borderRadius: '50%', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.22)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 800, color: 'white', fontSize: 14, flexShrink: 0,
            }}>TG</div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'white', margin: '0 0 4px' }}>
                {mode === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
              </h2>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                {mode === 'login'
                  ? 'Accede a tu carrito y pedidos guardados'
                  : 'Regístrate y empieza a pedir productos andinos'}
              </p>
            </div>
          </div>
        </div>

        {/* Tab bar — login / register */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-warm-100)', backgroundColor: 'var(--color-parchment)' }}>
          {(['login', 'register'] as const).map(m => (
            <button
              key={m}
              onClick={() => { onModeChange(m); resetAll() }}
              style={{
                flex: 1, padding: '13px 0', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14,
                backgroundColor: 'transparent', transition: 'all 0.2s',
                ...(mode === m
                  ? { color: 'var(--color-red-mid)', borderBottom: '2.5px solid var(--color-red-mid)', marginBottom: -1 }
                  : { color: 'var(--color-ink-40)', borderBottom: '2.5px solid transparent' }),
              }}
            >
              {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
            </button>
          ))}
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px 32px 32px', maxHeight: '68vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ── LOGIN ── */}
          {mode === 'login' && (
            <>
              <Field label="Correo electrónico" error={errors.email}>
                <Input type="email" placeholder="correo@ejemplo.com" value={loginForm.email} onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))} hasError={!!errors.email} />
              </Field>
              <Field label="Contraseña" error={errors.password}>
                <Input type="password" placeholder="••••••••" value={loginForm.password} onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))} hasError={!!errors.password} />
              </Field>
            </>
          )}

          {/* ── REGISTER ── */}
          {mode === 'register' && (
            <>
              {/* Tipo selector */}
              <div style={{ marginBottom: 4 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-ink-60)', marginBottom: 10, letterSpacing: '0.02em' }}>
                  Tipo de cuenta
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {([
                    { value: 'natural', icon: '👤', title: 'Persona Natural', desc: 'Compras personales y familiares' },
                    { value: 'juridica', icon: '🏢', title: 'Persona Jurídica', desc: 'Empresas, colegios, instituciones' },
                  ] as { value: TipoPersona; icon: string; title: string; desc: string }[]).map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => { setTipo(opt.value); setErrors({}) }}
                      style={{
                        padding: '14px 16px', borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                        transition: 'all 0.2s', border: '2px solid',
                        ...(tipo === opt.value
                          ? { borderColor: 'var(--color-red-mid)', backgroundColor: 'rgba(155,28,28,0.05)', boxShadow: '0 0 0 3px rgba(155,28,28,0.08)' }
                          : { borderColor: 'var(--color-warm-200)', backgroundColor: 'white' }),
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 20 }}>{opt.icon}</span>
                        {tipo === opt.value && (
                          <span style={{
                            marginLeft: 'auto', width: 18, height: 18, borderRadius: '50%',
                            backgroundColor: 'var(--color-red-mid)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <svg width="10" height="10" fill="none" stroke="white" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        )}
                      </div>
                      <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, color: tipo === opt.value ? 'var(--color-red-deep)' : 'var(--color-ink)', marginBottom: 2 }}>
                        {opt.title}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-ink-40)', lineHeight: 1.4 }}>
                        {opt.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '0 0 4px' }}>
                <div style={{ flex: 1, height: 1, backgroundColor: 'var(--color-warm-100)' }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-ink-40)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {tipo === 'natural' ? 'Datos personales' : 'Datos de la empresa'}
                </span>
                <div style={{ flex: 1, height: 1, backgroundColor: 'var(--color-warm-100)' }} />
              </div>

              {/* ── PERSONA NATURAL fields ── */}
              {tipo === 'natural' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Field label="Nombre" error={errors.nombre}>
                      <Input type="text" placeholder="Juan" value={natural.nombre} onChange={setN('nombre')} hasError={!!errors.nombre} />
                    </Field>
                    <Field label="Apellido" error={errors.apellido}>
                      <Input type="text" placeholder="Quispe" value={natural.apellido} onChange={setN('apellido')} hasError={!!errors.apellido} />
                    </Field>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Field label="DNI" error={errors.dni} hint="8 dígitos">
                      <Input type="text" placeholder="12345678" maxLength={8} value={natural.dni} onChange={setN('dni')} hasError={!!errors.dni} />
                    </Field>
                    <Field label="Fecha de nacimiento" error={errors.fechaNacimiento}>
                      <Input type="date" value={natural.fechaNacimiento} onChange={setN('fechaNacimiento')} hasError={!!errors.fechaNacimiento} />
                    </Field>
                  </div>
                  <Field label="Número de celular" error={errors.telefono}>
                    <PhoneInput value={natural.telefono} onChange={setN('telefono')} hasError={!!errors.telefono} />
                  </Field>
                </>
              )}

              {/* ── PERSONA JURÍDICA fields ── */}
              {tipo === 'juridica' && (
                <>
                  <Field label="Razón Social" error={errors.razonSocial}>
                    <Input type="text" placeholder="Colegio Nacional San Juan S.A.C." value={juridica.razonSocial} onChange={setJ('razonSocial')} hasError={!!errors.razonSocial} />
                  </Field>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Field label="RUC" error={errors.ruc} hint="11 dígitos">
                      <Input type="text" placeholder="20123456789" maxLength={11} value={juridica.ruc} onChange={setJ('ruc')} hasError={!!errors.ruc} />
                    </Field>
                    <Field label="Rubro / Sector" error={errors.rubro}>
                      <select
                        value={juridica.rubro}
                        onChange={setJ('rubro')}
                        style={{
                          width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14,
                          fontFamily: 'var(--font-body)', color: juridica.rubro ? 'var(--color-ink)' : 'var(--color-ink-40)',
                          outline: 'none', appearance: 'none', cursor: 'pointer',
                          backgroundColor: errors.rubro ? '#FEF2F2' : 'white',
                          border: `1.5px solid ${errors.rubro ? '#FCA5A5' : 'var(--color-warm-200)'}`,
                        }}
                      >
                        <option value="">Seleccionar...</option>
                        {RUBROS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </Field>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Field label="Representante legal" error={errors.representante}>
                      <Input type="text" placeholder="María García" value={juridica.representante} onChange={setJ('representante')} hasError={!!errors.representante} />
                    </Field>
                    <Field label="Cargo" error={undefined}>
                      <Input type="text" placeholder="Directora / Gerente" value={juridica.cargo} onChange={setJ('cargo')} hasError={false} />
                    </Field>
                  </div>
                  <Field label="Dirección de la empresa" error={undefined}>
                    <Input type="text" placeholder="Av. Arenas 123, Abancay" value={juridica.direccion} onChange={setJ('direccion')} hasError={false} />
                  </Field>
                  <Field label="Teléfono de contacto" error={errors.telefono}>
                    <PhoneInput value={juridica.telefono} onChange={setJ('telefono')} hasError={!!errors.telefono} />
                  </Field>
                </>
              )}

              {/* Divider — account */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' }}>
                <div style={{ flex: 1, height: 1, backgroundColor: 'var(--color-warm-100)' }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-ink-40)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Acceso a la cuenta</span>
                <div style={{ flex: 1, height: 1, backgroundColor: 'var(--color-warm-100)' }} />
              </div>

              <Field label="Correo electrónico" error={errors.email}>
                <Input
                  type="email" placeholder="correo@empresa.com"
                  value={tipo === 'natural' ? natural.email : juridica.email}
                  onChange={tipo === 'natural' ? setN('email') : setJ('email')}
                  hasError={!!errors.email}
                />
              </Field>
              <Field label="Contraseña" error={errors.password} hint="Mínimo 6 caracteres">
                <Input
                  type="password" placeholder="••••••••"
                  value={tipo === 'natural' ? natural.password : juridica.password}
                  onChange={tipo === 'natural' ? setN('password') : setJ('password')}
                  hasError={!!errors.password}
                />
              </Field>

              <p style={{ fontSize: 12, color: 'var(--color-ink-40)', lineHeight: 1.6 }}>
                Al registrarte aceptas los términos y condiciones y la política de privacidad de Tambo Grande.
              </p>
            </>
          )}

          {errors.api && <div role="alert" style={{background:'#fff2ee',border:'1px solid #EAB2A8',borderRadius:10,padding:'12px 14px',color:'#842525',fontSize:13,lineHeight:1.5}}>{errors.api}</div>}
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '15px', borderRadius: 12, border: 'none', cursor: loading ? 'default' : 'pointer',
              fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 15, color: 'white',
              background: loading ? 'var(--color-warm-200)' : 'linear-gradient(135deg, var(--color-red-mid), var(--color-red-deep))',
              boxShadow: loading ? 'none' : '0 4px 20px rgba(122,21,21,0.3)',
              transition: 'all 0.2s', marginTop: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {loading ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Procesando...
              </>
            ) : mode === 'login' ? 'Ingresar a mi cuenta' : tipo === 'juridica' ? 'Registrar empresa →' : 'Crear cuenta →'}
          </button>
        </form>
      </div>
    </div>
  )
}

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-ink-60)', letterSpacing: '0.02em' }}>{label}</label>
        {hint && !error && <span style={{ fontSize: 11, color: 'var(--color-ink-40)' }}>{hint}</span>}
        {error && <span style={{ fontSize: 11, color: '#DC2626', fontWeight: 500 }}>{error}</span>}
      </div>
      {children}
    </div>
  )
}

function Input({ hasError, style: extra, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      {...props}
      onFocus={e => { setFocused(true); props.onFocus?.(e) }}
      onBlur={e => { setFocused(false); props.onBlur?.(e) }}
      style={{
        width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14,
        fontFamily: 'var(--font-body)', color: 'var(--color-ink)', outline: 'none',
        backgroundColor: hasError ? '#FEF2F2' : 'white',
        border: `1.5px solid ${hasError ? '#FCA5A5' : focused ? 'var(--color-red-mid)' : 'var(--color-warm-200)'}`,
        boxShadow: focused && !hasError ? '0 0 0 3px rgba(155,28,28,0.08)' : 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        ...extra,
      }}
    />
  )
}

function PhoneInput({ value, onChange, hasError }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; hasError: boolean }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{
      display: 'flex', borderRadius: 10, overflow: 'hidden',
      border: `1.5px solid ${hasError ? '#FCA5A5' : focused ? 'var(--color-red-mid)' : 'var(--color-warm-200)'}`,
      boxShadow: focused && !hasError ? '0 0 0 3px rgba(155,28,28,0.08)' : 'none',
      transition: 'border-color 0.15s, box-shadow 0.15s',
      backgroundColor: hasError ? '#FEF2F2' : 'white',
    }}>
      <div style={{ padding: '11px 14px', borderRight: '1px solid var(--color-warm-100)', fontSize: 14, fontWeight: 600, color: 'var(--color-ink-60)', backgroundColor: 'var(--color-parchment)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
        🇵🇪 <span style={{ fontSize: 13 }}>+51</span>
      </div>
      <input
        type="tel" placeholder="987 654 321" maxLength={9} value={value} onChange={onChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ flex: 1, padding: '11px 14px', fontSize: 14, fontFamily: 'var(--font-body)', border: 'none', outline: 'none', backgroundColor: 'transparent', color: 'var(--color-ink)' }}
      />
    </div>
  )
}
