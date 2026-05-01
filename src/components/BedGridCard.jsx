const STATUS_COLOR = {
  available: { bg: '#dcfce7', border: '#22c55e', text: '#15803d', label: 'Available' },
  occupied:  { bg: '#fee2e2', border: '#ef4444', text: '#b91c1c', label: 'Occupied'  },
  reserved:  { bg: '#fef9c3', border: '#eab308', text: '#a16207', label: 'Reserved'  },
}

export default function BedGridCard({ bedNumber, status = 'available', tenantName }) {
  const s = STATUS_COLOR[status]
  return (
    <div style={{
      background: s.bg,
      border: `1.5px solid ${s.border}`,
      borderRadius: 10,
      padding: '12px 14px',
      minWidth: 100,
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'transform 0.15s',
    }}
    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      <div style={{ fontSize: 22 }}>🛏️</div>
      <div style={{ fontWeight: 600, fontSize: 14, marginTop: 4 }}>Bed {bedNumber}</div>
      <span style={{
        display: 'inline-block', marginTop: 6,
        background: s.border, color: '#fff',
        borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600,
      }}>{s.label}</span>
      {tenantName && (
        <div style={{ fontSize: 11, color: s.text, marginTop: 4 }}>{tenantName}</div>
      )}
    </div>
  )
}
