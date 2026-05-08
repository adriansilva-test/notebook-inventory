import { supabase } from '../lib/supabase'

const S = {
  app: { display:'flex', minHeight:'100vh' },
  sidebar: { width:220, background:'#fff', borderRight:'1px solid #e8eaf0', display:'flex', flexDirection:'column', position:'fixed', top:0, bottom:0, left:0 },
  logo: { padding:'1.25rem', borderBottom:'1px solid #e8eaf0' },
  logoText: { fontSize:15, fontWeight:600, color:'#1a3a5c', margin:0 },
  logoSub: { fontSize:11, color:'#888', marginTop:2 },
  nav: { flex:1, paddingTop:8 },
  navItem: (active) => ({
    display:'flex', alignItems:'center', gap:10, padding:'10px 1.25rem',
    fontSize:13, cursor:'pointer', color: active ? '#185fa5' : '#555',
    background: active ? '#e6f1fb' : 'transparent',
    borderLeft: active ? '2px solid #378add' : '2px solid transparent',
    fontWeight: active ? 500 : 400, transition:'all 0.15s',
  }),
  main: { marginLeft:220, flex:1, padding:'1.5rem', maxWidth:'100%' },
  footer: { padding:'1rem 1.25rem', borderTop:'1px solid #e8eaf0' },
  avatar: { width:30, height:30, borderRadius:'50%', background:'#e6f1fb', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600, color:'#185fa5', flexShrink:0 },
  userRow: { display:'flex', alignItems:'center', gap:10 },
  userName: { fontSize:12, fontWeight:500, color:'#333' },
  userRole: { fontSize:10, padding:'2px 7px', borderRadius:100, background:'#fff3cd', color:'#7a5c00', fontWeight:500, display:'inline-block', marginTop:2 },
  logoutBtn: { marginTop:8, width:'100%', padding:'6px', fontSize:12, border:'1px solid #e8eaf0', borderRadius:6, background:'transparent', cursor:'pointer', color:'#888' },
}

const navItems = [
  { id:'inventario',    label:'Inventário',       icon:'◫' },
  { id:'movimentacoes', label:'Movimentações',    icon:'⇅' },
  {page === 'entradas' && <Movimentacoes perfil={perfil} filtroInicial="entrada" />}
{page === 'saidas'   && <Movimentacoes perfil={perfil} filtroInicial="saida" />}
  { id:'entradas',      label:'↳ Entradas',       icon:'↓', sub:true },
  { id:'saidas',        label:'↳ Saídas',         icon:'↑', sub:true },
  { id:'usuarios',      label:'Usuários',         icon:'◎' },
  { id:'dashboard',     label:'Dashboard',        icon:'▦' },
]

export default function Layout({ children, page, setPage, perfil, session }) {
  const initials = session?.user?.email?.slice(0,2)?.toUpperCase() || 'US'
  const roleLabel = { gestor:'Gestor', operador:'Operador', visualizador:'Visualizador' }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div style={S.app}>
      <div style={S.sidebar}>
        <div style={S.logo}>
          <p style={S.logoText}>Gupy Estoque</p>
          <p style={S.logoSub}>Gestão de equipamentos</p>
        </div>
        <nav style={S.nav}>
          {navItems.map(item => {
            if (item.id === 'usuarios' && perfil?.perfil !== 'gestor') return null
            return (
              <div key={item.id} style={{...S.navItem(page === item.id), paddingLeft: item.sub ? '2rem' : '1.25rem', fontSize: item.sub ? 12 : 13}} onClick={() => setPage(item.id)}>
                <span style={{ fontSize:14, width:18, textAlign:'center' }}>{item.icon}</span>
                {item.label}
              </div>
            )
          })}
        </nav>
        <div style={S.footer}>
          <div style={S.userRow}>
            <div style={S.avatar}>{initials}</div>
            <div>
              <div style={S.userName}>{session?.user?.email}</div>
              <span style={S.userRole}>{roleLabel[perfil?.perfil] || 'Usuário'}</span>
            </div>
          </div>
          <button style={S.logoutBtn} onClick={handleLogout}>Sair</button>
        </div>
      </div>
      <main style={S.main}>{children}</main>
    </div>
  )
}
