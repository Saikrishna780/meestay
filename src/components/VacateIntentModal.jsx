import { useState } from 'react'
import { X } from 'lucide-react'

// Default vacate date: today + 30 days
function defaultVacateDate() {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d.toISOString().split('T')[0]
}

export default function VacateIntentModal({ tenant, onClose, onSubmit }) {
  const [vacateDate, setVacateDate] = useState(defaultVacateDate())
  const [vacateReason, setVacateReason] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!vacateDate) return
    setLoading(true)
    try {
      await onSubmit(tenant.tenantId, vacateDate, vacateReason || undefined)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 440,
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Record Vacate Intent</h2>
            <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>{tenant.tenantName} · Room {tenant.roomId}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Vacate Date <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <input
              type="date"
              value={vacateDate}
              onChange={e => setVacateDate(e.target.value)}
              required
              min={new Date().toISOString().split('T')[0]}
              style={{
                width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB',
                borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Reason (optional)
            </label>
            <textarea
              value={vacateReason}
              onChange={e => setVacateReason(e.target.value)}
              placeholder="Enter reason for vacating..."
              rows={3}
              style={{
                width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB',
                borderRadius: 10, fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" onClick={onClose}
              style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid #E5E7EB', background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#6B7280' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading}
              style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: '#F59E0B', color: '#fff', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Saving...' : 'Record Intent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
