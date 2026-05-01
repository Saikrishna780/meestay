import { useEffect, useState } from 'react'
import { LayoutDashboard, UserCheck, IndianRupee, Zap, AlertCircle, Plus, CheckCircle, Clock, XCircle, ArrowRightLeft, BarChart2 } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/ui/Card'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const sidebarItems = [
  { path: '/manager/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { path: '/manager/tenants', label: 'Tenants', icon: <UserCheck size={18} /> },
  { path: '/manager/billing', label: 'Billing', icon: <IndianRupee size={18} /> },
  { path: '/manager/power', label: 'Power', icon: <Zap size={18} /> },
  { path: '/manager/complaints', label: 'Complaints', icon: <AlertCircle size={18} /> },
  { path: '/manager/transfer', label: 'Transfer', icon: <ArrowRightLeft size={18} /> },
  { path: '/manager/reports', label: 'Reports', icon: <BarChart2 size={18} /> },
]

const STATUS_COLORS = {
  OPEN: { bg: '#FEE2E2', color: '#991B1B' },
  IN_PROGRESS: { bg: '#FEF3C7', color: '#92400E' },
  RESOLVED: { bg: '#D1FAE5', color: '#065F46' },
  CLOSED: { bg: '#F3F4F6', color: '#374151' },
}

const PRIORITY_COLORS = {
  LOW: { bg: '#F0FDF4', color: '#166534' },
  MEDIUM: { bg: '#EFF6FF', color: '#1E40AF' },
  HIGH: { bg: '#FEF3C7', color: '#92400E' },
  URGENT: { bg: '#FEE2E2', color: '#991B1B' },
}

const CATEGORIES = ['MAINTENANCE', 'CLEANLINESS', 'NOISE', 'BILLING', 'SECURITY', 'OTHER']
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']

function NewComplaintModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    tenantName: '', tenantId: '', category: 'MAINTENANCE',
    title: '', description: '', priority: 'MEDIUM'
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.title) return toast.error('Title is required')
    setSaving(true)
    try {
      await api.post('/manager/complaints', form)
      toast.success('Complaint raised')
      onSaved()
      onClose()
    } catch { toast.error('Failed to raise complaint') }
    finally { setSaving(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 520, maxWidth: '95vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>Raise Complaint</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6B7280' }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Tenant Name</label>
              <input value={form.tenantName} onChange={e => setForm(f => ({ ...f, tenantName: e.target.value }))}
                placeholder="Tenant name" style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Tenant ID (optional)</label>
              <input value={form.tenantId} onChange={e => setForm(f => ({ ...f, tenantId: e.target.value }))}
                placeholder="T123..." style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 13 }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 13 }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 13 }}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Title *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Brief description of the issue" required
              style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 13 }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Detailed description..." rows={3}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 13, resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ flex: 2, padding: '10px', borderRadius: 8, border: 'none', background: '#4F46E5', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              {saving ? 'Saving...' : 'Raise Complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ComplaintRow({ c, onUpdate }) {
  const [expanded, setExpanded] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [resolution, setResolution] = useState('')
  const sc = STATUS_COLORS[c.status] || STATUS_COLORS.OPEN
  const pc = PRIORITY_COLORS[c.priority] || PRIORITY_COLORS.MEDIUM

  const updateStatus = async newStatus => {
    setUpdating(true)
    try {
      await api.put(`/manager/complaints/${c.complaintId}/status`, { status: newStatus, resolutionNotes: resolution })
      toast.success('Status updated')
      onUpdate()
    } catch { toast.error('Failed') }
    finally { setUpdating(false) }
  }

  return (
    <div style={{ border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
      <div onClick={() => setExpanded(e => !e)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer', background: expanded ? '#F9FAFB' : '#fff' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{c.title}</span>
            <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.color }}>{c.status}</span>
            <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: pc.bg, color: pc.color }}>{c.priority}</span>
          </div>
          <div style={{ fontSize: 12, color: '#6B7280' }}>
            {c.category} · {c.tenantName || 'Unknown'} · {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : ''}
          </div>
        </div>
        <span style={{ fontSize: 18, color: '#9CA3AF' }}>{expanded ? '▲' : '▼'}</span>
      </div>
      {expanded && (
        <div style={{ padding: '14px 16px', borderTop: '1px solid #F3F4F6', background: '#FAFAFA' }}>
          {c.description && <p style={{ fontSize: 13, color: '#374151', marginBottom: 12 }}>{c.description}</p>}
          {c.resolutionNotes && (
            <div style={{ padding: '8px 12px', borderRadius: 8, background: '#D1FAE5', marginBottom: 12, fontSize: 13, color: '#065F46' }}>
              Resolution: {c.resolutionNotes}
            </div>
          )}
          {c.status !== 'CLOSED' && c.status !== 'RESOLVED' && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <input value={resolution} onChange={e => setResolution(e.target.value)}
                placeholder="Resolution notes (optional)"
                style={{ flex: 1, minWidth: 200, padding: '7px 10px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 12 }} />
              {c.status === 'OPEN' && (
                <button onClick={() => updateStatus('IN_PROGRESS')} disabled={updating}
                  style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: '#FEF3C7', color: '#92400E', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  In Progress
                </button>
              )}
              <button onClick={() => updateStatus('RESOLVED')} disabled={updating}
                style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: '#D1FAE5', color: '#065F46', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                Resolve
              </button>
              <button onClick={() => updateStatus('CLOSED')} disabled={updating}
                style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: '#F3F4F6', color: '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Complaints() {
  const [complaints, setComplaints] = useState([])
  const [stats, setStats] = useState(null)
  const [filter, setFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = () => {
    const url = filter !== 'all' ? `/manager/complaints?status=${filter}` : '/manager/complaints'
    setLoading(true)
    api.get(url).then(r => setComplaints(r.data.data || [])).catch(() => {}).finally(() => setLoading(false))
    api.get('/manager/complaints/stats').then(r => setStats(r.data.data)).catch(() => {})
  }

  useEffect(() => { load() }, [filter])

  const TABS = [
    { key: 'all', label: 'All', icon: <AlertCircle size={14} /> },
    { key: 'OPEN', label: 'Open', icon: <XCircle size={14} /> },
    { key: 'IN_PROGRESS', label: 'In Progress', icon: <Clock size={14} /> },
    { key: 'RESOLVED', label: 'Resolved', icon: <CheckCircle size={14} /> },
  ]

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>Complaints</h1>
            <p style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>Track and resolve tenant complaints</p>
          </div>
          <button onClick={() => setShowModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, border: 'none', background: '#4F46E5', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={15} /> Raise Complaint
          </button>
        </div>

        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
            {[
              { label: 'Total', value: stats.total, bg: '#EEF2FF', color: '#4338CA' },
              { label: 'Open', value: stats.open, bg: '#FEE2E2', color: '#991B1B' },
              { label: 'In Progress', value: stats.inProgress, bg: '#FEF3C7', color: '#92400E' },
              { label: 'Resolved', value: stats.resolved, bg: '#D1FAE5', color: '#065F46' },
            ].map(s => (
              <div key={s.label} style={{ padding: 16, borderRadius: 10, background: s.bg }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: s.color, textTransform: 'uppercase', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 6 }}>
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setFilter(tab.key)} style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 8, border: 'none',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: filter === tab.key ? '#4F46E5' : '#F3F4F6',
              color: filter === tab.key ? '#fff' : '#374151'
            }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <Card>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>Loading...</div>
          ) : complaints.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>
              <AlertCircle size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <p>No complaints found</p>
            </div>
          ) : (
            complaints.map(c => <ComplaintRow key={c.complaintId} c={c} onUpdate={load} />)
          )}
        </Card>
      </div>

      {showModal && <NewComplaintModal onClose={() => setShowModal(false)} onSaved={load} />}
    </DashboardLayout>
  )
}
