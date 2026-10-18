import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import type { Product, Purchase, StockMovement, Supplier } from '../types'
import PanelShell from './PanelShell'

type QtyEntry={idProducto:number;cantidad:number;costoUnitario:string}
export default function InventoryPanel({token,onClose,onSaved}:{token:string;onClose:()=>void;onSaved:()=>void}){
  const [tab,setTab]=useState<'crear'|'recibir'|'movimientos'>('crear')
  const [suppliers,setSuppliers]=useState<Supplier[]>([])
  const [products,setProducts]=useState<Product[]>([])
  const [supplier,setSupplier]=useState('')
  const [items,setItems]=useState<QtyEntry[]>([{idProducto:0,cantidad:1,costoUnitario:''}])
  const [observation,setObservation]=useState('')
  const [purchaseId,setPurchaseId]=useState('')
  const [purchase,setPurchase]=useState<Purchase|null>(null)
  const [movementProduct,setMovementProduct]=useState('')
  const [movements,setMovements]=useState<StockMovement[]>([])
  const [low,setLow]=useState<Array<Record<string,unknown>>>([])
  const [busy,setBusy]=useState(false)
  const [err,setErr]=useState('')
  const [ok,setOk]=useState('')
  const load=async()=>{
    try{
      const [pr,su,st]=await Promise.all([api.products(new URLSearchParams({limit:'50'})),api.suppliers(token),api.lowStock(token)])
      setProducts(pr.productos);setSuppliers(su.proveedores);setLow(st.productos)
      if(!supplier&&su.proveedores.length)setSupplier(String(su.proveedores[0].id_proveedor))
    }catch(e){setErr(e instanceof Error?e.message:'No se pudo consultar inventario')}
  }
  useEffect(()=>{void load()},[token])
  const updateItem=(i:number,key:keyof QtyEntry,value:number|string)=>setItems(prev=>prev.map((item,j)=>j===i?{...item,[key]:value}:item))
  const create=async()=>{
    setErr('');setOk('')
    if(!supplier||items.some(i=>!i.idProducto||!i.cantidad||i.cantidad<1||!i.costoUnitario||Number(i.costoUnitario)<0) || new Set(items.map(i=>i.idProducto)).size!==items.length){setErr('Selecciona proveedor y productos sin repetir, con cantidades y costos válidos.');return}
    setBusy(true)
    try{
      const r=await api.createPurchase(token,{idProveedor:Number(supplier),items:items.map(i=>({...i,costoUnitario:Number(i.costoUnitario)})),observacion:observation})
      const id=r.compra.idCompra??r.compra.id_compra
      if(!id)throw new Error('La API no devolvió ID de compra')
      setPurchaseId(String(id));setPurchase(r.compra);setTab('recibir');setOk(`Orden #${id} generada. El stock todavía NO aumentó; registra la recepción cuando llegue el proveedor.`)
    }catch(e){setErr(e instanceof Error?e.message:'No se pudo crear la compra')}
    finally{setBusy(false)}
  }
  const lookup=async()=>{
    setErr('');setOk('')
    if(!/^[1-9]\d*$/.test(purchaseId)) {setErr('Escribe un número de orden válido');return}
    setBusy(true)
    try{const r=await api.purchaseById(token,Number(purchaseId));setPurchase(r.compra)}catch(e){setErr(e instanceof Error?e.message:'No se pudo consultar orden');setPurchase(null)}finally{setBusy(false)}
  }
  const receive=async()=>{
    if(!purchase||!purchaseId||busy)return
    setBusy(true);setErr('');setOk('')
    try{const r=await api.receivePurchase(token,Number(purchaseId));setOk(`Mercadería recibida en orden #${r.recepcion.idCompra}. Stock aumentado automáticamente y movimientos guardados.`);setPurchase({...purchase,estado:'RECIBIDA'});await load();onSaved()}
    catch(e){setErr(e instanceof Error?e.message:'No se pudo recibir mercadería')}finally{setBusy(false)}
  }
  const fetchMovements=async()=>{
    setErr('');setOk('')
    if(!movementProduct)return
    setBusy(true)
    try{const r=await api.movements(token,Number(movementProduct));setMovements(r.movimientos)}catch(e){setErr(e instanceof Error?e.message:'No se pudo consultar movimientos')}finally{setBusy(false)}
  }
  return <PanelShell title="Reposición e inventario" subtitle="Operaciones de compra a proveedor, recepción y movimientos reales de stock." onClose={onClose} wide>
    <div className="tabs-bar"><button onClick={()=>setTab('crear')} className={tab==='crear'?'current':''}>1. Crear orden</button><button onClick={()=>setTab('recibir')} className={tab==='recibir'?'current':''}>2. Recibir mercadería</button><button onClick={()=>setTab('movimientos')} className={tab==='movimientos'?'current':''}>3. Ver movimientos</button></div>
    {tab==='crear' && <div className="inventory-form">
      <div className="subsection"><h3 className="mini-title">Nueva compra al proveedor</h3><p className="muted">La orden no modifica stock. Las unidades ingresarán cuando registres su recepción.</p></div>
      <label className="field-label">Proveedor</label>
      <select className="form-input" value={supplier} onChange={e=>setSupplier(e.target.value)}><option value="">Selecciona proveedor</option>{suppliers.map(s=><option key={s.id_proveedor} value={s.id_proveedor}>{s.nombre}</option>)}</select>
      <label className="field-label" style={{marginTop:18}}>Productos a reponer</label>
      {items.map((item,i)=><div key={i} className="purchase-row"><select className="form-input" value={item.idProducto} onChange={e=>updateItem(i,'idProducto',Number(e.target.value))}><option value="0">Producto...</option>{products.map(p=><option key={p.id} value={p.id}>{p.name} (stock: {p.stock})</option>)}</select><input className="form-input" aria-label="Cantidad" type="number" min="1" step="1" value={item.cantidad} onChange={e=>updateItem(i,'cantidad',Number(e.target.value))}/><input className="form-input" aria-label="Costo unitario" type="number" min="0" step="0.01" placeholder="Costo S/" value={item.costoUnitario} onChange={e=>updateItem(i,'costoUnitario',e.target.value)}/><button className="text-btn" disabled={items.length===1} onClick={()=>setItems(v=>v.filter((_,j)=>j!==i))}>Quitar</button></div>)}
      <button className="text-btn" onClick={()=>setItems(v=>[...v,{idProducto:0,cantidad:1,costoUnitario:''}])}>+ Agregar otro producto</button>
      <label className="field-label" style={{marginTop:14}}>Observación (opcional)</label><input className="form-input" value={observation} onChange={e=>setObservation(e.target.value)} placeholder="Ej.: reposición por stock bajo"/>
      <button className="primary-btn" disabled={busy} onClick={()=>void create()}>{busy?'Generando...':'Generar orden al proveedor →'}</button>
    </div>}
    {tab==='recibir' && <div className="inventory-form"><h3 className="mini-title">Confirmar ingreso de mercadería</h3><p className="muted">Busca la orden por número y registra la recepción solo cuando llegue físicamente. Cada orden puede recibirse una sola vez.</p><div className="lookup-line"><input className="form-input" type="number" min="1" placeholder="N.º de orden de compra" value={purchaseId} onChange={e=>{setPurchaseId(e.target.value);setPurchase(null)}}/><button className="outline-btn" onClick={()=>void lookup()} disabled={busy}>Consultar</button></div>
      {purchase && <div className="purchase-detail"><div className="detail-header"><b>Orden #{purchaseId}</b><span className={`status ${purchase.estado.toLowerCase()}`}>{purchase.estado}</span></div><table className="stock-table"><thead><tr><th>Producto</th><th>Cantidad</th><th>Costo unit.</th></tr></thead><tbody>{purchase.items.map((it,i)=><tr key={i}><td>{products.find(p=>p.id===(it.id_producto??it.idProducto))?.name??`Producto #${it.id_producto??it.idProducto}`}</td><td>{it.cantidad}</td><td>{it.costo_unitario!==undefined?`S/ ${Number(it.costo_unitario).toFixed(2)}`:'Registrado'}</td></tr>)}</tbody></table>{purchase.estado==='GENERADA'?<button className="primary-btn full" disabled={busy} onClick={()=>void receive()}>{busy?'Recibiendo...':'Confirmar recepción y sumar stock'}</button>:<p className="success-note">Orden ya procesada; no puede recibirse dos veces.</p>}</div>}
    </div>}
    {tab==='movimientos' && <div className="inventory-form"><h3 className="mini-title">Trazabilidad del inventario</h3><p className="muted">Las entradas provienen de recepciones; las salidas provienen de pedidos confirmados.</p><div className="lookup-line"><select className="form-input" value={movementProduct} onChange={e=>setMovementProduct(e.target.value)}><option value="">Selecciona producto...</option>{products.map(p=><option key={p.id} value={p.id}>{p.name} — Stock actual: {p.stock}</option>)}</select><button className="outline-btn" disabled={busy||!movementProduct} onClick={()=>void fetchMovements()}>Consultar</button></div><div className="table-scroll"><table className="stock-table"><thead><tr><th>Movimiento</th><th>Unidades</th><th>Antes</th><th>Después</th><th>Origen</th></tr></thead><tbody>{movements.map(m=><tr key={m.id_movimiento}><td>{m.tipo==='ENTRADA_PROVEEDOR'?'Entrada':'Salida'}</td><td>{m.tipo==='ENTRADA_PROVEEDOR'?'+':'−'}{m.cantidad}</td><td>{m.stock_anterior}</td><td><b>{m.stock_nuevo}</b></td><td>{m.id_compra?`Compra #${m.id_compra}`:m.id_pedido?`Pedido #${m.id_pedido}`:'—'}</td></tr>)}{!movements.length && <tr><td colSpan={5} className="muted">Selecciona producto y presiona Consultar para ver movimientos.</td></tr>}</tbody></table></div></div>}
    <div className="low-stock"><h3 className="mini-title">Alertas de stock bajo (≤ 5)</h3>{low.length ? <div className="low-products">{low.map(p=><span key={String(p.id_producto)}>{String(p.nombre)}: <b>{String(p.stock)} unid.</b></span>)}</div> : <p className="muted">Sin alertas de stock bajo.</p>}</div>
    {err && <p className="inline-error" role="alert">{err}</p>}
    {ok && <p className="success-note" role="status">{ok}</p>}
  </PanelShell>
}
