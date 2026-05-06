const S = {
  overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' },
  box: { background:'#fff', borderRadius:12, padding:'1.5rem', width:500, maxWidth:'90%', maxHeight:'90vh', overflowY:'auto' },
  title: { fontSize:15, fontWeight:600, marginBottom:'1.25rem', color:'#1a3a5c' },
  footer: { display:'flex', gap:8, justifyContent:'flex-end', marginTop:'1.25rem' },
  btnCancel: { padding:'8px 16px', fontSize:13, border:'1px solid #e0e4ea', borderRadius:6, background:'transparent', cursor:'pointer', color:'#555' },
  btnConfirm: { padding:'8px 16px', fontSize:13, border:'none', borderRadius:6, background:'#378add', color:'#fff', cursor:'pointer', fontWeight:500 },
}

export default function Modal({ title, onClose, onConfirm, children, confirmLabel = 'Salvar' }) {
  return (
    <div style={S.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={S.box}>
        <div style={S.title}>{title}</div>
        {children}
        <div style={S.footer}>
          <button style={S.btnCancel} onClick={onClose}>Cancelar</button>
          <button style={S.btnConfirm} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

export function FormGroup({ label, children }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:5, marginBottom:12 }}>
      <label style={{ fontSize:12, fontWeight:500, color:'#555' }}>{label}</label>
      {children}
    </div>
  )
}

export const input = {
  width:'100%', padding:'8px 10px', fontSize:13, border:'1px solid #dde1ea',
  borderRadius:6, outline:'none', color:'#1a1a1a', background:'#fff',
}

export const select = {
  ...input, cursor:'pointer',
}
