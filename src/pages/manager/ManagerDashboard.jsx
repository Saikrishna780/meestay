import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Plus, Building2, LayoutDashboard, UserCheck, Layers, DoorOpen, BedDouble, ChevronDown, ChevronRight, IndianRupee, Zap, AlertCircle, ArrowRightLeft, BarChart2 } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/ui/Card'
import StatCard from '../../components/ui/StatCard'
import Button from '../../components/ui/Button'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
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

function FloorRow({ floor }) {
  const [open, setOpen] = useState(true)
  return (
    <div style={{ marginBottom: 8 }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
        padding: '10px 14px', borderRadius: 8,
        background: 'var(--primary-light)', border: '1px solid #C7D2FE',
        cursor: 'pointer', marginBottom: open ? 6 : 0
      }}>
        {open ? <ChevronDown size={15} color="var(--primary)" /> : <ChevronRight size={15} color="var(--primary)" />}
        <Layers size={14} color="var(--primary)" />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>Floor {floor.floorNumber}</span>
        <span style={{ fontSize: 12, color: 'var(--gray-500)', marginLeft: 'auto' }}>
          {floor.rooms?.length || 0} rooms
        </span>
      </button>
      {open && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8, paddingLeft: 8 }}>
          {floor.rooms?.map(room => {
            const vacant = room.vacantBeds
            const isFull = vacant === 0
            return (
              <div key={room.roomId} style={{
                padding: '10px 14px', borderRadius: 8,
                border: `1px solid ${isFull ? '#FECACA' : '#A7F3D0'}`,
                background: isFull ? '#FEF2F2' : '#F0FDF4'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-800)' }}>
                    Room {room.roomNumber}
                  </span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                    background: isFull ? '#FEE2E2' : '#D1FAE5',
                    color: isFull ? 'var(--danger)' : 'var(--success)'
                  }}>
                    {isFull ? 'Full' : `${vacant} free`}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>
                  {room.roomType} · {room.sharingType} Sharing
                </div>
                <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                  {Array.from({ length: room.totalBeds }, (_, i) => (
                    <div key={i} style={{
                      width: 20, height: 20, borderRadius: 4,
                      background: i < room.occupiedBeds ? '#FCA5A5' : '#6EE7B7',
                      border: `1px solid ${i < room.occupiedBeds ? '#F87171' : '#34D399'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 9, fontWeight: 700,
                      color: i < room.occupiedBeds ? '#991B1B' : '#065F46'
                    }}>{i + 1}</div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function ManagerDashboard() {
  const [stats, setStats] = useState(null)
  const [tenants, setTenants] = useState([])
  const { user } = useAuth()
  const { selectedHostelId } = useHostel()
  const navigate = useNavigate()

  useEffect(() => {
    const hostelParam = selectedHostelId ? `?hostelId=${selectedHostelId}` : ''
    api.get(`/manager/dashboard/stats${hostelParam}`).then(r => setStats(r.data.data)).catch(() => {})
    api.get('/manager/tenants').then(r => setTenants(r.data.data || [])).catch(() => {})
  }, [selectedHostelId])

  const active = tenants.filter(t => t.isActive).length
  const vacated = tenants.length - active

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--gray-900)' }}>
              Welcome, {user?.name}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>
              {stats?.hostelName || 'Manager Dashboard'}
            </p>
          </div>
          <Button onClick={() => navigate('/manager/add-tenant')}>
            <Plus size={16} /> Add Tenant
          </Button>
        </div>

        {/* Hostel stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
          <StatCard label="Total Floors" value={stats?.totalFloors ?? '—'}
            icon={<Layers size={22} />} color="var(--primary)" bg="var(--primary-light)" />
          <StatCard label="Total Rooms" value={stats?.totalRooms ?? '—'}
            icon={<DoorOpen size={22} />} color="#7C3AED" bg="#EDE9FE" />
          <StatCard label="Vacant Rooms" value={stats?.vacantRooms ?? '—'}
            icon={<DoorOpen size={22} />} color="var(--success)" bg="#D1FAE5" />
          <StatCard label="Total Beds" value={stats?.totalBeds ?? '—'}
            icon={<BedDouble size={22} />} color="#0891B2" bg="#E0F2FE" />
          <StatCard label="Vacant Beds" value={stats?.vacantBeds ?? '—'}
            icon={<BedDouble size={22} />} color="var(--success)" bg="#D1FAE5" />
          <StatCard label="Occupied Beds" value={stats?.occupiedBeds ?? '—'}
            icon={<BedDouble size={22} />} color="var(--danger)" bg="#FEE2E2" />
        </div>

        {/* Tenant stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
          <StatCard label="Total Tenants" value={tenants.length} icon={<Users size={22} />} />
          <StatCard label="Active Tenants" value={active}
            icon={<UserCheck size={22} />} color="var(--success)" bg="#D1FAE5" />
          <StatCard label="Vacated" value={vacated}
            icon={<Building2 size={22} />} color="var(--warning)" bg="#FEF3C7" />
        </div>

        {/* Hostel info */}
        {stats && (
          <Card title="Hostel Info">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <InfoItem label="Hostel Name" value={stats.hostelName} />
              <InfoItem label="Address" value={stats.hostelAddress} />
            </div>
          </Card>
        )}

        {/* Floor / Room / Bed structure */}
        {stats?.floors?.length > 0 && (
          <Card title="Hostel Structure — Availability">
            <div style={{ marginBottom: 10, display: 'flex', gap: 16, fontSize: 12 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 14, height: 14, borderRadius: 3, background: '#6EE7B7', display: 'inline-block' }} /> Available
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 14, height: 14, borderRadius: 3, background: '#FCA5A5', display: 'inline-block' }} /> Occupied
              </span>
            </div>
            {stats.floors.map(floor => <FloorRow key={floor.floorId} floor={floor} />)}
          </Card>
        )}

        {/* Filled Rooms tab */}
        {stats?.floors?.length > 0 && (() => {
          const filledRooms = stats.floors.flatMap(f =>
            (f.rooms || []).filter(r => r.vacantBeds === 0).map(r => ({ ...r, floorNumber: f.floorNumber }))
          )
          return filledRooms.length > 0 ? (
            <Card title={`Filled Rooms (${filledRooms.length})`} action={
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: '#FEE2E2', color: 'var(--danger)' }}>
                All beds occupied
              </span>
            }>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
                {filledRooms.map(room => (
                  <div key={room.roomId} style={{
                    padding: '12px 14px', borderRadius: 8,
                    border: '1px solid #FECACA', background: '#FEF2F2'
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--danger)', marginBottom: 4 }}>
                      Room {room.roomNumber}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>
                      Floor {room.floorNumber} · {room.roomType}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>
                      {room.sharingType} Sharing · {room.totalBeds}/{room.totalBeds} beds full
                    </div>
                    <div style={{ marginTop: 6, display: 'flex', gap: 4 }}>
                      {Array.from({ length: room.totalBeds }, (_, i) => (
                        <div key={i} style={{
                          width: 18, height: 18, borderRadius: 3,
                          background: '#FCA5A5', border: '1px solid #F87171',
                          fontSize: 9, fontWeight: 700, color: '#991B1B',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>{i + 1}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ) : null
        })()}
      </div>
    </DashboardLayout>
  )
}

function InfoItem({ label, value }) {
  return (
    <div style={{ padding: '12px 16px', background: 'var(--gray-50)', borderRadius: 8, border: '1px solid var(--gray-100)' }}>
      <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 500, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, color: 'var(--gray-800)', fontWeight: 500 }}>{value || '—'}</div>
    </div>
  )
}
