import { useState } from 'react'
import { LogOut, Bell, User, Menu, Building2, ChevronDown } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useHostel } from '../../context/HostelContext'
import { useNavigate } from 'react-router-dom'

const roleBadgeColor = {
  SUPER_ADMIN: { bg: '#FEF3C7', color: '#92400E', label: 'Super Admin' },
  OWNER: { bg: '#DBEAFE', color: '#1E40AF', label: 'Owner' },
  MANAGER: { bg: '#D1FAE5', color: '#065F46', label: 'Manager' },
}

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth()
  const { hostels, selectedHostel, selectHostel, assignedHostelId } = useHostel()
  const navigate = useNavigate()
  const badge = roleBadgeColor[user?.role] || roleBadgeColor.MANAGER
  const [showHostelDrop, setShowHostelDrop] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isManager = user?.role === 'MANAGER'
  const hasMultipleHostels = isManager && hostels.length > 1 && !assignedHostelId

  return (
    <header style={{
      height: 'var(--navbar-height)',
      background: '#fff',
      borderBottom: '1px solid var(--gray-200)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onToggleSidebar} style={{
          background: 'none', border: 'none', padding: 8,
          borderRadius: 8, color: 'var(--gray-500)',
          display: 'flex', alignItems: 'center', transition: 'background 0.15s'
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-100)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <Menu size={20} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>S</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--gray-900)' }}>MeeStay</span>
        </div>

        {/* Hostel selector — only for managers with multiple hostels */}
        {hasMultipleHostels && (
          <div style={{ position: 'relative', marginLeft: 8 }}>
            <button
              onClick={() => setShowHostelDrop(d => !d)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 8,
                border: '1px solid var(--gray-200)', background: 'var(--primary-light)',
                color: 'var(--primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer'
              }}
            >
              <Building2 size={14} />
              <span style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selectedHostel?.hostelName || 'Select Hostel'}
              </span>
              <ChevronDown size={13} />
            </button>

            {showHostelDrop && (
              <div style={{
                position: 'absolute', top: '110%', left: 0,
                background: '#fff', borderRadius: 10, border: '1px solid var(--gray-200)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 200,
                minWidth: 220, overflow: 'hidden'
              }}>
                <div style={{ padding: '8px 12px', fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', borderBottom: '1px solid var(--gray-100)' }}>
                  Your Hostels
                </div>
                {hostels.map(h => (
                  <button
                    key={h.hostelId}
                    onClick={() => { selectHostel(h.hostelId); setShowHostelDrop(false) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      width: '100%', padding: '10px 14px', border: 'none',
                      background: h.hostelId === selectedHostel?.hostelId ? 'var(--primary-light)' : '#fff',
                      color: h.hostelId === selectedHostel?.hostelId ? 'var(--primary)' : 'var(--gray-800)',
                      fontSize: 13, fontWeight: h.hostelId === selectedHostel?.hostelId ? 600 : 400,
                      cursor: 'pointer', textAlign: 'left'
                    }}
                  >
                    <Building2 size={14} />
                    <div>
                      <div>{h.hostelName}</div>
                      {h.hostelAddress && (
                        <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>
                          {h.hostelAddress.substring(0, 35)}{h.hostelAddress.length > 35 ? '...' : ''}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Single hostel name badge for managers */}
        {isManager && !hasMultipleHostels && selectedHostel && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 10px', borderRadius: 8,
            background: 'var(--primary-light)', color: 'var(--primary)',
            fontSize: 12, fontWeight: 600
          }}>
            <Building2 size={13} />
            {selectedHostel.hostelName}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Hide hostel badge and notification bell below 480px */}
        <style>{`
          @media (max-width: 479px) {
            .navbar-hostel-badge { display: none !important; }
            .navbar-bell { display: none !important; }
          }
        `}</style>

        <span className="navbar-hostel-badge" style={{ padding: '4px 12px', borderRadius: 20, background: badge.bg, color: badge.color, fontSize: 12, fontWeight: 600 }}>
          {badge.label}
        </span>

        <button className="navbar-bell" style={{ background: 'none', border: 'none', padding: 8, borderRadius: 8, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', position: 'relative' }}>
          <Bell size={18} />
          <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)', border: '2px solid #fff' }} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={18} color="var(--primary)" />
          </div>
          <div style={{ lineHeight: 1.3 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-800)' }}>{user?.name || 'User'}</div>
            <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{user?.mobile}</div>
          </div>
        </div>

        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 14px', borderRadius: 8,
          background: 'none', border: '1px solid var(--gray-200)',
          color: 'var(--gray-600)', fontSize: 13, fontWeight: 500, transition: 'all 0.15s'
        }}
          onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.borderColor = '#FECACA' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--gray-600)'; e.currentTarget.style.borderColor = 'var(--gray-200)' }}
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>

      {showHostelDrop && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 199 }} onClick={() => setShowHostelDrop(false)} />
      )}
    </header>
  )
}
