import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus, ArrowLeft, LayoutDashboard, UserCog } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const sidebarItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { path: '/admin/owner', label: 'Owner Details', icon: <UserCog size={18} /> },
]

export default function CreateOwner() {
  const [form, setForm] = useState({ ownerName: '', ownerMobile: '', ownerEmail: '', password: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/admin/owner', form)
      toast.success('Hostel owner created successfully!')
      navigate('/admin/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create owner')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <button onClick={() => navigate(-1)} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', color: 'var(--gray-500)',
          fontSize: 13, cursor: 'pointer', marginBottom: 20, padding: 0
        }}>
          <ArrowLeft size={16} /> Back
        </button>

        <Card title="Create Hostel Owner" action={
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--primary-light)', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
          }}>
            <UserPlus size={18} color="var(--primary)" />
          </div>
        }>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Input label="Full Name" name="ownerName" value={form.ownerName}
              onChange={handleChange} placeholder="Enter owner name" required />
            <Input label="Mobile Number" name="ownerMobile" type="tel"
              value={form.ownerMobile} onChange={handleChange}
              placeholder="10-digit mobile number" required />
            <Input label="Email Address" name="ownerEmail" type="email"
              value={form.ownerEmail} onChange={handleChange}
              placeholder="owner@example.com" required />
            <Input label="Password" name="password" type="password"
              value={form.password} onChange={handleChange}
              placeholder="Min 6 characters" required />
            <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
              <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
              <Button type="submit" loading={loading} fullWidth>Create Owner</Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  )
}
