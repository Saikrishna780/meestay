const NAV = [
  { icon: '📊', label: 'Dashboard',    id: 'dashboard'    },
  { icon: '🛏️', label: 'Availability', id: 'availability' },
  { icon: '🧍', label: 'Tenants',      id: 'tenants'      },
  { icon: '⚡', label: 'Billing',      id: 'billing'      },
  { icon: '💳', label: 'Payments',     id: 'payments'     },
  { icon: '🚪', label: 'Vacate',       id: 'vacate'       },
]

export default function Sidebar({ active, onNav }) {
  return (
    <aside style={{
      width: 220, minHeight: '100vh', background: '#1e293b',
      display: 'flex', flexDirection: 'column', padding: '24px 0',
    }}>
      <div style={{ padding: '0 20px 28px', borderBottom: '1px solid #334155' }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>🏠 MeeStay</div>
        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Manager Portal</div>
      </div>
      <nav style={{ marginTop: 16, flex: 1 }}>
        {NAV.map(item => (
          <button key={item.id} onClick={() => onNav?.(item.id)} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            width: '100%', padding: '11px 20px',
            background: active === item.id ? '#3b82f6' : 'transparent',
            border: 'none', cursor: 'pointer', textAlign: 'left',
            color: active === item.id ? '#fff' : '#94a3b8',
            fontWeight: active === item.id ? 600 : 400,
            fontSize: 14, borderRadius: active === item.id ? '0 8px 8px 0' : 0,
            transition: 'all 0.15s',
          }}>
            <span>{item.icon}</span>{item.label}
          </button>
        ))}
      </nav>
      <div style={{ padding: '16px 20px', borderTop: '1px solid #334155' }}>
        <div style={{ fontSize: 13, color: '#94a3b8' }}>Manager</div>
        <div style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>Ravi Kumar</div>
      </div>
    </aside>
  )
}
