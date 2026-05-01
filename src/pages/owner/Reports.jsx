import { useEffect, useState } from 'react'
import { LayoutDashboard, Hotel, UserCog, Zap, BarChart2, TrendingUp, Users, IndianRupee, BedDouble, AlertCircle, Settings } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/ui/Card'
import api from '../../api/axios'

const sidebarItems = [
  { path: '/owner/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { path: '/owner/hostel', label: 'Hostel', icon: <Hotel size={18} /> },
  { path: '/owner/managers', label: 'Managers', icon: <UserCog size={18} /> },
  { path: '/owner/power', label: 'Power', icon: <Zap size={18} /> },
  { path: '/owner/reports', label: 'Reports', icon: <BarChart2 size={18} /> },
  { path: '/owner/settings', label: 'Settings', icon: <Settings size={18} /> },
]

function StatBox({ label, value, sub, bg, color, icon }) {
  return (
    <div style={{ padding: '18px 20px', borderRadius: 12, background: bg, border: `1px solid ${bg}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
        <span style={{ color, opacity: 0.7 }}>{icon}</span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color }}>{value ?? '—'}</div>
      {sub && <div style={{ fontSize: 12, color, opacity: 0.7, marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

function BarChart({ data, valueKey, labelKey, color = '#4F46E5', title }) {
  if (!data || data.length === 0) return null
  const max = Math.max(...data.map(d => parseFloat(d[valueKey] || 0)), 1)
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
        {data.map((d, i) => {
          const h = Math.max(4, (parseFloat(d[valueKey] || 0) / max) * 100)
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ fontSize: 10, color: '#6B7280', fontWeight: 600 }}>
                ₹{(parseFloat(d[valueKey] || 0) / 1000).toFixed(0)}k
              </div>
              <div style={{ width: '100%', height: `${h}%`, background: color, borderRadius: '4px 4px 0 0', minHeight: 4 }} />
              <div style={{ fontSize: 10, color: '#9CA3AF', textAlign: 'center' }}>
                {d[labelKey]?.substring(5) || d[labelKey]}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Reports() {
  const [analytics, setAnalytics] = useState(null)
  const [collection, setCollection] = useState(null)
  const [tenantReport, setTenantReport] = useState([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get('/owner/reports/analytics'),
      api.get(`/owner/reports/collection?month=${selectedMonth}`),
      api.get('/owner/reports/tenants'),
    ]).then(([a, c, t]) => {
      setAnalytics(a.data.data)
      setCollection(c.data.data)
      setTenantReport(t.data.data || [])
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
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>Reports & Analytics</h1>
            <p style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>Business overview and performance metrics</p>
          </div>
          <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 13 }} />
        </div>

        {analytics && (
          <>
            {/* KPI Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
              <StatBox label="Occupancy Rate" value={`${analytics.occupancyRate}%`}
                sub={`${analytics.occupiedBeds}/${analytics.totalBeds} beds`}
                bg="#EEF2FF" color="#4338CA" icon={<BedDouble size={18} />} />
              <StatBox label="Active Tenants" value={analytics.activeTenants}
                sub={`${analytics.vacatedTenants} vacated`}
                bg="#D1FAE5" color="#065F46" icon={<Users size={18} />} />
              <StatBox label="Month Revenue" value={`₹${(parseFloat(analytics.currentMonthRevenue || 0) / 1000).toFixed(1)}k`}
                sub={`Collected: ₹${(parseFloat(analytics.currentMonthCollected || 0) / 1000).toFixed(1)}k`}
                bg="#FEF3C7" color="#92400E" icon={<IndianRupee size={18} />} />
              <StatBox label="Outstanding Dues" value={`₹${(parseFloat(analytics.outstandingDues || 0) / 1000).toFixed(1)}k`}
                sub={`${analytics.overdueTenants} overdue tenants`}
                bg="#FEE2E2" color="#991B1B" icon={<TrendingUp size={18} />} />
              <StatBox label="Open Complaints" value={analytics.openComplaints}
                sub={`${analytics.totalComplaints} total`}
                bg="#F3F4F6" color="#374151" icon={<AlertCircle size={18} />} />
            </div>

            {/* Revenue Trend */}
            {analytics.revenueTrend && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <Card title="Revenue Trend (6 months)">
                  <BarChart data={analytics.revenueTrend} valueKey="billed" labelKey="month" color="#4F46E5" title="Billed" />
                </Card>
                <Card title="Collection Trend (6 months)">
                  <BarChart data={analytics.revenueTrend} valueKey="collected" labelKey="month" color="#059669" title="Collected" />
                </Card>
              </div>
            )}

            {/* Room Occupancy Breakdown */}
            {analytics.roomBreakdown && analytics.roomBreakdown.length > 0 && (
              <Card title="Room Occupancy Breakdown">
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#F9FAFB', borderBottom: '2px solid #E5E7EB' }}>
                        {['Floor', 'Room', 'Total Beds', 'Occupied', 'Vacant', 'Occupancy %'].map(h => (
                          <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.roomBreakdown.map((r, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                          <td style={{ padding: '10px 14px', fontSize: 13 }}>Floor {r.floorNumber}</td>
                          <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600 }}>Room {r.roomNumber}</td>
                          <td style={{ padding: '10px 14px', fontSize: 13 }}>{r.totalBeds}</td>
                          <td style={{ padding: '10px 14px', fontSize: 13, color: '#DC2626', fontWeight: 600 }}>{r.occupiedBeds}</td>
                          <td style={{ padding: '10px 14px', fontSize: 13, color: '#059669', fontWeight: 600 }}>{r.vacantBeds}</td>
                          <td style={{ padding: '10px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ flex: 1, height: 6, borderRadius: 3, background: '#E5E7EB', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${r.occupancyPct}%`, background: r.occupancyPct >= 80 ? '#DC2626' : r.occupancyPct >= 50 ? '#D97706' : '#059669', borderRadius: 3 }} />
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 600, color: '#374151', minWidth: 32 }}>{r.occupancyPct}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </>
        )}

        {/* Collection Report */}
        {collection && (
          <Card title={`Collection Report — ${selectedMonth}`}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
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

        {/* Tenant Report */}
        {tenantReport.length > 0 && (
          <Card title={`Tenant Report (${tenantReport.length})`}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F9FAFB', borderBottom: '2px solid #E5E7EB' }}>
                    {['Name', 'Mobile', 'Room', 'Rent', 'Paid', 'Due', 'Status', 'Join Date'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tenantReport.map((t, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600 }}>{t.tenantName}</td>
                      <td style={{ padding: '10px 14px', fontSize: 13 }}>{t.mobile}</td>
                      <td style={{ padding: '10px 14px', fontSize: 13 }}>{t.roomId}</td>
                      <td style={{ padding: '10px 14px', fontSize: 13 }}>₹{t.rentAmount}</td>
                      <td style={{ padding: '10px 14px', fontSize: 13, color: '#059669', fontWeight: 600 }}>₹{t.amountPaid}</td>
                      <td style={{ padding: '10px 14px', fontSize: 13, color: parseFloat(t.dueAmount) > 0 ? '#DC2626' : '#059669', fontWeight: 600 }}>₹{t.dueAmount}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                          background: t.status === 'ACTIVE' ? '#D1FAE5' : '#F3F4F6',
                          color: t.status === 'ACTIVE' ? '#065F46' : '#374151' }}>{t.status}</span>
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: 13 }}>{t.joinDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
