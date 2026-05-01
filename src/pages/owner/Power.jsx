import { useEffect, useState } from 'react'
import { LayoutDashboard, Hotel, UserCog, Zap, Plus, Save, BarChart2, Settings } from 'lucide-react'
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
  { path: '/owner/settings', label: 'Settings', icon: <Settings size={18} /> },
]

const currentMonth = () => new Date().toISOString().substring(0, 7)

function ReadingForm({ onSave, acRooms, apiPrefix }) {
  const [form, setForm] = useState({
    meterType: 'MAIN', meterLabel: 'Main Meter', roomId: '', floorLabel: '',
    readingMonth: currentMonth(), previousUnits: '', currentUnits: '', unitPrice: ''
  })
  const [saving, setSaving] = useState(false)

  const consumed = Math.max(0, parseFloat(form.currentUnits || 0) - parseFloat(form.previousUnits || 0))
  const cost = consumed * parseFloat(form.unitPrice || 0)

  const handleMeterTypeChange = type => {
    setForm(f => ({
      ...f, meterType: type,
      meterLabel: type === 'MAIN' ? 'Main Meter' : '',
      roomId: '', floorLabel: ''
    }))
  }

  const handleRoomSelect = roomId => {
    const room = acRooms.find(r => r.roomId === roomId)
    if (room) {
      setForm(f => ({
        ...f, roomId,
        floorLabel: `Floor ${room.floorNumber}`,
        meterLabel: `Floor ${room.floorNumber} - Room ${room.roomNumber} (AC)`
      }))
    }
  }

  const handleSave = async () => {
    if (!form.currentUnits || !form.unitPrice) return toast.error('Fill all fields')
    if (form.meterType === 'SUB' && !form.roomId) return toast.error('Select an AC room for sub meter')
    if (parseFloat(form.currentUnits) < parseFloat(form.previousUnits || 0))
      return toast.error('Current units cannot be less than previous units')
    setSaving(true)
    try {
      await api.post(`/${apiPrefix}/power/readings`, form)
      toast.success('Reading saved!')
      onSave()
      setForm(f => ({
        ...f, previousUnits: form.currentUnits, currentUnits: '',
        roomId: '', floorLabel: '',
        meterLabel: form.meterType === 'MAIN' ? 'Main Meter' : ''
      }))
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  return (
    <div style={{ padding: 16, background: '#F9FAFB', borderRadius: 10, border: '1px solid #E5E7EB', marginBottom: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Meter Type</label>
          <select value={form.meterType} onChange={e => handleMeterTypeChange(e.target.value)}
            style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 13, marginTop: 4 }}>
            <option value="MAIN">Main Meter (All AC Tenants)</option>
            <option value="SUB">Sub Meter (Specific AC Room)</option>
          </select>
        </div>

        {form.meterType === 'SUB' && (
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Select AC Room *</label>
            {acRooms.length === 0 ? (
              <div style={{ marginTop: 4, padding: '8px 10px', borderRadius: 8, background: '#FEF3C7', border: '1px solid #FDE68A', fontSize: 12, color: '#92400E' }}>
                No AC rooms found
              </div>
            ) : (
              <select value={form.roomId} onChange={e => handleRoomSelect(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 13, marginTop: 4 }}>
                <option value="">Choose AC room...</option>
                {acRooms.map(r => (
                  <option key={r.roomId} value={r.roomId}>
                    Floor {r.floorNumber} - Room {r.roomNumber} ({r.occupiedBeds}/{r.totalBeds} occupied)
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Month</label>
          <input type="month" value={form.readingMonth} onChange={e => setForm(f => ({ ...f, readingMonth: e.target.value }))}
            style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 13, marginTop: 4 }} />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Previous Units</label>
          <input type="number" value={form.previousUnits} onChange={e => setForm(f => ({ ...f, previousUnits: e.target.value }))}
            placeholder="0" style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 13, marginTop: 4 }} />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Current Units</label>
          <input type="number" value={form.currentUnits} onChange={e => setForm(f => ({ ...f, currentUnits: e.target.value }))}
            placeholder="0" style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 13, marginTop: 4 }} />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Unit Price (₹)</label>
          <input type="number" value={form.unitPrice} onChange={e => setForm(f => ({ ...f, unitPrice: e.target.value }))}
            placeholder="0" style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 13, marginTop: 4 }} />
        </div>
      </div>

      {form.meterType === 'SUB' && form.roomId && (
        <div style={{ padding: '10px 14px', borderRadius: 8, background: '#EEF2FF', border: '1px solid #C7D2FE', marginBottom: 12, fontSize: 13, color: '#4338CA' }}>
          ⚡ {form.meterLabel} — Only this AC room's tenants will be charged
        </div>
      )}
      {form.meterType === 'MAIN' && (
        <div style={{ padding: '10px 14px', borderRadius: 8, background: '#F0FDF4', border: '1px solid #A7F3D0', marginBottom: 12, fontSize: 13, color: '#065F46' }}>
          ℹ️ Main meter cost will be split equally among all AC room tenants. Non-AC tenants are excluded.
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 20, fontSize: 13 }}>
          <span style={{ color: '#6B7280' }}>Units Consumed: <strong style={{ color: '#111827' }}>{consumed.toFixed(2)}</strong></span>
          <span style={{ color: '#6B7280' }}>Total Cost: <strong style={{ color: '#059669' }}>₹{cost.toFixed(2)}</strong></span>
        </div>
        <button onClick={handleSave} disabled={saving}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: 'none', background: '#4F46E5', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Save size={14} /> {saving ? 'Saving...' : 'Save Reading'}
        </button>
      </div>
    </div>
  )
}

export default function Power() {
  const [readings, setReadings] = useState([])
  const [acRooms, setAcRooms] = useState([])
  const [hostels, setHostels] = useState([])
  const [selectedHostelId, setSelectedHostelId] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [filterMonth, setFilterMonth] = useState('')

  // Load hostels on mount
  useEffect(() => {
    api.get('/owner/hostel/all').then(r => {
      const list = r.data.data || []
      setHostels(list)
      if (list.length > 0) setSelectedHostelId(list[0].hostelId)
    }).catch(() => {})
  }, [])

  const load = () => {
    if (!selectedHostelId) return
    const hostelParam = `hostelId=${selectedHostelId}`
    const url = filterMonth
      ? `/owner/power/readings?month=${filterMonth}&${hostelParam}`
      : `/owner/power/readings?${hostelParam}`
    api.get(url).then(r => setReadings(r.data.data || [])).catch(() => {})
    api.get(`/owner/power/ac-rooms?hostelId=${selectedHostelId}`)
      .then(r => setAcRooms(r.data.data || [])).catch(() => {})
  }

  useEffect(() => { load() }, [filterMonth, selectedHostelId])

  const totalCost = readings.reduce((s, r) => {
    const c = Math.max(0, parseFloat(r.currentUnits || 0) - parseFloat(r.previousUnits || 0))
    return s + c * parseFloat(r.unitPrice || 0)
  }, 0)

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>Power Management</h1>
            <p style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
              AC rooms only — Non-AC tenants excluded from power billing
            </p>
          </div>
          <button onClick={() => setShowForm(s => !s)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, border: 'none', background: '#4F46E5', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={15} /> Add Reading
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
          {[
            { label: 'Total Readings', value: readings.length, bg: '#EEF2FF', color: '#4338CA' },
            { label: 'Main Meters', value: readings.filter(r => r.meterType === 'MAIN').length, bg: '#FEF3C7', color: '#92400E' },
            { label: 'AC Rooms', value: acRooms.length, bg: '#E0F2FE', color: '#0369A1' },
            { label: 'Total Cost', value: `₹${totalCost.toFixed(0)}`, bg: '#D1FAE5', color: '#065F46' },
          ].map(s => (
            <div key={s.label} style={{ padding: '16px', borderRadius: 10, background: s.bg }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: s.color, textTransform: 'uppercase', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {showForm && (
          <Card title="Add Meter Reading">
            <ReadingForm onSave={() => { load(); setShowForm(false) }} acRooms={acRooms} apiPrefix="owner" />
          </Card>
        )}

        <Card title="Meter Readings">
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
            <label style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>Filter by month:</label>
            <input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
              style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 13 }} />
            {filterMonth && <button onClick={() => setFilterMonth('')} style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', fontSize: 12, cursor: 'pointer' }}>Clear</button>}
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '2px solid #E5E7EB' }}>
                  {['Type', 'Room / Label', 'Month', 'Prev Units', 'Curr Units', 'Consumed', 'Unit Price', 'Total Cost'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {readings.length === 0
                  ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>No readings found</td></tr>
                  : readings.map(r => {
                    const consumed = Math.max(0, parseFloat(r.currentUnits || 0) - parseFloat(r.previousUnits || 0))
                    const cost = consumed * parseFloat(r.unitPrice || 0)
                    return (
                      <tr key={r.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ padding: '2px 8px', borderRadius: 6, background: r.meterType === 'MAIN' ? '#EEF2FF' : '#FEF3C7', color: r.meterType === 'MAIN' ? '#4338CA' : '#92400E', fontSize: 11, fontWeight: 700 }}>{r.meterType}</span>
                        </td>
                        <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600 }}>{r.meterLabel}</td>
                        <td style={{ padding: '10px 14px', fontSize: 13 }}>{r.readingMonth}</td>
                        <td style={{ padding: '10px 14px', fontSize: 13 }}>{r.previousUnits}</td>
                        <td style={{ padding: '10px 14px', fontSize: 13 }}>{r.currentUnits}</td>
                        <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600, color: '#4F46E5' }}>{consumed.toFixed(2)}</td>
                        <td style={{ padding: '10px 14px', fontSize: 13 }}>₹{r.unitPrice}</td>
                        <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 700, color: '#059669' }}>₹{parseFloat(cost).toFixed(2)}</td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
