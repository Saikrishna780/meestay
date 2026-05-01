import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Support both old 'token' key and new 'accessToken' key for backward compat
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      // Migrate old 'token' key to 'accessToken'
      if (!localStorage.getItem('accessToken') && localStorage.getItem('token')) {
        localStorage.setItem('accessToken', token)
      }
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  /**
   * Called after successful login.
   * userData = full LoginResponse object from backend
   * token = the access token (accessToken or token field)
   */
  const login = (userData, token) => {
    const accessToken = userData.accessToken || token
    const refreshToken = userData.refreshToken

    localStorage.setItem('accessToken', accessToken)
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('tokenType', userData.tokenType) // "JWT" | "SESSION"
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = async () => {
    try { await api.post('/auth/logout') } catch (_) {}
    localStorage.clear()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
