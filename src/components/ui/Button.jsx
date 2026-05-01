const variants = {
  primary: {
    background: 'var(--primary)', color: '#fff', border: 'none',
    hover: { background: 'var(--primary-dark)' }
  },
  outline: {
    background: '#fff', color: 'var(--primary)',
    border: '1px solid var(--primary)',
    hover: { background: 'var(--primary-light)' }
  },
  danger: {
    background: 'var(--danger)', color: '#fff', border: 'none',
    hover: { background: '#DC2626' }
  },
  ghost: {
    background: 'transparent', color: 'var(--gray-600)',
    border: '1px solid var(--gray-200)',
    hover: { background: 'var(--gray-100)' }
  }
}

export default function Button({
  children, onClick, variant = 'primary',
  disabled = false, loading = false,
  size = 'md', fullWidth = false, type = 'button', style: extraStyle = {}
}) {
  const v = variants[variant]
  const padding = size === 'sm' ? '7px 14px' : size === 'lg' ? '12px 28px' : '10px 20px'
  const fontSize = size === 'sm' ? 13 : size === 'lg' ? 15 : 14

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: 8, padding, fontSize, fontWeight: 600,
        borderRadius: 8, border: v.border || 'none',
        background: v.background, color: v.color,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.15s',
        width: fullWidth ? '100%' : 'auto',
        ...extraStyle
      }}
      onMouseEnter={e => { if (!disabled && !loading) Object.assign(e.currentTarget.style, v.hover) }}
      onMouseLeave={e => { if (!disabled && !loading) Object.assign(e.currentTarget.style, { background: v.background, color: v.color }) }}
    >
      {loading ? (
        <span style={{
          width: 16, height: 16, border: '2px solid currentColor',
          borderTopColor: 'transparent', borderRadius: '50%',
          animation: 'spin 0.6s linear infinite', display: 'inline-block'
        }} />
      ) : children}
    </button>
  )
}
