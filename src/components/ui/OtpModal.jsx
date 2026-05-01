import { useState, useRef } from 'react'
import Button from './Button'
import { X } from 'lucide-react'

export default function OtpModal({ isOpen, onClose, onVerify, onResend, loading }) {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const refs = useRef([])

  if (!isOpen) return null

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

  const handleVerify = () => {
    const code = otp.join('')
    if (code.length === 6) onVerify(code)
  }

  const handleResend = () => {
    setOtp(['', '', '', '', '', ''])
    onResend()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: 32,
        width: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        position: 'relative'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16,
          background: 'none', border: 'none', color: 'var(--gray-400)',
          cursor: 'pointer', padding: 4, borderRadius: 6
        }}>
          <X size={18} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'var(--primary-light)', margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ fontSize: 24 }}>🔐</span>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-900)' }}>Verify OTP</h2>
          <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 6 }}>
            Enter the 6-digit OTP sent to the owner's mobile
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 24 }}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => refs.current[i] = el}
              type="text"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              style={{
                width: 48, height: 52, textAlign: 'center',
                fontSize: 20, fontWeight: 700,
                border: `2px solid ${digit ? 'var(--primary)' : 'var(--gray-300)'}`,
                borderRadius: 10, outline: 'none',
                color: 'var(--gray-900)', background: digit ? 'var(--primary-light)' : '#fff',
                transition: 'all 0.15s'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = digit ? 'var(--primary)' : 'var(--gray-300)'}
            />
          ))}
        </div>

        <Button fullWidth onClick={handleVerify} loading={loading}
          disabled={otp.join('').length < 6}>
          Verify OTP
        </Button>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>Didn't receive? </span>
          <button onClick={handleResend} style={{
            background: 'none', border: 'none', color: 'var(--primary)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer'
          }}>
            Resend OTP
          </button>
        </div>
      </div>
    </div>
  )
}
