import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const S = {
  title: { fontSize:20, fontWeight:600, color:'#1a3a5c', marginBottom:'1.25rem' },
  metrics: { display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12, marginBottom:'1.5rem' },
  metric: (color) => ({ background:'#fff', border:'1px solid #e8eaf0', borderRadius:10, padding:'1rem', borderTop:`3px solid ${color}` }),
  mLabel: { fontSize:12, color:'#888', marginBottom:6 },
  mValue: (color) => ({ fontSize:26, fontWeight:600, color }),
  grid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' },
  card: { background:'#fff', border:'1px solid #e8eaf0', borderRadius:10, padding:'1.25rem' },
  cardTitle: { fontSize:14, fontWeight:600, color:'#1a3a5c', marginBottom:'1rem' },
  badge: (s) => {
    const map = { disponivel:['#d4edda','#1e6b45'], em_uso:['#fff3cd','#7a5c00'], manutencao:['#f8d7da','#8b2500'] }
    const [bg, color] = map[s] || ['#eee','#333']
    return { fontSize:11, padding:'2px 8px', borderRadius:100, background:bg, color, fontWeight:500, display:'inline-block' }
  },
  row: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #f0f2f5', fontSize:13 },
  movRow: { display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom:'1px solid #f0f2f5', fontSize:13 },
  movIcon: (tipo) => ({ width:28, height:28, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', background: tipo==='entrada'?'#d4edda':'#f8d7da', color: tipo==='entrada'?'#1e6b45':'#8b2500', fontSize:13, flexShrink:0 }),
}

const labelStatus = { disponivel:'Disponível', em_uso:'Em uso', manutencao:'Manutenção' }

export default function Dashboard() {
  const [notebooks, setNotebooks] = useState([])
  const [movs, setMovs] = useState([])

  useEffect(() => {
    supabase.from('notebooks').select('*').order('created_at', { ascending:false }).then(({ data }) => setNotebooks(data || []))
    supabase.from('movimentacoes').select('*').order('created_at', { ascending:false }).limit(6).then(({ data }) => setMovs(data || []))
  }, [])

  const total = notebooks.length
  const disp = notebooks.filter(n => n.status === 'disponivel').length
  const uso = notebooks.filter(n => n.status === 'em_uso').length
  const manut = notebooks.filter(n => n.status === 'manutencao').length

  return (
    <div>
      <p style={S.title}>Dashboard</p>

      <div style={S.metrics}>
        {[
          { label:'Total de notebooks', value: total, color:'#1a3a5c' },
          { label:'Disponíveis',        value: disp,  color:'#1e6b45' },
          { label:'Em uso',             value: uso,   color:'#e6a817' },
          { label:'Em manutenção',      value: manut, color:'#c0392b' },
        ].map(m => (
          <div key={m.label} style={S.metric(m.color)}>
            <div style={S.mLabel}>{m.label}</div>
            <div style={S.mValue(m.color)}>{m.value}</div>
          </div>
        ))}
      </div>

      <div style={S.grid}>
        <div style={S.card}>
          <p style={S.cardTitle}>Últimas movimentações</p>
          {movs.length === 0 && <p style={{ fontSize:13, color:'#aaa' }}>Nenhuma movimentação registrada.</p>}
          {movs.map(m => (
            <div key={m.id} style={S.movRow}>
              <div style={S.movIcon(m.tipo)}>{m.tipo === 'entrada' ? '↓' : '↑'}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:500 }}>{m.patrimonio} — {m.responsavel || 'Devolução'}</div>
                <div style={{ fontSize:11, color:'#888' }}>{m.departamento || '—'}</div>
              </div>
              <div style={{ fontSize:11, color:'#aaa' }}>{new Date(m.created_at).toLocaleDateString('pt-BR')}</div>
            </div>
          ))}
        </div>

        <div style={S.card}>
          <p style={S.cardTitle}>Status dos equipamentos</p>
          {notebooks.length === 0 && <p style={{ fontSize:13, color:'#aaa' }}>Nenhum notebook cadastrado.</p>}
          {notebooks.slice(0,8).map(n => (
            <div key={n.id} style={S.row}>
              <span style={{ fontWeight:500 }}>{n.patrimonio}</span>
              <span style={{ color:'#888', fontSize:12 }}>{n.modelo}</span>
              <span style={S.badge(n.status)}>{labelStatus[n.status]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
