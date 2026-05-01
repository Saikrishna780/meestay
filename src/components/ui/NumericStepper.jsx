import { useState } from 'react'

export default function NumericStepper({
  label,
  value,
  onChange,
  min = 1,
  max = 50,
}) {
  const [error, setError] = useState('')

  const clamp = (n) => Math.min(max, Math.max(min, n))

  const decrement = () => {
    setError('')
    onChange(clamp(value - 1))
  }

  const increment = () => {
    setError('')
    onChange(clamp(value + 1))
  }

  const handleChange = (e) => {
    // Allow free typing — just pass the raw numeric string as a number
    const raw = e.target.value
    if (raw === '' || raw === '-') {
      onChange(raw)
      setError('')
      return
    }
    const n = parseInt(raw, 10)
    if (isNaN(n)) return
    onChange(n)
    if (n < min || n > max) {
      setError(`Value must be between ${min} and ${max}`)
    } else {
      setError('')
    }
  }

  const handleBlur = () => {
    const n = parseInt(value, 10)
    if (isNaN(n) || n < min || n > max) {
      const clamped = isNaN(n) ? min : clamp(n)
      onChange(clamped)
      setError('')
    }
  }

  const btnStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
    padding: '0 14px',
    fontSize: 20,
    fontWeight: 700,
    lineHeight: 1,
    border: '1px solid var(--gray-300)',
    borderRadius: 8,
    background: '#fff',
    color: 'var(--gray-700)',
    cursor: 'pointer',
    transition: 'background 0.15s, border-color 0.15s',
    userSelect: 'none',
  }

  const inputStyle = {
    minHeight: 44,
    width: 72,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: 600,
    border: `1px solid ${error ? 'var(--danger)' : 'var(--gray-300)'}`,
    borderRadius: 8,
    outline: 'none',
    color: 'var(--gray-800)',
    background: '#fff',
    fontFamily: 'Inter, sans-serif',
    padding: '0 8px',
    transition: 'border-color 0.15s',
    MozAppearance: 'textfield',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-700)' }}>
          {label}
        </label>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          type="button"
          onClick={decrement}
          disabled={value <= min}
          style={{
            ...btnStyle,
            opacity: value <= min ? 0.4 : 1,
            cursor: value <= min ? 'not-allowed' : 'pointer',
          }}
          onMouseEnter={e => { if (value > min) e.currentTarget.style.background = 'var(--gray-100)' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
          aria-label="Decrease"
        >
          −
        </button>

        <input
          type="number"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={e => { e.target.style.borderColor = 'var(--primary)' }}
          min={min}
          max={max}
          style={inputStyle}
          aria-label={label}
        />

        <button
          type="button"
          onClick={increment}
          disabled={value >= max}
          style={{
            ...btnStyle,
            opacity: value >= max ? 0.4 : 1,
            cursor: value >= max ? 'not-allowed' : 'pointer',
          }}
          onMouseEnter={e => { if (value < max) e.currentTarget.style.background = 'var(--gray-100)' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
          aria-label="Increase"
        >
          +
        </button>
      </div>
      {error && (
        <span style={{ fontSize: 12, color: 'var(--danger)' }}>{error}</span>
      )}
    </div>
  )
}
