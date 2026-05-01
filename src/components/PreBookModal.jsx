import { useState } from 'react'
import { X } from 'lucide-react'

const FOOD_OPTIONS = ['Veg', 'Non-Veg', 'Eggetarian']

export default function PreBookModal({ vacatingTenant, onClose, onSubmit }) {
  // Pre-fill join date as vacate_date + 1
  const joinDateDefault = (() => {
    if (!vacatingTenant?.vacateDate) return ''
    const d = new Date(vacatingTenant.vacateDate)
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  })()

  const [form, setForm] = useState({
    roomId: vacatingTenant?.roomId || '',
    tenantName: '',
    tenantMobile: '',
    tenantEmail: '',
    depositAmount: '',
    rentAmount: vacatingTenant?.rentAmount || '',
    joinDate: joinDateDefault,
    foodPreference: 'Veg',
  })
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit({
        ...form,
        depositAmount: form.depositAmount ? parseFloat(form.depositAmount) : null,
        rentAmount: parseFloat(form.rentAmount),
      })
    } finally {
      setLoading(false)
    }
  }

  const field = (label, key, type = 'text', required = false, extra = {}) => (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
        {label} {required && <span style={{ color: '#DC2626' }}>*</span>}
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={e => set(key, e.target.value)}
        required={required}
        style={{
          width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB',
          borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box'
        }}
        {...extra}
      />
    </div>
  )

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, overflowY: 'auto', padding: 20
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 520,
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>Pre-book Room</h2>
            <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
              Room {vacatingTenant?.roomId} · Vacating on {vacatingTenant?.vacateDate}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {field('Tenant Name', 'tenantName', 'text', true)}
            {field('Mobile', 'tenantMobile', 'tel', true)}
            {field('Email', 'tenantEmail', 'email')}
            {field('Deposit Amount', 'depositAmount', 'number', false, { min: 0, step: '0.01' })}
            {field('Rent Amount', 'rentAmount', 'number', true, { min: 0, step: '0.01' })}
            {field('Join Date', 'joinDate', 'date', true)}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Food Preference
            </label>
            <select
              value={form.foodPreference}
              onChange={e => set('foodPreference', e.target.value)}
              style={{
                width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB',
                borderRadius: 10, fontSize: 14, outline: 'none', background: '#fff'
              }}
            >
              {FOOD_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" onClick={onClose}
              style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid #E5E7EB', background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#6B7280' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading}
              style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: '#3B82F6', color: '#fff', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Saving...' : 'Create Pre-booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
