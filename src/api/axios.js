import axios from 'axios'

const api = axios.create({
  baseURL: 'http://20.193.140.173:8086/api',
  headers: { 'Content-Type': 'application/json' }
})

/**
 * Decode the JWT payload and return the exp claim (in seconds).
 * Returns null if the token is missing or malformed.
 */
function getTokenExpiry(token) {
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp ?? null
  } catch {
    return null
  }
}

/**
 * Returns true if the token is about to expire within 2 seconds (or is already expired).
 */
function isTokenExpiringSoon(token) {
  const exp = getTokenExpiry(token)
  if (exp === null) return false
  return exp * 1000 < Date.now() + 2000
}

/**
 * Call POST /auth/refresh with the stored refreshToken.
 * On success, update accessToken in localStorage and return the new token.
 * On failure, throw so the caller can handle it.
 */
async function doRefresh() {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) throw new Error('No refresh token available')

  // Use a plain axios instance (not `api`) to avoid interceptor loops
  const response = await axios.post(
    `http://20.193.140.173:8086/api/auth/refresh`,
    { refreshToken },
    { headers: { 'Content-Type': 'application/json' } }
  )

  const newAccessToken = response.data?.accessToken || response.data?.data?.accessToken
  if (!newAccessToken) throw new Error('Refresh response missing accessToken')

  localStorage.setItem('accessToken', newAccessToken)
  return newAccessToken
}

// ─── Request interceptor ────────────────────────────────────────────────────

api.interceptors.request.use(async (config) => {
  let token = localStorage.getItem('accessToken')

  // Proactively refresh if the token is about to expire
  if (token && isTokenExpiringSoon(token)) {
    try {
      token = await doRefresh()
    } catch {
      // If proactive refresh fails, proceed with the (possibly expired) token;
      // the response interceptor will handle the resulting 401.
    }
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// ─── Response interceptor ───────────────────────────────────────────────────

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config

    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const newToken = await doRefresh()
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch {
        // Refresh failed — clear session and redirect to login
        localStorage.clear()
        window.location.href = '/login'
      }
    }

    return Promise.reject(err)
  }
)

export default api
