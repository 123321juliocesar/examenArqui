import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Products from './components/Products'
import AuthModal from './components/AuthModal'
import CartSidebar from './components/CartSidebar'
import About from './components/About'
import Footer from './components/Footer'
import OrdersPanel from './components/OrdersPanel'
import InventoryPanel from './components/InventoryPanel'
import ProfilePanel from './components/ProfilePanel'
import { api } from './lib/api'
import type { CartItem, User } from './types'

const TOKEN_KEY = 'tambo_demo_token'
const CART_KEY=(userId:number)=>`tambo_cart_${userId}`
function readCart(id:number):CartItem[]{
  try {
    const saved=JSON.parse(localStorage.getItem(CART_KEY(id))||'[]') as CartItem[]
    return Array.isArray(saved) ? saved.filter(i=>Number.isSafeInteger(i.id)&&i.id>0&&Number.isSafeInteger(i.qty)&&i.qty>0).slice(0,30) : []
  } catch { return [] }
}

export default function App() {
  const [user, setUser] = useState<User|null>(null)
  const [token,setToken] = useState<string|null>(null)
  const [cart,setCart] = useState<CartItem[]>([])
  const [showAuth,setShowAuth] = useState(false)
  const [authMode,setAuthMode] = useState<'login'|'register'>('login')
  const [showCart,setShowCart] = useState(false)
  const [screen,setScreen] = useState<'orders'|'inventory'|'profile'|null>(null)
  const [reloadKey,setReloadKey] = useState(0)
  const [checkoutLoading,setCheckoutLoading] = useState(false)
  const [checkoutError,setCheckoutError] = useState('')
  const [notice,setNotice] = useState('')
  const [loadingSession,setLoadingSession] = useState(true)

  // Recuperar sesión en una recarga; validar token con el backend, no confiar en localStorage.
  useEffect(()=>{
    const saved=sessionStorage.getItem(TOKEN_KEY)
    if (!saved) {setLoadingSession(false);return}
    api.me(saved).then(({usuario})=>{
      setUser(usuario);setToken(saved);setCart(readCart(usuario.id))
    }).catch(()=>sessionStorage.removeItem(TOKEN_KEY)).finally(()=>setLoadingSession(false))
  },[])

  useEffect(()=>{if(user) localStorage.setItem(CART_KEY(user.id),JSON.stringify(cart))},[cart,user])
  useEffect(()=>{if(!notice)return;const t=window.setTimeout(()=>setNotice(''),6500);return()=>window.clearTimeout(t)},[notice])
  const logout=()=>{sessionStorage.removeItem(TOKEN_KEY);setToken(null);setUser(null);setCart([]);setScreen(null);setShowCart(false);setNotice('Sesión cerrada.')}
  const onAuth=(u:User,jwt:string)=>{sessionStorage.setItem(TOKEN_KEY,jwt);setToken(jwt);setUser(u);setCart(readCart(u.id));setShowAuth(false);setNotice(`¡Bienvenido, ${u.displayName}!`)}
  const openLogin=()=>{setAuthMode('login');setShowAuth(true)}
  const openRegister=()=>{setAuthMode('register');setShowAuth(true)}
  const refresh=()=>setReloadKey(k=>k+1)
  const addToCart=(item:CartItem)=>{
    if(!user){openLogin();setNotice('Inicia sesión para guardar productos en tu carrito.');return}
    setCart(prev=>{
      const existing=prev.find(c=>c.id===item.id)
      if(existing){if(existing.qty>=item.stock){setNotice('Has alcanzado la cantidad disponible de este producto.');return prev}return prev.map(c=>c.id===item.id?{...c,stock:item.stock,price:item.price,qty:c.qty+1}:c)}
      return [...prev,{...item,qty:1}]
    })
    setCheckoutError('');setShowCart(true)
  }
  const removeFromCart=(id:number)=>setCart(prev=>prev.filter(c=>c.id!==id))
  const updateQty=(id:number,qty:number)=>{if(qty<1)return removeFromCart(id);setCart(prev=>prev.map(c=>c.id===id?{...c,qty:Math.min(qty,c.stock)}:c))}
  const checkout=async(direccion:string,notas:string)=>{
    if(!token||!user){setShowCart(false);openLogin();return}
    if(!direccion.trim()){setCheckoutError('Ingresa una dirección de entrega.');return}
    if(!cart.length)return
    setCheckoutError('');setCheckoutLoading(true)
    try{
      const {pedido}=await api.placeOrder(token,{items:cart.map(c=>({idProducto:c.id,cantidad:c.qty})),direccionEntrega:direccion.trim(),notas})
      setCart([]);setShowCart(false);refresh()
      setNotice(`Pedido #${pedido.idPedido} registrado por S/ ${Number(pedido.total).toFixed(2)}. Paga al recibirlo.`)
      setScreen('orders')
    } catch(e){setCheckoutError(e instanceof Error?e.message:'No se pudo registrar pedido');refresh()}
    finally{setCheckoutLoading(false)}
  }

  return <div className="min-h-screen" style={{backgroundColor:'var(--color-cream)'}}>
    <Navbar user={user} cartCount={cart.reduce((s,c)=>s+c.qty,0)} onCartClick={()=>setShowCart(true)} onLoginClick={openLogin} onLogout={logout} onOrders={()=>setScreen('orders')} onInventory={()=>setScreen('inventory')} onProfile={()=>setScreen('profile')}/>
    <main>
      <Hero onShopClick={()=>document.getElementById('tienda')?.scrollIntoView({behavior:'smooth'})}/>
      <About/>
      <Products onAddToCart={addToCart} reloadKey={reloadKey}/>
    </main>
    <Footer onRegisterClick={openRegister}/>
    {loadingSession && <div className="session-pill">Recuperando sesión...</div>}
    {notice && <div className="toast" role="status"><span>{notice}</span><button onClick={()=>setNotice('')} aria-label="Cerrar aviso">×</button></div>}
    {showAuth&&<AuthModal mode={authMode} onClose={()=>setShowAuth(false)} onModeChange={setAuthMode} onSuccess={onAuth}/>}
    {showCart&&<CartSidebar cart={cart} user={user} onClose={()=>setShowCart(false)} onRemove={removeFromCart} onUpdateQty={updateQty} onCheckout={checkout} checkoutLoading={checkoutLoading} checkoutError={checkoutError}/>}
    {screen==='orders' && user && token && <OrdersPanel user={user} token={token} onClose={()=>setScreen(null)} onSaved={refresh}/>}
    {screen==='inventory' && user?.rol==='ADMIN' && token && <InventoryPanel token={token} onClose={()=>setScreen(null)} onSaved={refresh}/>}
    {screen==='profile' && user && token && <ProfilePanel user={user} token={token} onClose={()=>setScreen(null)} onSaved={u=>setUser(u)}/>}
  </div>
}
