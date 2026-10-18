import type { ReactNode } from 'react'
export default function PanelShell({title,subtitle,onClose,children,wide=false}:{title:string;subtitle:string;onClose:()=>void;children:ReactNode;wide?:boolean}) {
  return <div className="panel-overlay" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}>
    <section className="panel-window" role="dialog" aria-modal="true" aria-label={title} style={{maxWidth:wide?980:700}}>
      <header className="panel-header"><div><p className="panel-kicker">TAMBO GRANDE · GESTIÓN</p><h2>{title}</h2><p>{subtitle}</p></div><button className="panel-close" onClick={onClose} aria-label="Cerrar">×</button></header>
      <div className="panel-body">{children}</div>
    </section>
  </div>
}
