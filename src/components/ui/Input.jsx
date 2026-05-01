export default function Input({
  label, name, type = 'text', value, onChange,
  placeholder, required, error, disabled, rows
}) {
  const inputStyle = {
    width: '100%', padding: '10px 14px',
    border: `1px solid ${error ? 'var(--danger)' : 'var(--gray-300)'}`,
    borderRadius: 8, fontSize: 14, color: 'var(--gray-800)',
    background: disabled ? 'var(--gray-100)' : '#fff',
    outline: 'none', transition: 'border-color 0.15s',
    fontFamily: 'Inter, sans-serif'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-700)' }}>
          {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </label>
      )}
      {rows ? (
        <textarea
          name={name} value={value} onChange={onChange}
          placeholder={placeholder} disabled={disabled} rows={rows}
          style={{ ...inputStyle, resize: 'vertical' }}
          onFocus={e => e.target.style.borderColor = 'var(--primary)'}
          onBlur={e => e.target.style.borderColor = error ? 'var(--danger)' : 'var(--gray-300)'}
        />
      ) : (
        <input
          type={type} name={name} value={value} onChange={onChange}
          placeholder={placeholder} disabled={disabled} required={required}
          style={inputStyle}
          onFocus={e => e.target.style.borderColor = 'var(--primary)'}
          onBlur={e => e.target.style.borderColor = error ? 'var(--danger)' : 'var(--gray-300)'}
        />
      )}
      {error && <span style={{ fontSize: 12, color: 'var(--danger)' }}>{error}</span>}
    </div>
  )
}
