import { useEffect, useState } from 'react'
import { LayoutDashboard, UserCheck, IndianRupee, Zap, ArrowRightLeft, AlertCircle, BarChart2 } from 'lucide-react'
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

export default function TenantTransfer() {
  const [tenants, setTenants] = useState([])
  const [floors, setFloors] = useState([])
  const [rooms, setRooms] = useState([])
  const [transfers, setTransfers] = useState([])
  const [form, setForm] = useState({ tenantId: '', newRoomId: '', reason: '' })
  const [selectedFloor, setSelectedFloor] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/manager/tenants').then(r => setTenants((r.data.data || []).filter(t => t.isActive)))
    api.get('/manager/hostel/floors').then(r => setFloors(r.data.data || []))
    api.get('/manager/transfers').then(r => setTransfers(r.data.data || [])).catch(() => {})
  }, [])

  const handleFloorChange = async e => {
    const floorId = e.target.value
    setSelectedFloor(floorId)
    setForm(f => ({ ...f, newRoomId: '' }))
    if (floorId) {
      const r = await api.get(`/manager/hostel/rooms/${floorId}`)
      setRooms((r.data.data || []).filter(rm => rm.totalBeds - rm.occupiedBeds > 0))
    }
  }

  const handleTransfer = async e => {
    e.preventDefault()
    if (!form.tenantId || !form.newRoomId) return toast.error('Select tenant and target room')
    setLoading(true)
    try {
      await api.post(`/manager/tenants/${form.tenantId}/transfer`, {
        newRoomId: form.newRoomId,
        reason: form.reason
      })
      toast.success('Tenant transferred successfully')
      setForm({ tenantId: '', newRoomId: '', reason: '' })
      setSelectedFloor('')
      setRooms([])
      // Refresh
      api.get('/manager/tenants').then(r => setTenants((r.data.data || []).filter(t => t.isActive)))
      api.get('/manager/transfers').then(r => setTransfers(r.data.data || []))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transfer failed')
    } finally { setLoading(false) }
  }

  const selectedTenant = tenants.find(t => t.tenantId === form.tenantId)

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>Tenant Transfer</h1>
          <p style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>Move a tenant to a different room/bed</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <Card title="Transfer Tenant">
            <form onSubmit={handleTransfer} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Select Tenant *</label>
                <select value={form.tenantId} onChange={e => setForm(f => ({ ...f, tenantId: e.target.value }))}
                  required style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 13 }}>
                  <option value="">Choose active tenant...</option>
                  {tenants.map(t => (
                    <option key={t.tenantId} value={t.tenantId}>
                      {t.tenantName} — Room {t.roomId}
                    </option>
                  ))}
                </select>
              </div>

              {selectedTenant && (
                <div style={{ padding: '10px 14px', borderRadius: 8, background: '#EEF2FF', border: '1px solid #C7D2FE', fontSize: 13 }}>
                  <div style={{ fontWeight: 600, color: '#4338CA' }}>{selectedTenant.tenantName}</div>
                  <div style={{ color: '#6B7280', marginTop: 2 }}>Current: Room {selectedTenant.roomId} · Bed {selectedTenant.bedId}</div>
                </div>
              )}

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Target Floor *</label>
                <select value={selectedFloor} onChange={handleFloorChange}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 13 }}>
                  <option value="">Choose floor...</option>
                  {floors.map(f => <option key={f.floorId} value={f.floorId}>Floor {f.floorNumber}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Target Room *</label>
                <select value={form.newRoomId} onChange={e => setForm(f => ({ ...f, newRoomId: e.target.value }))}
                  required disabled={!selectedFloor}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 13 }}>
                  <option value="">{selectedFloor ? 'Choose available room...' : 'Select floor first'}</option>
                  {rooms.map(r => (
                    <option key={r.roomId} value={r.roomId}>
                      Room {r.roomNumber} — {r.totalBeds - r.occupiedBeds} beds free ({r.roomType})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Reason</label>
                <textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                  placeholder="Reason for transfer..." rows={2}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 13, resize: 'vertical' }} />
              </div>

              <button type="submit" disabled={loading || !form.tenantId || !form.newRoomId}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', borderRadius: 8, border: 'none',
                  background: !form.tenantId || !form.newRoomId ? '#D1D5DB' : '#4F46E5', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                <ArrowRightLeft size={15} /> {loading ? 'Transferring...' : 'Transfer Tenant'}
              </button>
            </form>
          </Card>

          <Card title={`Transfer History (${transfers.length})`}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 400, overflowY: 'auto' }}>
              {transfers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 32, color: '#9CA3AF' }}>No transfers yet</div>
              ) : transfers.map(t => (
                <div key={t.transferId} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#F9FAFB' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 4 }}>{t.tenantName}</div>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>
                    Room {t.fromRoomId} → Room {t.toRoomId}
                  </div>
                  {t.reason && <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2, fontStyle: 'italic' }}>{t.reason}</div>}
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
                    {t.transferDate} · by {t.performedBy}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
