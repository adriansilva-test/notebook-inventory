import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Modal, { FormGroup, input, select } from '../components/Modal'

const S = {
  header: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem' },
  title: { fontSize:20, fontWeight:600, color:'#1a3a5c' },
  addBtn: { padding:'8px 16px', fontSize:13, fontWeight:500, border:'none', borderRadius:6, background:'#378add', color:'#fff', cursor:'pointer' },
  card: { background:'#fff', border:'1px solid #e8eaf0', borderRadius:10, padding:'1rem' },
  searchRow: { display:'flex', gap:10, marginBottom:'1rem' },
  searchInput: { ...input, flex:1 },
  filterSelect: { ...select, width:180 },
  table: { width:'100%', borderCollapse:'collapse', fontSize:13 },
  th: { textAlign:'left', padding:'8px 10px', fontWeight:500, fontSize:12, color:'#888', borderBottom:'1px solid #f0f2f5' },
  td: { padding:'10px', borderBottom:'1px solid #f0f2f5', color:'#333' },
  badge: (s) => {
    const map = { disponivel:['#d4edda','#1e6b45'], em_uso:['#fff3cd','#7a5c00'], manutencao:['#f8d7da','#8b2500'] }
    const [bg, color] = map[s] || ['#eee','#333']
    return { fontSize:11, padding:'2px 8px', borderRadius:100, background:bg, color, fontWeight:500 }
  },
  editBtn: { padding:'4px 10px', fontSize:12, border:'1px solid #e0e4ea', borderRadius:5, background:'transparent', cursor:'pointer', color:'#555' },
  grid2: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 },
}

const labelStatus = { disponivel:'Disponível', em_uso:'Em uso', manutencao:'Manutenção' }
const canEdit = (perfil) => perfil?.perfil === 'gestor' || perfil?.perfil === 'operador'

export default function Inventario({ perfil }) {
  const [notebooks, setNotebooks] = useState([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    const { data } = await supabase.from('notebooks').select('*').order('patrimonio')
    setNotebooks(data || [])
  }

  const filtered = notebooks.filter(n => {
    const q = search.toLowerCase()
    const matchSearch = !q || n.patrimonio?.toLowerCase().includes(q) || n.modelo?.toLowerCase().includes(q) || n.responsavel?.toLowerCase().includes(q) || n.marca?.toLowerCase().includes(q)
    const matchStatus = !filterStatus || n.status === filterStatus
    return matchSearch && matchStatus
  })

  const openAdd = () => {
    setForm({ status:'disponivel' })
    setModal('add')
  }

  const openEdit = (nb) => {
    setForm({ ...nb })
    setModal('edit')
  }

  const f = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const save = async () => {
    if (!form.patrimonio || !form.modelo) return alert('Patrimônio e modelo são obrigatórios.')
    setSaving(true)
    if (modal === 'add') {
      await supabase.from('notebooks').insert([{ patrimonio:form.patrimonio, modelo:form.modelo, marca:form.marca||'', serial:form.serial||'', status:form.status, responsavel:form.responsavel||'', departamento:form.departamento||'' }])
    } else {
      await supabase.from('notebooks').update({ modelo:form.modelo, marca:form.marca, serial:form.serial, status:form.status, responsavel:form.responsavel, departamento:form.departamento }).eq('id', form.id)
    }
    setSaving(false)
    setModal(null)
    load()
  }

  return (
    <div>
      <div style={S.header}>
        <p style={S.title}>Inventário</p>
        {canEdit(perfil) && <button style={S.addBtn} onClick={openAdd}>+ Adicionar notebook</button>}
      </div>

      <div style={S.card}>
        <div style={S.searchRow}>
          <input style={S.searchInput} placeholder="Buscar por modelo, patrimônio, marca ou responsável..." value={search} onChange={e => setSearch(e.target.value)} />
          <select style={S.filterSelect} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Todos os status</option>
            <option value="disponivel">Disponível</option>
            <option value="em_uso">Em uso</option>
            <option value="manutencao">Manutenção</option>
          </select>
        </div>

        <table style={S.table}>
          <thead>
            <tr>
              {['Patrimônio','Modelo','Marca','Serial','Responsável','Departamento','Status',''].map(h => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ ...S.td, color:'#aaa', textAlign:'center', padding:'2rem' }}>Nenhum notebook encontrado.</td></tr>
            )}
            {filtered.map(n => (
              <tr key={n.id} style={{ cursor:'default' }}>
                <td style={{ ...S.td, fontWeight:500 }}>{n.patrimonio}</td>
                <td style={S.td}>{n.modelo}</td>
                <td style={S.td}>{n.marca}</td>
                <td style={{ ...S.td, color:'#aaa', fontSize:12 }}>{n.serial || '—'}</td>
                <td style={S.td}>{n.responsavel || <span style={{ color:'#ccc' }}>—</span>}</td>
                <td style={S.td}>{n.departamento || <span style={{ color:'#ccc' }}>—</span>}</td>
                <td style={S.td}><span style={S.badge(n.status)}>{labelStatus[n.status]}</span></td>
                <td style={S.td}>
                  {canEdit(perfil) && <button style={S.editBtn} onClick={() => openEdit(n)}>Editar</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'Adicionar notebook' : `Editar: ${form.patrimonio}`} onClose={() => setModal(null)} onConfirm={save} confirmLabel={saving ? 'Salvando...' : 'Salvar'}>
          <div style={S.grid2}>
            {modal === 'add' && (
              <FormGroup label="Nº Patrimônio *">
                <input style={input} value={form.patrimonio||''} onChange={f('patrimonio')} placeholder="Ex: NB-007" />
              </FormGroup>
            )}
            <FormGroup label="Modelo *">
              <input style={input} value={form.modelo||''} onChange={f('modelo')} placeholder="Ex: ThinkPad E14" />
            </FormGroup>
            <FormGroup label="Marca">
              <input style={input} value={form.marca||''} onChange={f('marca')} placeholder="Ex: Lenovo" />
            </FormGroup>
            <FormGroup label="Nº Serial">
              <input style={input} value={form.serial||''} onChange={f('serial')} placeholder="Ex: LN2024007" />
            </FormGroup>
            <FormGroup label="Status">
              <select style={select} value={form.status||'disponivel'} onChange={f('status')}>
                <option value="disponivel">Disponível</option>
                <option value="em_uso">Em uso</option>
                <option value="manutencao">Manutenção</option>
              </select>
            </FormGroup>
            <FormGroup label="Responsável">
              <input style={input} value={form.responsavel||''} onChange={f('responsavel')} placeholder="Nome do responsável" />
            </FormGroup>
            <FormGroup label="Departamento">
              <input style={input} value={form.departamento||''} onChange={f('departamento')} placeholder="Ex: TI" />
            </FormGroup>
          </div>
        </Modal>
      )}
    </div>
  )
}
