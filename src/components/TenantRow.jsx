const STATUS_STYLE = {
  active:   { bg: '#dcfce7', color: '#15803d' },
  inactive: { bg: '#f1f5f9', color: '#64748b' },
  notice:   { bg: '#fef9c3', color: '#a16207' },
}

export default function TenantRow({ name, room, due, status = 'active', avatar }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.active
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '12px 16px', background: '#fff',
      borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        background: '#e0e7ff', color: '#4f46e5',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: 14, flexShrink: 0,
      }}>{initials}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{name}</div>
        <div style={{ fontSize: 12, color: '#94a3b8' }}>Room {room}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: due > 0 ? '#ef4444' : '#22c55e' }}>
          {due > 0 ? `₹${due} due` : 'Cleared'}
        </div>
        <span style={{
          display: 'inline-block', marginTop: 4,
          background: s.bg, color: s.color,
          borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 600,
        }}>{status}</span>
      </div>
    </div>
  )
}
