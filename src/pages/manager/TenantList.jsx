import {useEffect,useState} from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, UserCheck, LayoutDashboard, LogOut, IndianRupee, ChevronDown, ChevronRight,
  Users, UserX, History, Info, Zap, AlertCircle, ArrowRightLeft, BarChart2 } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import VacateIntentModal from '../../components/VacateIntentModal'
import PreBookModal from '../../components/PreBookModal'

const sidebarItems = [
  { path: '/manager/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { path: '/manager/tenants', label: 'Tenants', icon: <UserCheck size={18} /> },
  { path: '/manager/billing', label: 'Billing', icon: <IndianRupee size={18} /> },
  { path: '/manager/power', label: 'Power', icon: <Zap size={18} /> },
  { path: '/manager/complaints', label: 'Complaints', icon: <AlertCircle size={18} /> },
  { path: '/manager/transfer', label: 'Transfer', icon: <ArrowRightLeft size={18} /> },
  { path: '/manager/reports', label: 'Reports', icon: <BarChart2 size={18} /> },
]

const REASONS = ['Personal reasons', 'Job change / relocation', 'Higher studies', 'Marriage',
  'Found better accommodation', 'Financial issues', 'Family reasons',
  'Completed course / internship', 'Other']

const REASON_COLORS = {
  'Personal reasons': { bg: '#EDE9FE', color: '#5B21B6' },
  'Job change / relocation': { bg: '#DBEAFE', color: '#1D4ED8' },
  'Higher studies': { bg: '#D1FAE5', color: '#065F46' },
  'Marriage': { bg: '#FCE7F3', color: '#9D174D' },
  'Found better accommodation': { bg: '#FEF3C7', color: '#92400E' },
  'Financial issues': { bg: '#FEE2E2', color: '#991B1B' },
  'Family reasons': { bg: '#E0F2FE', color: '#0369A1' },
  'Completed course / internship': { bg: '#ECFDF5', color: '#047857' },
  'Other': { bg: '#F3F4F6', color: '#374151' }
}

const PTYPE_COLORS = {
  'RENT': { bg: '#EEF2FF', color: '#4338CA' },
  'EXTRA_STAY': { bg: '#FEF3C7', color: '#92400E' },
  'DEPOSIT': { bg: '#D1FAE5', color: '#065F46' },
  'OTHER': { bg: '#F3F4F6', color: '#374151' }
}

function D({ l, v }) {
  if (!v && v !== 0) return null
  return (
    <div style={{ padding: '8px 12px', background: '#fff', borderRadius: 8, border: '1px solid #E5E7EB' }}>
      <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', marginBottom: 3 }}>{l}</div>
      <div style={{ fontSize: 13, color: '#111827', fontWeight: 500 }}>{v}</div>
    </div>
  )
}

function StatusBadge({ isActive }) {
  return isActive
    ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, background: '#D1FAE5', color: '#065F46', fontSize: 12, fontWeight: 600 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />Active
      </span>
    : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, background: '#F3F4F6', color: '#6B7280', fontSize: 12, fontWeight: 600 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#9CA3AF', display: 'inline-block' }} />Vacated
      </span>
}

function BookingStatusBadge({ status }) {
  const styles = {
    ACTIVE:     { bg: '#D1FAE5', color: '#065F46', dot: '#10B981', label: 'Active' },
    VACATING:   { bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B', label: 'Vacating' },
    PRE_BOOKED: { bg: '#DBEAFE', color: '#1D4ED8', dot: '#3B82F6', label: 'Pre-booked' },
  }
  const s = styles[status] || styles.ACTIVE
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, background: s.bg, color: s.color, fontSize: 12, fontWeight: 600 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
      {s.label}
    </span>
  )
}

function ReasonBadge({ reason }) {
  if (!reason) return null
  const c = REASON_COLORS[reason] || REASON_COLORS['Other']
  return <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, background: c.bg, color: c.color, fontSize: 11, fontWeight: 600 }}>{reason}</span>
}

function PaymentHistory({ tenantId }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    api.get(`/manager/tenants/${tenantId}/payments`)
      .then(r => setHistory(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [tenantId])

  if (loading) return <div style={{ padding: 20, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>Loading...</div>
  if (history.length === 0) return <div style={{ padding: 20, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>No payment records yet</div>

  const total = history.reduce((s, p) => s + parseFloat(p.amount || 0), 0)
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: '#6B7280' }}>{history.length} payment(s)</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#059669' }}>Total: ₹{total.toFixed(2)}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {history.map(p => {
          const c = PTYPE_COLORS[p.paymentType] || PTYPE_COLORS['OTHER']
          return (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 8, background: '#fff', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ padding: '3px 8px', borderRadius: 6, background: c.bg, color: c.color, fontSize: 11, fontWeight: 700 }}>{p.paymentType}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>₹{p.amount}</div>
                  {p.paymentMonth && <div style={{ fontSize: 11, color: '#6B7280' }}>{p.paymentMonth}</div>}
                  {p.notes && <div style={{ fontSize: 11, color: '#9CA3AF', fontStyle: 'italic' }}>{p.notes}</div>}
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: 11, color: '#9CA3AF' }}>
                <div>{p.recordedBy}</div>
                <div>{p.recordedAt ? new Date(p.recordedAt).toLocaleDateString('en-IN') : ''}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Row({ t, onVacate, onVacateIntent, onConfirmVacate, onPreBook, hostelSettings }) {
  const [exp, setExp] = useState(false)
  const [tab, setTab] = useState('details')
  const [sv, setSv] = useState(false)
  const [r, setR] = useState('')
  const go = async () => { if (!r) return toast.error('Select reason'); await onVacate(t.tenantId, r); setSv(false); setR('') }
  const hasDue = parseFloat(t.dueAmount) > 0
  const noticeDays = hostelSettings?.vacateNoticeDays || 7

  return (
    <>
      <tr style={{ borderBottom: exp ? 'none' : '1px solid #F3F4F6' }}
        onMouseEnter={e => { if (!exp) e.currentTarget.style.background = '#F9FAFB' }}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <td style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => setExp(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#6366F1', display: 'flex' }}>
              {exp ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{t.tenantName?.[0]?.toUpperCase()}</span>
            </div>
            <div>
              <div onClick={() => setExp(o => !o)} style={{ fontSize: 13, fontWeight: 600, color: '#4F46E5', textDecoration: 'underline', cursor: 'pointer' }}>{t.tenantName}</div>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>{t.occupation || '—'}</div>
            </div>
          </div>
        </td>
        <td style={{ padding: '14px 16px', fontSize: 13, color: '#374151' }}>{t.tenantMobile}</td>
        <td style={{ padding: '14px 16px' }}>
          <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: '#EEF2FF', color: '#4338CA' }}>{t.roomId}</span>
        </td>
        <td style={{ padding: '14px 16px' }}><span style={{ fontSize: 13, fontWeight: 700 }}>₹{t.rentAmount}</span></td>
        <td style={{ padding: '14px 16px' }}><span style={{ fontSize: 13, fontWeight: 700, color: hasDue ? '#DC2626' : '#059669' }}>₹{t.dueAmount}</span></td>
        <td style={{ padding: '14px 16px' }}><StatusBadge isActive={t.isActive} /></td>
        <td style={{ padding: '14px 16px' }}><BookingStatusBadge status={t.bookingStatus || 'ACTIVE'} /></td>
        <td style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {/* Task 14: Action buttons based on bookingStatus */}
            {t.bookingStatus === 'ACTIVE' && t.isActive && (
              <button onClick={() => onVacateIntent(t)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, background: '#FEF3C7', border: '1px solid #FDE68A', color: '#92400E', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                📋 Record Vacate Intent
              </button>
            )}
            {t.bookingStatus === 'VACATING' && (
              <button onClick={() => onConfirmVacate(t)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, background: '#FEE2E2', border: '1px solid #FECACA', color: '#DC2626', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                <LogOut size={13} /> Confirm Vacate
              </button>
            )}
            {t.bookingStatus === 'VACATING' && (
              <button onClick={() => onPreBook(t)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, background: '#DBEAFE', border: '1px solid #BFDBFE', color: '#1D4ED8', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                + Pre-book Room
              </button>
            )}
            {/* Legacy vacate for ACTIVE tenants (backward compat) */}
            {t.isActive && !sv && t.bookingStatus === 'ACTIVE' && (
              <button onClick={() => setSv(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                <LogOut size={13} /> Vacate
              </button>
            )}
            {t.isActive && sv && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 11, color: '#D97706', background: '#FEF3C7', padding: '4px 8px', borderRadius: 6 }}>
                  ⚠️ Notice: {noticeDays} days required
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                  <select value={r} onChange={e => setR(e.target.value)}
                    style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 12, minWidth: 150, outline: 'none' }}>
                    <option value="">Select reason...</option>
                    {REASONS.map(x => <option key={x} value={x}>{x}</option>)}
                  </select>
                  <button onClick={go} style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: '#DC2626', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Confirm</button>
                  <button onClick={() => { setSv(false); setR('') }} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', fontSize: 12, cursor: 'pointer', color: '#6B7280' }}>✕</button>
                </div>
              </div>
            )}
            {!t.isActive && <ReasonBadge reason={t.vacateReason} />}
          </div>
        </td>
      </tr>
      {exp && (
        <tr style={{ borderBottom: '1px solid #F3F4F6' }}>
          <td colSpan={8} style={{ padding: '0 16px 20px 62px', background: '#F9FAFB' }}>
            <div style={{ display: 'flex', gap: 4, paddingTop: 14, marginBottom: 14, borderBottom: '1px solid #E5E7EB' }}>
              {[{ key: 'details', label: 'Details', icon: <Info size={13} /> }, { key: 'payments', label: 'Payment History', icon: <History size={13} /> }].map(tb => (
                <button key={tb.key} onClick={() => setTab(tb.key)} style={{
                  display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px',
                  borderRadius: '8px 8px 0 0', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  background: tab === tb.key ? '#fff' : 'transparent',
                  color: tab === tb.key ? '#4F46E5' : '#6B7280',
                  borderBottom: tab === tb.key ? '2px solid #4F46E5' : '2px solid transparent',
                  marginBottom: -1
                }}>
                  {tb.icon}{tb.label}
                </button>
              ))}
            </div>
            {tab === 'details' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: 8, paddingTop: 4 }}>
                <D l="Full Name" v={t.tenantName} /><D l="Mobile" v={t.tenantMobile} /><D l="Email" v={t.tenantEmail} />
                <D l="Aadhaar" v={t.aadhaarNumber} /><D l="Parent Mobile" v={t.parentMobile} /><D l="Occupation" v={t.occupation} />
                <D l="Food Preference" v={t.foodPreference} /><D l="Address" v={t.tenantAddress} />
                <D l="Join Date" v={t.joinDate} /><D l="Bill Due Date" v={t.billDueDate} />
                <D l="Rent" v={t.rentAmount ? `₹${t.rentAmount}` : null} /><D l="Deposit" v={t.depositAmount ? `₹${t.depositAmount}` : null} />
                <D l="Amount Paid" v={t.amountPaid ? `₹${t.amountPaid}` : null} /><D l="Due Amount" v={t.dueAmount ? `₹${t.dueAmount}` : null} />
                <D l="Room" v={t.roomId} /><D l="Bed" v={t.bedId} />
                {!t.isActive && <D l="Vacate Date" v={t.vacateDate} />}
                {!t.isActive && <D l="Vacate Reason" v={t.vacateReason} />}
              </div>
            )}
            {tab === 'payments' && <PaymentHistory tenantId={t.tenantId} />}
          </td>
        </tr>
      )}
    </>
  )
}

export default function TenantList() {
  const [tenants, setTenants] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [hostelSettings, setHostelSettings] = useState(null)
  const [vacateIntentTenant, setVacateIntentTenant] = useState(null)
  const [preBookTenant, setPreBookTenant] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/manager/tenants').then(r => setTenants(r.data.data || [])).catch(() => toast.error('Failed')).finally(() => setLoading(false))
    api.get('/manager/hostel/settings').then(r => setHostelSettings(r.data.data)).catch(() => {})
  }, [])

  const handleVacate = async (id, reason) => {
    try {
      await api.put(`/manager/tenants/${id}/vacate`, { reason })
      setTenants(p => p.map(t => t.tenantId === id ? { ...t, isActive: false, vacateReason: reason, vacateDate: new Date().toISOString().split('T')[0] } : t))
      toast.success('Tenant vacated')
    } catch { toast.error('Failed') }
  }

  const handleVacateIntentSubmit = async (tenantId, vacateDate, vacateReason) => {
    try {
      const res = await api.put(`/manager/tenants/${tenantId}/vacate-intent`, { vacateDate, vacateReason })
      setTenants(p => p.map(t => t.tenantId === tenantId ? res.data.data : t))
      toast.success('Vacate intent recorded')
      setVacateIntentTenant(null)
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to record vacate intent')
    }
  }

  const handleConfirmVacate = async (tenant) => {
    if (!window.confirm(`Confirm vacate for ${tenant.tenantName}? This will free the bed and activate pre-booked tenants.`)) return
    try {
      const res = await api.put(`/manager/tenants/${tenant.tenantId}/confirm-vacate`)
      setTenants(p => p.map(t => t.tenantId === tenant.tenantId ? res.data.data : t))
      // Refresh to pick up newly activated pre-booked tenants
      api.get('/manager/tenants').then(r => setTenants(r.data.data || []))
      toast.success('Vacate confirmed')
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to confirm vacate')
    }
  }

  const handlePreBookSubmit = async (formData) => {
    try {
      const res = await api.post('/manager/tenants/prebook', formData)
      setTenants(p => [...p, res.data.data])
      toast.success('Pre-booking created')
      setPreBookTenant(null)
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to create pre-booking')
    }
  }

  const active = tenants.filter(t => t.isActive).length
  const vacated = tenants.filter(t => !t.isActive).length

  const filtered = tenants.filter(t => {
    const ms = !search || t.tenantName?.toLowerCase().includes(search.toLowerCase()) || t.tenantMobile?.includes(search)
    const mf = filter === 'all' || (filter === 'active' && t.isActive) || (filter === 'vacated' && !t.isActive)
    return ms && mf
  })

  const TABS = [
    { key: 'all', label: 'All Tenants', count: tenants.length, bg: '#EEF2FF', active: '#4F46E5', text: '#4F46E5', activeTxt: '#fff' },
    { key: 'active', label: 'Active', count: active, bg: '#D1FAE5', active: '#059669', text: '#065F46', activeTxt: '#fff' },
    { key: 'vacated', label: 'Vacated', count: vacated, bg: '#F3F4F6', active: '#6B7280', text: '#374151', activeTxt: '#fff' },
  ]

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>Tenants</h1>
            <p style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{filtered.length} of {tenants.length} tenants</p>
          </div>
          <Button onClick={() => navigate('/manager/add-tenant')}><Plus size={16} /> Add Tenant</Button>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setFilter(tab.key)} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, border: 'none',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: filter === tab.key ? tab.active : tab.bg,
              color: filter === tab.key ? tab.activeTxt : tab.text,
              boxShadow: filter === tab.key ? '0 2px 8px rgba(0,0,0,0.15)' : 'none'
            }}>
              {tab.key === 'all' ? <Users size={14} /> : tab.key === 'active' ? <UserCheck size={14} /> : <UserX size={14} />}
              {tab.label}
              <span style={{ padding: '1px 7px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: filter === tab.key ? 'rgba(255,255,255,0.25)' : tab.active, color: '#fff' }}>{tab.count}</span>
            </button>
          ))}
        </div>

        <Card>
          <div style={{ marginBottom: 20 }}>
            <div style={{ position: 'relative', maxWidth: 400 }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input placeholder="Search by name or mobile..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '10px 14px 10px 38px', border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 14, outline: 'none', background: '#F9FAFB', color: '#111827' }}
                onFocus={e => { e.target.style.borderColor = '#6366F1'; e.target.style.background = '#fff' }}
                onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.background = '#F9FAFB' }}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '2px solid #E5E7EB' }}>
                  {['Tenant', 'Mobile', 'Room', 'Rent', 'Due', 'Status', 'Booking', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 48, color: '#9CA3AF' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 32, height: 32, border: '3px solid #6366F1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                      <span>Loading tenants...</span>
                    </div>
                  </td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 48, color: '#9CA3AF' }}>
                    <UserCheck size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                    <p>No tenants found</p>
                  </td></tr>
                ) : filtered.map(t => (
                  <Row key={t.tenantId} t={t}
                    onVacate={handleVacate}
                    onVacateIntent={setVacateIntentTenant}
                    onConfirmVacate={handleConfirmVacate}
                    onPreBook={setPreBookTenant}
                    hostelSettings={hostelSettings}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {vacateIntentTenant && (
        <VacateIntentModal
          tenant={vacateIntentTenant}
          onClose={() => setVacateIntentTenant(null)}
          onSubmit={handleVacateIntentSubmit}
        />
      )}

      {preBookTenant && (
        <PreBookModal
          vacatingTenant={preBookTenant}
          onClose={() => setPreBookTenant(null)}
          onSubmit={handlePreBookSubmit}
        />
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </DashboardLayout>
  )
}
