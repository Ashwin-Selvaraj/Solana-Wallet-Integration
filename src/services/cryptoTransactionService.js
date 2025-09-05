import { getApiBaseUrl } from '../config/solana.js'
import authService from './authService.js'

// Crypto transaction service for backend API integration
class CryptoTransactionService {
  constructor() {
    this.baseUrl = getApiBaseUrl()
  }

  // Create a new crypto transaction
  async createTransaction(transactionData) {
    try {
      console.log('🔄 Creating crypto transaction...', transactionData)
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: authService.getAuthHeader(),
        body: JSON.stringify(transactionData)
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }
      
      const data = await response.json()
      console.log('✅ Transaction created:', data)
      console.log('📊 Transaction ID from response:', data.id || data._id)
      console.log('📊 Full response structure:', JSON.stringify(data, null, 2))
      console.log('📊 Available keys in response:', Object.keys(data))
      console.log('📊 Response type:', typeof data)
      console.log('📊 Is array?', Array.isArray(data))
      
      // Check if response is wrapped in another object
      if (data.data) {
        console.log('📊 Found nested data object:', data.data)
        console.log('📊 Nested data keys:', Object.keys(data.data))
      }
      
      return data
    } catch (error) {
      console.error('❌ Error creating transaction:', error)
      throw error
    }
  }

  // Update transaction status to confirmed
  async confirmTransaction(transactionId) {
    try {
      console.log('🔄 Confirming transaction:', transactionId)
      
      // Validate transaction ID
      if (!transactionId || transactionId === 'undefined' || transactionId === 'null') {
        throw new Error(`Invalid transaction ID: ${transactionId}`)
      }
      
      // Skip API call for temporary IDs
      if (transactionId.startsWith('temp_')) {
        console.warn('⚠️ Skipping API call for temporary transaction ID:', transactionId)
        return { success: true, message: 'Temporary ID - API call skipped' }
      }
      
      console.log('🌐 API URL:', `${this.baseUrl}/${transactionId}/confirmed`)
      console.log('🔐 Auth headers:', authService.getAuthHeader())
      
      const response = await fetch(`${this.baseUrl}/${transactionId}/confirmed`, {
        method: 'PUT',
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
      console.log('✅ Transaction confirmed successfully:', data)
      
      return data
    } catch (error) {
      console.error('❌ Error confirming transaction:', error)
      throw error
    }
  }

  // Update transaction status to failed
  async failTransaction(transactionId) {
    try {
      console.log('🔄 Failing transaction:', transactionId)
      
      // Validate transaction ID
      if (!transactionId || transactionId === 'undefined' || transactionId === 'null') {
        throw new Error(`Invalid transaction ID: ${transactionId}`)
      }
      
      // Skip API call for temporary IDs
      if (transactionId.startsWith('temp_')) {
        console.warn('⚠️ Skipping API call for temporary transaction ID:', transactionId)
        return { success: true, message: 'Temporary ID - API call skipped' }
      }
      
      const response = await fetch(`${this.baseUrl}/${transactionId}/failed`, {
        method: 'PUT',
        headers: authService.getAuthHeader()
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }
      
      const data = await response.json()
      console.log('❌ Transaction failed:', data)
      
      return data
    } catch (error) {
      console.error('❌ Error failing transaction:', error)
      throw error
    }
  }

  // Get transaction details by ID
  async getTransaction(transactionId) {
    try {
      console.log('🔄 Fetching transaction:', transactionId)
      
      const response = await fetch(`${this.baseUrl}/?transactionId=${transactionId}`, {
        headers: authService.getAuthHeader()
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }
      
      const data = await response.json()
      console.log('✅ Transaction fetched:', data)
      
      return data
    } catch (error) {
      console.error('❌ Error fetching transaction:', error)
      throw error
    }
  }

  // Helper method to create deposit transaction data
  createDepositData(amount, fromAddress, toAddress, txSignature) {
    return {
      type: "deposit",
      amount: amount.toString(),
      from_address: fromAddress,
      to_address: toAddress,
      tx_signature: txSignature,
      network: "solana"
    }
  }
}

// Create singleton instance
const cryptoTransactionService = new CryptoTransactionService()

export default cryptoTransactionService
