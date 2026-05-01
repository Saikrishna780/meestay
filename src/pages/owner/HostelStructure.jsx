import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronDown, Building2, Layers, DoorOpen, Bed,
  LayoutDashboard, Hotel, UserCog, Zap, BarChart2, Settings, Plus, ChevronDown as CD } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
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

function RoomNode({ room }) {
  const available = room.totalBeds - room.occupiedBeds
  return (
    <div style={{
      marginLeft: 32, padding: '10px 14px', borderRadius: 8,
      background: '#fff', border: '1px solid var(--gray-200)',
      marginBottom: 6, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: 12
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <DoorOpen size={15} color="var(--primary)" />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-800)' }}>
          Room {room.roomNumber}
        </span>
        <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>
          {room.sharingType} Sharing · {room.roomType}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>
          <Bed size={12} style={{ display: 'inline', marginRight: 4 }} />
          {room.occupiedBeds}/{room.totalBeds}
        </span>
        <Badge
          label={available > 0 ? `${available} Available` : 'Full'}
          variant={available > 0 ? 'success' : 'danger'}
        />
      </div>
    </div>
  )
}

function FloorNode({ floor }) {
  const [open, setOpen] = useState(true)
  return (
    <div style={{ marginBottom: 8 }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px', borderRadius: 8, width: '100%',
        background: 'var(--primary-light)', border: '1px solid #C7D2FE',
        cursor: 'pointer', marginBottom: open ? 8 : 0
      }}>
        {open ? <ChevronDown size={16} color="var(--primary)" /> : <ChevronRight size={16} color="var(--primary)" />}
        <Layers size={15} color="var(--primary)" />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>
          Floor {floor.floorNumber}
        </span>
        <span style={{ fontSize: 12, color: 'var(--gray-500)', marginLeft: 'auto' }}>
          {floor.rooms?.length || 0} rooms
        </span>
      </button>
      {open && floor.rooms?.map(room => <RoomNode key={room.roomId} room={room} />)}
    </div>
  )
}

export default function HostelStructure() {
  const [hostels, setHostels] = useState([])
  const [selectedHostelId, setSelectedHostelId] = useState(null)
  const [structure, setStructure] = useState(null)
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState({ vacateNoticeDays: 7, extraStayDailyFee: 0 })
  const [saving, setSaving] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const navigate = useNavigate()

  // Load all hostels on mount
  useEffect(() => {
    api.get('/owner/hostel/all')
      .then(r => {
        const list = r.data.data || []
        setHostels(list)
        if (list.length > 0) setSelectedHostelId(list[0].hostelId)
      })
      .catch(() => toast.error('Failed to load hostels'))
  }, [])

  // Load structure when selected hostel changes
  useEffect(() => {
    if (!selectedHostelId) return
    setLoading(true)
    setStructure(null)
    api.get(`/owner/hostel/structure?hostelId=${selectedHostelId}`)
      .then(r => setStructure(r.data.data))
      .catch(() => toast.error('Failed to load hostel structure'))
      .finally(() => setLoading(false))
    api.get('/owner/hostel/settings')
      .then(r => {
        if (r.data.data) {
          setSettings({
            vacateNoticeDays: r.data.data.vacateNoticeDays ?? 7,
            extraStayDailyFee: r.data.data.extraStayDailyFee ?? 0
          })
        }
      })
      .catch(() => {})
  }, [selectedHostelId])

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      await api.put('/owner/hostel/settings', settings)
      toast.success('Settings saved successfully!')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const selectedHostel = hostels.find(h => h.hostelId === selectedHostelId)

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Header with hostel switcher + Add Hostel button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--gray-900)' }}>Hostel Structure</h1>
            <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 2 }}>
              Visual tree of your hostel layout
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Hostel Switcher Dropdown */}
            {hostels.length > 0 && (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowDropdown(d => !d)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '9px 14px', borderRadius: 10,
                    border: '1px solid var(--gray-200)', background: '#fff',
                    fontSize: 13, fontWeight: 600, color: 'var(--gray-800)',
                    cursor: 'pointer', minWidth: 200
                  }}
                >
                  <Building2 size={15} color="var(--primary)" />
                  <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedHostel?.hostelName || 'Select Hostel'}
                  </span>
                  <CD size={14} color="var(--gray-400)" />
                </button>

                {showDropdown && (
                  <div style={{
                    position: 'absolute', top: '110%', left: 0, right: 0,
                    background: '#fff', borderRadius: 10, border: '1px solid var(--gray-200)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 100, overflow: 'hidden'
                  }}>
                    {hostels.map(h => (
                      <button
                        key={h.hostelId}
                        onClick={() => { setSelectedHostelId(h.hostelId); setShowDropdown(false) }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          width: '100%', padding: '10px 14px', border: 'none',
                          background: h.hostelId === selectedHostelId ? 'var(--primary-light)' : '#fff',
                          color: h.hostelId === selectedHostelId ? 'var(--primary)' : 'var(--gray-800)',
                          fontSize: 13, fontWeight: h.hostelId === selectedHostelId ? 600 : 400,
                          cursor: 'pointer', textAlign: 'left'
                        }}
                      >
                        <Building2 size={14} />
                        <div>
                          <div>{h.hostelName}</div>
                          {h.hostelAddress && (
                            <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 1 }}>
                              {h.hostelAddress.substring(0, 40)}{h.hostelAddress.length > 40 ? '...' : ''}
                            </div>
                          )}
                        </div>
                        {!h.isActive && (
                          <span style={{ marginLeft: 'auto', fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#FEE2E2', color: '#991B1B' }}>
                            Inactive
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Add Hostel Button */}
            <button
              onClick={() => navigate('/owner/create-hostel')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 18px', borderRadius: 10, border: 'none',
                background: 'var(--primary)', color: '#fff',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(79,70,229,0.3)'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-dark)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--primary)'}
            >
              <Plus size={15} /> Add Hostel
            </button>
          </div>
        </div>

        {/* Hostel count badge */}
        {hostels.length > 1 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {hostels.map(h => (
              <button
                key={h.hostelId}
                onClick={() => setSelectedHostelId(h.hostelId)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 20, border: 'none',
                  background: h.hostelId === selectedHostelId ? 'var(--primary)' : 'var(--gray-100)',
                  color: h.hostelId === selectedHostelId ? '#fff' : 'var(--gray-600)',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer'
                }}
              >
                <Building2 size={12} />
                {h.hostelName}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--gray-400)' }}>
            <div style={{ width: 32, height: 32, border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite', margin: '0 auto 12px' }} />
            Loading hostel structure...
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : structure ? (
          <>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'var(--primary-light)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center'
                }}>
                  <Building2 size={22} color="var(--primary)" />
                </div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--gray-900)' }}>
                    {structure.hostelName}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{structure.hostelAddress}</div>
                </div>
              </div>
              {structure.floors?.length > 0
                ? structure.floors.map(floor => <FloorNode key={floor.floorId} floor={floor} />)
                : <p style={{ color: 'var(--gray-400)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No floors added yet.</p>
              }
            </Card>

            {/* Hostel Settings */}
            <Card title="Hostel Settings">
              <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 20 }}>
                Configure policies for your hostel. These settings apply to all tenants.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ padding: '16px', borderRadius: 10, background: '#FEF3C7', border: '1px solid #FDE68A' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 20 }}>📋</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#92400E' }}>Vacate Notice Period</div>
                      <div style={{ fontSize: 12, color: '#B45309' }}>Days tenant must inform before vacating</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input type="number" min="1" max="90" value={settings.vacateNoticeDays}
                      onChange={e => setSettings(s => ({ ...s, vacateNoticeDays: parseInt(e.target.value) || 1 }))}
                      style={{ width: 80, padding: '8px 12px', borderRadius: 8, border: '2px solid #FCD34D', fontSize: 18, fontWeight: 700, textAlign: 'center', outline: 'none', background: '#fff', color: '#92400E' }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#92400E' }}>days</span>
                  </div>
                </div>

                <div style={{ padding: '16px', borderRadius: 10, background: '#EDE9FE', border: '1px solid #DDD6FE' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 20 }}>💰</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#5B21B6' }}>Extra Stay Daily Fee</div>
                      <div style={{ fontSize: 12, color: '#7C3AED' }}>Per day charge if tenant stays beyond notice</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#5B21B6' }}>₹</span>
                    <input type="number" min="0" value={settings.extraStayDailyFee}
                      onChange={e => setSettings(s => ({ ...s, extraStayDailyFee: parseFloat(e.target.value) || 0 }))}
                      style={{ width: 100, padding: '8px 12px', borderRadius: 8, border: '2px solid #C4B5FD', fontSize: 18, fontWeight: 700, textAlign: 'center', outline: 'none', background: '#fff', color: '#5B21B6' }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#5B21B6' }}>/ day</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={handleSaveSettings} disabled={saving} style={{
                  padding: '10px 24px', borderRadius: 10, border: 'none',
                  background: saving ? 'var(--gray-300)' : 'linear-gradient(135deg, var(--primary), #7C3AED)',
                  color: '#fff', fontSize: 14, fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  boxShadow: saving ? 'none' : '0 4px 12px rgba(79,70,229,0.3)'
                }}>
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </Card>
          </>
        ) : (
          <Card>
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gray-400)' }}>
              <Building2 size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <p style={{ marginBottom: 16 }}>No hostel found. Create your first hostel.</p>
              <button onClick={() => navigate('/owner/create-hostel')} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '10px 20px', borderRadius: 10, border: 'none',
                background: 'var(--primary)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer'
              }}>
                <Plus size={15} /> Add Hostel
              </button>
            </div>
          </Card>
        )}
      </div>

      {/* Close dropdown on outside click */}
      {showDropdown && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setShowDropdown(false)} />
      )}
    </DashboardLayout>
  )
}
