// Authentication service for managing API tokens
class AuthService {
  constructor() {
    this.tokenKey = 'auth_token'
    this.token = this.getStoredToken()
  }

  // Get token from localStorage
  getStoredToken() {
    try {
      return localStorage.getItem(this.tokenKey)
    } catch (error) {
      console.warn('Could not access localStorage:', error)
      return null
    }
  }

  // Store token in localStorage
  setToken(token) {
    try {
      this.token = token
      if (token) {
        localStorage.setItem(this.tokenKey, token)
      } else {
        localStorage.removeItem(this.tokenKey)
      }
      console.log('🔐 Token updated')
    } catch (error) {
      console.warn('Could not store token in localStorage:', error)
    }
  }

  // Get current token
  getToken() {
    return this.token
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token
  }

  // Clear token (logout)
  clearToken() {
    this.setToken(null)
    console.log('🔐 Token cleared')
  }

  // Get authorization header
  getAuthHeader() {
    if (this.token) {
      return {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    }
    return {
      'Content-Type': 'application/json'
    }
  }

  // Login method
  async login(credentials) {
    try {
      console.log('🔐 Attempting login...')
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8888'}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: credentials.userName,
          password: credentials.password
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Login failed: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      
      if (data.token) {
        this.setToken(data.token)
        console.log('✅ Login successful')
        return { success: true, token: data.token }
      } else {
        throw new Error('No token received from server')
      }
    } catch (error) {
      console.error('❌ Login error:', error)
      throw error
    }
  }

  // Register method (you can customize this based on your backend)
  async register(userData) {
    try {
      console.log('🔐 Attempting registration...')
      
      // Replace this with your actual registration endpoint
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8888'}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Registration failed: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('✅ Registration successful')
      return { success: true, data }
    } catch (error) {
      console.error('❌ Registration error:', error)
      throw error
    }
  }
}

// Create singleton instance
const authService = new AuthService()

export default authService
