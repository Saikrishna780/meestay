import { useEffect, useState } from 'react'
import { LayoutDashboard, UserCheck, IndianRupee, Zap, AlertCircle, BarChart2, FileText, ArrowRightLeft } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/ui/Card'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const sidebarItems = [
  { path: '/manager/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { path: '/manager/tenants', label: 'Tenants', icon: <UserCheck size={18} /> },
  { path: '/manager/billing', label: 'Billing', icon: <IndianRupee size={18} /> },
  { path: '/manager/power', label: 'Power', icon: <Zap size={18} /> },
  { path: '/manager/complaints', label: 'Complaints', icon: <AlertCircle size={18} /> },
  { path: '/manager/transfer', label: 'Transfer', icon: <ArrowRightLeft size={18} /> },
  { path: '/manager/reports', label: 'Reports', icon: <BarChart2 size={18} /> },
]

const STATUS_COLORS = {
  PENDING: { bg: '#FEF3C7', color: '#92400E' },
  PARTIAL: { bg: '#DBEAFE', color: '#1E40AF' },
  PAID: { bg: '#D1FAE5', color: '#065F46' },
  OVERDUE: { bg: '#FEE2E2', color: '#991B1B' },
}

function PayModal({ bill, onClose, onPaid }) {
  const [amount, setAmount] = useState(parseFloat(bill.balanceDue || 0).toFixed(2))
  const [saving, setSaving] = useState(false)

  const handlePay = async () => {
    if (!amount || parseFloat(amount) <= 0) return toast.error('Enter valid amount')
    setSaving(true)
    try {
      await api.put(`/manager/billing/bills/${bill.billId}/pay`, { amount: parseFloat(amount) })
      toast.success('Payment recorded')
      onPaid()
      onClose()
    } catch { toast.error('Failed') }
    finally { setSaving(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 400, maxWidth: '95vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>Record Payment</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6B7280' }}>✕</button>
        </div>
        <div style={{ padding: '12px 14px', borderRadius: 8, background: '#F9FAFB', marginBottom: 16, fontSize: 13 }}>
          <div style={{ fontWeight: 600, color: '#111827' }}>{bill.tenantName}</div>
          <div style={{ color: '#6B7280', marginTop: 2 }}>Bill: {bill.billingMonth} · Total: ₹{bill.totalAmount} · Due: ₹{bill.balanceDue}</div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Amount (₹)</label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} min={0.01} step={0.01}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '2px solid #4F46E5', fontSize: 16, fontWeight: 600, textAlign: 'center' }} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          <button onClick={handlePay} disabled={saving} style={{ flex: 2, padding: '10px', borderRadius: 8, border: 'none', background: '#059669', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            {saving ? 'Saving...' : 'Record Payment'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function BillingV2() {
  const [bills, setBills] = useState([])
  const [summary, setSummary] = useState(null)
  const [filter, setFilter] = useState('all')
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7))
  const [generating, setGenerating] = useState(false)
  const [payBill, setPayBill] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = () => {
    const url = selectedMonth ? `/manager/billing/bills?month=${selectedMonth}` : '/manager/billing/bills'
    api.get(url).then(r => setBills(r.data.data || [])).catch(() => {}).finally(() => setLoading(false))
    api.get(`/manager/billing/summary?month=${selectedMonth}`).then(r => setSummary(r.data.data)).catch(() => {})
  }

  useEffect(() => { setLoading(true); load() }, [selectedMonth])

  const handleGenerate = async () => {
    if (!selectedMonth) return toast.error('Select a month')
    setGenerating(true)
    try {
      const r = await api.post('/manager/billing/generate', { billingMonth: selectedMonth })
      toast.success(`${r.data.data?.length || 0} bills generated`)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate bills')
    } finally { setGenerating(false) }
  }

  const filtered = bills.filter(b => filter === 'all' || b.status === filter)

  const TABS = [
    { key: 'all', label: 'All', count: bills.length },
    { key: 'PENDING', label: 'Pending', count: bills.filter(b => b.status === 'PENDING').length },
    { key: 'PARTIAL', label: 'Partial', count: bills.filter(b => b.status === 'PARTIAL').length },
    { key: 'PAID', label: 'Paid', count: bills.filter(b => b.status === 'PAID').length },
  ]

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>Billing</h1>
            <p style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>Monthly bills and payment tracking</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 13 }} />
            <button onClick={handleGenerate} disabled={generating}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, border: 'none', background: '#4F46E5', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <FileText size={15} /> {generating ? 'Generating...' : 'Generate Bills'}
            </button>
          </div>
        </div>

        {summary && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
            {[
              { label: 'Total Billed', value: `₹${parseFloat(summary.totalBilled || 0).toFixed(0)}`, bg: '#EEF2FF', color: '#4338CA' },
              { label: 'Collected', value: `₹${parseFloat(summary.totalCollected || 0).toFixed(0)}`, bg: '#D1FAE5', color: '#065F46' },
              { label: 'Outstanding', value: `₹${parseFloat(summary.outstanding || 0).toFixed(0)}`, bg: '#FEE2E2', color: '#991B1B' },
              { label: 'Paid Bills', value: summary.paidBills, bg: '#D1FAE5', color: '#065F46' },
              { label: 'Pending Bills', value: summary.pendingBills, bg: '#FEF3C7', color: '#92400E' },
            ].map(s => (
              <div key={s.label} style={{ padding: '14px 16px', borderRadius: 10, background: s.bg }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: s.color, textTransform: 'uppercase', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 6 }}>
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setFilter(tab.key)} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: 'none',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: filter === tab.key ? '#4F46E5' : '#F3F4F6',
              color: filter === tab.key ? '#fff' : '#374151'
            }}>
              {tab.label}
              <span style={{ padding: '1px 6px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                background: filter === tab.key ? 'rgba(255,255,255,0.25)' : '#E5E7EB',
                color: filter === tab.key ? '#fff' : '#374151' }}>{tab.count}</span>
            </button>
          ))}
        </div>

        <Card>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>Loading bills...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>
              <FileText size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <p>No bills found. Click "Generate Bills" to create bills for {selectedMonth}.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F9FAFB', borderBottom: '2px solid #E5E7EB' }}>
                    {['Tenant', 'Month', 'Rent', 'Electricity', 'Discount', 'Prev Due', 'Total', 'Paid', 'Balance', 'Status', 'Action'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(b => {
                    const sc = STATUS_COLORS[b.status] || STATUS_COLORS.PENDING
                    return (
                      <tr key={b.billId} style={{ borderBottom: '1px solid #F3F4F6' }}>
                        <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 600 }}>{b.tenantName}</td>
                        <td style={{ padding: '10px 12px', fontSize: 13 }}>{b.billingMonth}</td>
                        <td style={{ padding: '10px 12px', fontSize: 13 }}>₹{b.rentAmount}</td>
                        <td style={{ padding: '10px 12px', fontSize: 13 }}>₹{parseFloat(b.electricityCost || 0).toFixed(2)}</td>
                        <td style={{ padding: '10px 12px', fontSize: 13, color: '#059669' }}>-₹{b.discountAmount || 0}</td>
                        <td style={{ padding: '10px 12px', fontSize: 13, color: '#DC2626' }}>₹{b.previousDue || 0}</td>
                        <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 700 }}>₹{b.totalAmount}</td>
                        <td style={{ padding: '10px 12px', fontSize: 13, color: '#059669', fontWeight: 600 }}>₹{b.paidAmount}</td>
                        <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 700, color: parseFloat(b.balanceDue) > 0 ? '#DC2626' : '#059669' }}>₹{b.balanceDue}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.color }}>{b.status}</span>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          {b.status !== 'PAID' && (
                            <button onClick={() => setPayBill(b)}
                              style={{ padding: '5px 12px', borderRadius: 6, border: 'none', background: '#059669', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                              Pay
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {payBill && <PayModal bill={payBill} onClose={() => setPayBill(null)} onPaid={load} />}
    </DashboardLayout>
  )
}
