import { useLocation, NavLink } from 'react-router-dom'

/**
 * DashboardLayout's internal Sidebar.
 *
 * Props:
 *   items      – Array<{ path, label, icon }>  (optional/empty is safe)
 *   collapsed  – boolean  icon-only mode (tablet)
 *   mobileOpen – boolean  show as fixed overlay (mobile)
 *   onClose    – fn       called when a nav link is tapped (mobile)
 */
export default function Sidebar({ items = [], collapsed = false, mobileOpen = false, onClose }) {
  const location = useLocation()

  const sidebarStyle = {
    width: collapsed ? 'var(--sidebar-collapsed, 64px)' : 'var(--sidebar-width, 240px)',
    background: '#fff',
    borderRight: '1px solid var(--gray-200)',
    transition: 'width 0.25s ease, transform 0.25s ease',
    overflow: 'hidden',
    flexShrink: 0,
    boxShadow: 'var(--shadow-sm)',
    zIndex: 50,
    display: 'flex',
    flexDirection: 'column',
    // Desktop: sticky so it stays in view while scrolling
    position: 'sticky',
    top: 'var(--navbar-height, 64px)',
    height: 'calc(100vh - var(--navbar-height, 64px))',
    overflowY: 'auto',
  }

  // Mobile overlay mode overrides
  const mobileStyle = mobileOpen
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: 'var(--sidebar-width, 240px)',
        zIndex: 50,
        boxShadow: '4px 0 24px rgba(0,0,0,0.18)',
        transform: 'translateX(0)',
      }
    : {
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: 'var(--sidebar-width, 240px)',
        zIndex: 50,
        transform: 'translateX(-100%)',
        pointerEvents: 'none',
      }

  // We only apply mobile styles when the parent explicitly passes mobileOpen prop
  const appliedStyle = mobileOpen !== undefined
    ? { ...sidebarStyle, ...mobileStyle }
    : sidebarStyle

  return (
    <aside style={appliedStyle}>
      <nav style={{ padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {items.map(item => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path))

          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: collapsed ? 0 : 12,
                padding: collapsed ? '10px 0' : '10px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 8,
                textDecoration: 'none',
                color: isActive ? 'var(--primary)' : 'var(--gray-600)',
                background: isActive ? 'var(--primary-light)' : 'transparent',
                fontWeight: isActive ? 600 : 400,
                fontSize: 14,
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                position: 'relative',
              }}
              onMouseEnter={e => {
                if (!isActive) e.currentTarget.style.background = 'var(--gray-100)'
              }}
              onMouseLeave={e => {
                if (!isActive) e.currentTarget.style.background = 'transparent'
              }}
            >
              <span
                style={{ flexShrink: 0, display: 'flex', fontSize: 18 }}
                title={collapsed ? item.label : undefined}
              >
                {item.icon}
              </span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
