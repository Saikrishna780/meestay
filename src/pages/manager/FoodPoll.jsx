import { LayoutDashboard, UserCheck, IndianRupee, Zap, UtensilsCrossed, AlertCircle, ArrowRightLeft, BarChart2 } from 'lucide-react'
import { ManagerFoodPollPage } from '../shared/FoodPoll'

const sidebarItems = [
  { path: '/manager/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { path: '/manager/tenants', label: 'Tenants', icon: <UserCheck size={18} /> },
  { path: '/manager/billing', label: 'Billing', icon: <IndianRupee size={18} /> },
  { path: '/manager/power', label: 'Power', icon: <Zap size={18} /> },
  { path: '/manager/complaints', label: 'Complaints', icon: <AlertCircle size={18} /> },
  { path: '/manager/transfer', label: 'Transfer', icon: <ArrowRightLeft size={18} /> },
  { path: '/manager/food-poll', label: 'Food Poll', icon: <UtensilsCrossed size={18} /> },
  { path: '/manager/reports', label: 'Reports', icon: <BarChart2 size={18} /> },
]

export default function ManagerFoodPoll() {
  return <ManagerFoodPollPage sidebarItems={sidebarItems} />
}
