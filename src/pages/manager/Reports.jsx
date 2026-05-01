import { useEffect, useState } from 'react'
import { LayoutDashboard, UserCheck, IndianRupee, Zap, AlertCircle, BarChart2, BedDouble, Users, TrendingUp, ArrowRightLeft } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/ui/Card'
import api from '../../api/axios'

const sidebarItems = [
  { path: '/manager/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { path: '/manager/tenants', label: 'Tenants', icon: <UserCheck size={18} /> },
  { path: '/manager/billing', label: 'Billing', icon: <IndianRupee size={18} /> },
  { path: '/manager/power', label: 'Power', icon: <Zap size={18} /> },
  { path: '/manager/complaints', label: 'Complaints', icon: <AlertCircle size={18} /> },
  { path: '/manager/transfer', label: 'Transfer', icon: <ArrowRightLeft size={18} /> },
  { path: '/manager/reports', label: 'Reports', icon: <BarChart2 size={18} /> },
]

export default function ManagerReports() {
  const [analytics, setAnalytics] = useState(null)
  const [collection, setCollection] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get('/manager/reports/analytics'),
      api.get(`/manager/reports/collection?month=${selectedMonth}`),
    ]).then(([a, c]) => {
      setAnalytics(a.data.data)
      setCollection(c.data.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [selectedMonth])

  if (loading) return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <div style={{ width: 32, height: 32, border: '3px solid #4F46E5', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>Reports</h1>
            <p style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>Hostel performance overview</p>
          </div>
          <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 13 }} />
        </div>

        {analytics && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
            {[
              { label: 'Occupancy', value: `${analytics.occupancyRate}%`, sub: `${analytics.occupiedBeds}/${analytics.totalBeds} beds`, bg: '#EEF2FF', color: '#4338CA', icon: <BedDouble size={18} /> },
              { label: 'Active Tenants', value: analytics.activeTenants, sub: `${analytics.vacatedTenants} vacated`, bg: '#D1FAE5', color: '#065F46', icon: <Users size={18} /> },
              { label: 'Month Revenue', value: `₹${(parseFloat(analytics.currentMonthRevenue || 0) / 1000).toFixed(1)}k`, sub: `Collected: ₹${(parseFloat(analytics.currentMonthCollected || 0) / 1000).toFixed(1)}k`, bg: '#FEF3C7', color: '#92400E', icon: <IndianRupee size={18} /> },
              { label: 'Outstanding', value: `₹${(parseFloat(analytics.outstandingDues || 0) / 1000).toFixed(1)}k`, sub: `${analytics.overdueTenants} overdue`, bg: '#FEE2E2', color: '#991B1B', icon: <TrendingUp size={18} /> },
            ].map(s => (
              <div key={s.label} style={{ padding: '18px 20px', borderRadius: 12, background: s.bg }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: s.color, textTransform: 'uppercase' }}>{s.label}</span>
                  <span style={{ color: s.color, opacity: 0.7 }}>{s.icon}</span>
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
                {s.sub && <div style={{ fontSize: 12, color: s.color, opacity: 0.7, marginTop: 4 }}>{s.sub}</div>}
              </div>
            ))}
          </div>
        )}

        {collection && (
          <Card title={`Collection Report — ${selectedMonth}`}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
              {[
                { label: 'Total Billed', value: `₹${parseFloat(collection.totalBilled || 0).toFixed(0)}`, bg: '#EEF2FF', color: '#4338CA' },
                { label: 'Collected', value: `₹${parseFloat(collection.totalCollected || 0).toFixed(0)}`, bg: '#D1FAE5', color: '#065F46' },
                { label: 'Collection Rate', value: `${collection.collectionRate || 0}%`, bg: '#FEF3C7', color: '#92400E' },
                { label: 'Paid Bills', value: collection.paidCount, bg: '#D1FAE5', color: '#065F46' },
                { label: 'Pending Bills', value: collection.pendingCount, bg: '#FEE2E2', color: '#991B1B' },
              ].map(s => (
                <div key={s.label} style={{ padding: '12px 14px', borderRadius: 8, background: s.bg }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: s.color, textTransform: 'uppercase', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
