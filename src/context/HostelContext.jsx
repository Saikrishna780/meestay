import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'
import { useAuth } from './AuthContext'

const HostelContext = createContext(null)

export function HostelProvider({ children }) {
  const { user } = useAuth()
  const [hostels, setHostels] = useState([])
  const [selectedHostelId, setSelectedHostelId] = useState(null)
  const [selectedHostel, setSelectedHostel] = useState(null)
  const [assignedHostelId, setAssignedHostelId] = useState(null) // manager's fixed hostel
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user || user.role !== 'MANAGER') return
    setLoading(true)
    api.get('/manager/my-hostel')
      .then(r => {
        const data = r.data.data
        const list = data.hostels || []
        setHostels(list)

        // Manager's assigned hostel — this is their primary hostel
        const assigned = data.assignedHostelId && data.assignedHostelId !== ''
          ? data.assignedHostelId
          : list[0]?.hostelId

        setAssignedHostelId(assigned)
        setSelectedHostelId(assigned)
        setSelectedHostel(list.find(h => h.hostelId === assigned) || null)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  const selectHostel = (hostelId) => {
    // Managers can only view their assigned hostel — prevent switching
    if (user?.role === 'MANAGER' && hostelId !== assignedHostelId) return
    setSelectedHostelId(hostelId)
    setSelectedHostel(hostels.find(h => h.hostelId === hostelId) || null)
  }

  return (
    <HostelContext.Provider value={{
      hostels,
      selectedHostelId,
      selectedHostel,
      assignedHostelId,
      selectHostel,
      loading
    }}>
      {children}
    </HostelContext.Provider>
  )
}

export const useHostel = () => useContext(HostelContext)
