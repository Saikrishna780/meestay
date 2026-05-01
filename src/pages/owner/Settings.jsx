import { useEffect, useState } from 'react'
import { LayoutDashboard, Hotel, UserCog, Zap, BarChart2, Settings as SettingsIcon, Save } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/ui/Card'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const sidebarItems = [
  { path: '/owner/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { path: '/owner/hostel', label: 'Hostel', icon: <Hotel size={18} /> },
  { path: '/owner/managers', label: 'Managers', icon: <UserCog size={18} /> },
  { path: '/owner/power', label: 'Power', icon: <Zap size={18} /> },
  { path: '/owner/reports', label: 'Reports', icon: <BarChart2 size={18} /> },
  { path: '/owner/settings', label: 'Settings', icon: <SettingsIcon size={18} /> },
]

export default function Settings() {
  const [form, setForm] = useState({ vacateNoticeDays: 7, extraStayDailyFee: 0 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/owner/hostel/settings').then(r => {
      const d = r.data.data
      if (d) setForm({ vacateNoticeDays: d.vacateNoticeDays || 7, extraStayDailyFee: d.extraStayDailyFee || 0 })
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleSave = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/owner/hostel/settings', form)
      toast.success('Settings saved')
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>Hostel Settings</h1>
          <p style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>Configure hostel policies and fees</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>Loading...</div>
        ) : (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Card title="Vacate Policy">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                    Vacate Notice Period (days)
                  </label>
                  <input type="number" min={0} max={90} value={form.vacateNoticeDays}
                    onChange={e => setForm(f => ({ ...f, vacateNoticeDays: parseInt(e.target.value) || 0 }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14 }} />
                  <p style={{ fontSize: 12, color: '#6B7280', marginTop: 6 }}>
                    Number of days advance notice required before a tenant can vacate.
                  </p>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                    Extra Stay Daily Fee (₹)
                  </label>
                  <input type="number" min={0} step="0.01" value={form.extraStayDailyFee}
                    onChange={e => setForm(f => ({ ...f, extraStayDailyFee: parseFloat(e.target.value) || 0 }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14 }} />
                  <p style={{ fontSize: 12, color: '#6B7280', marginTop: 6 }}>
                    Daily fee charged for staying beyond the notice period.
                  </p>
                </div>
              </div>
            </Card>

            <button type="submit" disabled={saving}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 10, border: 'none', background: '#4F46E5', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              <Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        )}
      </div>
    </DashboardLayout>
  )
}
