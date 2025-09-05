import React, { useState } from 'react'
import authService from '../services/authService'

const LoginComponent = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    userName: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await authService.login({
        userName: formData.userName,
        password: formData.password
      })
      
      if (result.success) {
        setSuccess('Login successful!')
        if (onLoginSuccess) {
          onLoginSuccess(result.token)
        }
      }
    } catch (err) {
      console.error('Auth error:', err)
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    authService.clearToken()
    setSuccess('Logged out successfully!')
    setFormData({ userName: '', password: '' })
  }

  // If user is already authenticated, show logout option
  if (authService.isAuthenticated()) {
    return (
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        border: '1px solid #4CAF50', 
        borderRadius: '5px',
        backgroundColor: '#f9f9f9'
      }}>
        <h3>🔐 Authentication</h3>
        <p style={{ color: '#4CAF50', fontWeight: 'bold' }}>
          ✅ You are authenticated
        </p>
        <button 
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
    )
  }

  return (
    <div style={{ 
      marginTop: '20px', 
      padding: '15px', 
      border: '1px solid #ccc', 
      borderRadius: '5px',
      backgroundColor: '#f9f9f9'
    }}>
      <h3>🔐 Authentication Required</h3>
      <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
        Please login to use the deposit feature
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Username:
          </label>
          <input
            type="text"
            name="userName"
            value={formData.userName}
            onChange={handleInputChange}
            required
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Password:
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
        </div>

        {error && (
          <div style={{ 
            marginBottom: '15px', 
            padding: '10px', 
            backgroundColor: '#ffe6e6', 
            border: '1px solid #ff6b6b',
            borderRadius: '4px',
            color: '#d32f2f'
          }}>
            ❌ {error}
          </div>
        )}

        {success && (
          <div style={{ 
            marginBottom: '15px', 
            padding: '10px', 
            backgroundColor: '#e8f5e8', 
            border: '1px solid #4CAF50',
            borderRadius: '4px',
            color: '#2e7d32'
          }}>
            ✅ {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: loading ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '⏳ Processing...' : '🔐 Login'}
        </button>
      </form>
    </div>
  )
}

export default LoginComponent
