const STATUS_STYLE = {
  paid:    { bg: '#dcfce7', color: '#15803d' },
  unpaid:  { bg: '#fee2e2', color: '#b91c1c' },
  pending: { bg: '#fef9c3', color: '#a16207' },
}

export default function BillCard({ month, amount, status = 'unpaid', dueDate }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.pending
  return (
    <div style={{
      background: '#fff', borderRadius: 12, padding: '16px 20px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: 15 }}>{month}</div>
        {dueDate && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Due: {dueDate}</div>}
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontWeight: 700, fontSize: 18 }}>₹{amount}</div>
        <span style={{
          display: 'inline-block', marginTop: 4,
          background: s.bg, color: s.color,
          borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600,
        }}>{status.toUpperCase()}</span>
      </div>
    </div>
  )
}
