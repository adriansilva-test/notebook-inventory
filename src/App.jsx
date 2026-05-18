import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Inventario from './pages/Inventario'
import Estoque from './pages/Estoque'
import Atribuicoes from './pages/Atribuicoes'
import Movimentacoes from './pages/Movimentacoes'
import Usuarios from './pages/Usuarios'
import Detalhe from './pages/Detalhe'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState('estoque')
  const [perfil, setPerfil] = useState(null)
  const [detalheId, setDetalheId] = useState(null)

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

  const openDetalhe = (id) => {
    setDetalheId(id)
    setPage('detalhe')
  }

  const voltarDaDetalhe = () => {
    setDetalheId(null)
    setPage('inventario')
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'#666' }}>
      Carregando...
    </div>
  )

  if (!session) return <Login />

  return (
    <Layout page={page} setPage={setPage} perfil={perfil} session={session}>
      {page === 'estoque'        && <Estoque perfil={perfil} onDetalhe={openDetalhe} />}
      {page === 'atribuicoes'    && <Atribuicoes perfil={perfil} onDetalhe={openDetalhe} />}
      {page === 'inventario'     && <Inventario perfil={perfil} onDetalhe={openDetalhe} />}
      {page === 'movimentacoes'  && <Movimentacoes perfil={perfil} />}
      {page === 'entradas'       && <Movimentacoes perfil={perfil} filtroInicial="entrada" />}
      {page === 'saidas'         && <Movimentacoes perfil={perfil} filtroInicial="saida" />}
      {page === 'usuarios'       && <Usuarios perfil={perfil} />}
      {page === 'dashboard'      && <Dashboard onDetalhe={openDetalhe} />}
      {page === 'detalhe'        && <Detalhe id={detalheId} onVoltar={voltarDaDetalhe} perfil={perfil} />}
    </Layout>
  )
}
