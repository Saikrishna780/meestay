const variants = {
  success: { bg: '#D1FAE5', color: '#065F46' },
  danger:  { bg: '#FEE2E2', color: '#991B1B' },
  warning: { bg: '#FEF3C7', color: '#92400E' },
  info:    { bg: '#DBEAFE', color: '#1E40AF' },
  gray:    { bg: '#F1F5F9', color: '#475569' },
}

export default function Badge({ label, variant = 'gray' }) {
  const style = variants[variant] || variants.gray
  return (
    <span style={{
      padding: '3px 10px',
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
      background: style.bg,
      color: style.color,
      display: 'inline-block'
    }}>
      {label}
    </span>
  )
}
