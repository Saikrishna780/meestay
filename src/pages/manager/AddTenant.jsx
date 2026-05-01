import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, UserPlus, LayoutDashboard, UserCheck, BedDouble, IndianRupee, Zap, AlertCircle, ArrowRightLeft, BarChart2 } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { useHostel } from '../../context/HostelContext'

const sidebarItems = [
  { path: '/manager/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { path: '/manager/tenants', label: 'Tenants', icon: <UserCheck size={18} /> },
  { path: '/manager/billing', label: 'Billing', icon: <IndianRupee size={18} /> },
  { path: '/manager/power', label: 'Power', icon: <Zap size={18} /> },
  { path: '/manager/complaints', label: 'Complaints', icon: <AlertCircle size={18} /> },
  { path: '/manager/transfer', label: 'Transfer', icon: <ArrowRightLeft size={18} /> },
  { path: '/manager/reports', label: 'Reports', icon: <BarChart2 size={18} /> },
]

const foodOptions = [
  { value: 'Veg', label: 'Vegetarian' },
  { value: 'Non-Veg', label: 'Non-Vegetarian' },
]

export default function AddTenant() {
  const [floors, setFloors] = useState([])
  const [rooms, setRooms] = useState([])
  const [selectedFloor, setSelectedFloor] = useState('')
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    tenantName: '', tenantMobile: '', tenantEmail: '',
    aadhaarNumber: '', joinDate: '', billDueDate: '',
    parentMobile: '', occupation: '', tenantAddress: '',
    depositAmount: '', rentAmount: '', foodPreference: 'Veg',
    floorId: '', roomId: ''
  })
  const navigate = useNavigate()
  const { selectedHostelId } = useHostel()

  useEffect(() => {
    const hostelParam = selectedHostelId ? `?hostelId=${selectedHostelId}` : ''
    api.get(`/manager/hostel/floors${hostelParam}`).then(r => setFloors(r.data.data || []))
  }, [selectedHostelId])

  const handleFloorChange = async e => {
    const floorId = e.target.value
    setSelectedFloor(floorId)
    setSelectedRoom(null)
    setForm(f => ({ ...f, floorId, roomId: '' }))
    if (floorId) {
      const r = await api.get(`/manager/hostel/rooms/${floorId}`)
      setRooms(r.data.data || [])
    }
  }

  const handleRoomChange = e => {
    const roomId = e.target.value
    const room = rooms.find(r => r.roomId === roomId)
    setSelectedRoom(room)
    setForm(f => ({ ...f, roomId }))
  }

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    // Frontend validations
    if (!/^[6-9][0-9]{9}$/.test(form.tenantMobile)) {
      toast.error('Mobile must be 10 digits starting with 6-9')
      return
    }
    if (form.aadhaarNumber && !/^[0-9]{12}$/.test(form.aadhaarNumber)) {
      toast.error('Aadhaar must be exactly 12 digits')
      return
    }
    if (form.parentMobile && !/^[6-9][0-9]{9}$/.test(form.parentMobile)) {
      toast.error('Parent mobile must be 10 digits starting with 6-9')
      return
    }
    setLoading(true)
    try {
      await api.post('/manager/tenants', {
        ...form,
        depositAmount: parseFloat(form.depositAmount) || 0,
        rentAmount: parseFloat(form.rentAmount),
      })
      toast.success('Tenant added successfully!')
      navigate('/manager/tenants')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add tenant')
    } finally {
      setLoading(false)
    }
  }

  const availableRooms = rooms.filter(r => r.totalBeds - r.occupiedBeds > 0)
  const floorOptions = floors.map(f => ({ value: f.floorId, label: `Floor ${f.floorNumber}` }))
  const roomOptions = availableRooms.map(r => ({
    value: r.roomId,
    label: `Room ${r.roomNumber} (${r.roomType} · ${r.sharingType} Sharing) — ${r.totalBeds - r.occupiedBeds} beds free`
  }))

  const vacantBeds = selectedRoom ? selectedRoom.totalBeds - selectedRoom.occupiedBeds : 0

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <button onClick={() => navigate(-1)} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', color: 'var(--gray-500)',
          fontSize: 13, cursor: 'pointer', marginBottom: 20, padding: 0
        }}>
          <ArrowLeft size={16} /> Back
        </button>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Room Allocation — shown first so manager picks room before filling details */}
          <Card title="Room Allocation">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Select label="Select Floor" value={form.floorId}
                onChange={handleFloorChange} options={floorOptions}
                placeholder="Choose floor" required />
              <Select label="Select Room" value={form.roomId}
                onChange={handleRoomChange} options={roomOptions}
                placeholder={selectedFloor ? (availableRooms.length ? 'Choose room' : 'No rooms available') : 'Select floor first'}
                required disabled={!selectedFloor} />
            </div>

            {/* Floor availability summary */}
            {selectedFloor && rooms.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)', marginBottom: 8 }}>
                  FLOOR AVAILABILITY
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {rooms.map(r => {
                    const free = r.totalBeds - r.occupiedBeds
                    const isFull = free === 0
                    const isSelected = r.roomId === form.roomId
                    return (
                      <button key={r.roomId} type="button"
                        onClick={() => !isFull && handleRoomChange({ target: { value: r.roomId } })}
                        style={{
                          padding: '8px 14px', borderRadius: 8, border: `2px solid ${isSelected ? 'var(--primary)' : isFull ? 'var(--gray-200)' : '#C7D2FE'}`,
                          background: isSelected ? 'var(--primary)' : isFull ? 'var(--gray-100)' : 'var(--primary-light)',
                          color: isSelected ? '#fff' : isFull ? 'var(--gray-400)' : 'var(--primary)',
                          fontSize: 12, fontWeight: 600, cursor: isFull ? 'not-allowed' : 'pointer',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2
                        }}>
                        <span>Room {r.roomNumber}</span>
                        <span style={{ fontSize: 11, fontWeight: 400 }}>
                          {isFull ? 'Full' : `${free}/${r.totalBeds} free`}
                        </span>
                        <span style={{ fontSize: 10 }}>{r.roomType}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Selected room bed grid */}
            {selectedRoom && (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)', marginBottom: 8 }}>
                  BED AVAILABILITY — Room {selectedRoom.roomNumber}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                  {Array.from({ length: selectedRoom.totalBeds }, (_, i) => {
                    const isOccupied = i < selectedRoom.occupiedBeds
                    return (
                      <div key={i} style={{
                        width: 48, height: 48, borderRadius: 8, display: 'flex',
                        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        background: isOccupied ? '#FEE2E2' : '#D1FAE5',
                        border: `1px solid ${isOccupied ? '#FECACA' : '#A7F3D0'}`,
                        fontSize: 11, fontWeight: 600,
                        color: isOccupied ? 'var(--danger)' : 'var(--success)'
                      }}>
                        <BedDouble size={16} />
                        <span>{i + 1}</span>
                      </div>
                    )
                  })}
                </div>
                <div style={{ padding: '10px 14px', borderRadius: 8, background: vacantBeds > 0 ? 'var(--primary-light)' : '#FEE2E2', border: `1px solid ${vacantBeds > 0 ? '#C7D2FE' : '#FECACA'}` }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: vacantBeds > 0 ? 'var(--primary)' : 'var(--danger)' }}>
                    Room {selectedRoom.roomNumber} · {selectedRoom.sharingType} Sharing · {selectedRoom.roomType} ·{' '}
                    {vacantBeds > 0 ? `${vacantBeds} bed${vacantBeds > 1 ? 's' : ''} available` : 'No beds available'}
                  </span>
                </div>
              </div>
            )}
          </Card>

          <Card title="Personal Details" action={
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserPlus size={18} color="var(--primary)" />
            </div>
          }>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Input label="Full Name" name="tenantName" value={form.tenantName}
                onChange={handleChange} placeholder="Tenant name" required />
              <Input label="Mobile Number" name="tenantMobile" value={form.tenantMobile}
                onChange={handleChange} placeholder="10-digit mobile" required maxLength={10} />
              <Input label="Email" name="tenantEmail" type="email" value={form.tenantEmail}
                onChange={handleChange} placeholder="email@example.com" />
              <Input label="Aadhaar Number" name="aadhaarNumber" value={form.aadhaarNumber}
                onChange={handleChange} placeholder="12-digit Aadhaar" maxLength={12} />
              <Input label="Parent Mobile" name="parentMobile" value={form.parentMobile}
                onChange={handleChange} placeholder="Parent contact" maxLength={10} />
              <Input label="Occupation" name="occupation" value={form.occupation}
                onChange={handleChange} placeholder="Student / Employee" />
              <Select label="Food Preference" name="foodPreference"
                value={form.foodPreference} onChange={handleChange} options={foodOptions} />
            </div>
            <div style={{ marginTop: 16 }}>
              <Input label="Address" name="tenantAddress" value={form.tenantAddress}
                onChange={handleChange} placeholder="Permanent address" rows={2} />
            </div>
          </Card>

          <Card title="Rent & Dates">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Input label="Rent Amount (₹)" name="rentAmount" type="number"
                value={form.rentAmount} onChange={handleChange} placeholder="Monthly rent" required />
              <Input label="Deposit Amount (₹)" name="depositAmount" type="number"
                value={form.depositAmount} onChange={handleChange} placeholder="Security deposit" />
              <Input label="Join Date" name="joinDate" type="date"
                value={form.joinDate} onChange={handleChange} />
              <Input label="Bill Due Date" name="billDueDate" type="date"
                value={form.billDueDate} onChange={handleChange} />
            </div>
          </Card>

          <div style={{ display: 'flex', gap: 12 }}>
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" loading={loading} disabled={!form.roomId || vacantBeds === 0} fullWidth>
              Add Tenant
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
