import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Layers, DoorOpen, Users, Plus, LayoutDashboard, UserCog,
  BedDouble, UserCheck, Bell, ChevronDown, ChevronRight, Zap, BarChart2, Settings } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import api from '../../api/axios'

const sidebarItems = [
  { path: '/owner/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { path: '/owner/hostel', label: 'Hostel', icon: <Building2 size={18} /> },
  { path: '/owner/managers', label: 'Managers', icon: <UserCog size={18} /> },
  { path: '/owner/power', label: 'Power', icon: <Zap size={18} /> },
  { path: '/owner/reports', label: 'Reports', icon: <BarChart2 size={18} /> },
  { path: '/owner/settings', label: 'Settings', icon: <Settings size={18} /> },
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
        <span style={{ fontSize: 12, color: 'var(--gray-500)', marginLeft: 'auto' }}>{floor.rooms?.length || 0} rooms</span>
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
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-800)' }}>Room {room.roomNumber}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                    background: isFull ? '#FEE2E2' : '#D1FAE5',
                    color: isFull ? 'var(--danger)' : 'var(--success)'
                  }}>{isFull ? 'Full' : `${vacant} free`}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>{room.roomType} · {room.sharingType} Sharing</div>
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

export default function OwnerDashboard() {
  const [hostels, setHostels] = useState([])
  const [selectedHostelId, setSelectedHostelId] = useState(null)
  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Load all hostels on mount
  useEffect(() => {
    api.get('/owner/hostel/all')
      .then(r => {
        const list = r.data.data || []
        setHostels(list)
        if (list.length > 0) setSelectedHostelId(list[0].hostelId)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
    api.get('/owner/hostel/activity')
      .then(r => setActivity(r.data.data || []))
      .catch(() => {})
  }, [])

  // Load stats for selected hostel whenever it changes
  useEffect(() => {
    if (!selectedHostelId) return
    setStatsLoading(true)
    setStats(null)
    api.get(`/owner/hostel/dashboard?hostelId=${selectedHostelId}`)
      .then(r => setStats(r.data.data))
      .catch(() => {})
      .finally(() => setStatsLoading(false))
  }, [selectedHostelId])

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--gray-900)' }}>Dashboard</h1>
            <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>
              {hostels.length > 0 ? `${hostels.length} hostel${hostels.length > 1 ? 's' : ''} managed` : 'Your hostel overview'}
            </p>
          </div>
          <Button onClick={() => navigate('/owner/create-hostel')}>
            <Plus size={16} /> Add Hostel
          </Button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--gray-400)' }}>
            <div style={{ width: 32, height: 32, border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite', margin: '0 auto 12px' }} />
            Loading...
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : hostels.length === 0 ? (
          <Card>
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Building2 size={48} style={{ margin: '0 auto 16px', color: 'var(--gray-300)' }} />
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--gray-700)' }}>No hostel created yet</h3>
              <p style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 6, marginBottom: 20 }}>
                Set up your first hostel to start managing rooms and tenants
              </p>
              <Button onClick={() => navigate('/owner/create-hostel')}>
                <Plus size={16} /> Create Hostel
              </Button>
            </div>
          </Card>
        ) : (
          <>
            {/* Hostel selector tabs */}
            <Card title={`My Hostels (${hostels.length})`}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                {hostels.map(h => {
                  const isSelected = h.hostelId === selectedHostelId
                  return (
                    <div
                      key={h.hostelId}
                      onClick={() => setSelectedHostelId(h.hostelId)}
                      style={{
                        padding: '16px', borderRadius: 12, cursor: 'pointer',
                        border: `2px solid ${isSelected ? '#4F46E5' : '#E5E7EB'}`,
                        background: isSelected ? '#EEF2FF' : '#F9FAFB',
                        transition: 'all 0.15s',
                        boxShadow: isSelected ? '0 4px 12px rgba(79,70,229,0.15)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                          background: isSelected ? '#4F46E5' : '#E5E7EB',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <Building2 size={18} color={isSelected ? '#fff' : '#6B7280'} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {h.hostelName}
                          </div>
                          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {h.hostelAddress || 'No address'}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <span style={{
                          fontSize: 10, padding: '2px 8px', borderRadius: 4, fontWeight: 600,
                          background: h.isActive ? '#D1FAE5' : '#FEE2E2',
                          color: h.isActive ? '#065F46' : '#991B1B'
                        }}>
                          {h.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {isSelected && (
                          <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: '#EEF2FF', color: '#4F46E5', fontWeight: 600 }}>
                            ✓ Viewing
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Stats for selected hostel */}
            {statsLoading ? (
              <div style={{ textAlign: 'center', padding: 32, color: 'var(--gray-400)' }}>
                <div style={{ width: 28, height: 28, border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite', margin: '0 auto 8px' }} />
                Loading hostel data...
              </div>
            ) : stats ? (
              <>
                {/* Hostel name banner */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 18px', borderRadius: 12,
                  background: 'var(--primary-light)', border: '1px solid #C7D2FE'
                }}>
                  <Building2 size={20} color="var(--primary)" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary)' }}>{stats.hostelName}</div>
                    {stats.hostelAddress && (
                      <div style={{ fontSize: 12, color: '#6B7280', marginTop: 1 }}>{stats.hostelAddress}</div>
                    )}
                  </div>
                  {stats.hostelManagerName && (
                    <div style={{ fontSize: 12, color: '#6B7280' }}>
                      Manager: <strong style={{ color: 'var(--primary)' }}>{stats.hostelManagerName}</strong>
                    </div>
                  )}
                </div>

                {/* Hostel stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
                  <StatCard label="Total Floors" value={stats.totalFloors} icon={<Layers size={22} />} />
                  <StatCard label="Total Rooms" value={stats.totalRooms} icon={<DoorOpen size={22} />} color="#7C3AED" bg="#EDE9FE" />
                  <StatCard label="Vacant Rooms" value={stats.vacantRooms} icon={<DoorOpen size={22} />} color="var(--success)" bg="#D1FAE5" />
                  <StatCard label="Total Beds" value={stats.totalBeds} icon={<BedDouble size={22} />} color="#0891B2" bg="#E0F2FE" />
                  <StatCard label="Vacant Beds" value={stats.vacantBeds} icon={<BedDouble size={22} />} color="var(--success)" bg="#D1FAE5" />
                  <StatCard label="Occupied Beds" value={stats.occupiedBeds} icon={<BedDouble size={22} />} color="var(--danger)" bg="#FEE2E2" />
                </div>

                {/* Tenant stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
                  <StatCard label="Total Tenants" value={stats.totalTenants} icon={<Users size={22} />} />
                  <StatCard label="Active Tenants" value={stats.activeTenants} icon={<UserCheck size={22} />} color="var(--success)" bg="#D1FAE5" />
                  <StatCard label="Vacated" value={stats.vacatedTenants} icon={<Building2 size={22} />} color="var(--warning)" bg="#FEF3C7" />
                </div>

                {/* Hostel info + Activity */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
                  <Card title="Hostel Info">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <InfoItem label="Hostel Name" value={stats.hostelName} />
                      <InfoItem label="Address" value={stats.hostelAddress} />
                      <InfoItem label="Manager" value={stats.hostelManagerName || 'Not assigned'} />
                    </div>
                  </Card>
                  <Card title="Recent Activity" action={<Bell size={16} color="var(--primary)" />}>
                    {activity.length === 0 ? (
                      <p style={{ fontSize: 13, color: 'var(--gray-400)', textAlign: 'center', padding: '20px 0' }}>No recent activity</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 260, overflowY: 'auto' }}>
                        {activity.map(log => (
                          <div key={log.id} style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--gray-50)', border: '1px solid var(--gray-100)' }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-800)', marginBottom: 2 }}>{log.action.replace(/_/g, ' ')}</div>
                            <div style={{ fontSize: 11, color: 'var(--gray-500)', marginBottom: 4 }}>{log.description}</div>
                            <div style={{ fontSize: 10, color: 'var(--gray-400)' }}>By {log.performedBy} · {new Date(log.createdAt).toLocaleString()}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </div>

                {/* Hostel Structure */}
                {stats.floors?.length > 0 && (
                  <Card title={`Hostel Structure — ${stats.hostelName}`}>
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
              </>
            ) : null}
          </>
        )}
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
