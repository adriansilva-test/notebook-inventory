import { useState } from 'react'
import { supabase } from '../lib/supabase'

const S = {
  page: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f5f7fa' },
  card: { background:'#fff', borderRadius:12, padding:'2rem', width:380, boxShadow:'0 2px 16px rgba(0,0,0,0.08)' },
  logo: { textAlign:'center', marginBottom:'1.75rem' },
  logoText: { fontSize:20, fontWeight:700, color:'#1a3a5c', margin:0 },
  logoSub: { fontSize:12, color:'#888', marginTop:4 },
  label: { display:'block', fontSize:12, fontWeight:500, color:'#555', marginBottom:5 },
  input: { width:'100%', padding:'9px 12px', fontSize:13, border:'1px solid #dde1ea', borderRadius:6, outline:'none', marginBottom:12 },
  btn: { width:'100%', padding:'10px', fontSize:14, fontWeight:500, border:'none', borderRadius:6, background:'#378add', color:'#fff', cursor:'pointer', marginTop:4 },
  error: { fontSize:12, color:'#c0392b', marginBottom:8, padding:'8px 10px', background:'#fdf0f0', borderRadius:6 },
  hint: { fontSize:11, color:'#aaa', textAlign:'center', marginTop:'1rem', lineHeight:1.5 },
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('E-mail ou senha incorretos.')
    setLoading(false)
  }

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.logo}>
          <p style={S.logoText}>NotebookTrack</p>
          <p style={S.logoSub}>Sistema de gestão de equipamentos</p>
        </div>
        <form onSubmit={handleLogin}>
          {error && <div style={S.error}>{error}</div>}
          <label style={S.label}>E-mail</label>
          <input style={S.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required />
          <label style={S.label}>Senha</label>
          <input style={S.input} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          <button style={S.btn} type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <p style={S.hint}>Acesso restrito. Entre em contato com o administrador para obter suas credenciais.</p>
      </div>
    </div>
  )
}
