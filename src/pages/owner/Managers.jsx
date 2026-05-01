import { useEffect, useRef, useState } from 'react'
import { Plus, UserCog, ToggleLeft, ToggleRight, LayoutDashboard, Hotel, KeyRound, Zap, BarChart2, Settings } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import OtpModal from '../../components/ui/OtpModal'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { encryptField } from '../../utils/encryption'

const sidebarItems = [
  { path: '/owner/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { path: '/owner/hostel', label: 'Hostel', icon: <Hotel size={18} /> },
  { path: '/owner/managers', label: 'Managers', icon: <UserCog size={18} /> },
  { path: '/owner/power', label: 'Power', icon: <Zap size={18} /> },
  { path: '/owner/reports', label: 'Reports', icon: <BarChart2 size={18} /> },
  { path: '/owner/settings', label: 'Settings', icon: <Settings size={18} /> },
]

// ── Inline OTP input ─────────────────────────────────────────────────────────
function OtpInput({ onVerify, loading }) {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const refs = useRef([])
  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]; next[i] = val; setOtp(next)
    if (val && i < 5) refs.current[i + 1]?.focus()
  }
  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus()
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        {otp.map((d, i) => (
          <input key={i} ref={el => refs.current[i] = el}
            type="text" maxLength={1} value={d}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            style={{
              width: 40, height: 44, textAlign: 'center', fontSize: 18, fontWeight: 700,
              border: `2px solid ${d ? 'var(--primary)' : 'var(--gray-300)'}`,
              borderRadius: 8, outline: 'none',
              background: d ? 'var(--primary-light)' : '#fff'
            }}
          />
        ))}
      </div>
      <button onClick={() => onVerify(otp.join(''))}
        disabled={otp.join('').length < 6 || loading}
        style={{
          padding: '10px', borderRadius: 8, border: 'none', fontWeight: 700, fontSize: 14,
          background: otp.join('').length < 6 ? 'var(--gray-200)' : 'var(--primary)',
          color: otp.join('').length < 6 ? 'var(--gray-400)' : '#fff',
          cursor: otp.join('').length < 6 ? 'not-allowed' : 'pointer'
        }}>
        {loading ? 'Verifying...' : 'Verify & Reset Password'}
      </button>
    </div>
  )
}

export default function Managers() {
  const [managers, setManagers] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])

  // Add manager state
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ managerName: '', managerMobile: '', managerEmail: '', aadhaarNumber: '', password: '' })
  const [formErrors, setFormErrors] = useState({})
  const [loading, setLoading] = useState(false)

  // Reset password state
  const [resetManagerId, setResetManagerId] = useState(null)
  const [resetStep, setResetStep] = useState(null) // null | 'otp' | 'password'
  const [resetOtp, setResetOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [resetLoading, setResetLoading] = useState(false)

  useEffect(() => {
    api.get('/owner/managers').then(r => setManagers(r.data.data || []))
    loadPendingRequests()
  }, [])

  const loadPendingRequests = () => {
    api.get('/owner/managers/password-requests').then(r => setPendingRequests(r.data.data || [])).catch(() => {})
  }

  // ── Add manager ────────────────────────────────────────────────────────────

  const handleCreateManager = async () => {
    // Inline validation
    const errors = {}
    if (!form.managerName.trim()) errors.managerName = 'Name is required'
    if (!form.managerMobile || form.managerMobile.length !== 10) errors.managerMobile = 'Mobile must be exactly 10 digits'
    if (!form.managerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.managerEmail)) errors.managerEmail = 'Valid email is required'
    if (!form.aadhaarNumber || form.aadhaarNumber.length !== 12) errors.aadhaarNumber = 'Aadhaar must be exactly 12 digits'
    if (!form.password || form.password.length < 8) errors.password = 'Password must be at least 8 characters'
    if (form.password && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) errors.password = 'Password must have uppercase, lowercase, and a digit'
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) return

    setLoading(true)
    try {
      const encryptedMobile = encryptField(form.managerMobile)
      const encryptedAadhaar = encryptField(form.aadhaarNumber)
      const { data } = await api.post('/owner/managers', {
        managerName: form.managerName,
        managerMobile: encryptedMobile,
        managerEmail: form.managerEmail,
        aadhaarNumber: encryptedAadhaar,
        password: form.password,
        hostelId: form.hostelId || ''
      })
      toast.success('Manager created successfully!')
      setManagers(prev => [...prev, data.data])
      setShowForm(false)
      setForm({ managerName: '', managerMobile: '', managerEmail: '', aadhaarNumber: '', password: '' })
      setFormErrors({})
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create manager')
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async id => {
    try {
      const { data } = await api.put(`/owner/managers/${id}/toggle`)
      setManagers(prev => prev.map(m => m.managerId === id ? data.data : m))
    } catch {
      toast.error('Failed to update manager')
    }
  }

  const handleResolveRequest = async (requestId, approve) => {
    try {
      await api.put(`/owner/managers/password-requests/${requestId}`, { approve })
      toast.success(approve ? 'Request approved!' : 'Request rejected')
      loadPendingRequests()
    } catch {
      toast.error('Failed to update request')
    }
  }

  // ── Reset manager password (uses AuthService.resetManagerPassword) ──────────

  const startReset = async (managerId) => {
    setResetManagerId(managerId)
    setResetStep('otp')
    setResetOtp('')
    setNewPassword('')
    setResetLoading(true)
    try {
      await api.post('/auth/manager/reset-password/send-otp')
      toast.success('OTP sent to your mobile')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP')
      setResetStep(null)
    } finally {
      setResetLoading(false)
    }
  }

  const handleResetVerifyOtp = async (otp) => {
    // Just store OTP and move to password step
    setResetOtp(otp)
    setResetStep('password')
  }

  const handleResetSubmit = async e => {
    e.preventDefault()
    if (!newPassword || newPassword.length < 6)
      return toast.error('Password must be at least 6 characters')
    setResetLoading(true)
    try {
      await api.post(`/auth/manager/${resetManagerId}/reset-password`, {
        otp: resetOtp,
        newPassword
      })
      toast.success('Manager password reset successfully!')
      setResetStep(null)
      setResetManagerId(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password')
      setResetStep('otp') // go back to OTP step
    } finally {
      setResetLoading(false)
    }
  }

  const cancelReset = () => {
    setResetStep(null)
    setResetManagerId(null)
    setResetOtp('')
    setNewPassword('')
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--gray-900)' }}>Managers</h1>
            <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>Manage hostel staff</p>
          </div>
          <Button onClick={() => setShowForm(s => !s)}>
            <Plus size={16} /> Add Manager
          </Button>
        </div>

        {/* Add manager form */}
        {showForm && (
          <Card title="Add New Manager">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Manager Name */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <Input label="Manager Name" value={form.managerName}
                    onChange={e => { setForm(f => ({ ...f, managerName: e.target.value })); setFormErrors(fe => ({ ...fe, managerName: '' })) }}
                    placeholder="Full name" required />
                  {formErrors.managerName && <span style={{ fontSize: 11, color: 'var(--danger)' }}>{formErrors.managerName}</span>}
                </div>
                {/* Mobile Number */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <Input label="Mobile Number" value={form.managerMobile}
                    onChange={e => { setForm(f => ({ ...f, managerMobile: e.target.value })); setFormErrors(fe => ({ ...fe, managerMobile: '' })) }}
                    onKeyDown={e => { if (!/^\d$/.test(e.key) && !['Backspace','Delete','Tab','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault() }}
                    placeholder="10-digit mobile" required maxLength={10} inputMode="numeric" />
                  {formErrors.managerMobile && <span style={{ fontSize: 11, color: 'var(--danger)' }}>{formErrors.managerMobile}</span>}
                </div>
                {/* Email */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <Input label="Email" type="email" value={form.managerEmail}
                    onChange={e => { setForm(f => ({ ...f, managerEmail: e.target.value })); setFormErrors(fe => ({ ...fe, managerEmail: '' })) }}
                    placeholder="manager@example.com" required />
                  {formErrors.managerEmail && <span style={{ fontSize: 11, color: 'var(--danger)' }}>{formErrors.managerEmail}</span>}
                </div>
                {/* Aadhaar Number */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <Input label="Aadhaar Number" value={form.aadhaarNumber}
                    onChange={e => { setForm(f => ({ ...f, aadhaarNumber: e.target.value })); setFormErrors(fe => ({ ...fe, aadhaarNumber: '' })) }}
                    onKeyDown={e => { if (!/^\d$/.test(e.key) && !['Backspace','Delete','Tab','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault() }}
                    placeholder="12-digit Aadhaar" required maxLength={12} inputMode="numeric" />
                  {formErrors.aadhaarNumber && <span style={{ fontSize: 11, color: 'var(--danger)' }}>{formErrors.aadhaarNumber}</span>}
                </div>
                {/* Password */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <Input label="Password" type="password" value={form.password}
                    onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setFormErrors(fe => ({ ...fe, password: '' })) }}
                    placeholder="Min 8 chars, upper+lower+digit" required />
                  {formErrors.password && <span style={{ fontSize: 11, color: 'var(--danger)' }}>{formErrors.password}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <Button variant="ghost" onClick={() => { setShowForm(false); setFormErrors({}) }}>Cancel</Button>
                <Button onClick={handleCreateManager} loading={loading}>Create Manager</Button>
              </div>
            </div>
          </Card>
        )}

        {/* Reset password panel */}
        {resetStep && (
          <Card title="Reset Manager Password">
            <div style={{ maxWidth: 360, margin: '0 auto' }}>
              {resetStep === 'otp' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <p style={{ fontSize: 13, color: 'var(--gray-500)', textAlign: 'center' }}>
                    Enter the OTP sent to your registered mobile
                  </p>
                  <OtpInput onVerify={handleResetVerifyOtp} loading={resetLoading} />
                  <button onClick={cancelReset} style={{
                    background: 'none', border: 'none', color: 'var(--gray-400)',
                    fontSize: 13, cursor: 'pointer', textAlign: 'center'
                  }}>Cancel</button>
                </div>
              )}
              {resetStep === 'password' && (
                <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <p style={{ fontSize: 13, color: 'var(--gray-500)', textAlign: 'center' }}>
                    Set a new password for this manager
                  </p>
                  <Input label="New Password" type="password" value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters" required />
                  <div style={{ display: 'flex', gap: 12 }}>
                    <Button type="button" variant="ghost" onClick={cancelReset}>Cancel</Button>
                    <Button type="submit" loading={resetLoading} fullWidth>Set Password</Button>
                  </div>
                </form>
              )}
            </div>
          </Card>
        )}

        {/* Password reset requests */}
        {pendingRequests.length > 0 && (
          <Card title={`Password Reset Requests (${pendingRequests.length})`}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pendingRequests.map(req => (
                <div key={req.requestId} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px', borderRadius: 10,
                  border: '1px solid #FDE68A', background: '#FFFBEB'
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-800)' }}>
                      {req.managerName}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{req.managerMobile}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleResolveRequest(req.requestId, true)} style={{
                      padding: '6px 14px', borderRadius: 6, border: 'none',
                      background: '#D1FAE5', color: '#065F46', fontWeight: 600,
                      fontSize: 12, cursor: 'pointer'
                    }}>Approve</button>
                    <button onClick={() => handleResolveRequest(req.requestId, false)} style={{
                      padding: '6px 14px', borderRadius: 6, border: 'none',
                      background: '#FEE2E2', color: '#991B1B', fontWeight: 600,
                      fontSize: 12, cursor: 'pointer'
                    }}>Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Managers list */}
        <Card title={`All Managers (${managers.length})`}>
          {managers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--gray-400)' }}>
              <UserCog size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <p>No managers added yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {managers.map(m => (
                <div key={m.managerId} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 16px', borderRadius: 10,
                  border: '1px solid var(--gray-200)', background: 'var(--gray-50)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: 'var(--primary-light)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center'
                    }}>
                      <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 15 }}>
                        {m.managerName?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-800)' }}>
                        {m.managerName}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{m.managerMobile}</div>
                      {m.hostelId && m.hostelId !== 'UNASSIGNED' && (
                        <div style={{ fontSize: 11, color: 'var(--primary)', marginTop: 2 }}>
                          Assigned to hostel
                        </div>
                      )}
                      {(!m.hostelId || m.hostelId === 'UNASSIGNED') && (
                        <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>
                          Not assigned to any hostel
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Badge label={m.passwordSetupRequired ? 'No Password' : 'Password Set'}
                      variant={m.passwordSetupRequired ? 'warning' : 'success'} />
                    <Badge label={m.isActive ? 'Active' : 'Inactive'}
                      variant={m.isActive ? 'success' : 'danger'} />
                    {/* Reset password button */}
                    <button onClick={() => startReset(m.managerId)} title="Reset Password"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '6px 10px', borderRadius: 6, border: '1px solid #C7D2FE',
                        background: 'var(--primary-light)', color: 'var(--primary)',
                        fontSize: 12, fontWeight: 500, cursor: 'pointer'
                      }}>
                      <KeyRound size={13} /> Reset Password
                    </button>
                    <button onClick={() => handleToggle(m.managerId)} style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: m.isActive ? 'var(--success)' : 'var(--gray-400)'
                    }}>
                      {m.isActive ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}
