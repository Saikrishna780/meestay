export default function StatCard({ icon, label, value, sub, color = '#3b82f6' }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, padding: '20px 24px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)', flex: 1, minWidth: 160,
      borderLeft: `4px solid ${color}`,
    }}>
      <div style={{ fontSize: 28 }}>{icon}</div>
      <div style={{ fontSize: 13, color: '#64748b', marginTop: 8 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color, marginTop: 2 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}
