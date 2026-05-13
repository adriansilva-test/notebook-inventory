import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Modal, { FormGroup, input, select } from '../components/Modal'

const S = {
  header: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem' },
  title: { fontSize:20, fontWeight:600, color:'#1a3a5c' },
  addBtn: { padding:'8px 16px', fontSize:13, fontWeight:500, border:'none', borderRadius:6, background:'#378add', color:'#fff', cursor:'pointer' },
  card: { background:'#fff', border:'1px solid #e8eaf0', borderRadius:10, padding:'1rem' },
  searchRow: { display:'flex', gap:10, marginBottom:'1rem', flexWrap:'wrap' },
  table: { width:'100%', borderCollapse:'collapse', fontSize:13 },
  th: { textAlign:'left', padding:'8px 10px', fontWeight:500, fontSize:12, color:'#888', borderBottom:'1px solid #f0f2f5', whiteSpace:'nowrap' },
  td: { padding:'10px', borderBottom:'1px solid #f0f2f5', color:'#333', verticalAlign:'top' },
  badge: (s) => {
    const map = {
      'em_uso':         ['#fff3cd','#7a5c00'],
      'estoque':        ['#d4edda','#1e6b45'],
      'aguardando':     ['#fde8d8','#8b3a00'],
      'imobilizado':    ['#f0f0f0','#555'],
    }
    const [bg, color] = map[s] || ['#eee','#333']
    return { fontSize:11, padding:'2px 8px', borderRadius:100, background:bg, color, fontWeight:500, whiteSpace:'nowrap' }
  },
  editBtn: { padding:'4px 10px', fontSize:12, border:'1px solid #e0e4ea', borderRadius:5, background:'transparent', cursor:'pointer', color:'#555' },
  grid2: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 },
  grid3: { display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 },
  sectionTitle: { fontSize:12, fontWeight:600, color:'#1a3a5c', textTransform:'uppercase', letterSpacing:'0.05em', margin:'16px 0 8px', paddingBottom:6, borderBottom:'1px solid #e8eaf0' },
}

const statusLabel = {
  'em_uso':      'Ativo / Em uso',
  'estoque':     'Retornou p/ Estoque',
  'aguardando':  'Aguardando Devolução',
  'imobilizado': 'Ativo Imobilizado',
}

const canEdit = (perfil) => perfil?.perfil === 'gestor' || perfil?.perfil === 'operador'

export default function Inventario({ perfil }) {
  const [notebooks, setNotebooks] = useState([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterTipo, setFilterTipo] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    const { data } = await supabase.from('notebooks').select('*').order('responsavel')
    setNotebooks(data || [])
  }

  const filtered = notebooks.filter(n => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      n.patrimonio?.toLowerCase().includes(q) ||
      n.modelo?.toLowerCase().includes(q) ||
      n.responsavel?.toLowerCase().includes(q) ||
      n.email?.toLowerCase().includes(q) ||
      n.cargo?.toLowerCase().includes(q) ||
      n.departamento?.toLowerCase().includes(q)
    const matchStatus = !filterStatus || n.status === filterStatus
    const matchTipo = !filterTipo || n.tipo_equipamento === filterTipo
    return matchSearch && matchStatus && matchTipo
  })

  const openAdd = () => {
    setForm({ status:'em_uso', tipo_contratacao:'Gupier', tipo_propriedade:'Gupy', tipo_equipamento:'Notebook' })
    setModal('add')
  }

  const openEdit = (nb) => {
    setForm({ ...nb })
    setModal('edit')
  }

  const f = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const save = async () => {
    if (!form.responsavel) return alert('Nome do colaborador é obrigatório.')
    setSaving(true)
    const payload = {
      responsavel:         form.responsavel || '',
      email:               form.email || '',
      onde_reside:         form.onde_reside || '',
      data_admissao:       form.data_admissao || null,
      cargo:               form.cargo || '',
      departamento:        form.departamento || '',
      tipo_contratacao:    form.tipo_contratacao || '',
      status:              form.status || 'em_uso',
      tipo_propriedade:    form.tipo_propriedade || '',
      tipo_equipamento:    form.tipo_equipamento || '',
      modelo:              form.modelo || '',
      marca:               form.marca || '',
      processador:         form.processador || '',
      hd_ssd:              form.hd_ssd || '',
      memoria:             form.memoria || '',
      serial:              form.serial || '',
      patrimonio:          form.patrimonio || '',
      sistema_operacional: form.sistema_operacional || '',
      data_atribuicao:     form.data_atribuicao || null,
    }
    if (modal === 'add') {
      await supabase.from('notebooks').insert([payload])
    } else {
      await supabase.from('notebooks').update(payload).eq('id', form.id)
    }
    setSaving(false)
    setModal(null)
    load()
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '—'

  return (
    <div>
      <div style={S.header}>
        <p style={S.title}>Inventário</p>
        {canEdit(perfil) && <button style={S.addBtn} onClick={openAdd}>+ Adicionar registro</button>}
      </div>

      <div style={S.card}>
        <div style={S.searchRow}>
          <input style={{...input, flex:1, minWidth:200}} placeholder="Buscar por colaborador, e-mail, cargo, patrimônio..." value={search} onChange={e => setSearch(e.target.value)} />
          <select style={{...select, width:200}} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Todos os status</option>
            <option value="em_uso">Ativo / Em uso</option>
            <option value="estoque">Retornou p/ Estoque</option>
            <option value="aguardando">Aguardando Devolução</option>
            <option value="imobilizado">Ativo Imobilizado</option>
          </select>
          <select style={{...select, width:180}} value={filterTipo} onChange={e => setFilterTipo(e.target.value)}>
            <option value="">Todos os tipos</option>
            <option value="Notebook">Notebook</option>
            <option value="Celular">Celular</option>
            <option value="Monitor">Monitor</option>
          </select>
        </div>

        <div style={{overflowX:'auto'}}>
          <table style={S.table}>
            <thead>
              <tr>
                {['Colaborador','E-mail','Cargo','Depto','Contratação','Tipo Equip.','Equipamento','Patrimônio','Status','Atribuído em',''].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={11} style={{...S.td, color:'#aaa', textAlign:'center', padding:'2rem'}}>Nenhum registro encontrado.</td></tr>
              )}
              {filtered.map(n => (
                <tr key={n.id}>
                  <td style={{...S.td, fontWeight:500, whiteSpace:'nowrap'}}>{n.responsavel || '—'}</td>
                  <td style={{...S.td, color:'#888', fontSize:12}}>{n.email || '—'}</td>
                  <td style={{...S.td, whiteSpace:'nowrap'}}>{n.cargo || '—'}</td>
                  <td style={{...S.td, whiteSpace:'nowrap'}}>{n.departamento || '—'}</td>
                  <td style={{...S.td, whiteSpace:'nowrap'}}>{n.tipo_contratacao || '—'}</td>
                  <td style={{...S.td, whiteSpace:'nowrap'}}>{n.tipo_equipamento || '—'}</td>
                  <td style={{...S.td, whiteSpace:'nowrap'}}>{[n.marca, n.modelo].filter(Boolean).join(' ') || '—'}</td>
                  <td style={{...S.td, color:'#aaa', fontSize:12}}>{n.patrimonio || '—'}</td>
                  <td style={S.td}><span style={S.badge(n.status)}>{statusLabel[n.status] || n.status}</span></td>
                  <td style={{...S.td, whiteSpace:'nowrap', fontSize:12, color:'#888'}}>{formatDate(n.data_atribuicao)}</td>
                  <td style={S.td}>
                    {canEdit(perfil) && <button style={S.editBtn} onClick={() => openEdit(n)}>Editar</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal
          title={modal === 'add' ? '+ Adicionar registro' : `Editar: ${form.responsavel}`}
          onClose={() => setModal(null)}
          onConfirm={save}
          confirmLabel={saving ? 'Salvando...' : 'Salvar'}
        >
          <div style={S.sectionTitle}>Dados do Colaborador</div>
          <div style={S.grid2}>
            <FormGroup label="Nome do colaborador *">
              <input style={input} value={form.responsavel||''} onChange={f('responsavel')} placeholder="Nome completo" />
            </FormGroup>
            <FormGroup label="E-mail">
              <input style={input} type="email" value={form.email||''} onChange={f('email')} placeholder="email@empresa.com" />
            </FormGroup>
            <FormGroup label="Onde reside">
              <input style={input} value={form.onde_reside||''} onChange={f('onde_reside')} placeholder="Cidade / Estado" />
            </FormGroup>
            <FormGroup label="Data de admissão">
              <input style={input} type="date" value={form.data_admissao||''} onChange={f('data_admissao')} />
            </FormGroup>
            <FormGroup label="Cargo">
              <input style={input} value={form.cargo||''} onChange={f('cargo')} placeholder="Ex: Analista de TI" />
            </FormGroup>
            <FormGroup label="Departamento">
              <input style={input} value={form.departamento||''} onChange={f('departamento')} placeholder="Ex: Tecnologia" />
            </FormGroup>
            <FormGroup label="Tipo de contratação">
              <select style={select} value={form.tipo_contratacao||''} onChange={f('tipo_contratacao')}>
                <option value="">Selecione...</option>
                <option value="Gupier">Gupier</option>
                <option value="Terceiro">Terceiro</option>
                <option value="PJ/Consultoria">PJ / Consultoria</option>
              </select>
            </FormGroup>
            <FormGroup label="Status da máquina">
              <select style={select} value={form.status||'em_uso'} onChange={f('status')}>
                <option value="em_uso">Ativo / Em uso</option>
                <option value="estoque">Retornou p/ Estoque</option>
                <option value="aguardando">Aguardando Devolução</option>
                <option value="imobilizado">Ativo Imobilizado (vendido/descartado)</option>
              </select>
            </FormGroup>
          </div>

          <div style={S.sectionTitle}>Dados do Equipamento</div>
          <div style={S.grid2}>
            <FormGroup label="Tipo de propriedade">
              <select style={select} value={form.tipo_propriedade||''} onChange={f('tipo_propriedade')}>
                <option value="">Selecione...</option>
                <option value="Gupy">Equipamento Gupy</option>
                <option value="Alugado BR">Alugado — BR</option>
                <option value="Alugado Mobile">Alugado — Mobile</option>
              </select>
            </FormGroup>
            <FormGroup label="Tipo de equipamento">
              <select style={select} value={form.tipo_equipamento||''} onChange={f('tipo_equipamento')}>
                <option value="">Selecione...</option>
                <option value="Notebook">Notebook</option>
                <option value="Celular">Celular</option>
                <option value="Monitor">Monitor</option>
              </select>
            </FormGroup>
            <FormGroup label="Marca">
              <input style={input} value={form.marca||''} onChange={f('marca')} placeholder="Ex: Dell, Apple, Lenovo" />
            </FormGroup>
            <FormGroup label="Modelo">
              <input style={input} value={form.modelo||''} onChange={f('modelo')} placeholder="Ex: Inspiron 15, MacBook Air" />
            </FormGroup>
            <FormGroup label="Processador">
              <input style={input} value={form.processador||''} onChange={f('processador')} placeholder="Ex: Intel i5, Apple M2" />
            </FormGroup>
            <FormGroup label="HD / SSD">
              <input style={input} value={form.hd_ssd||''} onChange={f('hd_ssd')} placeholder="Ex: SSD 512GB" />
            </FormGroup>
            <FormGroup label="Memória RAM">
              <input style={input} value={form.memoria||''} onChange={f('memoria')} placeholder="Ex: 16GB" />
            </FormGroup>
            <FormGroup label="Sistema Operacional">
              <input style={input} value={form.sistema_operacional||''} onChange={f('sistema_operacional')} placeholder="Ex: Windows 11, macOS Sonoma" />
            </FormGroup>
            <FormGroup label="Patrimônio">
              <input style={input} value={form.patrimonio||''} onChange={f('patrimonio')} placeholder="Ex: NB-001" />
            </FormGroup>
            <FormGroup label="Nº Serial">
              <input style={input} value={form.serial||''} onChange={f('serial')} placeholder="Ex: SN123456" />
            </FormGroup>
            <FormGroup label="Data de atribuição">
              <input style={input} type="date" value={form.data_atribuicao||''} onChange={f('data_atribuicao')} />
            </FormGroup>
          </div>
        </Modal>
      )}
    </div>
  )
}
