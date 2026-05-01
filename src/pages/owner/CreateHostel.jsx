import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Hotel, LayoutDashboard, UserCog, Zap, BarChart2, Settings } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import NumericStepper from '../../components/ui/NumericStepper'
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

const sharingOptions = [
  { value: '1', label: '1 Sharing (Single)' },
  { value: '2', label: '2 Sharing' },
  { value: '3', label: '3 Sharing' },
  { value: '4', label: '4 Sharing' },
  { value: '5', label: '5 Sharing' },
  { value: '6', label: '6 Sharing' },
  { value: '7', label: '7 Sharing' },
  { value: '8', label: '8 Sharing' },
  { value: '9', label: '9 Sharing' },
  { value: '10', label: '10 Sharing' },
]

const roomTypeOptions = [
  { value: 'AC', label: 'AC' },
  { value: 'NON-AC', label: 'NON-AC' },
]

const makeRooms = (count, existing = []) =>
  Array.from({ length: count }, (_, i) => ({
    roomNumber: i + 1,
    sharingType: existing[i]?.sharingType || '2',
    roomType: existing[i]?.roomType || 'NON-AC',
  }))

const makeFloors = (count, existing = []) =>
  Array.from({ length: count }, (_, i) => ({
    floorNumber: i + 1,
    numberOfRooms: existing[i]?.numberOfRooms || 1,
    rooms: existing[i]?.rooms || makeRooms(1),
  }))

export default function CreateHostel() {
  const [managers, setManagers] = useState([])
  const [form, setForm] = useState({ hostelName: '', hostelAddress: '', numFloors: 1, managerId: '' })
  const [floors, setFloors] = useState(makeFloors(1))
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/owner/managers').then(r => setManagers(r.data.data || [])).catch(() => {})
  }, [])

  // When number of floors changes (receives numeric value directly from NumericStepper)
  const handleNumFloors = n => {
    const count = Math.max(1, parseInt(n) || 1)
    setForm(f => ({ ...f, numFloors: count }))
    setFloors(prev => makeFloors(count, prev))
  }

  // When number of rooms on a floor changes (receives numeric value directly from NumericStepper)
  const handleNumRooms = (floorIdx, n) => {
    const count = Math.max(1, parseInt(n) || 1)
    setFloors(prev => prev.map((f, i) =>
      i === floorIdx
        ? { ...f, numberOfRooms: count, rooms: makeRooms(count, f.rooms) }
        : f
    ))
  }

  // Update a specific room's field
  const updateRoom = (floorIdx, roomIdx, field, val) => {
    setFloors(prev => prev.map((f, i) =>
      i === floorIdx
        ? { ...f, rooms: f.rooms.map((r, j) => j === roomIdx ? { ...r, [field]: val } : r) }
        : f
    ))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        hostelName: form.hostelName,
        hostelAddress: form.hostelAddress,
        floors: floors.map(f => ({
          floorNumber: f.floorNumber,
          rooms: f.rooms.map(r => ({
            roomNumber: r.roomNumber,
            sharingType: parseInt(r.sharingType),
            roomType: r.roomType,
          }))
        }))
      }
      const { data } = await api.post('/owner/hostel', payload)
      const newHostelId = data.data?.hostelId

      // Assign selected manager to the new hostel
      if (form.managerId && newHostelId) {
        await api.put(`/owner/managers/${form.managerId}/assign-hostel`, { hostelId: newHostelId })
      }

      toast.success('Hostel created successfully!')
      navigate('/owner/hostel')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create hostel')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <style>{`
        @media (max-width: 600px) {
          .room-grid-header { display: none !important; }
          .room-grid-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <button onClick={() => navigate(-1)} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', color: 'var(--gray-500)',
          fontSize: 13, cursor: 'pointer', marginBottom: 20, padding: 0
        }}>
          <ArrowLeft size={16} /> Back
        </button>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Hostel Details */}
          <Card title="Hostel Details">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Input label="Hostel Name" value={form.hostelName}
                onChange={e => setForm(f => ({ ...f, hostelName: e.target.value }))}
                placeholder="e.g. Green Residency" required />
              <Input label="Address" value={form.hostelAddress}
                onChange={e => setForm(f => ({ ...f, hostelAddress: e.target.value }))}
                placeholder="Full address" required />
              <NumericStepper
                label="Number of Floors"
                value={form.numFloors}
                onChange={handleNumFloors}
                min={1}
                max={50}
              />
              {/* Manager dropdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-700)' }}>
                  Assign Manager <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>(optional)</span>
                </label>
                {managers.length === 0 ? (
                  <div style={{
                    padding: '10px 12px', borderRadius: 8, fontSize: 13,
                    border: '1px solid var(--gray-200)', background: 'var(--gray-50)',
                    color: 'var(--gray-400)'
                  }}>
                    No managers yet — add managers first from the Managers page
                  </div>
                ) : (
                  <select
                    value={form.managerId}
                    onChange={e => setForm(f => ({ ...f, managerId: e.target.value }))}
                    style={{
                      padding: '10px 12px', borderRadius: 8, fontSize: 13,
                      border: '1px solid var(--gray-300)', outline: 'none',
                      background: '#fff', color: 'var(--gray-800)', cursor: 'pointer'
                    }}
                  >
                    <option value="">-- Select Manager --</option>
                    {managers.map(m => (
                      <option key={m.managerId} value={m.managerId}>
                        {m.managerName} ({m.managerMobile}){m.hostelId && m.hostelId !== 'UNASSIGNED' ? ' — already assigned' : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </Card>

          {/* Per-floor config */}
          {floors.map((floor, fi) => (
            <Card key={fi} title={`Floor ${floor.floorNumber}`}>
              <div style={{ marginBottom: 16 }}>
                <NumericStepper
                  label="Number of Rooms"
                  value={floor.numberOfRooms}
                  onChange={n => handleNumRooms(fi, n)}
                  min={1}
                  max={50}
                />
              </div>

              {/* Per-room rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Header — hidden on small screens */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '80px 1fr 1fr',
                  gap: 12, padding: '6px 10px',
                  background: 'var(--gray-100)', borderRadius: 8,
                  fontSize: 12, fontWeight: 600, color: 'var(--gray-500)'
                }}
                  className="room-grid-header"
                >
                  <span>Room No.</span>
                  <span>Sharing Type</span>
                  <span>Room Type</span>
                </div>

                {floor.rooms.map((room, ri) => (
                  <div key={ri} className="room-grid-row" style={{
                    display: 'grid', gridTemplateColumns: '80px 1fr 1fr',
                    gap: 12, alignItems: 'center', padding: '8px 10px',
                    background: '#fff', border: '1px solid var(--gray-200)',
                    borderRadius: 8
                  }}>
                    <span style={{
                      fontSize: 13, fontWeight: 700, color: 'var(--primary)',
                      background: 'var(--primary-light)', borderRadius: 6,
                      padding: '4px 10px', textAlign: 'center'
                    }}>
                      {floor.floorNumber * 100 + room.roomNumber}
                    </span>
                    <select
                      value={room.sharingType}
                      onChange={e => updateRoom(fi, ri, 'sharingType', e.target.value)}
                      style={{
                        padding: '8px 12px', borderRadius: 8, fontSize: 13,
                        border: '1px solid var(--gray-300)', outline: 'none',
                        background: '#fff', color: 'var(--gray-800)', cursor: 'pointer'
                      }}
                    >
                      {sharingOptions.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    <select
                      value={room.roomType}
                      onChange={e => updateRoom(fi, ri, 'roomType', e.target.value)}
                      style={{
                        padding: '8px 12px', borderRadius: 8, fontSize: 13,
                        border: '1px solid var(--gray-300)', outline: 'none',
                        background: '#fff', color: 'var(--gray-800)', cursor: 'pointer'
                      }}
                    >
                      {roomTypeOptions.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </Card>
          ))}

          <div style={{ display: 'flex', gap: 12 }}>
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" loading={loading} fullWidth>
              Create Hostel
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
