import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Modal, { FormGroup, input, select } from '../components/Modal'

const S = {
  header: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem' },
  title: { fontSize:20, fontWeight:600, color:'#1a3a5c' },
  addBtn: { padding:'8px 16px', fontSize:13, fontWeight:500, border:'none', borderRadius:6, background:'#378add', color:'#fff', cursor:'pointer' },
  card: { background:'#fff', border:'1px solid #e8eaf0', borderRadius:10, padding:'1rem' },
  table: { width:'100%', borderCollapse:'collapse', fontSize:13 },
  th: { textAlign:'left', padding:'8px 10px', fontWeight:500, fontSize:12, color:'#888', borderBottom:'1px solid #f0f2f5' },
  td: { padding:'10px', borderBottom:'1px solid #f0f2f5', color:'#333' },
  badge: (p) => {
    const map = { gestor:['#e6f1fb','#185fa5'], operador:['#fff3cd','#7a5c00'], visualizador:['#f0f2f5','#555'] }
    const [bg, color] = map[p] || ['#eee','#333']
    return { fontSize:11, padding:'2px 8px', borderRadius:100, background:bg, color, fontWeight:500 }
  },
  info: { background:'#e6f1fb', borderRadius:8, padding:'10px 14px', fontSize:12, color:'#185fa5', marginBottom:'1rem', lineHeight:1.6 },
  noAccess: { textAlign:'center', color:'#aaa', padding:'3rem', fontSize:14 },
}

const perfilLabel = { gestor:'Gestor', operador:'Operador', visualizador:'Visualizador' }
const perfilDesc = {
  gestor: 'Acesso total: inventário, movimentações e gerenciamento de usuários.',
  operador: 'Pode registrar entradas e saídas e editar inventário. Não gerencia usuários.',
  visualizador: 'Somente leitura. Não pode fazer alterações.',
}

export default function Usuarios({ perfil }) {
  const [users, setUsers] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { if (perfil?.perfil === 'gestor') load() }, [perfil])

  const load = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at')
    setUsers(data || [])
  }

  if (perfil?.perfil !== 'gestor') {
    return <p style={S.noAccess}>Acesso restrito a gestores.</p>
  }

  const f = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const save = async () => {
    if (!form.email || !form.senha || !form.perfil) return alert('Preencha todos os campos.')
    if (form.senha.length < 6) return alert('A senha deve ter ao menos 6 caracteres.')
    setSaving(true)
    setMsg('')

    const { data, error } = await supabase.auth.admin.createUser({
      email: form.email,
      password: form.senha,
      email_confirm: true,
    })

    if (error) {
      setMsg('Erro ao criar usuário: ' + error.message)
      setSaving(false)
      return
    }

    await supabase.from('profiles').insert([{ id: data.user.id, perfil: form.perfil, nome: form.nome || '' }])

    setSaving(false)
    setModal(false)
    load()
  }

  return (
    <div>
      <div style={S.header}>
        <p style={S.title}>Usuários do sistema</p>
        <button style={S.addBtn} onClick={() => { setForm({ perfil:'operador' }); setMsg(''); setModal(true) }}>+ Novo usuário</button>
      </div>

      <div style={S.info}>
        <strong>Perfis de acesso:</strong>{' '}
        <strong>Gestor</strong> — acesso total, incluindo esta tela.{' '}
        <strong>Operador</strong> — registra entradas/saídas e edita inventário.{' '}
        <strong>Visualizador</strong> — apenas leitura.
      </div>

      <div style={S.card}>
        <table style={S.table}>
          <thead>
            <tr>
              {['Nome','E-mail','Perfil','Permissões'].map(h => <th key={h} style={S.th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr><td colSpan={4} style={{ ...S.td, color:'#aaa', textAlign:'center', padding:'2rem' }}>Nenhum usuário encontrado.</td></tr>
            )}
            {users.map(u => (
              <tr key={u.id}>
                <td style={{ ...S.td, fontWeight:500 }}>{u.nome || '—'}</td>
                <td style={{ ...S.td, color:'#888' }}>{u.email || '—'}</td>
                <td style={S.td}><span style={S.badge(u.perfil)}>{perfilLabel[u.perfil] || u.perfil}</span></td>
                <td style={{ ...S.td, fontSize:12, color:'#888' }}>{perfilDesc[u.perfil] || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title="Novo usuário" onClose={() => setModal(false)} onConfirm={save} confirmLabel={saving ? 'Criando...' : 'Criar usuário'}>
          {msg && <div style={{ background:'#fdf0f0', color:'#c0392b', borderRadius:6, padding:'8px 12px', fontSize:12, marginBottom:12 }}>{msg}</div>}
          <FormGroup label="Nome completo">
            <input style={input} value={form.nome||''} onChange={f('nome')} placeholder="Nome do usuário" />
          </FormGroup>
          <FormGroup label="E-mail *">
            <input style={input} type="email" value={form.email||''} onChange={f('email')} placeholder="email@empresa.com" />
          </FormGroup>
          <FormGroup label="Senha inicial *">
            <input style={input} type="password" value={form.senha||''} onChange={f('senha')} placeholder="Mínimo 6 caracteres" />
          </FormGroup>
          <FormGroup label="Perfil de acesso *">
            <select style={select} value={form.perfil||'operador'} onChange={f('perfil')}>
              <option value="gestor">Gestor — acesso total</option>
              <option value="operador">Operador — entrada/saída e inventário</option>
              <option value="visualizador">Visualizador — somente leitura</option>
            </select>
          </FormGroup>
        </Modal>
      )}
    </div>
  )
}
