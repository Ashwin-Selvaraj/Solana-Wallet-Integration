import { getApiBaseUrl } from '../config/solana.js'
import authService from './authService.js'

// Game balance service for fetching game account balance
class GameBalanceService {
  constructor() {
    this.baseUrl = getApiBaseUrl().replace('/api/crypto-transactions', '/api/game')
  }

  // Get game balance
  async getGameBalance() {
    try {
      console.log('🔄 Fetching game balance...')
      console.log('🌐 API URL:', `${this.baseUrl}/balance`)
      
      const response = await fetch(`${this.baseUrl}/balance`, {
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
      console.log('✅ Game balance fetched successfully:', data)
      
      return data
    } catch (error) {
      console.error('❌ Error fetching game balance:', error)
      throw error
    }
  }
}

// Create singleton instance
const gameBalanceService = new GameBalanceService()

export default gameBalanceService
