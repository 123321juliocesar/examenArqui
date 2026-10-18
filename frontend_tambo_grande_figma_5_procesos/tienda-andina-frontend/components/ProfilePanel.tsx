import { useState } from 'react'
import type { User } from '../types'
import { api } from '../lib/api'
import PanelShell from './PanelShell'
export default function ProfilePanel({user,token,onClose,onSaved}:{user:User;token:string;onClose:()=>void;onSaved:(u:User)=>void}){
  const [phone,setPhone]=useState(user.telefono)
  const [address,setAddress]=useState(user.direccion??'')
  const [error,setError]=useState('');const [ok,setOk]=useState('');const [busy,setBusy]=useState(false)
  const submit=async(e:React.FormEvent)=>{e.preventDefault();setBusy(true);setError('');setOk('');try{const r=await api.editProfile(token,{telefono:phone,direccion:address});onSaved(r.usuario);setOk('Perfil actualizado en MySQL.')}catch(e){setError(e instanceof Error?e.message:'No se pudo guardar')}finally{setBusy(false)}}
  return <PanelShell title="Mi perfil" subtitle="Tu información de cuenta, almacenada en la base de datos." onClose={onClose}>
    <div className="profile-heading"><div className="profile-avatar">{user.tipo==='juridica'?'🏢':`${user.nombre?.[0]??''}${user.apellido?.[0]??''}`}</div><div><h3>{user.displayName}</h3><p>{user.tipo==='juridica'?`Empresa · RUC ${user.ruc}`:`Persona natural · DNI ${user.dni}`}</p><small>{user.email}</small></div></div>
    <form onSubmit={e=>void submit()} className="inventory-form"><label className="field-label" htmlFor="phone-profile">Teléfono</label><input id="phone-profile" className="form-input" required maxLength={20} value={phone} onChange={e=>setPhone(e.target.value)}/><label className="field-label" htmlFor="address-profile">Dirección de entrega</label><input id="address-profile" className="form-input" maxLength={255} value={address} onChange={e=>setAddress(e.target.value)} placeholder="Av. Arenas 123, Abancay"/><button className="primary-btn" type="submit" disabled={busy}>{busy?'Guardando...':'Guardar cambios'}</button></form>
    {error&&<div role="alert" className="inline-error">{error}</div>}{ok&&<p role="status" className="success-note">{ok}</p>}
  </PanelShell>
}
