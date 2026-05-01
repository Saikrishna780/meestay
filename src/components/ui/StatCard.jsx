export default function StatCard({ label, value, icon, color = 'var(--primary)', bg = 'var(--primary-light)' }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 'var(--radius)',
      padding: '20px 24px',
      boxShadow: 'var(--shadow-sm)',
      border: '1px solid var(--gray-200)',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      transition: 'box-shadow 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: bg, display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0
      }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--gray-900)', lineHeight: 1 }}>
          {value ?? '—'}
        </div>
        <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>{label}</div>
      </div>
    </div>
  )
}
