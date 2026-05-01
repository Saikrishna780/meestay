import { LayoutDashboard, Building2, UserCog, Zap, UtensilsCrossed, BarChart2, Settings } from 'lucide-react'
import { OwnerFoodPollPage } from '../shared/FoodPoll'

const sidebarItems = [
  { path: '/owner/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { path: '/owner/hostel', label: 'Hostel', icon: <Building2 size={18} /> },
  { path: '/owner/managers', label: 'Managers', icon: <UserCog size={18} /> },
  { path: '/owner/power', label: 'Power', icon: <Zap size={18} /> },
  { path: '/owner/food-poll', label: 'Food Poll', icon: <UtensilsCrossed size={18} /> },
  { path: '/owner/reports', label: 'Reports', icon: <BarChart2 size={18} /> },
  { path: '/owner/settings', label: 'Settings', icon: <Settings size={18} /> },
]

export default function OwnerFoodPoll() {
  return <OwnerFoodPollPage sidebarItems={sidebarItems} />
}
