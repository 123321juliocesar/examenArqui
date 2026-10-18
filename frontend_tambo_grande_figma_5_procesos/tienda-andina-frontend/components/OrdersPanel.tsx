import { useEffect, useState } from 'react'
import type { OrderDetail, OrderShort, User } from '../types'
import { api } from '../lib/api'
import PanelShell from './PanelShell'

const money=(v:number|string)=>`S/ ${Number(v).toFixed(2)}`
const when=(v:string)=>new Date(v).toLocaleString('es-PE',{dateStyle:'medium',timeStyle:'short'})

export default function OrdersPanel({user,token,onClose,onSaved}:{user:User;token:string;onClose:()=>void;onSaved:()=>void}) {
  const [orders,setOrders]=useState<OrderShort[]>([])
  const [selected,setSelected]=useState<OrderDetail|null>(null)
  const [loading,setLoading]=useState(true)
  const [working,setWorking]=useState(false)
  const [err,setErr]=useState('')
  const [ok,setOk]=useState('')
  const [payment,setPayment]=useState<'SIMULADO'|'EFECTIVO'|'TRANSFERENCIA'>('SIMULADO')
  const [reference,setReference]=useState('')
  const admin=user.rol==='ADMIN'
  const refresh=async()=>{setErr('');try {const r=admin?await api.allOrders(token):await api.myOrders(token);setOrders(r.pedidos)}catch(e){setErr(e instanceof Error?e.message:'No se pudo cargar pedidos')}finally{setLoading(false)}}
  useEffect(()=>{void refresh()},[token,admin])
  const open=async(id:number)=>{setErr('');setOk('');try{const r=await api.orderDetail(token,id);setSelected(r.pedido)}catch(e){setErr(e instanceof Error?e.message:'No se pudo cargar pedido')}}
  const close=async()=>{
    if(!selected||working)return
    setWorking(true);setErr('');setOk('')
    try {
      const r=await api.closeOrder(token,selected.id_pedido,{medio:payment,monto:Number(selected.total),...(payment==='TRANSFERENCIA'?{referencia:reference}:{})})
      await refresh()
      await open(selected.id_pedido)
      setOk(r.pedido.advertencia||`Pedido #${selected.id_pedido} entregado y cobro registrado.`)
      onSaved()
    } catch(e) {setErr(e instanceof Error?e.message:'Error al cerrar pedido')}
    finally{setWorking(false)}
  }
  return <PanelShell title={admin?'Atención de pedidos':'Mis pedidos'} subtitle={admin?'Verifica la entrega y registra el cobro sin pasarela online.':'Consulta los pedidos que realizaste y su estado.'} onClose={onClose} wide>
    <div className="split-pane">
      <div>
        <h3 className="mini-title">{admin?'Pedidos recibidos':'Historial de compras'}</h3>
        {loading?<p className="muted">Cargando pedidos...</p>:orders.length===0?<p className="muted">Todavía no hay pedidos registrados.</p>:<div className="order-list">
          {orders.map(p=><button key={p.id_pedido} className={`order-row ${selected?.id_pedido===p.id_pedido?'is-active':''}`} onClick={()=>void open(p.id_pedido)}>
            <span><strong>Pedido #{p.id_pedido}</strong><small>{when(p.creado_en)}</small></span>
            <span style={{textAlign:'right'}}><strong>{money(p.total)}</strong><small className={`status ${p.estado.toLowerCase()}`}>{p.estado}</small></span>
          </button>)}
        </div>}
      </div>
      <div className="details-box">
        <h3 className="mini-title">Detalle del pedido</h3>
        {!selected?<p className="muted">Selecciona un pedido para conocer sus productos y seguimiento.</p>:<>
          <div className="detail-header"><strong>Pedido #{selected.id_pedido}</strong><span className={`status ${selected.estado.toLowerCase()}`}>{selected.estado}</span></div>
          <p className="muted">{selected.direccion_entrega ? `Entregar en: ${selected.direccion_entrega}`:'Dirección no especificada'}</p>
          {selected.notas && <p className="muted">Indicaciones: {selected.notas}</p>}
          <div className="detail-products">{selected.items.map(item=><div className="detail-product" key={item.id_producto}><span>{item.nombre}<small>{item.cantidad} × {money(item.precio_unitario)}</small></span><b>{money(item.subtotal)}</b></div>)}</div>
          <div className="detail-total"><span>Total pedido</span><b>{money(selected.total)}</b></div>
          {selected.pago && <div className="success-note">Cobro registrado: {selected.pago.medio} — {money(selected.pago.monto)}</div>}
          {admin && selected.estado==='CONFIRMADO' && <div className="close-form">
            <h4>Confirmar entrega y cobro</h4>
            <label className="field-label">Medio de cobro</label>
            <select className="form-input" value={payment} onChange={e=>setPayment(e.target.value as typeof payment)}><option value="SIMULADO">SIMULADO (solo demostración)</option><option value="EFECTIVO">EFECTIVO (ya cobrado)</option><option value="TRANSFERENCIA">TRANSFERENCIA (ya verificada)</option></select>
            {payment==='TRANSFERENCIA' && <><label className="field-label">Referencia de transferencia</label><input className="form-input" value={reference} onChange={e=>setReference(e.target.value)} placeholder="N.° operación bancaria"/></>}
            <p className="muted">Solo confirma EFECTIVO o TRANSFERENCIA después de entregar y verificar el dinero recibido. El modo SIMULADO no representa un pago real.</p>
            <button disabled={working || (payment==='TRANSFERENCIA'&&!reference.trim())} className="primary-btn full" onClick={()=>void close()}>{working?'Guardando...':'Registrar entrega y cobro'}</button>
          </div>}
        </>}
      </div>
    </div>
    {err && <p className="inline-error" role="alert">{err}</p>}
    {ok && <p className="success-note" role="status">{ok}</p>}
    <p className="muted" style={{marginTop:18}}>Datos procedentes de MySQL mediante /api/pedidos. La vista no es un dashboard analítico.</p>
  </PanelShell>
}
