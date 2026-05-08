import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Modal, { FormGroup, input, select } from '../components/Modal'

const S = {
  header: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem' },
  title: { fontSize:20, fontWeight:600, color:'#1a3a5c' },
  btnRow: { display:'flex', gap:8 },
  btnPrimary: { padding:'8px 16px', fontSize:13, fontWeight:500, border:'none', borderRadius:6, background:'#378add', color:'#fff', cursor:'pointer' },
  btnSecondary: { padding:'8px 16px', fontSize:13, fontWeight:500, border:'1px solid #e0e4ea', borderRadius:6, background:'#fff', color:'#555', cursor:'pointer' },
  tabs: { display:'flex', gap:4, background:'#f0f2f5', padding:4, borderRadius:8, marginBottom:'1rem', width:'fit-content' },
  tab: (active) => ({ padding:'6px 16px', fontSize:13, borderRadius:6, cursor:'pointer', background: active?'#fff':'transparent', color: active?'#1a3a5c':'#888', fontWeight: active?500:400, transition:'all 0.15s' }),
  card: { background:'#fff', border:'1px solid #e8eaf0', borderRadius:10, padding:'1rem' },
  movRow: { display:'flex', alignItems:'center', gap:12, padding:'11px 0', borderBottom:'1px solid #f0f2f5', fontSize:13 },
  icon: (tipo) => ({ width:32, height:32, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', background: tipo==='entrada'?'#d4edda':'#f8d7da', color: tipo==='entrada'?'#1e6b45':'#8b2500', fontSize:14, flexShrink:0, fontWeight:600 }),
  badge: (tipo) => ({ fontSize:11, padding:'2px 8px', borderRadius:100, background: tipo==='entrada'?'#d4edda':'#f8d7da', color: tipo==='entrada'?'#1e6b45':'#8b2500', fontWeight:500 }),
  empty: { textAlign:'center', color:'#aaa', fontSize:13, padding:'2rem' },
}

const canRegister = (perfil) => perfil?.perfil === 'gestor' || perfil?.perfil === 'operador'

export default function Movimentacoes({ perfil, filtroInicial }) {
  const [movs, setMovs] = useState([])
  const [notebooks, setNotebooks] = useState([])
  const [tab, setTab] = useState(filtroInicial || 'todos')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadMovs(); loadNotebooks() }, [])

  const loadMovs = async () => {
    const { data } = await supabase.from('movimentacoes').select('*').order('created_at', { ascending:false })
    setMovs(data || [])
  }

  const loadNotebooks = async () => {
    const { data } = await supabase.from('notebooks').select('id, patrimonio, modelo, status')
    setNotebooks(data || [])
  }

  const filtered = tab === 'todos' ? movs : movs.filter(m => m.tipo === tab)

  const f = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const openModal = (tipo) => {
    setForm({ tipo })
    setModal(tipo)
  }

  const save = async () => {
    if (!form.patrimonio) return alert('Selecione um equipamento.')
    if (!form.responsavel && form.tipo === 'saida') return alert('Informe o responsável.')
    setSaving(true)

    await supabase.from('movimentacoes').insert([{
      tipo: form.tipo,
      patrimonio: form.patrimonio,
      responsavel: form.responsavel || '',
      departamento: form.departamento || '',
      observacao: form.observacao || '',
    }])

    const novoStatus = form.tipo === 'saida' ? 'em_uso' : 'disponivel'
    const updateData = form.tipo === 'saida'
      ? { status: novoStatus, responsavel: form.responsavel, departamento: form.departamento }
      : { status: novoStatus, responsavel: '', departamento: '' }

    await supabase.from('notebooks').update(updateData).eq('patrimonio', form.patrimonio)

    setSaving(false)
    setModal(null)
    loadMovs()
    loadNotebooks()
  }

  const nbOptions = notebooks.map(n => (
    <option key={n.id} value={n.patrimonio}>{n.patrimonio} — {n.modelo} ({n.status === 'disponivel' ? 'Disponível' : n.status === 'em_uso' ? 'Em uso' : 'Manutenção'})</option>
  ))

  return (
    <div>
      <div style={S.header}>
        <p style={S.title}>Movimentações</p>
        {canRegister(perfil) && (
          <div style={S.btnRow}>
            <button style={S.btnPrimary} onClick={() => openModal('entrada')}>↓ Entrada</button>
            <button style={S.btnSecondary} onClick={() => openModal('saida')}>↑ Saída</button>
          </div>
        )}
      </div>

      <div style={S.tabs}>
        {[['todos','Todos'],['entrada','Entradas'],['saida','Saídas']].map(([id, label]) => (
          <div key={id} style={S.tab(tab === id)} onClick={() => setTab(id)}>{label}</div>
        ))}
      </div>

      <div style={S.card}>
        {filtered.length === 0 && <p style={S.empty}>Nenhuma movimentação encontrada.</p>}
        {filtered.map(m => (
          <div key={m.id} style={S.movRow}>
            <div style={S.icon(m.tipo)}>{m.tipo === 'entrada' ? '↓' : '↑'}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:500 }}>
                <span style={S.badge(m.tipo)}>{m.tipo === 'entrada' ? 'Entrada' : 'Saída'}</span>
                {' '}{m.patrimonio}
                {m.responsavel ? ` — ${m.responsavel}` : ''}
              </div>
              <div style={{ fontSize:12, color:'#888', marginTop:2 }}>
                {m.departamento && `${m.departamento}`}
                {m.observacao && ` · ${m.observacao}`}
              </div>
            </div>
            <div style={{ fontSize:12, color:'#aaa', flexShrink:0 }}>
              {new Date(m.created_at).toLocaleDateString('pt-BR')}
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <Modal
          title={modal === 'entrada' ? '↓ Registrar Entrada' : '↑ Registrar Saída'}
          onClose={() => setModal(null)}
          onConfirm={save}
          confirmLabel={saving ? 'Salvando...' : 'Registrar'}
        >
          <FormGroup label="Equipamento *">
            <select style={select} value={form.patrimonio||''} onChange={f('patrimonio')}>
              <option value="">Selecione um notebook...</option>
              {nbOptions}
            </select>
          </FormGroup>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <FormGroup label={modal === 'saida' ? 'Responsável (quem está retirando) *' : 'Responsável pela devolução'}>
              <input style={input} value={form.responsavel||''} onChange={f('responsavel')} placeholder="Nome completo" />
            </FormGroup>
            <FormGroup label="Departamento">
              <input style={input} value={form.departamento||''} onChange={f('departamento')} placeholder="Ex: TI" />
            </FormGroup>
          </div>
          <FormGroup label="Observações">
            <input style={input} value={form.observacao||''} onChange={f('observacao')} placeholder={modal === 'saida' ? 'Finalidade, prazo de devolução...' : 'Condição do equipamento...'} />
          </FormGroup>
        </Modal>
      )}
    </div>
  )
}
