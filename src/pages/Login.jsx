import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Building2, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'

const ROLES = [
  { value: 'admin', label: 'Super Admin' },
  { value: 'owner', label: 'Hostel Owner' },
  { value: 'manager', label: 'Manager' },
]

// ── OTP input component ──────────────────────────────────────────────────────
function OtpInput({ onVerify, onResend, loading }) {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const refs = useRef([])

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]
    next[i] = val
    setOtp(next)
    if (val && i < 5) refs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🔐</div>
        <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>
          Enter the 6-digit OTP sent to your mobile
        </p>
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        {otp.map((digit, i) => (
          <input key={i} ref={el => refs.current[i] = el}
            type="text" maxLength={1} value={digit}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            style={{
              width: 48, height: 52, textAlign: 'center', fontSize: 20, fontWeight: 700,
              border: `2px solid ${digit ? 'var(--primary)' : 'var(--gray-300)'}`,
              borderRadius: 10, outline: 'none', color: 'var(--gray-900)',
              background: digit ? 'var(--primary-light)' : '#fff', transition: 'all 0.15s'
            }}
            onFocus={e => e.target.style.borderColor = 'var(--primary)'}
            onBlur={e => e.target.style.borderColor = digit ? 'var(--primary)' : 'var(--gray-300)'}
          />
        ))}
      </div>
      <button onClick={() => onVerify(otp.join(''))}
        disabled={otp.join('').length < 6 || loading}
        style={{
          padding: '12px', borderRadius: 10, border: 'none',
          background: otp.join('').length < 6 ? 'var(--gray-200)' : 'linear-gradient(135deg, var(--primary), #7C3AED)',
          color: otp.join('').length < 6 ? 'var(--gray-400)' : '#fff',
          fontSize: 15, fontWeight: 700,
          cursor: otp.join('').length < 6 ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
        }}>
        {loading ? <Spinner /> : 'Verify & Login'}
      </button>
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>Didn't receive? </span>
        <button onClick={onResend} style={{
          background: 'none', border: 'none', color: 'var(--primary)',
          fontSize: 13, fontWeight: 600, cursor: 'pointer'
        }}>Resend OTP</button>
      </div>
    </div>
  )
}

function Spinner() {
  return <span style={{ width: 16, height: 16, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} />
}

// ── Main Login page ──────────────────────────────────────────────────────────
export default function Login() {
  const [role, setRole] = useState('admin')
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [step, setStep] = useState('form') // 'form' | 'otp' | 'manager-otp' | 'forgot' | 'set-password'
  const [loading, setLoading] = useState(false)
  const [encryptedMobile, setEncryptedMobile] = useState('')
  const [forgotMobile, setForgotMobile] = useState('')
  const [requestId, setRequestId] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [forgotStatus, setForgotStatus] = useState(null) // null | 'PENDING' | 'APPROVED' | 'NONE'
  const { login } = useAuth()
  const navigate = useNavigate()

  const isOtpRole = role === 'admin'
  const isPasswordRole = role === 'owner' || role === 'manager'

  const redirectAfterLogin = (userRole) => {
    if (userRole === 'SUPER_ADMIN') navigate('/admin/dashboard')
    else if (userRole === 'OWNER') navigate('/owner/dashboard')
    else navigate('/manager/dashboard')
  }

  const handleSendOtp = async e => {
    e.preventDefault()
    if (!mobile) return toast.error('Enter your mobile number')
    setLoading(true)
    try {
      await api.post(`/auth/admin/otp/send`, { mobile })
      toast.success('OTP sent to your mobile')
      setStep('otp')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP')
    } finally { setLoading(false) }
  }

  const handleVerifyOtp = async (otp) => {
    if (otp.length < 6) return toast.error('Enter complete OTP')
    setLoading(true)
    try {
      const { data } = await api.post(`/auth/admin/otp/verify`, { mobile, otp })
      if (data.success) {
        login(data.data, data.data.token)
        toast.success(`Welcome, ${data.data.name}!`)
        redirectAfterLogin(data.data.role)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP')
    } finally { setLoading(false) }
  }

  const handlePasswordLogin = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const endpoint = role === 'owner' ? '/auth/owner/login' : '/auth/manager/login'
      const body = { mobile, password }
      // Include OTP if manager is on the OTP step
      if (role === 'manager' && step === 'manager-otp' && otp) {
        body.otp = otp
      }

      const { data } = await api.post(endpoint, body)

      if (data.success) {
        // Manager first-time login: OTP required
        if (role === 'manager' && data.data?.status === 'OTP_REQUIRED') {
          setStep('manager-otp')
          toast('OTP sent to your registered mobile. Check server logs for OTP.', { icon: '📱' })
          return
        }
        login(data.data, data.data.accessToken || data.data.token)
        toast.success(`Welcome, ${data.data.name}!`)
        redirectAfterLogin(data.data.role)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  // Manager: raise forgot password request
  const handleForgotRequest = async e => {
    e.preventDefault()
    if (!forgotMobile) return toast.error('Enter your mobile number')
    setLoading(true)
    try {
      await api.post('/auth/manager/forgot-password/request', { mobile: forgotMobile })
      toast.success('Request raised! Waiting for owner approval.')
      setForgotStatus('PENDING')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to raise request')
    } finally { setLoading(false) }
  }

  // Manager: check status of request
  const handleCheckStatus = async e => {
    e.preventDefault()
    if (!forgotMobile) return toast.error('Enter your mobile number')
    setLoading(true)
    try {
      const { data } = await api.get(`/auth/manager/forgot-password/status?mobile=${forgotMobile}`)
      const status = data.data?.status
      setForgotStatus(status)
      if (status === 'APPROVED') {
        setRequestId(data.data.requestId)
        setStep('set-password')
        toast.success('Request approved! Set your new password.')
      } else if (status === 'PENDING') {
        toast('Request is pending owner approval.', { icon: '⏳' })
      } else {
        toast('No pending request found. Please raise a new request.', { icon: 'ℹ️' })
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to check status')
    } finally { setLoading(false) }
  }

  // Manager: set new password
  const handleSetPassword = async e => {
    e.preventDefault()
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match')
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      await api.post('/auth/manager/forgot-password/set-password', {
        requestId, mobile: forgotMobile, newPassword
      })
      toast.success('Password updated! Please login.')
      setStep('form')
      setForgotMobile('')
      setNewPassword('')
      setConfirmPassword('')
      setForgotStatus(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to set password')
    } finally { setLoading(false) }
  }

  const handleRoleChange = (r) => {
    setRole(r); setStep('form'); setMobile(''); setPassword(''); setOtp('')
    setForgotMobile(''); setForgotStatus(null)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #EEF2FF 0%, #F8FAFC 50%, #E0E7FF 100%)'
    }}>
      <div style={{ position: 'fixed', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,70,229,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: -100, left: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,70,229,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{
        background: '#fff', borderRadius: 20, padding: '40px',
        width: '100%', maxWidth: 420,
        boxShadow: '0 20px 60px rgba(79,70,229,0.12), 0 4px 20px rgba(0,0,0,0.06)',
        border: '1px solid rgba(79,70,229,0.1)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 16,
            background: 'linear-gradient(135deg, var(--primary), #7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px', boxShadow: '0 8px 20px rgba(79,70,229,0.3)'
          }}>
            <Building2 size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--gray-900)' }}>MeeStay</h1>
          <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>Hostel Management System</p>
        </div>

        {/* Role tabs */}
        <div style={{ display: 'flex', gap: 6, background: 'var(--gray-100)', borderRadius: 10, padding: 4, marginBottom: 24 }}>
          {ROLES.map(r => (
            <button key={r.value} type="button" onClick={() => handleRoleChange(r.value)}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 8, border: 'none',
                fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                background: role === r.value ? '#fff' : 'transparent',
                color: role === r.value ? 'var(--primary)' : 'var(--gray-500)',
                boxShadow: role === r.value ? 'var(--shadow-sm)' : 'none'
              }}>
              {r.label}
            </button>
          ))}
        </div>

        {/* Admin OTP step indicator */}
        {isOtpRole && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <StepDot active={step === 'form'} done={step === 'otp'} label="Mobile" />
            <div style={{ flex: 1, height: 2, background: step === 'otp' ? 'var(--primary)' : 'var(--gray-200)', borderRadius: 2, transition: 'background 0.3s' }} />
            <StepDot active={step === 'otp'} done={false} label="OTP" />
          </div>
        )}

        {/* Admin OTP verify step */}
        {isOtpRole && step === 'otp' ? (
          <div>
            <button onClick={() => setStep('form')} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: 'none', border: 'none', color: 'var(--gray-500)',
              fontSize: 13, cursor: 'pointer', marginBottom: 16, padding: 0
            }}>
              <ArrowLeft size={14} /> Change mobile
            </button>
            <OtpInput
              onVerify={handleVerifyOtp}
              onResend={() => { setStep('form'); setTimeout(() => handleSendOtp({ preventDefault: () => {} }), 100) }}
              loading={loading}
            />
          </div>
        ) : step === 'manager-otp' ? (
          <form onSubmit={handlePasswordLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <button type="button" onClick={() => { setStep('form'); setOtp('') }} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: 'none', border: 'none', color: 'var(--gray-500)',
              fontSize: 13, cursor: 'pointer', padding: 0
            }}>
              <ArrowLeft size={14} /> Back to login
            </button>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>📱</div>
              <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>
                Enter the OTP sent to <strong>{mobile}</strong>
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-700)' }}>
                OTP <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input type="text" placeholder="6-digit OTP" maxLength={6}
                value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} required
                style={{ padding: '11px 14px', border: '1px solid var(--gray-300)', borderRadius: 8, fontSize: 18, letterSpacing: 8, textAlign: 'center', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--gray-300)'}
              />
            </div>
            <button type="submit" disabled={loading || otp.length < 6} style={{
              padding: '12px', borderRadius: 10, border: 'none',
              background: otp.length < 6 ? 'var(--gray-200)' : 'linear-gradient(135deg, var(--primary), #7C3AED)',
              color: otp.length < 6 ? 'var(--gray-400)' : '#fff',
              fontSize: 15, fontWeight: 700,
              cursor: otp.length < 6 ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}>
              {loading ? <Spinner /> : 'Verify & Login'}
            </button>
          </form>
        ) : step === 'forgot' ? (
          /* Manager forgot password — raise request or check status */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <button onClick={() => { setStep('form'); setForgotStatus(null) }} style={{
              display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none',
              color: 'var(--gray-500)', fontSize: 13, cursor: 'pointer', padding: 0
            }}>
              <ArrowLeft size={14} /> Back to login
            </button>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>🔑</div>
              <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>
                Enter your mobile to raise a password reset request
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-700)' }}>Mobile Number</label>
              <input type="tel" placeholder="Your registered mobile"
                value={forgotMobile} onChange={e => setForgotMobile(e.target.value)}
                style={{ padding: '11px 14px', border: '1px solid var(--gray-300)', borderRadius: 8, fontSize: 14, outline: 'none' }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--gray-300)'}
              />
            </div>
            {forgotStatus === 'PENDING' && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: '#FEF3C7', border: '1px solid #FDE68A', fontSize: 13, color: '#92400E' }}>
                ⏳ Request pending owner approval. Check status below.
              </div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleForgotRequest} disabled={loading || forgotStatus === 'PENDING'}
                style={{
                  flex: 1, padding: '11px', borderRadius: 8, border: 'none', fontWeight: 600,
                  fontSize: 13, cursor: forgotStatus === 'PENDING' ? 'not-allowed' : 'pointer',
                  background: forgotStatus === 'PENDING' ? 'var(--gray-200)' : 'var(--primary-light)',
                  color: forgotStatus === 'PENDING' ? 'var(--gray-400)' : 'var(--primary)'
                }}>
                Raise Request
              </button>
              <button onClick={handleCheckStatus} disabled={loading}
                style={{
                  flex: 1, padding: '11px', borderRadius: 8, border: 'none', fontWeight: 600,
                  fontSize: 13, cursor: 'pointer',
                  background: 'linear-gradient(135deg, var(--primary), #7C3AED)', color: '#fff'
                }}>
                {loading ? '...' : 'Check Status'}
              </button>
            </div>
          </div>
        ) : step === 'set-password' ? (
          /* Manager set new password after approval */
          <form onSubmit={handleSetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>✅</div>
              <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>Request approved! Set your new password.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-700)' }}>New Password</label>
              <input type="password" placeholder="Min 6 characters"
                value={newPassword} onChange={e => setNewPassword(e.target.value)} required
                style={{ padding: '11px 14px', border: '1px solid var(--gray-300)', borderRadius: 8, fontSize: 14, outline: 'none' }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--gray-300)'}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-700)' }}>Confirm Password</label>
              <input type="password" placeholder="Re-enter password"
                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                style={{ padding: '11px 14px', border: '1px solid var(--gray-300)', borderRadius: 8, fontSize: 14, outline: 'none' }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--gray-300)'}
              />
            </div>
            <button type="submit" disabled={loading} style={{
              padding: '12px', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg, var(--primary), #7C3AED)',
              color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {loading ? <Spinner /> : 'Save New Password'}
            </button>
          </form>
        ) : (
          <form onSubmit={isOtpRole ? handleSendOtp : handlePasswordLogin}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-700)' }}>
                Mobile Number <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input type="tel" placeholder="Enter mobile number"
                value={mobile} onChange={e => setMobile(e.target.value)} required
                style={{ padding: '11px 14px', border: '1px solid var(--gray-300)', borderRadius: 8, fontSize: 14, outline: 'none' }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--gray-300)'}
              />
            </div>

            {/* Password for owner and manager */}
            {isPasswordRole && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-700)' }}>
                  Password <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input type={showPass ? 'text' : 'password'} placeholder="Enter password"
                    value={password} onChange={e => setPassword(e.target.value)} required
                    style={{ width: '100%', padding: '11px 44px 11px 14px', border: '1px solid var(--gray-300)', borderRadius: 8, fontSize: 14, outline: 'none' }}
                    onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--gray-300)'}
                  />
                  <button type="button" onClick={() => setShowPass(s => !s)} style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer'
                  }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {/* OTP hint for admin */}
            {isOtpRole && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--primary-light)', border: '1px solid #C7D2FE' }}>
                <p style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 500 }}>
                  📱 An OTP will be sent to your registered mobile via SMS
                </p>
              </div>
            )}

            {/* Forgot password hint for manager */}
            {role === 'manager' && (
              <p style={{ fontSize: 12, color: 'var(--gray-400)', textAlign: 'center' }}>
                Forgot password?{' '}
                <button type="button" onClick={() => setStep('forgot')} style={{
                  background: 'none', border: 'none', color: 'var(--primary)',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer'
                }}>Request reset</button>
              </p>
            )}

            <button type="submit" disabled={loading} style={{
              padding: '12px', borderRadius: 10, border: 'none',
              background: loading ? 'var(--gray-300)' : 'linear-gradient(135deg, var(--primary), #7C3AED)',
              color: '#fff', fontSize: 15, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 14px rgba(79,70,229,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}>
              {loading ? <Spinner /> : isOtpRole ? 'Send OTP' : 'Sign In'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--gray-400)', marginTop: 24 }}>
          © 2026 MeeStay. All rights reserved.
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function StepDot({ active, done, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%', display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
        background: active || done ? 'var(--primary)' : 'var(--gray-200)',
        color: active || done ? '#fff' : 'var(--gray-400)', transition: 'all 0.3s'
      }}>
        {done ? '✓' : active ? '●' : '○'}
      </div>
      <span style={{ fontSize: 10, color: active ? 'var(--primary)' : 'var(--gray-400)', fontWeight: 500 }}>
        {label}
      </span>
    </div>
  )
}
