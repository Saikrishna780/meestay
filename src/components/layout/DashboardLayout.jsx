import { useState, useEffect } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

/**
 * DashboardLayout
 *
 * Props:
 *   children      – page content
 *   sidebarItems  – Array<{ path, label, icon }> passed to Sidebar
 */
export default function DashboardLayout({ children, sidebarItems }) {
  const [isMobile, setIsMobile] = useState(() =>
    window.matchMedia('(max-width: 767px)').matches
  )
  const [isTablet, setIsTablet] = useState(() =>
    window.matchMedia('(min-width: 768px) and (max-width: 1024px)').matches
  )
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 767px)')
    const tabletQuery = window.matchMedia('(min-width: 768px) and (max-width: 1024px)')

    const handleMobileChange = (e) => {
      setIsMobile(e.matches)
      if (!e.matches) setSidebarOpen(false) // close overlay when leaving mobile
    }
    const handleTabletChange = (e) => setIsTablet(e.matches)

    mobileQuery.addEventListener('change', handleMobileChange)
    tabletQuery.addEventListener('change', handleTabletChange)

    return () => {
      mobileQuery.removeEventListener('change', handleMobileChange)
      tabletQuery.removeEventListener('change', handleTabletChange)
    }
  }, [])

  const handleToggleSidebar = () => setSidebarOpen(open => !open)
  const handleCloseSidebar = () => setSidebarOpen(false)

  // On tablet: collapsed icon-only mode; on mobile: hidden by default (overlay)
  const sidebarCollapsed = isTablet && !isMobile
  const sidebarMobileOpen = isMobile ? sidebarOpen : undefined

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar onToggleSidebar={handleToggleSidebar} />

      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        {/* Mobile backdrop */}
        {isMobile && sidebarOpen && (
          <div
            onClick={handleCloseSidebar}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.45)',
              zIndex: 49,
            }}
          />
        )}

        {/* Sidebar — hidden on mobile unless open */}
        {(!isMobile || sidebarOpen) && (
          <Sidebar
            items={sidebarItems}
            collapsed={sidebarCollapsed}
            mobileOpen={sidebarMobileOpen}
            onClose={isMobile ? handleCloseSidebar : undefined}
          />
        )}

        <main
          style={{
            flex: 1,
            padding: isMobile ? '16px' : '28px 32px',
            background: 'var(--gray-50)',
            minHeight: 'calc(100vh - var(--navbar-height, 64px))',
            overflow: 'auto',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
