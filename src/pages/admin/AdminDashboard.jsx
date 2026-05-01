import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Plus, Mail, Phone, CheckCircle, ArrowRightLeft, Eye, LayoutDashboard, UserCog } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const sidebarItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { path: '/admin/owner', label: 'Owner Details', icon: <UserCog size={18} /> },
]

// ── Owner Transfer Modal ──────────────────────────────────────────────────────
function TransferModal({ owner, onClose, onDone }) {
  const [step, setStep] = useState(1) // 1=form, 2=otp, 3=done
  const [form, setForm] = useState({ newOwnerName: '', newOwnerMobile: '', newOwnerEmail: '' })
  const [newOwnerId, setNewOwnerId] = useState('')
  const [otp, setOtp] = useState('')
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get(`/admin/owners/${owner.ownerId}/transfer-preview`)
      .then(r => setPreview(r.data.data)).catch(() => {})
  }, [owner.ownerId])

  const handleInitiate = async () => {
    if (!form.newOwnerName || !form.newOwnerMobile || !form.newOwnerEmail)
      return toast.error('Fill all fields')
    setLoading(true)
    try {
      const { data } = await api.post('/admin/owners/transfer/initiate', {
        oldOwnerId: owner.ownerId, ...form
      })
      setNewOwnerId(data.data.ownerId)
      toast.success('OTP sent to new owner mobile')
      setStep(2)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally { setLoading(false) }
  }

  const handleConfirm = async () => {
    if (otp.length < 6) return toast.error('Enter 6-digit OTP')
    setLoading(true)
    try {
      await api.post('/admin/owners/transfer/confirm', {
        oldOwnerId: owner.ownerId, newOwnerId, otp
      })
      toast.success('Ownership transferred successfully!')
      setStep(3)
      onDone()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transfer failed')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 480, maxWidth: '95vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>Transfer Ownership</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6B7280' }}>✕</button>
        </div>

        {/* Preview */}
        {preview && (
          <div style={{ padding: '10px 14px', borderRadius: 8, background: '#FEF3C7', border: '1px solid #FDE68A', marginBottom: 16, fontSize: 13, color: '#92400E' }}>
            ⚠️ This will transfer: <strong>{preview.hostels} hostels</strong>, <strong>{preview.managers} managers</strong>, <strong>{preview.tenants} tenants</strong> from <strong>{owner.ownerName}</strong>
          </div>
        )}

        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 4 }}>Enter new owner details. An OTP will be sent to verify their mobile.</p>
            {[
              { key: 'newOwnerName', label: 'New Owner Name', placeholder: 'Full name' },
              { key: 'newOwnerMobile', label: 'Mobile Number', placeholder: '10-digit mobile' },
              { key: 'newOwnerEmail', label: 'Email', placeholder: 'email@example.com' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>{f.label}</label>
                <input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 13, outline: 'none' }} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleInitiate} disabled={loading} style={{ flex: 2, padding: '10px', borderRadius: 8, border: 'none', background: '#DC2626', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                {loading ? 'Sending OTP...' : 'Send OTP & Continue'}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: 13, color: '#6B7280' }}>Enter the 6-digit OTP sent to <strong>{form.newOwnerMobile}</strong></p>
            <input value={otp} onChange={e => setOtp(e.target.value)} maxLength={6}
              placeholder="Enter OTP"
              style={{ padding: '12px', borderRadius: 8, border: '2px solid #4F46E5', fontSize: 20, fontWeight: 700, textAlign: 'center', outline: 'none', letterSpacing: 8 }} />
            <div style={{ padding: '10px 14px', borderRadius: 8, background: '#FEE2E2', border: '1px solid #FECACA', fontSize: 12, color: '#991B1B' }}>
              ⚠️ This action is IRREVERSIBLE. The old owner will lose all access.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', fontSize: 13, cursor: 'pointer' }}>Back</button>
              <button onClick={handleConfirm} disabled={loading || otp.length < 6} style={{ flex: 2, padding: '10px', borderRadius: 8, border: 'none', background: otp.length < 6 ? '#D1D5DB' : '#DC2626', color: '#fff', fontSize: 13, fontWeight: 600, cursor: otp.length < 6 ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Transferring...' : 'Confirm Transfer'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#059669' }}>Transfer Complete!</h3>
            <p style={{ fontSize: 13, color: '#6B7280', marginTop: 6 }}>Ownership has been successfully transferred.</p>
            <button onClick={onClose} style={{ marginTop: 16, padding: '10px 24px', borderRadius: 8, border: 'none', background: '#4F46E5', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Close</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [owners, setOwners] = useState([])
  const [loading, setLoading] = useState(true)
  const [transferOwner, setTransferOwner] = useState(null)
  const navigate = useNavigate()

  const loadOwners = () => {
    api.get('/admin/owners').then(r => setOwners(r.data.data || []))
      .catch(() => toast.error('Failed to load owners'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadOwners() }, [])

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--gray-900)' }}>Dashboard</h1>
            <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>Super Admin Overview</p>
          </div>
          <Button onClick={() => navigate('/admin/create-owner')}>
            <Plus size={16} /> Create Owner
          </Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <StatCard label="Total Owners" value={owners.length} icon={<Users size={22} />} />
          <StatCard label="Active Owners" value={owners.filter(o => o.isActive).length}
            icon={<CheckCircle size={22} />} color="var(--success)" bg="#D1FAE5" />
          <StatCard label="Inactive Owners" value={owners.filter(o => !o.isActive).length}
            icon={<Users size={22} />} color="var(--danger)" bg="#FEE2E2" />
        </div>

        <Card title={`All Owners (${owners.length})`}>
          {loading ? (
            <p style={{ textAlign: 'center', padding: 32, color: 'var(--gray-400)' }}>Loading...</p>
          ) : owners.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--gray-400)' }}>
              <Users size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <p>No owners yet. Click "Create Owner" to get started.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {owners.map(owner => (
                <div key={owner.ownerId} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 16px', borderRadius: 10,
                  border: '1px solid var(--gray-200)', background: owner.isActive ? '#F9FAFB' : '#FEF2F2'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{owner.ownerName?.[0]?.toUpperCase()}</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{owner.ownerName}</div>
                      <div style={{ fontSize: 12, color: '#6B7280', display: 'flex', gap: 12, marginTop: 2 }}>
                        <span><Phone size={11} style={{ display: 'inline', marginRight: 3 }} />{owner.ownerMobile}</span>
                        <span><Mail size={11} style={{ display: 'inline', marginRight: 3 }} />{owner.ownerEmail}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Badge label={owner.isActive ? 'Active' : 'Inactive'} variant={owner.isActive ? 'success' : 'danger'} />
                    {owner.isActive && (
                      <button onClick={() => setTransferOwner(owner)} style={{
                        display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px',
                        borderRadius: 8, border: '1px solid #FECACA', background: '#FEF2F2',
                        color: '#DC2626', fontSize: 12, fontWeight: 600, cursor: 'pointer'
                      }}>
                        <ArrowRightLeft size={13} /> Transfer
                      </button>
                    )}
                    <button onClick={() => api.get(`/admin/owners/${owner.ownerId}/transfer-preview`).then(r => toast(r.data.data?.message || 'Preview loaded'))} style={{
                      display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px',
                      borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff',
                      color: '#374151', fontSize: 12, fontWeight: 500, cursor: 'pointer'
                    }}>
                      <Eye size={13} /> Preview
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {transferOwner && (
        <TransferModal
          owner={transferOwner}
          onClose={() => setTransferOwner(null)}
          onDone={() => { setTransferOwner(null); loadOwners() }}
        />
      )}
    </DashboardLayout>
  )
}
