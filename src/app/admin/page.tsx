'use client'
import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'

// ─── DESIGN TOKENS (light theme) ─────────────────────────────────────────────
const A = {
  bg: '#F7F8FC', card: '#FFFFFF', border: '#E4E7EF',
  text: '#111827', sub: '#6B7280', accent: '#2563EB',
  success: '#059669', warn: '#D97706', danger: '#DC2626',
  purple: '#7C3AED', sidebar: '#0F172A', sidebarText: '#94A3B8',
}

// ─── TINY UI COMPONENTS ───────────────────────────────────────────────────────
const C = ({ children, style = {} }: any) => (
  <div style={{ background: A.card, border: `1px solid ${A.border}`, borderRadius: 12, padding: 22, ...style }}>{children}</div>
)
const ST = ({ children }: any) => (
  <div style={{ fontSize: 11, fontWeight: 800, color: A.sub, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 14 }}>{children}</div>
)
const Btn = ({ children, onClick, v = 'primary', sz = 'md', disabled = false, full = false, style = {} }: any) => {
  const vs: any = {
    primary: { background: A.accent, color: '#fff', border: 'none' },
    secondary: { background: '#F3F4F6', color: A.text, border: `1px solid ${A.border}` },
    danger: { background: A.danger, color: '#fff', border: 'none' },
    success: { background: A.success, color: '#fff', border: 'none' },
    ghost: { background: 'transparent', color: A.accent, border: `1px solid ${A.accent}` },
  }
  const ss: any = { sm: { fontSize: 12, padding: '5px 12px' }, md: { fontSize: 13, padding: '8px 16px' }, lg: { fontSize: 15, padding: '11px 28px' } }
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...vs[v], ...ss[sz], borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: disabled ? 0.45 : 1, fontFamily: 'DM Sans, sans-serif', width: full ? '100%' : 'auto', ...style }}>
      {children}
    </button>
  )
}
const Inp = ({ label, value, onChange, type = 'text', placeholder = '', style = {} }: any) => (
  <div style={{ marginBottom: 13 }}>
    {label && <label style={{ fontSize: 12, fontWeight: 600, color: A.sub, display: 'block', marginBottom: 4 }}>{label}</label>}
    <input type={type} value={value ?? ''} onChange={onChange} placeholder={placeholder}
      style={{ width: '100%', boxSizing: 'border-box', border: `1px solid ${A.border}`, borderRadius: 8, padding: '8px 11px', fontSize: 14, color: A.text, outline: 'none', fontFamily: 'DM Sans, sans-serif', ...style }} />
  </div>
)
const Sel = ({ label, value, onChange, options }: any) => (
  <div style={{ marginBottom: 13 }}>
    {label && <label style={{ fontSize: 12, fontWeight: 600, color: A.sub, display: 'block', marginBottom: 4 }}>{label}</label>}
    <select value={value} onChange={onChange} style={{ width: '100%', border: `1px solid ${A.border}`, borderRadius: 8, padding: '8px 11px', fontSize: 14, color: A.text, fontFamily: 'DM Sans, sans-serif', background: '#fff' }}>
      {options.map((o: any) => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
    </select>
  </div>
)
const Tog = ({ value, onChange, label }: any) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }} onClick={() => onChange(!value)}>
    <div style={{ width: 38, height: 21, borderRadius: 11, background: value ? A.accent : '#D1D5DB', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ width: 17, height: 17, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: value ? 19 : 2, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
    </div>
    <span style={{ fontSize: 13, color: A.text, cursor: 'pointer', userSelect: 'none' }}>{label}</span>
  </div>
)
const TA = ({ label, value, onChange, rows = 5 }: any) => (
  <div style={{ marginBottom: 13 }}>
    {label && <label style={{ fontSize: 12, fontWeight: 600, color: A.sub, display: 'block', marginBottom: 4 }}>{label}</label>}
    <textarea value={value ?? ''} onChange={onChange} rows={rows}
      style={{ width: '100%', boxSizing: 'border-box', border: `1px solid ${A.border}`, borderRadius: 8, padding: '8px 11px', fontSize: 13, color: A.text, fontFamily: 'DM Mono, monospace', lineHeight: 1.6, resize: 'vertical', outline: 'none' }} />
  </div>
)
const Badge = ({ status }: { status: string }) => {
  const m: any = {
    pending_review: ['#92400E', '#FEF3C7'], approved: ['#065F46', '#D1FAE5'],
    rejected: ['#991B1B', '#FEE2E2'], active: ['#065F46', '#D1FAE5'],
    pending: ['#92400E', '#FEF3C7'], suspended: ['#991B1B', '#FEE2E2'],
  }
  const [c, bg] = m[status] || ['#374151', '#F3F4F6']
  return <span style={{ fontSize: 11, fontWeight: 700, color: c, background: bg, padding: '3px 9px', borderRadius: 20, whiteSpace: 'nowrap' }}>{status.replace('_', ' ').replace(/\b\w/g, x => x.toUpperCase())}</span>
}

// ─── API HELPERS ──────────────────────────────────────────────────────────────
const adminToken = () => typeof window !== 'undefined' ? localStorage.getItem('fm_admin_token') || '' : ''
const api = async (url: string, opts: any = {}) => {
  const res = await fetch(url, { 
    ...opts, 
    headers: { 
      'Content-Type': 'application/json', 
      'x-admin-token': adminToken(), 
      ...(opts.headers || {}) 
    } 
  })
  if (res.status === 401) {
    // Stale token — clear and reload to show login
    if (typeof window !== 'undefined') {
      localStorage.removeItem('fm_admin_token')
      window.location.reload()
    }
    return { error: 'Unauthorized' }
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    console.error(`[API Error] ${url}:`, err)
    return err
  }
  return res.json()
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function Login({ onAuth }: { onAuth: () => void }) {
  const [pw, setPw] = useState('')
  const [loading, setLoading] = useState(false)
  const submit = async () => {
    if (!pw) return
    setLoading(true)
    try {
      const res = await fetch('/api/auth', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ password: pw }) 
      })
      const data = await res.json()
      if (res.ok && data.token) { 
        localStorage.setItem('fm_admin_token', data.token)
        onAuth() 
      } else {
        toast.error(data.error || 'Invalid password')
      }
    } catch (e) {
      toast.error('Connection error — please try again')
    }
    setLoading(false)
  }
  return (
    <div style={{ minHeight: '100vh', background: A.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif' }}>
      <C style={{ width: 380, textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🔐</div>
        <img src='/logo.svg' alt='LogiMatcher' height='32' style={{ display:'block', margin:'0 auto 16px' }} /><h2 style={{ fontSize: 22, fontWeight: 800, color: A.text, margin: '0 0 6px' }}>Admin Login</h2>
        <p style={{ fontSize: 13, color: A.sub, margin: '0 0 24px' }}>LogiMatcher Platform Dashboard</p>
        <input
          type="password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Enter admin password"
          autoComplete="current-password"
          autoFocus
          style={{ width: '100%', boxSizing: 'border-box', border: `2px solid ${A.border}`, borderRadius: 10, padding: '12px 16px', fontSize: 15, marginBottom: 12, fontFamily: 'DM Sans, sans-serif', outline: 'none', color: A.text, background: '#fff', transition: 'border-color 0.15s' }}
          onFocus={e => e.target.style.borderColor = A.accent}
          onBlur={e => e.target.style.borderColor = A.border}
        />
        <Btn onClick={submit} disabled={loading} full>{ loading ? 'Signing in…' : 'Sign In →' }</Btn>
      </C>
    </div>
  )
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ leads }: { leads: any[] }) {
  const pending = leads.filter(l => l.status === 'pending_review').length
  const approved = leads.filter(l => l.status === 'approved').length
  const revenue = leads.filter(l => l.warehouse_sent).reduce((s, l) => s + (l.warehouse?.lead_fee || 120), 0)

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: A.text, margin: '0 0 22px' }}>Dashboard</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { icon: '📋', label: 'Total Leads', val: leads.length, color: A.accent },
          { icon: '⏳', label: 'Pending Review', val: pending, color: A.warn },
          { icon: '✅', label: 'Sent to Warehouse', val: approved, color: A.success },
          { icon: '💰', label: 'Revenue (MTD)', val: `$${revenue.toLocaleString()}`, color: A.purple },
        ].map(s => (
          <C key={s.label} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: 18 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: s.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{s.icon}</div>
            <div><div style={{ fontSize: 22, fontWeight: 800, color: A.text }}>{s.val}</div><div style={{ fontSize: 12, color: A.sub }}>{s.label}</div></div>
          </C>
        ))}
      </div>
      <C>
        <ST>Recent Leads</ST>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>{['ID','Company','Match','Status','Date'].map(h => <th key={h} style={{ textAlign: 'left', fontSize: 11, fontWeight: 700, color: A.sub, padding: '0 8px 10px', textTransform: 'uppercase' }}>{h}</th>)}</tr></thead>
          <tbody>
            {leads.slice(0, 8).map(l => (
              <tr key={l.id} style={{ borderTop: `1px solid ${A.border}` }}>
                <td style={{ padding: '10px 8px', fontSize: 12, color: A.sub, fontFamily: 'DM Mono, monospace' }}>{l.id}</td>
                <td style={{ padding: '10px 8px' }}><div style={{ fontSize: 14, fontWeight: 600 }}>{l.shipper_company}</div><div style={{ fontSize: 11, color: A.sub }}>{l.shipper_email}</div></td>
                <td style={{ padding: '10px 8px', fontSize: 14, fontWeight: 700, color: (l.match_score || 0) >= 80 ? A.success : A.warn }}>{l.match_score}%</td>
                <td style={{ padding: '10px 8px' }}><Badge status={l.status} /></td>
                <td style={{ padding: '10px 8px', fontSize: 12, color: A.sub }}>{l.created_at?.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </C>
    </div>
  )
}

// ─── LEADS ────────────────────────────────────────────────────────────────────
function Leads({ leads, setLeads, warehouses }: any) {
  const [sel, setSel] = useState<any>(null)
  const [filter, setFilter] = useState('all')
  const [note, setNote] = useState('')
  const [emailModal, setEmailModal] = useState<any>(null)
  const [cfg, setCfg] = useState<any>({})

  useEffect(() => { api('/api/config').then(setCfg) }, [])

  const filtered = filter === 'all' ? leads : leads.filter((l: any) => l.status === filter)

  const act = async (action: string, extra: any = {}) => {
    const res = await api('/api/leads', { method: 'PATCH', body: JSON.stringify({ id: sel.id, action, note, ...extra }) })
    if (res.error) { toast.error(res.error); return }
    setLeads((prev: any[]) => prev.map(l => l.id === sel.id ? { ...l, ...res } : l))
    setSel((p: any) => ({ ...p, ...res }))
    toast.success(`Lead ${action}d`)
  }

  const fillTpl = (tpl: string, lead: any, wh: any) => {
    if (!tpl) return ''
    const biz: any = { dtc: 'DTC / eCommerce', b2b: 'B2B / Wholesale', marketplace: 'Amazon Seller', subscription: 'Subscription Box', retail: 'Retail' }
    const vol: any = { startup: 'Under 500/mo', growing: '500–2,000/mo', established: '2,000–10,000/mo', enterprise: '10,000+/mo' }
    return tpl
      .replace(/{{warehouse_name}}/g, wh?.name || '')
      .replace(/{{shipper_company}}/g, lead.shipper_company)
      .replace(/{{shipper_name}}/g, lead.shipper_name)
      .replace(/{{shipper_email}}/g, lead.shipper_email)
      .replace(/{{shipper_phone}}/g, lead.shipper_phone || '')
      .replace(/{{match_score}}/g, lead.match_score)
      .replace(/{{business_type}}/g, biz[lead.answers?.business_type] || lead.answers?.business_type || '')
      .replace(/{{monthly_orders}}/g, vol[lead.answers?.monthly_orders] || '')
      .replace(/{{product_types}}/g, (lead.answers?.product_type || []).join(', '))
      .replace(/{{location}}/g, lead.answers?.location || '')
      .replace(/{{services}}/g, (lead.answers?.services || []).join(', '))
      .replace(/{{timeline}}/g, lead.answers?.timeline || '')
      .replace(/{{warehouse_location}}/g, wh?.location || '')
      .replace(/{{warehouse_rating}}/g, wh?.rating || '')
      .replace(/{{warehouse_reviews}}/g, wh?.reviews || '')
      .replace(/{{days}}/g, '7')
      .replace(/{{survey_link}}/g, `${window.location.origin}/survey/${lead.id}`)
  }

  const showEmail = (type: string) => {
    const tpl = cfg.email_templates?.[type]
    const wh = sel?.warehouse
    if (!tpl || !sel) return
    setEmailModal({ subject: fillTpl(tpl.subject, sel, wh), body: fillTpl(tpl.body, sel, wh) })
  }

  const wh = sel ? warehouses.find((w: any) => w.id === sel.top_match_id) || sel.warehouse : null

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: A.text, margin: 0 }}>Lead Management</h2>
        <div style={{ display: 'flex', gap: 6 }}>
          {['all', 'pending_review', 'approved', 'rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '6px 13px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: `1px solid ${filter === f ? A.accent : A.border}`, background: filter === f ? '#EFF6FF' : '#fff', color: filter === f ? A.accent : A.sub, fontFamily: 'DM Sans, sans-serif' }}>
              {f === 'all' ? `All (${leads.length})` : `${f.replace('_', ' ').replace(/\b\w/g, x => x.toUpperCase())} (${leads.filter((l: any) => l.status === f).length})`}
            </button>
          ))}
        </div>
      </div>

      {emailModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <C style={{ width: '90%', maxWidth: 600, maxHeight: '80vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Email Preview</h3>
              <button onClick={() => setEmailModal(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: A.sub }}>×</button>
            </div>
            <div style={{ background: '#F9FAFB', borderRadius: 8, padding: 12, marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: A.sub, marginBottom: 4 }}>SUBJECT</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{emailModal.subject}</div>
            </div>
            <div style={{ background: '#F9FAFB', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 11, color: A.sub, marginBottom: 8 }}>BODY</div>
              <pre style={{ fontSize: 13, color: A.text, whiteSpace: 'pre-wrap', fontFamily: 'DM Mono, monospace', lineHeight: 1.7, margin: 0 }}>{emailModal.body}</pre>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <Btn onClick={async () => { await act('send_emails'); setEmailModal(null) }} full>✓ Confirm & Send</Btn>
              <Btn v="secondary" onClick={() => setEmailModal(null)}>Cancel</Btn>
            </div>
          </C>
        </div>
      )}

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ width: sel ? 320 : '100%', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((l: any) => (
            <button
              key={l.id}
              onClick={() => { setSel(l); setNote(l.admin_note || '') }}
              style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              <C style={{ padding: 14, border: sel?.id === l.id ? `2px solid ${A.accent}` : `1px solid ${A.border}`, background: sel?.id === l.id ? '#EFF6FF' : A.card, transition: 'all 0.15s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: A.text }}>{l.shipper_company || '(No company)'}</div>
                    <div style={{ fontSize: 11, color: A.sub }}>{l.shipper_name} · {l.created_at?.slice(0, 10)}</div>
                  </div>
                  <div style={{ pointerEvents: 'none' }}><Badge status={l.status} /></div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: (l.match_score || 0) >= 80 ? A.success : A.warn }}>{l.match_score}%</span>
                  <span style={{ fontSize: 11, color: A.sub }}>→ {l.warehouse?.name || '—'}</span>
                  {l.warehouse_sent && <span style={{ fontSize: 10, fontWeight: 700, color: A.success }}>✓ Sent</span>}
                  {l.survey_completed && <span style={{ fontSize: 10, fontWeight: 700, color: A.purple }}>✓ Survey</span>}
                </div>
              </C>
            </button>
          ))}
        </div>

        {sel && (
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <C>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, color: A.sub, marginBottom: 3 }}>Lead {sel.id} · {sel.created_at?.slice(0, 10)}</div>
                  <div style={{ fontSize: 20, fontWeight: 800 }}>{sel.shipper_company}</div>
                  <div style={{ fontSize: 13, color: A.sub }}>{sel.shipper_name} · {sel.shipper_email} · {sel.shipper_phone}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {sel.status === 'pending_review' && <>
                    <Btn v="success" onClick={() => act('approve')}>✓ Approve</Btn>
                    <Btn v="danger" onClick={() => act('reject')}>✗ Reject</Btn>
                  </>}
                  {sel.status === 'approved' && !sel.warehouse_sent && <Btn onClick={() => showEmail('warehouseIntro')}>📧 Send to Warehouse</Btn>}
                  {sel.warehouse_sent && <Btn v="ghost" onClick={() => showEmail('surveyInvite')}>📋 Preview Survey Email</Btn>}
                </div>
              </div>
            </C>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <C>
                <ST>Shipper Requirements</ST>
                {Object.entries(sel.answers || {}).map(([k, v]: any) => (
                  <div key={k} style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: `1px solid ${A.border}`, fontSize: 13 }}>
                    <span style={{ color: A.sub, width: 120, flexShrink: 0, textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</span>
                    <span style={{ fontWeight: 600 }}>{Array.isArray(v) ? v.join(', ') : v}</span>
                  </div>
                ))}
              </C>
              <C>
                <ST>Match Details</ST>
                {/* Shipper's explicit choice (if different from top AI match) */}
                {sel.chosen_warehouse && sel.chosen_by_shipper !== sel.top_match_id && (
                  <div style={{ padding: 12, background: '#FEF9C3', borderRadius: 10, marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#92400E', marginBottom: 4 }}>⭐ SHIPPER'S CHOICE</div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{sel.chosen_warehouse?.name}</div>
                    <div style={{ fontSize: 12, color: A.sub }}>📍 {sel.chosen_warehouse?.location}</div>
                  </div>
                )}
                {/* AI top match */}
                {wh && (
                  <div style={{ padding: 12, background: '#F0FDF4', borderRadius: 10, marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: A.success, marginBottom: 4 }}>🤖 AI TOP MATCH</div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{wh.name}</div>
                    <div style={{ fontSize: 12, color: A.sub }}>📍 {wh.location}</div>
                    <div style={{ fontSize: 13, marginTop: 6 }}>Lead fee: <strong>${wh.lead_fee || wh.leadFee || 120}</strong></div>
                  </div>
                )}
                {/* AI chat note */}
                {sel.extra_note && (
                  <div style={{ padding: 10, background: '#EEF3FE', borderRadius: 10, marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#3563E9', marginBottom: 3 }}>💬 EXTRA REQUIREMENTS</div>
                    <div style={{ fontSize: 13, color: A.text }}>{sel.extra_note}</div>
                  </div>
                )}
                <div style={{ marginBottom: 13 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: A.sub, display: 'block', marginBottom: 4 }}>Override Match</label>
                  <select
                    value={sel.top_match_id || ''}
                    onChange={async (e: any) => {
                      const newId = e.target.value
                      const newWh = warehouses.find((w: any) => w.id === newId)
                      await act('reassign', { top_match_id: newId })
                      setSel((prev: any) => ({ ...prev, top_match_id: newId, warehouse: newWh || prev.warehouse }))
                    }}
                    style={{ width: '100%', border: `1px solid ${A.border}`, borderRadius: 8, padding: '8px 11px', fontSize: 14, color: A.text, fontFamily: 'DM Sans, sans-serif', background: '#fff' }}
                  >
                    {warehouses.filter((w: any) => w.status === 'active').map((w: any) => (
                      <option key={w.id} value={w.id}>{w.name} ({w.location})</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <Btn sz="sm" v="ghost" onClick={() => showEmail('warehouseIntro')}>👁 WH Email</Btn>
                  <Btn sz="sm" v="ghost" onClick={() => showEmail('shipperConfirm')}>👁 Shipper Email</Btn>
                </div>
              </C>
            </div>

            <C>
              <ST>Admin Notes</ST>
              <TA value={note} onChange={(e: any) => setNote(e.target.value)} rows={3} />
              <Btn sz="sm" onClick={() => act('note')}>Save Note</Btn>
            </C>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── WAREHOUSES ───────────────────────────────────────────────────────────────
function Warehouses({ warehouses, setWarehouses }: any) {
  const [sel, setSel] = useState<any>(null)
  const [tab, setTab] = useState('basic')
  const [editW, setEditW] = useState<any>(null)

  const [newSvc, setNewSvc]   = useState('')
  const [newSpec, setNewSpec] = useState('')
  const [newInt, setNewInt]   = useState('')

  const startEdit = (w: any) => {
    const copy = JSON.parse(JSON.stringify(w))
    // Ensure additional_locations is always an array
    if (!Array.isArray(copy.additional_locations)) copy.additional_locations = []
    setSel(w.id); setEditW(copy); setTab('basic')
  }

  const save = async () => {
    const payload = { ...editW, id: editW.id }
    const res = await api('/api/warehouses', { method: 'PUT', body: JSON.stringify(payload) })
    if (res.error) { toast.error(res.error); return }
    setWarehouses((p: any[]) => p.map(w => w.id === res.id ? res : w))
    setSel(null); setEditW(null); toast.success('Saved')
  }

  const add = async () => {
    const res = await api('/api/warehouses', { method: 'POST', body: JSON.stringify({ name: 'New Warehouse', location: '', region: 'West', logo: 'NW', status: 'pending', plan: 'standard', lead_fee: 120, ad_boost: 0 }) })
    if (res.error) { toast.error(res.error); return }
    setWarehouses((p: any[]) => [...p, res])
    startEdit(res)
  }

  const del = async (id: string) => {
    if (!confirm('Delete this warehouse?')) return
    await api(`/api/warehouses?id=${id}`, { method: 'DELETE' })
    setWarehouses((p: any[]) => p.filter(w => w.id !== id))
    setSel(null); setEditW(null)
  }

  const e = (key: string, val: any) => setEditW((p: any) => ({ ...p, [key]: val }))
  const ep = (key: string, val: any) => setEditW((p: any) => ({ ...p, pricing: { ...p.pricing, [key]: val } }))

  const TABS = ['basic', 'pricing', 'services', 'advertising']

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: A.text, margin: 0 }}>Warehouses ({warehouses.length})</h2>
        <Btn onClick={add}>+ Add Warehouse</Btn>
      </div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {/* List — always visible, fixed width when editing */}
        <div style={{ width: sel ? 300 : '100%', flexShrink: 0, display: 'grid', gridTemplateColumns: sel ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10, alignContent: 'start' }}>
          {warehouses.map((w: any) => (
            <button
              key={w.id}
              onClick={() => startEdit(w)}
              style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              <C style={{ padding: 14, border: sel === w.id ? `2px solid ${A.accent}` : `1px solid ${A.border}`, transition: 'border-color 0.15s', background: sel === w.id ? '#EFF6FF' : A.card }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 9, background: 'linear-gradient(135deg,#1E3A8A,#4F46E5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff', flexShrink: 0 }}>{w.logo}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: A.text }}>{w.name}</div>
                    <div style={{ fontSize: 11, color: A.sub }}>📍 {w.location || 'No location set'}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, pointerEvents: 'none' }}>
                    <Badge status={w.status} />
                    {w.ad_boost > 0 && <span style={{ fontSize: 10, fontWeight: 700, background: '#FEF9C3', color: '#854D0E', padding: '1px 6px', borderRadius: 8 }}>+{w.ad_boost}% boost</span>}
                  </div>
                </div>
              </C>
            </button>
          ))}
        </div>

        {/* Edit Panel */}
        {sel && editW && (
          <C>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ fontSize: 16, fontWeight: 800 }}>{editW.name}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn sz="sm" v="danger" onClick={() => del(editW.id)}>Delete</Btn>
                <Btn sz="sm" v="secondary" onClick={() => { setSel(null); setEditW(null) }}>Cancel</Btn>
                <Btn sz="sm" onClick={save}>Save</Btn>
              </div>
            </div>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: `1px solid ${A.border}` }}>
              {TABS.map(t => (
                <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer', color: tab === t ? A.accent : A.sub, borderBottom: `2px solid ${tab === t ? A.accent : 'transparent'}`, marginBottom: -1, fontFamily: 'DM Sans, sans-serif', textTransform: 'capitalize' }}>{t}</button>
              ))}
            </div>

            {tab === 'basic' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

                {/* ── Warehouse Identity ── */}
                <div style={{ gridColumn: '1/-1', fontSize: 11, fontWeight: 800, color: A.sub, letterSpacing: 1.2, textTransform: 'uppercase', paddingBottom: 6, borderBottom: `1px solid ${A.border}` }}>Warehouse Identity</div>
                <Inp label="Warehouse Name *" value={editW.name} onChange={(ev: any) => e('name', ev.target.value)} placeholder="e.g. PacWest Fulfillment" />
                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 8 }}>
                  <Inp label="Logo (2 chars)" value={editW.logo} onChange={(ev: any) => e('logo', ev.target.value.slice(0, 2).toUpperCase())} placeholder="PW" />
                  <Inp label="Badge Label" value={editW.badge || ''} onChange={(ev: any) => e('badge', ev.target.value)} placeholder="e.g. Top Rated, B2B Specialist" />
                </div>
                <Sel label="Status" value={editW.status} onChange={(ev: any) => e('status', ev.target.value)} options={['active', 'pending', 'suspended']} />
                <Sel label="Region (for AI Matching)" value={editW.region} onChange={(ev: any) => e('region', ev.target.value)} options={['West', 'East', 'Midwest', 'South', 'Southeast', 'Northwest']} />

                {/* ── Address ── */}
                <div style={{ gridColumn: '1/-1', fontSize: 11, fontWeight: 800, color: A.sub, letterSpacing: 1.2, textTransform: 'uppercase', paddingBottom: 6, borderBottom: `1px solid ${A.border}`, marginTop: 8 }}>Address</div>
                <div style={{ gridColumn: '1/-1' }}>
                  <Inp label="Street Address" value={editW.address_street || ''} onChange={(ev: any) => e('address_street', ev.target.value)} placeholder="e.g. 1234 Warehouse Blvd, Suite 100" />
                </div>
                <Inp label="City *" value={editW.address_city || ''} onChange={(ev: any) => {
                  e('address_city', ev.target.value)
                  // Auto-update the legacy location field for AI matching display
                  const state = editW.address_state || ''
                  if (ev.target.value || state) e('location', [ev.target.value, state].filter(Boolean).join(', '))
                }} placeholder="e.g. Los Angeles" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 8 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: A.sub, display: 'block', marginBottom: 4 }}>State *</label>
                    <select
                      value={editW.address_state || ''}
                      onChange={(ev: any) => {
                        e('address_state', ev.target.value)
                        const city = editW.address_city || ''
                        if (city || ev.target.value) e('location', [city, ev.target.value].filter(Boolean).join(', '))
                      }}
                      style={{ width: '100%', border: `1px solid ${A.border}`, borderRadius: 8, padding: '8px 11px', fontSize: 14, color: A.text, fontFamily: 'DM Sans, sans-serif', background: '#fff' }}
                    >
                      <option value="">Select State</option>
                      {['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <Inp label="ZIP Code" value={editW.address_zip || ''} onChange={(ev: any) => e('address_zip', ev.target.value)} placeholder="90001" />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: A.sub, display: 'block', marginBottom: 4 }}>Country</label>
                  <select
                    value={editW.address_country || 'US'}
                    onChange={(ev: any) => e('address_country', ev.target.value)}
                    style={{ width: '100%', border: `1px solid ${A.border}`, borderRadius: 8, padding: '8px 11px', fontSize: 14, color: A.text, fontFamily: 'DM Sans, sans-serif', background: '#fff' }}
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="MX">Mexico</option>
                    <option value="GB">United Kingdom</option>
                    <option value="DE">Germany</option>
                    <option value="NL">Netherlands</option>
                    <option value="AU">Australia</option>
                    <option value="CN">China</option>
                    <option value="JP">Japan</option>
                    <option value="SG">Singapore</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                {/* Read-only display of combined location used in AI matching */}
                <div style={{ background: '#F0FDF4', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#065F46', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>📍</span>
                  <span><strong>AI Match Display:</strong> {editW.location || 'Fill City + State above'}</span>
                </div>

                {/* ── 额外地址（多仓库支持）── */}
                <div style={{ gridColumn: '1/-1', marginTop: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: A.sub, letterSpacing: 1.2, textTransform: 'uppercase', paddingBottom: 6, borderBottom: `1px solid ${A.border}`, marginBottom: 12 }}>
                    Additional Locations
                    <span style={{ fontSize: 10, fontWeight: 500, textTransform: 'none', marginLeft: 8, color: A.sub }}>(for warehouses with multiple sites)</span>
                  </div>
                  {((editW.additional_locations as any[]) || []).map((loc: any, idx: number) => (
                    <div key={idx} style={{ background: '#F9FAFB', border: `1px solid ${A.border}`, borderRadius: 10, padding: 14, marginBottom: 10, position: 'relative' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: A.sub, marginBottom: 8 }}>Location #{idx + 2}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <Inp label="Street" value={loc.street || ''} onChange={(ev: any) => {
                          const locs = [...((editW.additional_locations as any[]) || [])]
                          locs[idx] = { ...locs[idx], street: ev.target.value }
                          e('additional_locations', locs)
                        }} placeholder="Street address" />
                        <Inp label="City" value={loc.city || ''} onChange={(ev: any) => {
                          const locs = [...((editW.additional_locations as any[]) || [])]
                          locs[idx] = { ...locs[idx], city: ev.target.value }
                          e('additional_locations', locs)
                        }} placeholder="City" />
                        <Inp label="State" value={loc.state || ''} onChange={(ev: any) => {
                          const locs = [...((editW.additional_locations as any[]) || [])]
                          locs[idx] = { ...locs[idx], state: ev.target.value }
                          e('additional_locations', locs)
                        }} placeholder="CA" />
                        <Inp label="ZIP" value={loc.zip || ''} onChange={(ev: any) => {
                          const locs = [...((editW.additional_locations as any[]) || [])]
                          locs[idx] = { ...locs[idx], zip: ev.target.value }
                          e('additional_locations', locs)
                        }} placeholder="90001" />
                      </div>
                      <Inp label="Notes (optional)" value={loc.notes || ''} onChange={(ev: any) => {
                        const locs = [...((editW.additional_locations as any[]) || [])]
                        locs[idx] = { ...locs[idx], notes: ev.target.value }
                        e('additional_locations', locs)
                      }} placeholder="e.g. East Coast hub, climate control only" />
                      <button onClick={() => {
                        const locs = ((editW.additional_locations as any[]) || []).filter((_: any, i: number) => i !== idx)
                        e('additional_locations', locs)
                      }} style={{ position: 'absolute', top: 10, right: 10, background: '#FEE2E2', border: 'none', borderRadius: 6, padding: '3px 8px', fontSize: 12, color: '#DC2626', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>✕ Remove</button>
                    </div>
                  ))}
                  <button onClick={() => {
                    const locs = [...((editW.additional_locations as any[]) || []), { street: '', city: '', state: '', zip: '', notes: '' }]
                    e('additional_locations', locs)
                  }} style={{ background: '#EEF3FE', border: '1.5px dashed #3563E9', borderRadius: 10, padding: '10px 18px', fontSize: 13, color: '#3563E9', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, width: '100%' }}>
                    + Add Another Location
                  </button>
                </div>

                {/* ── Contact ── */}
                <div style={{ gridColumn: '1/-1', fontSize: 11, fontWeight: 800, color: A.sub, letterSpacing: 1.2, textTransform: 'uppercase', paddingBottom: 6, borderBottom: `1px solid ${A.border}`, marginTop: 8 }}>Contact</div>
                <Inp label="Contact Email *" value={editW.contact_email || ''} onChange={(ev: any) => e('contact_email', ev.target.value)} type="email" placeholder="ops@warehouse.com" />
                <Inp label="Contact Phone" value={editW.contact_phone || ''} onChange={(ev: any) => e('contact_phone', ev.target.value)} placeholder="(213) 555-0100" />

                {/* ── Capacity ── */}
                <div style={{ gridColumn: '1/-1', fontSize: 11, fontWeight: 800, color: A.sub, letterSpacing: 1.2, textTransform: 'uppercase', paddingBottom: 6, borderBottom: `1px solid ${A.border}`, marginTop: 8 }}>Capacity & Volume</div>
                <Inp label="Min Orders / Month" value={editW.min_volume} onChange={(ev: any) => e('min_volume', +ev.target.value)} type="number" placeholder="100" />
                <Inp label="Max Orders / Month" value={editW.max_volume} onChange={(ev: any) => e('max_volume', +ev.target.value)} type="number" placeholder="50000" />
                <Inp label="Warehouse Size (sqft)" value={editW.sqft ?? ''} onChange={(ev: any) => e('sqft', +ev.target.value)} type="number" placeholder="100000" />
                <Inp label="Order Accuracy (%)" value={editW.accuracy ?? ''} onChange={(ev: any) => e('accuracy', +ev.target.value)} type="number" placeholder="99.5" />

                {/* ── Description & Tags ── */}
                <div style={{ gridColumn: '1/-1', fontSize: 11, fontWeight: 800, color: A.sub, letterSpacing: 1.2, textTransform: 'uppercase', paddingBottom: 6, borderBottom: `1px solid ${A.border}`, marginTop: 8 }}>Description & Tags</div>
                <div style={{ gridColumn: '1/-1' }}>
                  <TA label="Warehouse Description" value={editW.description || ''} onChange={(ev: any) => e('description', ev.target.value)} rows={3} />
                </div>
                <Inp label="Specialties (comma-separated)" value={(editW.specialties || []).join(', ')} onChange={(ev: any) => e('specialties', ev.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))} placeholder="ecommerce, apparel, DTC, beauty" />
                <Inp label="Services (comma-separated)" value={(editW.services || []).join(', ')} onChange={(ev: any) => e('services', ev.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))} placeholder="Pick & Pack, Kitting, Returns, FBA Prep" />
                <div style={{ gridColumn: '1/-1' }}>
                  <Inp label="Platform Integrations (comma-separated)" value={(editW.integrations || []).join(', ')} onChange={(ev: any) => e('integrations', ev.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))} placeholder="Shopify, Amazon, WooCommerce, NetSuite" />
                </div>
              </div>
            )}

            {tab === 'pricing' && (() => {
              const pr = editW.pricing || {}
              const weightBands = pr.weightBands || [
                { label: '0–1 lb', price: '' },
                { label: '1–5 lbs', price: '' },
                { label: '5–20 lbs', price: '' },
                { label: '20–50 lbs', price: '' },
                { label: '50+ lbs', price: '' },
              ]
              const storageUnit = pr.storageUnit || 'sqft/day'
              const sqftRate = parseFloat(pr.storage || 0)
              const sqmRate  = (sqftRate * 10.764).toFixed(4)
              const updWB = (idx: number, val: string) => {
                const nb = [...weightBands]; nb[idx] = { ...nb[idx], price: val }
                ep('weightBands', nb)
              }
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                  {/* ── Setup & Onboarding ── */}
                  <C>
                    <ST>Setup & Onboarding</ST>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                      <Inp label="Setup / Onboarding Fee ($)" value={pr.setup ?? ''} onChange={(ev: any) => ep('setup', +ev.target.value)} type="number" placeholder="0 = free" />
                      <Inp label="Min. Monthly Spend ($)" value={pr.minMonthly ?? ''} onChange={(ev: any) => ep('minMonthly', +ev.target.value)} type="number" placeholder="e.g. 500" />
                      <Inp label="Contract Term" value={pr.contractTerm || ''} onChange={(ev: any) => ep('contractTerm', ev.target.value)} placeholder="Month-to-month / 1 year" />
                    </div>
                  </C>

                  {/* ── Storage ── */}
                  <C>
                    <ST>Storage Fees</ST>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 8 }}>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: A.sub, display: 'block', marginBottom: 4 }}>Rate Unit</label>
                        <select value={storageUnit} onChange={(ev: any) => ep('storageUnit', ev.target.value)}
                          style={{ width: '100%', border: `1px solid ${A.border}`, borderRadius: 8, padding: '8px 11px', fontSize: 14, fontFamily: 'DM Sans,sans-serif', color: A.text, background: '#fff' }}>
                          <option value="sqft/day">$ per sqft / day</option>
                          <option value="sqft/month">$ per sqft / month</option>
                          <option value="sqm/day">$ per sqm / day</option>
                          <option value="sqm/month">$ per sqm / month</option>
                          <option value="pallet/month">$ per pallet / month</option>
                          <option value="bin/month">$ per bin / month</option>
                        </select>
                      </div>
                      <Inp label={`Rate (${storageUnit})`} value={pr.storage ?? ''} onChange={(ev: any) => ep('storage', ev.target.value)} type="number" placeholder="e.g. 0.015" />
                      <div style={{ background: '#F0FDF4', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
                        <div style={{ color: A.sub, marginBottom: 3 }}>Conversion preview</div>
                        {storageUnit.includes('sqft') && <div style={{ color: '#065F46' }}><strong>${sqftRate}</strong>/sqft = <strong>${sqmRate}</strong>/sqm</div>}
                        {storageUnit.includes('sqm') && <div style={{ color: '#065F46' }}><strong>${sqftRate}</strong>/sqm = <strong>${(sqftRate/10.764).toFixed(4)}</strong>/sqft</div>}
                        {storageUnit.includes('pallet') && <div style={{ color: '#065F46' }}>Pallet-based pricing</div>}
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <Inp label="Long-term Storage Surcharge (after X days)" value={pr.longTermDays ?? ''} onChange={(ev: any) => ep('longTermDays', +ev.target.value)} type="number" placeholder="e.g. 180 days" />
                      <Inp label="Long-term Rate (multiplier)" value={pr.longTermMultiplier ?? ''} onChange={(ev: any) => ep('longTermMultiplier', ev.target.value)} placeholder="e.g. 1.5x" />
                    </div>
                  </C>

                  {/* ── Pick & Pack / Handling ── */}
                  <C>
                    <ST>Pick & Pack / Handling Fees</ST>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                      <Inp label="Base Handling Fee per Order ($)" value={pr.baseHandling ?? ''} onChange={(ev: any) => ep('baseHandling', ev.target.value)} placeholder="e.g. 1.50" />
                      <Inp label="Per Item Pick Fee ($)" value={pr.perItemPick ?? ''} onChange={(ev: any) => ep('perItemPick', ev.target.value)} placeholder="e.g. 0.20" />
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: A.sub, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Handling by Weight Band</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
                      {weightBands.map((wb: any, idx: number) => (
                        <div key={idx}>
                          <label style={{ fontSize: 11, fontWeight: 600, color: A.sub, display: 'block', marginBottom: 3 }}>{wb.label}</label>
                          <input value={wb.price} onChange={(ev: any) => updWB(idx, ev.target.value)}
                            placeholder="$" type="number" step="0.01"
                            style={{ width: '100%', boxSizing: 'border-box', border: `1px solid ${A.border}`, borderRadius: 6, padding: '6px 8px', fontSize: 13, fontFamily: 'DM Sans,sans-serif', color: A.text, outline: 'none' }} />
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: 11, color: A.sub, marginTop: 6 }}>Leave blank if not applicable. Used to estimate handling costs when shipper specifies product weight in AI chat.</div>
                  </C>

                  {/* ── Shipping & Returns ── */}
                  <C>
                    <ST>Shipping & Returns</ST>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                      <Inp label="Shipping Markup (%)" value={pr.shippingMarkup ?? ''} onChange={(ev: any) => ep('shippingMarkup', ev.target.value)} placeholder="e.g. 0 (pass-through) or 10%" />
                      <Inp label="Returns Processing Fee ($)" value={pr.returnsFee ?? ''} onChange={(ev: any) => ep('returnsFee', ev.target.value)} placeholder="e.g. 3.00" />
                      <Inp label="Returns Restocking Fee ($)" value={pr.restockFee ?? ''} onChange={(ev: any) => ep('restockFee', ev.target.value)} placeholder="e.g. 0.50 per item" />
                    </div>
                  </C>

                  {/* ── Value-added & Other ── */}
                  <C>
                    <ST>Value-Added Services (optional)</ST>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                      <Inp label="Kitting / Assembly ($/unit)" value={pr.kittingFee ?? ''} onChange={(ev: any) => ep('kittingFee', ev.target.value)} placeholder="e.g. 0.75" />
                      <Inp label="Custom Packaging ($/order)" value={pr.customPackFee ?? ''} onChange={(ev: any) => ep('customPackFee', ev.target.value)} placeholder="e.g. 1.50" />
                      <Inp label="Receiving Fee ($/pallet)" value={pr.receivingFee ?? ''} onChange={(ev: any) => ep('receivingFee', ev.target.value)} placeholder="e.g. 25.00" />
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <TA label="Additional Notes / Custom Pricing" value={pr.notes || ''} onChange={(ev: any) => ep('notes', ev.target.value)} rows={3} placeholder="e.g. Volume discounts available above 5,000 orders/month. Climate control adds $0.05/sqft/day." />
                    </div>
                  </C>

                  {/* ── Display Summary & LogiMatcher Revenue ── */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <C>
                      <ST>Display Summary (shown to shippers)</ST>
                      <Inp label="Lead Time" value={editW.lead_time || ''} onChange={(ev: any) => e('lead_time', ev.target.value)} placeholder="Same Day / Next Day / 1-2 Days" />
                      <Inp label="Order Accuracy (%)" value={editW.accuracy ?? 99} onChange={(ev: any) => e('accuracy', +ev.target.value)} type="number" placeholder="99.5" />
                      <div style={{ background: '#F0FDF4', borderRadius: 8, padding: 12, fontSize: 12, color: '#065F46' }}>
                        Shippers see: Setup ${pr.setup || 0} · Storage ${pr.storage || '—'}/${storageUnit} · Handling from ${pr.baseHandling || pr.perOrder || '—'}/order
                      </div>
                    </C>
                    <C>
                      <ST>LogiMatcher Revenue</ST>
                      <Sel label="Subscription Plan" value={editW.plan} onChange={(ev: any) => e('plan', ev.target.value)} options={[{ value: 'standard', label: 'Standard — $100/lead' }, { value: 'premium', label: 'Premium — $180/lead' }, { value: 'enterprise', label: 'Enterprise — $300/lead' }]} />
                      <Inp label="Lead Fee Override ($)" value={editW.lead_fee ?? 120} onChange={(ev: any) => e('lead_fee', +ev.target.value)} type="number" />
                      <Inp label="Ad Boost (%)" value={editW.ad_boost ?? 0} onChange={(ev: any) => e('ad_boost', +ev.target.value)} type="number" placeholder="0–30" />
                      <div style={{ background: '#EFF6FF', borderRadius: 10, padding: 14, marginTop: 4 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: A.accent }}>Revenue per lead</div>
                        <div style={{ fontSize: 26, fontWeight: 800 }}>${editW.lead_fee || 120}</div>
                      </div>
                    </C>
                  </div>

                </div>
              )
            })()}

            {tab === 'services' && (() => {
              const PRESET_SERVICES = [
                { group: 'Fulfillment Core', items: ['Pick & Pack', 'Same-Day Fulfillment', 'Next-Day Fulfillment', 'Kitting & Assembly', 'Subscription Box Fulfillment', 'Custom Packaging', 'Gift Wrapping'] },
                { group: 'Returns & Reverse Logistics', items: ['Returns Management', 'Refurbishment', 'Disposal / Liquidation'] },
                { group: 'Amazon & Marketplace', items: ['Amazon FBA Prep', 'Amazon FBM', 'Walmart Fulfillment', 'eBay Fulfillment'] },
                { group: 'B2B & Retail', items: ['Retail Distribution', 'EDI Integration', 'Cross-Docking', 'Palletizing', 'Freight Consolidation'] },
                { group: 'Storage', items: ['Bulk Storage', 'Climate Control', 'Cold Storage / Refrigerated', 'Hazmat Storage', 'Bonded Warehouse'] },
                { group: 'Shipping', items: ['International Shipping', 'Last-Mile Delivery', 'White Glove Delivery', 'LTL / FTL Freight'] },
                { group: 'Value-Added', items: ['Photography / QC Inspection', 'Labeling & Relabeling', 'Product Assembly', 'Bundling', 'Shrink Wrapping'] },
              ]
              const PRESET_SPECIALTIES = [
                'eCommerce / DTC', 'B2B / Wholesale', 'Apparel & Fashion', 'Beauty & Cosmetics',
                'Health & Supplements', 'Food & Beverage', 'Electronics & Tech', 'Furniture & Large Items',
                'Auto Parts / Industrial', 'Luxury Goods', 'Subscription Brands', 'Amazon Sellers',
                'Retail / Omnichannel', 'International Brands', 'Hazardous Materials',
              ]
              const PRESET_INTEGRATIONS = [
                'Shopify', 'WooCommerce', 'BigCommerce', 'Magento', 'Squarespace',
                'Amazon Seller Central', 'eBay', 'Walmart Marketplace', 'Etsy',
                'NetSuite', 'SAP', 'Oracle', 'QuickBooks', 'Xero',
                'ShipStation', 'ShipBob', 'EasyPost', 'Shippo',
                'Salesforce', 'HubSpot', 'Klaviyo',
                'Cratejoy', 'ReCharge', 'Skio',
              ]
              const curServices     = editW.services     || []
              const curSpecialties  = editW.specialties  || []
              const curIntegrations = editW.integrations || []

              const toggle = (field: string, cur: string[], val: string) => {
                e(field, cur.includes(val) ? cur.filter(x => x !== val) : [...cur, val])
              }

              const addCustom = (field: string, cur: string[], val: string, clear: () => void) => {
                const v = val.trim()
                if (!v || cur.includes(v)) return
                e(field, [...cur, v]); clear()
              }

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                  {/* ── SERVICES ── */}
                  <C style={{ background: '#F9FAFB' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <ST>Services Offered</ST>
                      <span style={{ fontSize: 11, color: A.accent, fontWeight: 700 }}>{curServices.length} selected</span>
                    </div>

                    {/* Selected chips */}
                    {curServices.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16, padding: 12, background: '#EFF6FF', borderRadius: 10 }}>
                        {curServices.map((s: string) => (
                          <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#fff', border: `1px solid ${A.accent}`, color: A.accent, fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>
                            {s}
                            <button onClick={() => e('services', curServices.filter((x: string) => x !== s))}
                              style={{ background: 'none', border: 'none', color: A.danger, cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: 0, marginLeft: 2 }}>×</button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Presets grouped */}
                    {PRESET_SERVICES.map(group => (
                      <div key={group.group} style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 10, fontWeight: 800, color: A.sub, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>{group.group}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {group.items.map(item => {
                            const on = curServices.includes(item)
                            return (
                              <button key={item} onClick={() => toggle('services', curServices, item)}
                                style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20, cursor: 'pointer', border: `1.5px solid ${on ? A.accent : A.border}`, background: on ? '#EFF6FF' : '#fff', color: on ? A.accent : A.sub, fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s' }}>
                                {on ? '✓ ' : ''}{item}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}

                    {/* Manual add */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${A.border}` }}>
                      <input value={newSvc} onChange={ev => setNewSvc(ev.target.value)}
                        onKeyDown={ev => ev.key === 'Enter' && addCustom('services', curServices, newSvc, () => setNewSvc(''))}
                        placeholder="Add custom service…"
                        style={{ flex: 1, border: `1px solid ${A.border}`, borderRadius: 8, padding: '7px 11px', fontSize: 13, fontFamily: 'DM Sans, sans-serif', outline: 'none', color: A.text }} />
                      <Btn sz="sm" onClick={() => addCustom('services', curServices, newSvc, () => setNewSvc(''))}>+ Add</Btn>
                    </div>
                  </C>

                  {/* ── SPECIALTIES ── */}
                  <C style={{ background: '#F9FAFB' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <ST>Industry Specialties</ST>
                      <span style={{ fontSize: 11, color: A.accent, fontWeight: 700 }}>{curSpecialties.length} selected</span>
                    </div>

                    {curSpecialties.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14, padding: 12, background: '#F0FDF4', borderRadius: 10 }}>
                        {curSpecialties.map((s: string) => (
                          <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#fff', border: `1px solid ${A.success}`, color: A.success, fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>
                            {s}
                            <button onClick={() => e('specialties', curSpecialties.filter((x: string) => x !== s))}
                              style={{ background: 'none', border: 'none', color: A.danger, cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: 0, marginLeft: 2 }}>×</button>
                          </span>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                      {PRESET_SPECIALTIES.map(item => {
                        const on = curSpecialties.includes(item)
                        return (
                          <button key={item} onClick={() => toggle('specialties', curSpecialties, item)}
                            style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20, cursor: 'pointer', border: `1.5px solid ${on ? A.success : A.border}`, background: on ? '#F0FDF4' : '#fff', color: on ? A.success : A.sub, fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s' }}>
                            {on ? '✓ ' : ''}{item}
                          </button>
                        )
                      })}
                    </div>

                    <div style={{ display: 'flex', gap: 8, paddingTop: 12, borderTop: `1px solid ${A.border}` }}>
                      <input value={newSpec} onChange={ev => setNewSpec(ev.target.value)}
                        onKeyDown={ev => ev.key === 'Enter' && addCustom('specialties', curSpecialties, newSpec, () => setNewSpec(''))}
                        placeholder="Add custom specialty…"
                        style={{ flex: 1, border: `1px solid ${A.border}`, borderRadius: 8, padding: '7px 11px', fontSize: 13, fontFamily: 'DM Sans, sans-serif', outline: 'none', color: A.text }} />
                      <Btn sz="sm" onClick={() => addCustom('specialties', curSpecialties, newSpec, () => setNewSpec(''))}>+ Add</Btn>
                    </div>
                  </C>

                  {/* ── INTEGRATIONS ── */}
                  <C style={{ background: '#F9FAFB' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <ST>Platform Integrations</ST>
                      <span style={{ fontSize: 11, color: A.accent, fontWeight: 700 }}>{curIntegrations.length} selected</span>
                    </div>

                    {curIntegrations.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14, padding: 12, background: '#FDF4FF', borderRadius: 10 }}>
                        {curIntegrations.map((s: string) => (
                          <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#fff', border: `1px solid ${A.purple}`, color: A.purple, fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>
                            {s}
                            <button onClick={() => e('integrations', curIntegrations.filter((x: string) => x !== s))}
                              style={{ background: 'none', border: 'none', color: A.danger, cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: 0, marginLeft: 2 }}>×</button>
                          </span>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                      {PRESET_INTEGRATIONS.map(item => {
                        const on = curIntegrations.includes(item)
                        return (
                          <button key={item} onClick={() => toggle('integrations', curIntegrations, item)}
                            style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20, cursor: 'pointer', border: `1.5px solid ${on ? A.purple : A.border}`, background: on ? '#FDF4FF' : '#fff', color: on ? A.purple : A.sub, fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s' }}>
                            {on ? '✓ ' : ''}{item}
                          </button>
                        )
                      })}
                    </div>

                    <div style={{ display: 'flex', gap: 8, paddingTop: 12, borderTop: `1px solid ${A.border}` }}>
                      <input value={newInt} onChange={ev => setNewInt(ev.target.value)}
                        onKeyDown={ev => ev.key === 'Enter' && addCustom('integrations', curIntegrations, newInt, () => setNewInt(''))}
                        placeholder="Add custom integration…"
                        style={{ flex: 1, border: `1px solid ${A.border}`, borderRadius: 8, padding: '7px 11px', fontSize: 13, fontFamily: 'DM Sans, sans-serif', outline: 'none', color: A.text }} />
                      <Btn sz="sm" onClick={() => addCustom('integrations', curIntegrations, newInt, () => setNewInt(''))}>+ Add</Btn>
                    </div>
                  </C>

                  {/* ── RATINGS ── */}
                  <C style={{ background: '#F9FAFB' }}>
                    <ST>Ratings & Reviews</ST>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <Inp label="Star Rating (0–5)" value={editW.rating ?? 4.5} onChange={(ev: any) => e('rating', Math.min(5, Math.max(0, +ev.target.value)))} type="number" />
                      <Inp label="Total Reviews Count" value={editW.reviews ?? 0} onChange={(ev: any) => e('reviews', +ev.target.value)} type="number" />
                    </div>
                  </C>

                </div>
              )
            })()}

            {tab === 'advertising' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <C style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                  <ST>Ad Boost Level</ST>
                  <p style={{ fontSize: 13, color: '#92400E', marginBottom: 14 }}>Paid boost increases match score in results ranking.</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                    {[0, 10, 20, 30, 50].map(b => (
                      <button key={b} onClick={() => e('ad_boost', b)}
                        style={{ padding: '7px 14px', borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: `1.5px solid ${editW.ad_boost === b ? '#F59E0B' : A.border}`, background: editW.ad_boost === b ? '#FEF9C3' : '#fff', color: editW.ad_boost === b ? '#92400E' : A.sub, fontFamily: 'DM Sans, sans-serif' }}>
                        {b === 0 ? 'None' : `+${b}%`}
                      </button>
                    ))}
                  </div>
                  {editW.ad_boost > 0 && (
                    <div style={{ background: '#FEF9C3', borderRadius: 8, padding: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#92400E' }}>Monthly Ad Fee</div>
                      <div style={{ fontSize: 22, fontWeight: 800 }}>
                        ${ editW.ad_boost === 10 ? '99' : editW.ad_boost === 20 ? '179' : editW.ad_boost === 30 ? '249' : '399' }/mo
                      </div>
                    </div>
                  )}
                </C>
                <C>
                  <ST>Preview in Results</ST>
                  <div style={{ border: `2px solid ${editW.ad_boost > 0 ? '#F59E0B' : A.border}`, borderRadius: 10, padding: 14, position: 'relative' }}>
                    {editW.ad_boost > 0 && <div style={{ position: 'absolute', top: -10, right: 10, background: '#F59E0B', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 8 }}>SPONSORED +{editW.ad_boost}%</div>}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg,#1E3A8A,#4F46E5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff' }}>{editW.logo}</div>
                      <div><div style={{ fontSize: 14, fontWeight: 700 }}>{editW.name}</div><div style={{ fontSize: 11, color: A.sub }}>📍 {editW.location}</div></div>
                      <div style={{ marginLeft: 'auto', fontSize: 16, fontWeight: 800, color: A.success }}>{Math.min(99, 82 + editW.ad_boost)}% Match</div>
                    </div>
                  </div>
                </C>
              </div>
            )}
          </C>
        )}
      </div>
    </div>
  )
}

// ─── QUIZ EDITOR ──────────────────────────────────────────────────────────────
function QuizEditor({ questions, setQuestions }: any) {
  const [editIdx, setEditIdx] = useState<number | null>(null)
  const [editQ, setEditQ] = useState<any>(null)
  const [newLabel, setNewLabel] = useState(''); const [newIcon, setNewIcon] = useState('')

  const startEdit = (i: number) => { setEditIdx(i); setEditQ(JSON.parse(JSON.stringify(questions[i]))) }

  const save = async () => {
    const res = await api('/api/questions', { method: 'PUT', body: JSON.stringify(editQ) })
    if (res.error) { toast.error(res.error); return }
    setQuestions((p: any[]) => p.map(q => q.id === res.id ? res : q))
    setEditIdx(null); setEditQ(null); toast.success('Question saved')
  }

  const add = async () => {
    const nq = { question_id: `q_${Date.now()}`, question: 'New Question', subtitle: 'Subtitle', type: 'single', options: [], sort_order: questions.length + 1, active: true }
    const res = await api('/api/questions', { method: 'POST', body: JSON.stringify(nq) })
    if (res.error) { toast.error(res.error); return }
    setQuestions((p: any[]) => [...p, res])
    startEdit(questions.length)
  }

  const del = async (id: string) => {
    if (!confirm('Delete question?')) return
    await api(`/api/questions?id=${id}`, { method: 'DELETE' })
    setQuestions((p: any[]) => p.filter(q => q.id !== id))
    setEditIdx(null); setEditQ(null)
  }

  const move = async (i: number, d: number) => {
    const qs = [...questions]
    const ni = i + d; if (ni < 0 || ni >= qs.length) return
    ;[qs[i], qs[ni]] = [qs[ni], qs[i]]
    qs[i].sort_order = i + 1; qs[ni].sort_order = ni + 1
    setQuestions(qs)
    await Promise.all([
      api('/api/questions', { method: 'PUT', body: JSON.stringify({ id: qs[i].id, sort_order: i + 1 }) }),
      api('/api/questions', { method: 'PUT', body: JSON.stringify({ id: qs[ni].id, sort_order: ni + 1 }) }),
    ])
  }

  const addOpt = () => {
    if (!newLabel.trim()) return
    setEditQ((p: any) => ({ ...p, options: [...(p.options || []), { value: newLabel.toLowerCase().replace(/\s+/g, '_'), label: newLabel, icon: newIcon || '📦' }] }))
    setNewLabel(''); setNewIcon('')
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: A.text, margin: 0 }}>Quiz Question Editor</h2>
        <Btn onClick={add}>+ Add Question</Btn>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: editIdx !== null ? '1fr 1fr' : '1fr', gap: 16, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {questions.map((q: any, i: number) => (
            <C key={q.id} style={{ padding: 14, border: editIdx === i ? `2px solid ${A.accent}` : undefined }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 5 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, background: q.type === 'multi' ? '#EDE9FE' : '#DBEAFE', color: q.type === 'multi' ? A.purple : A.accent, padding: '2px 7px', borderRadius: 10 }}>{q.type === 'multi' ? 'MULTI' : 'SINGLE'}</span>
                    <span style={{ fontSize: 11, color: A.sub }}>Step {i + 1}</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{q.question}</div>
                  <div style={{ fontSize: 12, color: A.sub }}>{(q.options || []).length} options</div>
                </div>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <Btn sz="sm" v="secondary" onClick={() => move(i, -1)} disabled={i === 0}>↑</Btn>
                  <Btn sz="sm" v="secondary" onClick={() => move(i, 1)} disabled={i === questions.length - 1}>↓</Btn>
                  <Btn sz="sm" v="secondary" onClick={() => startEdit(i)}>Edit</Btn>
                  <Btn sz="sm" v="danger" onClick={() => del(q.id)}>Del</Btn>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 8 }}>
                {(q.options || []).map((o: any) => <span key={o.value} style={{ fontSize: 11, background: '#F3F4F6', padding: '2px 7px', borderRadius: 6 }}>{o.icon} {o.label}</span>)}
              </div>
            </C>
          ))}
        </div>

        {editIdx !== null && editQ && (
          <C style={{ position: 'sticky', top: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <ST>Edit Question {editIdx + 1}</ST>
              <Btn sz="sm" v="ghost" onClick={() => { setEditIdx(null); setEditQ(null) }}>✕</Btn>
            </div>
            <Inp label="Question" value={editQ.question} onChange={(ev: any) => setEditQ((p: any) => ({ ...p, question: ev.target.value }))} />
            <Inp label="Subtitle" value={editQ.subtitle || ''} onChange={(ev: any) => setEditQ((p: any) => ({ ...p, subtitle: ev.target.value }))} />
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: A.sub, display: 'block', marginBottom: 5 }}>Type</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['single', 'multi'].map(t => (
                  <button key={t} onClick={() => setEditQ((p: any) => ({ ...p, type: t }))} style={{ padding: '7px 16px', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: `1.5px solid ${editQ.type === t ? A.accent : A.border}`, background: editQ.type === t ? '#EFF6FF' : '#fff', color: editQ.type === t ? A.accent : A.sub, fontFamily: 'DM Sans, sans-serif' }}>
                    {t === 'single' ? 'Single' : 'Multi-select'}
                  </button>
                ))}
              </div>
            </div>
            <ST>Options ({(editQ.options || []).length})</ST>
            {(editQ.options || []).map((o: any, i: number) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '7px 10px', background: '#F9FAFB', borderRadius: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 18 }}>{o.icon}</span>
                <span style={{ flex: 1, fontSize: 13 }}>{o.label}</span>
                <span style={{ fontSize: 11, color: A.sub, fontFamily: 'monospace' }}>{o.value}</span>
                <button onClick={() => setEditQ((p: any) => ({ ...p, options: p.options.filter((_: any, si: number) => si !== i) }))} style={{ background: 'none', border: 'none', color: A.danger, cursor: 'pointer', fontSize: 16 }}>×</button>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input value={newIcon} onChange={e => setNewIcon(e.target.value)} placeholder="🎁" style={{ width: 44, border: `1px solid ${A.border}`, borderRadius: 7, padding: '7px', fontSize: 18, textAlign: 'center' }} />
              <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Option label…" onKeyDown={e => e.key === 'Enter' && addOpt()} style={{ flex: 1, border: `1px solid ${A.border}`, borderRadius: 7, padding: '7px 10px', fontSize: 13, fontFamily: 'DM Sans, sans-serif' }} />
              <Btn sz="sm" onClick={addOpt}>+ Add</Btn>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <Btn onClick={save} full>Save Question</Btn>
              <Btn v="secondary" onClick={() => { setEditIdx(null); setEditQ(null) }}>Cancel</Btn>
            </div>
          </C>
        )}
      </div>
    </div>
  )
}

// ─── EMAIL & SURVEY CONFIG ────────────────────────────────────────────────────
function EmailConfig({ config, setConfig }: any) {
  const [tpl, setTpl] = useState('warehouseIntro')
  const [saving, setSaving] = useState(false)

  const saveConfig = async () => {
    setSaving(true)
    await api('/api/config', { method: 'PUT', body: JSON.stringify(config) })
    toast.success('Config saved'); setSaving(false)
  }

  const cfg = config || {}
  const templates = cfg.email_templates || {}
  const surveyQs: any[] = cfg.survey_questions || []

  const TPLS: any = {
    warehouseIntro: '📧 Warehouse Introduction',
    shipperConfirm: '✉️ Shipper Confirmation',
    surveyInvite: '📋 Survey Invite',
  }

  const VARS: any = {
    warehouseIntro: ['{{warehouse_name}}', '{{shipper_company}}', '{{shipper_name}}', '{{shipper_email}}', '{{shipper_phone}}', '{{match_score}}', '{{business_type}}', '{{monthly_orders}}', '{{product_types}}', '{{location}}', '{{services}}', '{{timeline}}'],
    shipperConfirm: ['{{shipper_name}}', '{{warehouse_name}}', '{{warehouse_location}}', '{{warehouse_rating}}', '{{match_score}}'],
    surveyInvite: ['{{shipper_name}}', '{{days}}', '{{warehouse_name}}', '{{survey_link}}'],
  }

  const updateTpl = (field: string, val: string) =>
    setConfig((p: any) => ({ ...p, email_templates: { ...p.email_templates, [tpl]: { ...p.email_templates?.[tpl], [field]: val } } }))

  const addSurveyQ = () =>
    setConfig((p: any) => ({ ...p, survey_questions: [...(p.survey_questions || []), { id: `q_${Date.now()}`, question: 'New question', type: 'single', options: ['Yes', 'No'] }] }))

  const removeSurveyQ = (i: number) =>
    setConfig((p: any) => ({ ...p, survey_questions: (p.survey_questions || []).filter((_: any, qi: number) => qi !== i) }))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: A.text, margin: 0 }}>Email Templates & Survey</h2>
        <Btn onClick={saveConfig} disabled={saving}>{saving ? 'Saving…' : 'Save All Changes'}</Btn>
      </div>

      {/* Automation */}
      <C style={{ marginBottom: 20 }}>
        <ST>Automation Settings</ST>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
          <div>
            <Tog value={cfg.review_required !== false} onChange={(v: boolean) => setConfig((p: any) => ({ ...p, review_required: v }))} label="Require manual review before sending" />
            <Tog value={cfg.auto_send_after_approval !== false} onChange={(v: boolean) => setConfig((p: any) => ({ ...p, auto_send_after_approval: v }))} label="Auto-send email after approval" />
          </div>
          <div>
            <Inp label="Survey delay (days after lead sent)" value={cfg.survey_delay_days ?? 7} onChange={(ev: any) => setConfig((p: any) => ({ ...p, survey_delay_days: +ev.target.value }))} type="number" />
          </div>
          <div style={{ background: '#F0FDF4', borderRadius: 10, padding: 14, fontSize: 13 }}>
            <div style={{ fontWeight: 700, color: A.success, marginBottom: 8 }}>📬 Email Flow</div>
            <div style={{ color: A.text, lineHeight: 2.2 }}>
              1. Lead submitted<br />
              {cfg.review_required !== false ? '2. Admin reviews\n3.' : '2.'} Warehouse email sent<br />
              {cfg.review_required !== false ? '4.' : '3.'} Shipper confirmation<br />
              {cfg.review_required !== false ? '5.' : '4.'} Survey after {cfg.survey_delay_days ?? 7} days
            </div>
          </div>
        </div>
      </C>

      {/* Templates */}
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16, marginBottom: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Object.entries(TPLS).map(([key, label]: any) => (
            <button key={key} onClick={() => setTpl(key)}
              style={{ padding: '12px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left', border: `1.5px solid ${tpl === key ? A.accent : A.border}`, background: tpl === key ? '#EFF6FF' : '#fff', color: tpl === key ? A.accent : A.text, fontFamily: 'DM Sans, sans-serif' }}>
              {label}
            </button>
          ))}
        </div>
        <C>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <ST>{TPLS[tpl]}</ST>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {(VARS[tpl] || []).map((v: string) => (
                <span key={v} onClick={() => navigator.clipboard?.writeText(v)} title="Click to copy"
                  style={{ fontSize: 10, background: '#EFF6FF', color: A.accent, padding: '2px 6px', borderRadius: 6, fontFamily: 'monospace', cursor: 'pointer' }}>{v}</span>
              ))}
            </div>
          </div>
          <Inp label="Subject" value={templates[tpl]?.subject || ''} onChange={(ev: any) => updateTpl('subject', ev.target.value)} />
          <TA label="Body" value={templates[tpl]?.body || ''} onChange={(ev: any) => updateTpl('body', ev.target.value)} rows={14} />
          <p style={{ fontSize: 11, color: A.sub }}>Click any variable tag to copy. Variables replaced with real data when sent.</p>
        </C>
      </div>

      {/* Survey Questions */}
      <C>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <ST>Shipper Survey Questions</ST>
          <Btn sz="sm" onClick={addSurveyQ}>+ Add Question</Btn>
        </div>
        {surveyQs.map((q: any, i: number) => (
          <div key={q.id} style={{ display: 'flex', gap: 10, padding: '12px 0', borderBottom: `1px solid ${A.border}`, alignItems: 'flex-start' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: A.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
            <div style={{ flex: 1 }}>
              <input value={q.question} onChange={e => setConfig((p: any) => ({ ...p, survey_questions: p.survey_questions.map((sq: any, si: number) => si === i ? { ...sq, question: e.target.value } : sq) }))}
                style={{ width: '100%', border: `1px solid ${A.border}`, borderRadius: 7, padding: '6px 10px', fontSize: 13, fontFamily: 'DM Sans, sans-serif', outline: 'none' }} />
              <div style={{ fontSize: 11, color: A.sub, marginTop: 3 }}>Type: {q.type} · {q.type === 'text' ? 'Free text' : q.type === 'rating' ? `Rating 1-${q.max || 5}` : `${(q.options || []).length} options`}</div>
            </div>
            <button onClick={() => removeSurveyQ(i)} style={{ background: 'none', border: 'none', color: A.danger, cursor: 'pointer', fontSize: 18, flexShrink: 0 }}>×</button>
          </div>
        ))}
      </C>
    </div>
  )
}

// ─── BILLING ──────────────────────────────────────────────────────────────────
function Billing({ config, setConfig }: any) {
  const [saving, setSaving] = useState(false)
  const save = async () => { setSaving(true); await api('/api/config', { method: 'PUT', body: JSON.stringify(config) }); toast.success('Saved'); setSaving(false) }
  const cfg = config || {}
  const fees: any = cfg.lead_fee_by_plan || { standard: 100, premium: 180, enterprise: 300 }
  const boosts: any = cfg.ad_boost_prices || { 10: 99, 20: 179, 30: 249, 50: 399 }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: A.text, margin: 0 }}>Billing & Payments</h2>
        <Btn onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Settings'}</Btn>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <C>
          <ST>Lead Fee by Plan</ST>
          <p style={{ fontSize: 13, color: A.sub, marginBottom: 14 }}>Charged to warehouse when an approved lead is sent.</p>
          {Object.entries(fees).map(([plan, fee]: any) => (
            <div key={plan} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, padding: 12, background: '#F9FAFB', borderRadius: 10 }}>
              <div style={{ width: 90, fontSize: 13, fontWeight: 700, textTransform: 'capitalize', color: plan === 'premium' ? A.purple : plan === 'enterprise' ? A.warn : A.text }}>{plan}</div>
              <input type="number" value={fee} onChange={e => setConfig((p: any) => ({ ...p, lead_fee_by_plan: { ...p.lead_fee_by_plan, [plan]: +e.target.value } }))}
                style={{ flex: 1, border: `1px solid ${A.border}`, borderRadius: 8, padding: '8px 10px', fontSize: 14, fontWeight: 700, fontFamily: 'DM Sans, sans-serif' }} />
              <span style={{ fontSize: 13, color: A.sub }}>per lead</span>
            </div>
          ))}
        </C>
        <C>
          <ST>Ad Boost Monthly Pricing</ST>
          <p style={{ fontSize: 13, color: A.sub, marginBottom: 14 }}>Monthly subscription for ranking boosts.</p>
          {Object.entries(boosts).map(([boost, price]: any) => (
            <div key={boost} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, padding: 12, background: '#FFFBEB', borderRadius: 10 }}>
              <div style={{ width: 60, fontSize: 13, fontWeight: 700, color: '#92400E' }}>+{boost}%</div>
              <input type="number" value={price} onChange={e => setConfig((p: any) => ({ ...p, ad_boost_prices: { ...p.ad_boost_prices, [boost]: +e.target.value } }))}
                style={{ flex: 1, border: `1px solid ${A.border}`, borderRadius: 8, padding: '8px 10px', fontSize: 14, fontWeight: 700, fontFamily: 'DM Sans, sans-serif' }} />
              <span style={{ fontSize: 13, color: A.sub }}>/mo</span>
            </div>
          ))}
        </C>
      </div>
      <C>
        <ST>Integration Guide (Production Setup)</ST>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {[
            { icon: '💳', name: 'Stripe', desc: 'Auto-charge lead fees + ad subscriptions', link: 'https://dashboard.stripe.com' },
            { icon: '📧', name: 'Resend', desc: 'Transactional email delivery (3k/mo free)', link: 'https://resend.com' },
            { icon: '🗄️', name: 'Supabase', desc: 'Database + auth (free tier)', link: 'https://supabase.com' },
          ].map(s => (
            <a key={s.name} href={s.link} target="_blank" rel="noreferrer" style={{ display: 'flex', gap: 12, padding: 14, background: '#F9FAFB', borderRadius: 10, textDecoration: 'none', alignItems: 'flex-start' }}>
              <div style={{ fontSize: 22 }}>{s.icon}</div>
              <div><div style={{ fontSize: 14, fontWeight: 700, color: A.text }}>{s.name}</div><div style={{ fontSize: 12, color: A.sub }}>{s.desc}</div></div>
            </a>
          ))}
        </div>
      </C>
    </div>
  )
}

// ─── SURVEY RESULTS ───────────────────────────────────────────────────────────
function SurveyResults() {
  const [responses, setResponses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    api('/api/survey-results')
      .then(d => { if (Array.isArray(d)) setResponses(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const avg = responses.length ? (responses.reduce((s, r) => s + r.match_quality, 0) / responses.length).toFixed(1) : '—'
  const pctRec = responses.length ? Math.round(responses.filter(r => r.recommend?.includes('yes') || r.recommend?.includes('Yes')).length / responses.length * 100) : 0

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: A.text, margin: '0 0 22px' }}>Survey Results</h2>
      {loading && <div style={{ color: A.sub, fontSize: 14, padding: '20px 0' }}>Loading…</div>}
      {!loading && responses.length === 0 && (
        <C style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
          <div style={{ fontWeight: 700, color: A.text, marginBottom: 6 }}>No survey responses yet</div>
          <div style={{ fontSize: 13, color: A.sub }}>Responses appear here after shippers complete the post-match survey.</div>
        </C>
      )}
      {!loading && responses.length > 0 && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { icon: '📋', label: 'Surveys Completed', val: responses.length },
          { icon: '⭐', label: 'Avg Match Quality', val: `${avg}/5` },
          { icon: '🤝', label: 'Connection Rate', val: `${responses.length ? Math.round(responses.filter(r => r.connected?.startsWith('Yes')).length / responses.length * 100) : 0}%` },
          { icon: '👍', label: 'Would Recommend', val: `${pctRec}%` },
        ].map(s => (
          <C key={s.label} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: 18 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{s.icon}</div>
            <div><div style={{ fontSize: 22, fontWeight: 800 }}>{s.val}</div><div style={{ fontSize: 12, color: A.sub }}>{s.label}</div></div>
          </C>
        ))}
      </div>}
      {!loading && responses.length > 0 && <C>
        <ST>Responses</ST>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>{['Company', 'Warehouse', 'Connected?', 'Quality', 'Onboarded?', 'Recommend?', 'Feedback'].map(h => <th key={h} style={{ textAlign: 'left', fontSize: 11, fontWeight: 700, color: A.sub, padding: '0 8px 10px', textTransform: 'uppercase' }}>{h}</th>)}</tr></thead>
          <tbody>
            {responses.map((r, i) => (
              <tr key={i} style={{ borderTop: `1px solid ${A.border}` }}>
                <td style={{ padding: '10px 8px', fontSize: 13, fontWeight: 700 }}>{r.company}</td>
                <td style={{ padding: '10px 8px', fontSize: 12, color: A.sub }}>{r.warehouse}</td>
                <td style={{ padding: '10px 8px' }}><span style={{ fontSize: 11, fontWeight: 700, color: r.connected?.startsWith('Yes') ? A.success : A.warn }}>{r.connected || '—'}</span></td>
                <td style={{ padding: '10px 8px' }}><span style={{ color: '#F59E0B' }}>{'★'.repeat(r.match_quality || 0)}</span></td>
                <td style={{ padding: '10px 8px', fontSize: 12 }}>{r.onboarded || '—'}</td>
                <td style={{ padding: '10px 8px' }}><span style={{ fontSize: 11, fontWeight: 700, color: r.recommend?.toLowerCase().includes('yes') ? A.success : A.warn }}>{r.recommend || '—'}</span></td>
                <td style={{ padding: '10px 8px', fontSize: 12, color: A.sub, maxWidth: 200 }}>{r.feedback || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </C>}
    </div>
  )
}


// ─── ABOUT PAGE EDITOR ─────────────────────────────────────────────────────
function AboutEditor({ config, setConfig }: any) {
  const [saving, setSaving] = useState(false)
  const ab = config?.about_content || {}

  const upd = (key: string, val: any) =>
    setConfig((p: any) => ({ ...p, about_content: { ...(p.about_content || {}), [key]: val } }))

  const saveAll = async () => {
    setSaving(true)
    await api('/api/config', { method: 'PUT', body: JSON.stringify({ about_content: config.about_content }) })
    toast.success('About page saved')
    setSaving(false)
  }

  const F = ({ label, k, rows = 0, placeholder = '' }: any) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: A.sub, display: 'block', marginBottom: 5 }}>{label}</label>
      {rows > 1
        ? <textarea value={ab[k] || ''} onChange={e => upd(k, e.target.value)} rows={rows} placeholder={placeholder}
            style={{ width: '100%', boxSizing: 'border-box', border: `1px solid ${A.border}`, borderRadius: 8, padding: '8px 11px', fontSize: 13, fontFamily: 'DM Sans, sans-serif', color: A.text, resize: 'vertical', outline: 'none' }} />
        : <input value={ab[k] || ''} onChange={e => upd(k, e.target.value)} placeholder={placeholder}
            style={{ width: '100%', boxSizing: 'border-box', border: `1px solid ${A.border}`, borderRadius: 8, padding: '8px 11px', fontSize: 14, color: A.text, outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
      }
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: A.text, margin: 0 }}>About Page Editor</h2>
          <p style={{ fontSize: 13, color: A.sub, margin: '4px 0 0' }}>
            Edit content displayed at <a href="/about" target="_blank" style={{ color: A.accent }}>logimatcher.com/about ↗</a>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a href="/about" target="_blank" style={{ fontSize: 13, fontWeight: 600, color: A.accent, padding: '8px 16px', border: `1px solid ${A.accent}`, borderRadius: 8, textDecoration: 'none' }}>Preview →</a>
          <Btn onClick={saveAll} disabled={saving}>{saving ? 'Saving…' : 'Save All Changes'}</Btn>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Hero */}
        <C>
          <ST>Hero Section</ST>
          <F label="Hero Title" k="hero_title" placeholder="We built the 3PL matching platform..." />
          <F label="Hero Subtitle" k="hero_subtitle" rows={3} placeholder="LogiMatcher connects growing brands..." />
        </C>

        {/* Mission */}
        <C>
          <ST>Mission Section</ST>
          <F label="Mission Title" k="mission_title" placeholder="Make logistics accessible for every brand..." />
          <F label="Mission Body (paragraph 1)" k="mission_body" rows={3} />
          <F label="Mission Body (paragraph 2)" k="mission_body2" rows={2} />
        </C>

        {/* Services */}
        <C style={{ gridColumn: '1/-1' }}>
          <ST>Services / What We Do</ST>
          <F label="Section Title" k="services_title" placeholder="A full-service matching platform" />
          <p style={{ fontSize: 12, color: A.sub, marginBottom: 12 }}>
            Services cards are managed as JSON below. Each item needs: icon, title, desc.
          </p>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: A.sub, display: 'block', marginBottom: 5 }}>Services (JSON array)</label>
            <textarea
              value={JSON.stringify(ab.services || [], null, 2)}
              onChange={e => { try { upd('services', JSON.parse(e.target.value)) } catch {} }}
              rows={10}
              style={{ width: '100%', boxSizing: 'border-box', border: `1px solid ${A.border}`, borderRadius: 8, padding: '8px 11px', fontSize: 12, fontFamily: 'DM Mono, monospace', color: A.text, resize: 'vertical', outline: 'none' }}
            />
          </div>
        </C>

        {/* Business Model */}
        <C>
          <ST>Business Model Section</ST>
          <F label="Title" k="biz_title" placeholder="Free for shippers. Always." />
          <F label="Body" k="biz_body" rows={4} />
        </C>

        {/* Story */}
        <C>
          <ST>Our Story Section</ST>
          <F label="Title" k="story_title" placeholder="Built by people who felt the pain" />
          <F label="Body" k="story_body" rows={4} />
        </C>

        {/* Contact */}
        <C>
          <ST>Contact Information</ST>
          <F label="Section Title" k="contact_title" placeholder="We'd love to hear from you" />
          <F label="Section Body" k="contact_body" rows={2} />
          <F label="General Email" k="email_general" placeholder="hello@logimatcher.com" />
          <F label="Warehouse Partners Email" k="email_warehouses" placeholder="warehouses@logimatcher.com" />
          <F label="Business Dev Email" k="email_biz" placeholder="partners@logimatcher.com" />
          <F label="Phone (optional)" k="phone" placeholder="+1 (555) 000-0000" />
          <F label="Office Address (optional)" k="address" placeholder="123 Main St, City, State ZIP" />
        </C>

        {/* SEO */}
        <C>
          <ST>SEO & Meta</ST>
          <F label="Page Title (browser tab)" k="seo_title" placeholder="About LogiMatcher — AI-Powered 3PL Matching" />
          <F label="Meta Description" k="seo_desc" rows={3} placeholder="Learn about LogiMatcher, the AI-powered platform..." />
        </C>

      </div>
    </div>
  )
}

// ─── MAIN ADMIN APP ───────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [page, setPage] = useState('dashboard')
  const [leads, setLeads] = useState<any[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [questions, setQuestions] = useState<any[]>([])
  const [config, setConfig] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const tok = localStorage.getItem('fm_admin_token')
    if (!tok) return
    // Validate stored token is still valid
    fetch('/api/auth', { headers: { 'x-admin-token': tok } })
      .then(r => r.json())
      .then(d => { if (d.valid) setAuthed(true); else localStorage.removeItem('fm_admin_token') })
      .catch(() => setAuthed(true)) // network error — assume valid, let APIs fail gracefully
  }, [])

  useEffect(() => {
    if (!authed) return
    setLoading(true)
    Promise.all([
      api('/api/leads').then(d => { if (Array.isArray(d)) setLeads(d) }).catch(() => {}),
      api('/api/warehouses?all=true').then(d => { if (Array.isArray(d)) setWarehouses(d) }).catch(() => {}),
      api('/api/questions').then(d => { if (Array.isArray(d)) setQuestions(d) }).catch(() => {}),
      api('/api/config').then(d => { if (d && typeof d === 'object') setConfig(d) }).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [authed])

  if (!authed) return <Login onAuth={() => setAuthed(true)} />

  const pending = leads.filter(l => l.status === 'pending_review').length

  const NAV = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'leads', icon: '📋', label: 'Lead Management', badge: pending },
    { id: 'warehouses', icon: '🏭', label: 'Warehouses' },
    { id: 'questions', icon: '❓', label: 'Quiz Editor' },
    { id: 'email', icon: '📧', label: 'Email & Surveys' },
    { id: 'billing', icon: '💰', label: 'Billing & Ads' },
    { id: 'surveys', icon: '📈', label: 'Survey Results' },
    { id: 'about',   icon: '🏢', label: 'About Page' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif', background: A.bg }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: A.sidebar, display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 10 }}>
        <div style={{ padding: '22px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <img src='/logo.svg' alt='LogiMatcher' height='30' style={{ display:'block', filter:'brightness(1.1)' }} />
          <div style={{ fontSize: 11, color: '#4B5563', marginTop: 2 }}>Match Smarter. Ship Faster.</div>
        </div>
        <nav style={{ flex: 1, padding: '10px 0' }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 20px', border: 'none', background: page === n.id ? 'rgba(255,255,255,0.07)' : 'transparent', color: page === n.id ? '#fff' : '#94A3B8', cursor: 'pointer', fontSize: 13, fontWeight: page === n.id ? 700 : 400, borderLeft: `3px solid ${page === n.id ? '#2563EB' : 'transparent'}`, textAlign: 'left', fontFamily: 'DM Sans, sans-serif' }}>
              <span>{n.icon}</span>
              <span style={{ flex: 1 }}>{n.label}</span>
              {n.badge ? <span style={{ background: '#D97706', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 8 }}>{n.badge}</span> : null}
            </button>
          ))}
        </nav>
        <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontSize: 11, color: '#4B5563' }}>Logged in as Admin</div>
          <button onClick={() => { localStorage.removeItem('fm_admin_token'); setAuthed(false) }} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 12, padding: 0, marginTop: 4, fontFamily: 'DM Sans, sans-serif' }}>Sign out</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ marginLeft: 220, flex: 1, padding: '32px 36px', minWidth: 0 }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', fontSize: 18, color: A.sub }}>Loading…</div>
        ) : (
          <>
            {page === 'dashboard' && <Dashboard leads={leads} />}
            {page === 'leads' && <Leads leads={leads} setLeads={setLeads} warehouses={warehouses} />}
            {page === 'warehouses' && <Warehouses warehouses={warehouses} setWarehouses={setWarehouses} />}
            {page === 'questions' && <QuizEditor questions={questions} setQuestions={setQuestions} />}
            {page === 'email' && <EmailConfig config={config} setConfig={setConfig} />}
            {page === 'billing' && <Billing config={config} setConfig={setConfig} />}
            {page === 'surveys' && <SurveyResults />}
            {page === 'about' && <AboutEditor config={config} setConfig={setConfig} />}
          </>
        )}
      </div>
    </div>
  )
}
