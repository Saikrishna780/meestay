export default function Card({ children, title, action, style: extra = {} }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 'var(--radius)',
      boxShadow: 'var(--shadow-sm)',
      border: '1px solid var(--gray-200)',
      overflow: 'hidden',
      ...extra
    }}>
      {title && (
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--gray-100)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-800)' }}>{title}</h3>
          {action}
        </div>
      )}
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  )
}
