import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Modal, { FormGroup, input, select } from '../components/Modal'

const S = {
  header: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem' },
  title: { fontSize:20, fontWeight:600, color:'#1a3a5c' },
  addBtn: { padding:'8px 16px', fontSize:13, fontWeight:500, border:'none', borderRadius:6, background:'#378add', color:'#fff', cursor:'pointer' },
  card: { background:'#fff', border:'1px solid #e8eaf0', borderRadius:10, padding:'1rem', marginBottom:'1rem' },
  sectionTitle: { fontSize:13, fontWeight:600, color:'#1a3a5c', marginBottom:'0.75rem', display:'flex', alignItems:'center', gap:8 },
  count: { fontSize:11, background:'#e6f1fb', color:'#185fa5', padding:'2px 8px', borderRadius:100, fontWeight:500 },
  table: { width:'100%', borderCollapse:'collapse', fontSize:13 },
  th: { textAlign:'left', padding:'8px 10px', fontWeight:500, fontSize:12, color:'#888', borderBottom:'1px solid #f0f2f5', whiteSpace:'nowrap' },
  td: { padding:'10px', borderBottom:'1px solid #f0f2f5', color:'#333' },
  badge: (s) => {
    const map = { 'estoque':['#d4edda','#1e6b45'], 'aguardando':['#fde8d8','#8b3a00'], 'imobilizado':['#f0f0f0','#555'] }
    const [bg, color] = map[s] || ['#d4edda','#1e6b45']
    return { fontSize:11, padding:'2px 8px', borderRadius:100, background:bg, color, fontWeight:500 }
  },
  searchRow: { display:'flex', gap:10, marginBottom:'1rem', flexWrap:'wrap' },
  filterBtn: (active) => ({ padding:'6px 14px', fontSize:12, borderRadius:100, border:'1px solid', borderColor: active ? '#378add' : '#e0e4ea', background: active ? '#e6f1fb' : '#fff', color: active ? '#185fa5' : '#555', cursor:'pointer', fontWeight: active ? 500 : 400 }),
}

const canEdit = (perfil) => perfil?.perfil === 'gestor' || perfil?.perfil === 'operador'

export default function Estoque({ perfil, onDetalhe }) {
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [tipoFilter, setTipoFilter] = useState('todos')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    const { data } = await supabase
      .from('notebooks')
      .select('*')
      .in('status', ['estoque', 'aguardando', 'imobilizado'])
      .order('tipo_equipamento')
    setItems(data || [])
  }

  const filtered = items.filter(n => {
    const q = search.toLowerCase()
    const matchSearch = !q || n.modelo?.toLowerCase().includes(q) || n.marca?.toLowerCase().includes(q) || n.patrimonio?.toLowerCase().includes(q) || n.serial?.toLowerCase().includes(q)
    const matchTipo = tipoFilter === 'todos' || n.tipo_equipamento === tipoFilter
    return matchSearch && matchTipo
  })

  const grupos = ['Notebook', 'Monitor', 'Celular'].map(tipo => ({
    tipo,
    items: filtered.filter(n => n.tipo_equipamento === tipo)
  })).filter(g => tipoFilter === 'todos' ? true : g.tipo === tipoFilter)

  const f = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const save = async () => {
    if (!form.tipo_equipamento || !form.modelo) return alert('Tipo e modelo são obrigatórios.')
    setSaving(true)
    await supabase.from('notebooks').insert([{
      tipo_equipamento: form.tipo_equipamento,
      tipo_propriedade: form.tipo_propriedade || '',
      marca: form.marca || '',
      modelo: form.modelo || '',
      processador: form.processador || '',
      hd_ssd: form.hd_ssd || '',
      memoria: form.memoria || '',
      serial: form.serial || '',
      patrimonio: form.patrimonio || '',
      sistema_operacional: form.sistema_operacional || '',
      status: 'estoque',
      responsavel: '',
    }])
    setSaving(false)
    setModal(false)
    load()
  }

  return (
    <div>
      <div style={S.header}>
        <p style={S.title}>Estoque</p>
        {canEdit(perfil) && <button style={S.addBtn} onClick={() => { setForm({ tipo_equipamento:'Notebook', tipo_propriedade:'Gupy' }); setModal(true) }}>+ Adicionar ao estoque</button>}
      </div>

      <div style={S.searchRow}>
        <input style={{...input, flex:1, minWidth:200}} placeholder="Buscar por modelo, marca, patrimônio, serial..." value={search} onChange={e => setSearch(e.target.value)} />
        {['todos','Notebook','Monitor','Celular'].map(t => (
          <button key={t} style={S.filterBtn(tipoFilter === t)} onClick={() => setTipoFilter(t)}>
            {t === 'todos' ? 'Todos' : t}
          </button>
        ))}
      </div>

      {grupos.every(g => g.items.length === 0) && (
        <div style={{...S.card, textAlign:'center', color:'#aaa', padding:'2rem'}}>Nenhum equipamento em estoque.</div>
      )}

      {grupos.map(({ tipo, items }) => items.length === 0 ? null : (
        <div key={tipo} style={S.card}>
          <div style={S.sectionTitle}>
            {tipo === 'Notebook' ? '💻' : tipo === 'Monitor' ? '🖥️' : '📱'} {tipo}s
            <span style={S.count}>{items.length}</span>
          </div>
          <table style={S.table}>
            <thead>
              <tr>
                {['Marca','Modelo','Processador','HD/SSD','Memória','Patrimônio','Serial','S.O.','Propriedade','Status',''].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(n => (
                <tr key={n.id} style={{cursor:'pointer'}} onClick={() => onDetalhe(n.id)}>
                  <td style={S.td}>{n.marca || '—'}</td>
                  <td style={{...S.td, fontWeight:500}}>{n.modelo || '—'}</td>
                  <td style={{...S.td, fontSize:12, color:'#888'}}>{n.processador || '—'}</td>
                  <td style={{...S.td, fontSize:12, color:'#888'}}>{n.hd_ssd || '—'}</td>
                  <td style={{...S.td, fontSize:12, color:'#888'}}>{n.memoria || '—'}</td>
                  <td style={{...S.td, fontSize:12}}>{n.patrimonio || '—'}</td>
                  <td style={{...S.td, fontSize:12, color:'#aaa'}}>{n.serial || '—'}</td>
                  <td style={{...S.td, fontSize:12, color:'#888'}}>{n.sistema_operacional || '—'}</td>
                  <td style={{...S.td, fontSize:12}}>{n.tipo_propriedade || '—'}</td>
                  <td style={S.td}><span style={S.badge(n.status)}>{n.status === 'estoque' ? 'Em estoque' : n.status === 'aguardando' ? 'Ag. devolução' : 'Imobilizado'}</span></td>
                  <td style={S.td}><button style={{padding:'4px 10px', fontSize:12, border:'1px solid #e0e4ea', borderRadius:5, background:'transparent', cursor:'pointer', color:'#555'}} onClick={e => { e.stopPropagation(); onDetalhe(n.id) }}>Ver</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {modal && (
        <Modal title="Adicionar ao estoque" onClose={() => setModal(false)} onConfirm={save} confirmLabel={saving ? 'Salvando...' : 'Salvar'}>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
            <FormGroup label="Tipo de equipamento *">
              <select style={select} value={form.tipo_equipamento||''} onChange={f('tipo_equipamento')}>
                <option value="Notebook">Notebook</option>
                <option value="Monitor">Monitor</option>
                <option value="Celular">Celular</option>
              </select>
            </FormGroup>
            <FormGroup label="Tipo de propriedade">
              <select style={select} value={form.tipo_propriedade||''} onChange={f('tipo_propriedade')}>
                <option value="Gupy">Equipamento Gupy</option>
                <option value="Alugado BR">Alugado — BR</option>
                <option value="Alugado Mobile">Alugado — Mobile</option>
              </select>
            </FormGroup>
            <FormGroup label="Marca"><input style={input} value={form.marca||''} onChange={f('marca')} placeholder="Ex: Dell, Apple" /></FormGroup>
            <FormGroup label="Modelo *"><input style={input} value={form.modelo||''} onChange={f('modelo')} placeholder="Ex: Inspiron 15" /></FormGroup>
            <FormGroup label="Processador"><input style={input} value={form.processador||''} onChange={f('processador')} placeholder="Ex: Intel i5" /></FormGroup>
            <FormGroup label="HD / SSD"><input style={input} value={form.hd_ssd||''} onChange={f('hd_ssd')} placeholder="Ex: SSD 512GB" /></FormGroup>
            <FormGroup label="Memória RAM"><input style={input} value={form.memoria||''} onChange={f('memoria')} placeholder="Ex: 16GB" /></FormGroup>
            <FormGroup label="Sistema Operacional"><input style={input} value={form.sistema_operacional||''} onChange={f('sistema_operacional')} placeholder="Ex: Windows 11" /></FormGroup>
            <FormGroup label="Patrimônio"><input style={input} value={form.patrimonio||''} onChange={f('patrimonio')} placeholder="Ex: NB-001" /></FormGroup>
            <FormGroup label="Nº Serial"><input style={input} value={form.serial||''} onChange={f('serial')} placeholder="Ex: SN123456" /></FormGroup>
          </div>
        </Modal>
      )}
    </div>
  )
}

