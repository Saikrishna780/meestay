import { useEffect, useState } from 'react'
import { Plus, UtensilsCrossed, ChevronDown, ChevronUp, BarChart3, Users } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const DEFAULT_OPTIONS = ['Chicken', 'Mutton', 'Fish', 'Crab', 'Prawns', 'Egg', 'Veg']

const OPTION_COLORS = {
  Chicken: { bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B' },
  Mutton:  { bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444' },
  Fish:    { bg: '#DBEAFE', color: '#1E40AF', dot: '#3B82F6' },
  Crab:    { bg: '#FDE8D8', color: '#9A3412', dot: '#EA580C' },
  Prawns:  { bg: '#FCE7F3', color: '#9D174D', dot: '#EC4899' },
  Egg:     { bg: '#FEF9C3', color: '#713F12', dot: '#CA8A04' },
  Veg:     { bg: '#D1FAE5', color: '#065F46', dot: '#10B981' },
}
const colorFor = opt => OPTION_COLORS[opt] || { bg: '#F3F4F6', color: '#374151', dot: '#6B7280' }


// ── Reusable count cards (used by both manager and owner) ─────────────────────
export function PollResultCounts({ results, total }) {
  if (!results) return null
  return (
    <>
      <style>{`
        @media (max-width: 480px) {
          .poll-result-counts { flex-direction: column !important; }
          .poll-result-counts > div { flex: 1 1 100% !important; }
        }
      `}</style>
      <div className="poll-result-counts" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {results.map(r => {
          const c = colorFor(r.option)
          const pct = total > 0 ? Math.round((r.count / total) * 100) : 0
          return (
            <div key={r.option} style={{
              flex: '1 1 110px', padding: '10px 12px', borderRadius: 10,
              background: c.bg, border: `1px solid ${c.dot}33`
            }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: c.color }}>{r.option}</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: c.color }}>{r.count}</span>
            </div>
            <div style={{ height: 5, borderRadius: 3, background: '#E5E7EB', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: c.dot, borderRadius: 3, transition: 'width 0.4s' }} />
            </div>
            <div style={{ fontSize: 10, color: c.color, marginTop: 3, textAlign: 'right' }}>{pct}%</div>
          </div>
        )
      })}
      </div>
    </>
  )
}


// ── Manager poll card — can record responses ──────────────────────────────────
function ManagerPollCard({ poll, tenants, onRefresh }) {
  const [results, setResults] = useState(null)
  const [expanded, setExpanded] = useState(false)
  const [respondingTenant, setRespondingTenant] = useState('')
  const [selectedOption, setSelectedOption] = useState('')
  const [saving, setSaving] = useState(false)

  const loadResults = async () => {
    const { data } = await api.get(`/manager/food-polls/${poll.pollId}/results`)
    setResults(data.data)
  }

  useEffect(() => { loadResults() }, [poll.pollId])

  const handleRespond = async () => {
    if (!respondingTenant) return toast.error('Select a tenant')
    if (!selectedOption) return toast.error('Select a food option')
    setSaving(true)
    try {
      await api.post(`/manager/food-polls/${poll.pollId}/respond`, { tenantId: respondingTenant, selectedOption })
      toast.success('Response recorded!')
      setRespondingTenant('')
      setSelectedOption('')
      loadResults()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally { setSaving(false) }
  }

  const handleClose = async () => {
    await api.put(`/manager/food-polls/${poll.pollId}/close`)
    toast.success('Poll closed')
    onRefresh()
  }

  const options = poll.options ? poll.options.split(',') : []
  const total = results?.totalResponses || 0
  const respondedIds = new Set((results?.responses || []).map(r => r.tenantId))
  const pendingTenants = tenants.filter(t => t.isActive && !respondedIds.has(t.tenantId))

  return (
    <div style={{
      borderRadius: 12, border: `1px solid ${poll.isActive ? '#C7D2FE' : '#E5E7EB'}`,
      background: poll.isActive ? '#FAFBFF' : '#F9FAFB', overflow: 'hidden'
    }}>
      <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: poll.isActive ? '#EEF2FF' : '#F3F4F6',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <UtensilsCrossed size={18} color={poll.isActive ? '#4F46E5' : '#9CA3AF'} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {poll.title}
            </div>
            <div style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }}>
              {poll.pollDate} · {total} response{total !== 1 ? 's' : ''}
              {pendingTenants.length > 0 && poll.isActive && (
                <span style={{ marginLeft: 8, color: '#D97706', fontWeight: 600 }}>· {pendingTenants.length} pending</span>
              )}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
            background: poll.isActive ? '#D1FAE5' : '#F3F4F6',
            color: poll.isActive ? '#065F46' : '#6B7280'
          }}>{poll.isActive ? 'Active' : 'Closed'}</span>
          {poll.isActive && (
            <button onClick={handleClose} style={{
              padding: '4px 10px', borderRadius: 6, border: '1px solid #FECACA',
              background: '#FEF2F2', color: '#DC2626', fontSize: 11, fontWeight: 600, cursor: 'pointer'
            }}>Close</button>
          )}
          <button onClick={() => setExpanded(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', display: 'flex' }}>
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {results && (
        <div style={{ padding: '0 18px 14px' }}>
          <PollResultCounts results={results.results} total={total} />
        </div>
      )}

      {expanded && (
        <div style={{ borderTop: '1px solid #E5E7EB', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {poll.isActive && (
            <div style={{ background: '#F9FAFB', borderRadius: 10, padding: '14px', border: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 10 }}>
                <Users size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Record Tenant Response
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ flex: '1 1 180px' }}>
                  <label style={{ fontSize: 11, color: '#6B7280', display: 'block', marginBottom: 4 }}>Tenant</label>
                  <select value={respondingTenant} onChange={e => setRespondingTenant(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 13, outline: 'none', background: '#fff' }}>
                    <option value="">-- Select Tenant --</option>
                    {tenants.filter(t => t.isActive).map(t => (
                      <option key={t.tenantId} value={t.tenantId}>
                        {t.tenantName}{respondedIds.has(t.tenantId) ? ' ✓' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: '1 1 160px' }}>
                  <label style={{ fontSize: 11, color: '#6B7280', display: 'block', marginBottom: 4 }}>Food Choice</label>
                  <select value={selectedOption} onChange={e => setSelectedOption(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 13, outline: 'none', background: '#fff' }}>
                    <option value="">-- Option --</option>
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <button onClick={handleRespond} disabled={saving} style={{
                  padding: '8px 18px', borderRadius: 8, border: 'none',
                  background: '#4F46E5', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0
                }}>{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </div>
          )}

          {results?.responses?.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8 }}>
                <BarChart3 size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                All Responses ({results.responses.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {results.responses.map(r => {
                  const c = colorFor(r.selectedOption)
                  return (
                    <div key={r.id} style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '5px 10px', borderRadius: 8, background: c.bg,
                      border: `1px solid ${c.dot}33`, fontSize: 12
                    }}>
                      <span style={{ fontWeight: 600, color: '#111827' }}>{r.tenantName}</span>
                      <span style={{ color: c.color, fontWeight: 700 }}>→ {r.selectedOption}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {pendingTenants.length > 0 && poll.isActive && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#D97706', marginBottom: 6 }}>
                Not responded yet ({pendingTenants.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {pendingTenants.map(t => (
                  <span key={t.tenantId} style={{
                    padding: '4px 10px', borderRadius: 20, background: '#FEF3C7',
                    color: '#92400E', fontSize: 11, fontWeight: 600
                  }}>{t.tenantName}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


// ── Manager Food Poll page ────────────────────────────────────────────────────
export function ManagerFoodPollPage({ sidebarItems }) {
  const [polls, setPolls] = useState([])
  const [tenants, setTenants] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [pollDate, setPollDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedOptions, setSelectedOptions] = useState([...DEFAULT_OPTIONS])
  const [creating, setCreating] = useState(false)

  const loadPolls = async () => {
    const { data } = await api.get('/manager/food-polls')
    setPolls(data.data || [])
  }

  useEffect(() => {
    Promise.all([
      loadPolls(),
      api.get('/manager/tenants').then(r => setTenants(r.data.data || [])).catch(() => {})
    ]).finally(() => setLoading(false))
  }, [])

  const toggleOption = opt =>
    setSelectedOptions(prev => prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt])

  const handleCreate = async () => {
    if (!title.trim()) return toast.error('Enter a poll title')
    if (selectedOptions.length < 2) return toast.error('Select at least 2 options')
    setCreating(true)
    try {
      await api.post('/manager/food-polls', { title, pollDate, options: selectedOptions })
      toast.success('Poll created!')
      setTitle('')
      setPollDate(new Date().toISOString().split('T')[0])
      setSelectedOptions([...DEFAULT_OPTIONS])
      setShowCreate(false)
      loadPolls()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally { setCreating(false) }
  }

  const activePolls = polls.filter(p => p.isActive)
  const closedPolls = polls.filter(p => !p.isActive)

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>Food Poll</h1>
            <p style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>Conduct food polls for your hostel tenants</p>
          </div>
          <Button onClick={() => setShowCreate(s => !s)}>
            <Plus size={16} /> {showCreate ? 'Cancel' : 'New Poll'}
          </Button>
        </div>

        {showCreate && (
          <Card title="Create New Poll">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Poll Title</label>
                  <input value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Sunday Special, Diwali Feast"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Date</label>
                  <input type="date" value={pollDate} onChange={e => setPollDate(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>Food Options</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {DEFAULT_OPTIONS.map(opt => {
                    const c = colorFor(opt)
                    const sel = selectedOptions.includes(opt)
                    return (
                      <button key={opt} onClick={() => toggleOption(opt)} style={{
                        padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        border: `2px solid ${sel ? c.dot : '#E5E7EB'}`,
                        background: sel ? c.bg : '#F9FAFB', color: sel ? c.color : '#9CA3AF',
                        transition: 'all 0.15s'
                      }}>{opt}</button>
                    )
                  })}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
                <Button onClick={handleCreate} loading={creating}><Plus size={14} /> Create Poll</Button>
              </div>
            </div>
          </Card>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#9CA3AF' }}>Loading polls...</div>
        ) : polls.length === 0 ? (
          <Card>
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <UtensilsCrossed size={44} style={{ margin: '0 auto 14px', color: '#D1D5DB' }} />
              <p style={{ fontSize: 14, color: '#6B7280' }}>No polls yet. Create one for a special day!</p>
            </div>
          </Card>
        ) : (
          <>
            {activePolls.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>Active Polls ({activePolls.length})</div>
                {activePolls.map(p => <ManagerPollCard key={p.pollId} poll={p} tenants={tenants} onRefresh={loadPolls} />)}
              </div>
            )}
            {closedPolls.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#6B7280', marginTop: 8 }}>Closed Polls ({closedPolls.length})</div>
                {closedPolls.map(p => <ManagerPollCard key={p.pollId} poll={p} tenants={tenants} onRefresh={loadPolls} />)}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}


// ── Owner poll card — read-only, just shows counts ────────────────────────────
function OwnerPollCard({ poll }) {
  const [results, setResults] = useState(null)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    api.get(`/owner/food-polls/${poll.pollId}/results`)
      .then(r => setResults(r.data.data))
      .catch(() => {})
  }, [poll.pollId])

  const total = results?.totalResponses || 0

  return (
    <div style={{
      borderRadius: 12, border: `1px solid ${poll.isActive ? '#C7D2FE' : '#E5E7EB'}`,
      background: poll.isActive ? '#FAFBFF' : '#F9FAFB', overflow: 'hidden'
    }}>
      <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: poll.isActive ? '#EEF2FF' : '#F3F4F6',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <UtensilsCrossed size={18} color={poll.isActive ? '#4F46E5' : '#9CA3AF'} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {poll.title}
            </div>
            <div style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }}>
              {poll.pollDate} · {total} response{total !== 1 ? 's' : ''}
              {poll.createdBy && <span style={{ marginLeft: 6 }}>· by {poll.createdBy}</span>}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
            background: poll.isActive ? '#D1FAE5' : '#F3F4F6',
            color: poll.isActive ? '#065F46' : '#6B7280'
          }}>{poll.isActive ? 'Active' : 'Closed'}</span>
          <button onClick={() => setExpanded(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', display: 'flex' }}>
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {results && (
        <div style={{ padding: '0 18px 14px' }}>
          <PollResultCounts results={results.results} total={total} />
        </div>
      )}

      {expanded && results?.responses?.length > 0 && (
        <div style={{ borderTop: '1px solid #E5E7EB', padding: '14px 18px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8 }}>
            <BarChart3 size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Individual Responses ({results.responses.length})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {results.responses.map(r => {
              const c = colorFor(r.selectedOption)
              return (
                <div key={r.id} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '5px 10px', borderRadius: 8, background: c.bg,
                  border: `1px solid ${c.dot}33`, fontSize: 12
                }}>
                  <span style={{ fontWeight: 600, color: '#111827' }}>{r.tenantName}</span>
                  <span style={{ color: c.color, fontWeight: 700 }}>→ {r.selectedOption}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Owner Food Poll page — read-only, per-hostel view ─────────────────────────
export function OwnerFoodPollPage({ sidebarItems }) {
  const [hostels, setHostels] = useState([])
  const [selectedHostelId, setSelectedHostelId] = useState(null)
  const [pollsByHostel, setPollsByHostel] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/owner/hostel/all')
      .then(r => {
        const list = r.data.data || []
        setHostels(list)
        if (list.length > 0) setSelectedHostelId(list[0].hostelId)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedHostelId || pollsByHostel[selectedHostelId] !== undefined) return
    api.get(`/owner/food-polls?hostelId=${selectedHostelId}`)
      .then(r => setPollsByHostel(prev => ({ ...prev, [selectedHostelId]: r.data.data || [] })))
      .catch(() => setPollsByHostel(prev => ({ ...prev, [selectedHostelId]: [] })))
  }, [selectedHostelId])

  const polls = selectedHostelId ? (pollsByHostel[selectedHostelId] || null) : null
  const activePolls = polls ? polls.filter(p => p.isActive) : []
  const closedPolls = polls ? polls.filter(p => !p.isActive) : []
  const selectedHostel = hostels.find(h => h.hostelId === selectedHostelId)

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>Food Poll</h1>
          <p style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>View food poll results from your hostels</p>
        </div>

        {/* Hostel selector tabs */}
        {hostels.length > 1 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {hostels.map(h => (
              <button key={h.hostelId} onClick={() => setSelectedHostelId(h.hostelId)} style={{
                padding: '8px 16px', borderRadius: 10, border: 'none', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.15s',
                background: selectedHostelId === h.hostelId ? '#4F46E5' : '#F3F4F6',
                color: selectedHostelId === h.hostelId ? '#fff' : '#374151',
                boxShadow: selectedHostelId === h.hostelId ? '0 2px 8px rgba(79,70,229,0.2)' : 'none'
              }}>{h.hostelName}</button>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#9CA3AF' }}>Loading...</div>
        ) : !polls ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#9CA3AF' }}>Loading polls...</div>
        ) : polls.length === 0 ? (
          <Card>
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <UtensilsCrossed size={44} style={{ margin: '0 auto 14px', color: '#D1D5DB' }} />
              <p style={{ fontSize: 14, color: '#6B7280' }}>
                No polls for {selectedHostel?.hostelName || 'this hostel'} yet.
              </p>
              <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>
                The manager can create polls from their dashboard.
              </p>
            </div>
          </Card>
        ) : (
          <>
            {activePolls.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>Active Polls ({activePolls.length})</div>
                {activePolls.map(p => <OwnerPollCard key={p.pollId} poll={p} />)}
              </div>
            )}
            {closedPolls.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#6B7280', marginTop: 8 }}>Closed Polls ({closedPolls.length})</div>
                {closedPolls.map(p => <OwnerPollCard key={p.pollId} poll={p} />)}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
