import authService from './authService.js'

// Withdrawal service for handling withdrawal operations
class WithdrawalService {
  constructor() {
    // Get the base URL without the crypto-transactions path
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8888'
    this.baseUrl = baseUrl
  }

  // Get game balance
  async getGameBalance() {
    try {
      console.log('🔄 Fetching game balance for withdrawal...')
      console.log('🌐 API URL:', `${this.baseUrl}/api/game/balance`)
      
      // Check if we have authentication
      if (!authService.isAuthenticated()) {
        throw new Error('User not authenticated. Please login first.')
      }
      
      // Check network connectivity
      if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your network.')
      }
      
      const response = await fetch(`${this.baseUrl}/api/game/balance`, {
        method: 'GET',
        headers: authService.getAuthHeader()
      })
      
      console.log('📡 Response status:', response.status)
      console.log('📡 Response ok:', response.ok)
      
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
      console.log('✅ Game balance fetched successfully:', data)
      
      return data
    } catch (error) {
      console.error('❌ Error fetching game balance:', error)
      
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

  // Initiate withdrawal
  async initiateWithdrawal(withdrawalData) {
    try {
      console.log('🔄 Initiating withdrawal...')
      console.log('🌐 API URL:', `${this.baseUrl}/api/withdrawal/initiate`)
      console.log('📤 Withdrawal data:', withdrawalData)
      
      // Check if we have authentication
      if (!authService.isAuthenticated()) {
        throw new Error('User not authenticated. Please login first.')
      }
      
      // Check network connectivity
      if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your network.')
      }
      
      const response = await fetch(`${this.baseUrl}/api/withdrawal/initiate`, {
        method: 'POST',
        headers: authService.getAuthHeader(),
        body: JSON.stringify(withdrawalData)
      })
      
      console.log('📡 Response status:', response.status)
      console.log('📡 Response ok:', response.ok)
      
      if (!response.ok) {
        let errorData = null
        let errorText = 'Unknown error'
        
        try {
          const responseText = await response.text()
          console.log('📡 Raw error response:', responseText)
          
          // Try to parse as JSON first
          try {
            errorData = JSON.parse(responseText)
            console.log('📡 Parsed error data:', errorData)
          } catch (parseError) {
            // If not JSON, use as plain text
            errorText = responseText
          }
        } catch (e) {
          console.warn('Could not read error response:', e)
        }
        
        console.error('❌ API Error Response:', errorData || errorText)
        
        // Handle specific error cases
        if (errorData && errorData.error) {
          throw new Error(errorData.error)
        } else if (errorData && errorData.message) {
          throw new Error(errorData.message)
        } else {
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
        }
      }
      
      const data = await response.json()
      console.log('✅ Withdrawal initiated successfully:', data)
      
      return data
    } catch (error) {
      console.error('❌ Error initiating withdrawal:', error)
      
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
}

// Create singleton instance
const withdrawalService = new WithdrawalService()

export default withdrawalService
