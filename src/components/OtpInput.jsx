import { useRef, useState } from 'react'

export default function OtpInput({ length = 6, onComplete }) {
  const [otp, setOtp] = useState(Array(length).fill(''))
  const refs = useRef([])

  const handle = (val, i) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]
    next[i] = val
    setOtp(next)
    if (val && i < length - 1) refs.current[i + 1]?.focus()
    if (next.every(d => d !== '')) onComplete?.(next.join(''))
  }

  const handleKey = (e, i) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus()
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    const next = [...otp]
    pasted.split('').forEach((d, i) => { next[i] = d })
    setOtp(next)
    refs.current[Math.min(pasted.length, length - 1)]?.focus()
    if (pasted.length === length) onComplete?.(pasted)
  }

  return (
    <div style={{ display: 'flex', gap: 10 }}>
      {otp.map((digit, i) => (
        <input
          key={i}
          ref={el => refs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={e => handle(e.target.value, i)}
          onKeyDown={e => handleKey(e, i)}
          onPaste={handlePaste}
          style={{
            width: 48, height: 56, textAlign: 'center',
            fontSize: 22, fontWeight: 700,
            border: `2px solid ${digit ? '#3b82f6' : '#e2e8f0'}`,
            borderRadius: 10, outline: 'none',
            background: digit ? '#eff6ff' : '#fff',
            transition: 'border 0.2s, background 0.2s',
          }}
        />
      ))}
    </div>
  )
}
