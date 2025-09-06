import { getApiBaseUrl } from '../config/solana.js'
import authService from './authService.js'

// Wallet connect service for connecting wallet to backend
class WalletConnectService {
  constructor() {
    this.baseUrl = getApiBaseUrl().replace('/api/crypto-transactions', '/api/wallet')
  }

  // Test server connectivity
  async testServerConnectivity() {
    try {
      console.log('🔄 Testing server connectivity...')
      console.log('🌐 Testing URL:', `${this.baseUrl}/connect`)
      
      // Try a simple GET request to test connectivity
      const response = await fetch(`${this.baseUrl}/connect`, {
        method: 'GET',
        headers: authService.getAuthHeader()
      })
      
      console.log('📡 Connectivity test response status:', response.status)
      console.log('📡 Connectivity test response ok:', response.ok)
      
      return {
        success: true,
        status: response.status,
        message: 'Server is reachable'
      }
    } catch (error) {
      console.error('❌ Server connectivity test failed:', error)
      
      let errorMessage = 'Unknown error'
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Server is not running or not accessible'
      } else if (error.message.includes('CORS')) {
        errorMessage = 'CORS error - server configuration issue'
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error - cannot reach server'
      }
      
      return {
        success: false,
        error: errorMessage,
        details: error.message
      }
    }
  }

  // Connect wallet to backend
  async connectWallet(walletAddress) {
    try {
      console.log('🔄 Connecting wallet to backend...')
      console.log('🌐 API URL:', `${this.baseUrl}/connect`)
      console.log('👛 Wallet address:', walletAddress)
      console.log('🔐 Auth headers:', authService.getAuthHeader())
      
      // Check if we have authentication
      if (!authService.isAuthenticated()) {
        throw new Error('User not authenticated. Please login first.')
      }
      
      // Check network connectivity
      if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your network.')
      }
      
      const requestBody = {
        wallet_address: walletAddress
      }
      
      console.log('📤 Request body:', requestBody)
      
      const response = await fetch(`${this.baseUrl}/connect`, {
        method: 'POST',
        headers: authService.getAuthHeader(),
        body: JSON.stringify(requestBody)
      })
      
      console.log('📡 Response status:', response.status)
      console.log('📡 Response ok:', response.ok)
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()))
      
      if (!response.ok) {
        let errorText = 'Unknown error'
        try {
          errorText = await response.text()
        } catch (e) {
          console.warn('Could not read error response:', e)
        }
        console.error('❌ API Error Response:', errorText)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }
      
      const data = await response.json()
      console.log('✅ Wallet connected successfully:', data)
      
      return data
    } catch (error) {
      console.error('❌ Error connecting wallet:', error)
      
      // Provide more specific error messages
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server. Please check if the server is running and accessible.')
      } else if (error.message.includes('CORS')) {
        throw new Error('CORS error: Server configuration issue. Please contact support.')
      } else if (error.message.includes('Failed to fetch')) {
        throw new Error('Connection failed: Server may be down or unreachable. Please try again later.')
      }
      
      throw error
    }
  }

  // Get connected wallet info
  async getConnectedWallet() {
    try {
      console.log('🔄 Fetching connected wallet info...')
      console.log('🌐 API URL:', `${this.baseUrl}/connect`)
      
      const response = await fetch(`${this.baseUrl}/connect`, {
        method: 'GET',
        headers: authService.getAuthHeader()
      })
      
      console.log('📡 Response status:', response.status)
      console.log('📡 Response ok:', response.ok)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API Error Response:', errorText)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }
      
      const data = await response.json()
      console.log('✅ Connected wallet info fetched:', data)
      
      return data
    } catch (error) {
      console.error('❌ Error fetching connected wallet:', error)
      throw error
    }
  }

  // Disconnect wallet
  async disconnectWallet() {
    try {
      console.log('🔄 Disconnecting wallet from backend...')
      console.log('🌐 API URL:', `${this.baseUrl}/connect`)
      
      const response = await fetch(`${this.baseUrl}/connect`, {
        method: 'DELETE',
        headers: authService.getAuthHeader()
      })
      
      console.log('📡 Response status:', response.status)
      console.log('📡 Response ok:', response.ok)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API Error Response:', errorText)
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }
      
      const data = await response.json()
      console.log('✅ Wallet disconnected successfully:', data)
      
      return data
    } catch (error) {
      console.error('❌ Error disconnecting wallet:', error)
      throw error
    }
  }
}

// Create singleton instance
const walletConnectService = new WalletConnectService()

export default walletConnectService
