import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { HostelProvider } from './context/HostelContext'

import Login from './pages/Login'
import AdminDashboard from './pages/admin/AdminDashboard'
import CreateOwner from './pages/admin/CreateOwner'
import OwnerDashboard from './pages/owner/OwnerDashboard'
import CreateHostel from './pages/owner/CreateHostel'
import HostelStructure from './pages/owner/HostelStructure'
import Managers from './pages/owner/Managers'
import Power from './pages/owner/Power'
import OwnerReports from './pages/owner/Reports'
import OwnerSettings from './pages/owner/Settings'
import ManagerDashboard from './pages/manager/ManagerDashboard'
import AddTenant from './pages/manager/AddTenant'
import TenantList from './pages/manager/TenantList'
import Billing from './pages/manager/Billing'
import BillingV2 from './pages/manager/BillingV2'
import ManagerPower from './pages/manager/Power'
import Complaints from './pages/manager/Complaints'
import TenantTransfer from './pages/manager/TenantTransfer'
import ManagerReports from './pages/manager/Reports'
import ManagerFoodPoll from './pages/manager/FoodPoll'
import OwnerFoodPoll from './pages/owner/FoodPoll'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ width: 32, height: 32, border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={
        user.role === 'SUPER_ADMIN' ? '/admin/dashboard' :
        user.role === 'OWNER' ? '/owner/dashboard' : '/manager/dashboard'
      } /> : <Login />} />

      {/* Super Admin */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute roles={['SUPER_ADMIN']}><AdminDashboard /></ProtectedRoute>
      } />
      <Route path="/admin/owner" element={
        <ProtectedRoute roles={['SUPER_ADMIN']}><AdminDashboard /></ProtectedRoute>
      } />
      <Route path="/admin/create-owner" element={
        <ProtectedRoute roles={['SUPER_ADMIN']}><CreateOwner /></ProtectedRoute>
      } />

      {/* Owner */}
      <Route path="/owner/dashboard" element={
        <ProtectedRoute roles={['OWNER']}><OwnerDashboard /></ProtectedRoute>
      } />
      <Route path="/owner/hostel" element={
        <ProtectedRoute roles={['OWNER']}><HostelStructure /></ProtectedRoute>
      } />
      <Route path="/owner/create-hostel" element={
        <ProtectedRoute roles={['OWNER']}><CreateHostel /></ProtectedRoute>
      } />
      <Route path="/owner/managers" element={
        <ProtectedRoute roles={['OWNER']}><Managers /></ProtectedRoute>
      } />
      <Route path="/owner/power" element={
        <ProtectedRoute roles={['OWNER']}><Power /></ProtectedRoute>
      } />
      <Route path="/owner/reports" element={
        <ProtectedRoute roles={['OWNER']}><OwnerReports /></ProtectedRoute>
      } />
      <Route path="/owner/settings" element={
        <ProtectedRoute roles={['OWNER']}><OwnerSettings /></ProtectedRoute>
      } />
      <Route path="/owner/food-poll" element={
        <ProtectedRoute roles={['OWNER']}><OwnerFoodPoll /></ProtectedRoute>
      } />

      {/* Manager */}
      <Route path="/manager/dashboard" element={
        <ProtectedRoute roles={['MANAGER']}><ManagerDashboard /></ProtectedRoute>
      } />
      <Route path="/manager/tenants" element={
        <ProtectedRoute roles={['MANAGER']}><TenantList /></ProtectedRoute>
      } />
      <Route path="/manager/add-tenant" element={
        <ProtectedRoute roles={['MANAGER']}><AddTenant /></ProtectedRoute>
      } />
      <Route path="/manager/billing" element={
        <ProtectedRoute roles={['MANAGER']}><BillingV2 /></ProtectedRoute>
      } />
      <Route path="/manager/billing-legacy" element={
        <ProtectedRoute roles={['MANAGER']}><Billing /></ProtectedRoute>
      } />
      <Route path="/manager/power" element={
        <ProtectedRoute roles={['MANAGER']}><ManagerPower /></ProtectedRoute>
      } />
      <Route path="/manager/complaints" element={
        <ProtectedRoute roles={['MANAGER']}><Complaints /></ProtectedRoute>
      } />
      <Route path="/manager/transfer" element={
        <ProtectedRoute roles={['MANAGER']}><TenantTransfer /></ProtectedRoute>
      } />
      <Route path="/manager/reports" element={
        <ProtectedRoute roles={['MANAGER']}><ManagerReports /></ProtectedRoute>
      } />
      <Route path="/manager/food-poll" element={
        <ProtectedRoute roles={['MANAGER']}><ManagerFoodPoll /></ProtectedRoute>
      } />

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <HostelProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { fontFamily: 'Inter, sans-serif', fontSize: 13, borderRadius: 10 },
            success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } }
          }}
        />
      </HostelProvider>
    </AuthProvider>
  )
}
