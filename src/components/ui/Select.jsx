export default function Select({ label, name, value, onChange, options, required, disabled, placeholder }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-700)' }}>
          {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </label>
      )}
      <select
        name={name} value={value} onChange={onChange}
        disabled={disabled} required={required}
        style={{
          width: '100%', padding: '10px 14px',
          border: '1px solid var(--gray-300)', borderRadius: 8,
          fontSize: 14, color: 'var(--gray-800)',
          background: disabled ? 'var(--gray-100)' : '#fff',
          outline: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
          fontFamily: 'Inter, sans-serif', appearance: 'auto'
        }}
        onFocus={e => e.target.style.borderColor = 'var(--primary)'}
        onBlur={e => e.target.style.borderColor = 'var(--gray-300)'}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}
