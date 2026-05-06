import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Inventario from './pages/Inventario'
import Movimentacoes from './pages/Movimentacoes'
import Usuarios from './pages/Usuarios'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState('dashboard')
  const [perfil, setPerfil] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
      if (session) loadPerfil(session.user.id)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) loadPerfil(session.user.id)
      else setPerfil(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const loadPerfil = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setPerfil(data)
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'#666' }}>
      Carregando...
    </div>
  )

  if (!session) return <Login />

  return (
    <Layout page={page} setPage={setPage} perfil={perfil} session={session}>
      {page === 'dashboard'      && <Dashboard />}
      {page === 'inventario'     && <Inventario perfil={perfil} />}
      {page === 'movimentacoes'  && <Movimentacoes perfil={perfil} />}
      {page === 'usuarios'       && <Usuarios perfil={perfil} />}
    </Layout>
  )
}
