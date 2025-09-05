import { Connection, PublicKey } from '@solana/web3.js'
import cryptoTransactionService from './cryptoTransactionService'

// Blockchain transaction monitoring service
class BlockchainMonitorService {
  constructor() {
    this.monitoringTransactions = new Map() // Track transactions being monitored
    this.checkInterval = 5000 // Check every 5 seconds
    this.maxRetries = 12 // Maximum 12 retries (1 minute total)
    this.connection = null
  }

  // Initialize with Solana connection
  initialize(connection) {
    this.connection = connection
    console.log('🔍 Blockchain monitor initialized with connection:', connection)
  }

  // Check if monitor is initialized
  get isInitialized() {
    return !!this.connection
  }

  // Start monitoring a transaction
  async startMonitoring(transactionId, signature, maxRetries = this.maxRetries) {
    console.log('🔍 Start monitoring called for transaction:', transactionId)
    console.log('🔍 Monitor initialized:', this.isInitialized)
    console.log('🔍 Connection available:', !!this.connection)
    
    if (!this.connection) {
      console.error('❌ Blockchain monitor not initialized!')
      throw new Error('Blockchain monitor not initialized. Call initialize() first.')
    }

    if (this.monitoringTransactions.has(transactionId)) {
      console.log('⚠️ Transaction already being monitored:', transactionId)
      return
    }

    console.log('🔍 Starting blockchain monitoring for transaction:', transactionId)
    console.log('📝 Signature:', signature)
    console.log('⏰ Check interval:', this.checkInterval, 'ms')
    console.log('🔄 Max retries:', maxRetries)

    const monitoringData = {
      transactionId,
      signature,
      retries: 0,
      maxRetries,
      intervalId: null
    }

    this.monitoringTransactions.set(transactionId, monitoringData)
    console.log('📊 Total transactions being monitored:', this.monitoringTransactions.size)

    // Start the monitoring loop
    monitoringData.intervalId = setInterval(async () => {
      console.log('⏰ Monitoring interval triggered for:', transactionId)
      await this.checkTransactionStatus(transactionId)
    }, this.checkInterval)

    // Initial check
    console.log('🚀 Performing initial transaction check...')
    await this.checkTransactionStatus(transactionId)
  }

  // Check the status of a specific transaction
  async checkTransactionStatus(transactionId) {
    const monitoringData = this.monitoringTransactions.get(transactionId)
    if (!monitoringData) {
      console.log('⚠️ No monitoring data found for transaction:', transactionId)
      return
    }

    try {
      console.log(`🔍 Checking transaction status (attempt ${monitoringData.retries + 1}/${monitoringData.maxRetries}):`, transactionId)

      // Get transaction status from blockchain
      const signature = monitoringData.signature
      const status = await this.connection.getSignatureStatus(signature, {
        searchTransactionHistory: true
      })

      if (status.value) {
        if (status.value.err) {
          // Transaction failed
          console.log('❌ Transaction failed on blockchain:', signature)
          await this.handleTransactionFailure(transactionId, status.value.err)
        } else {
          // Transaction confirmed (no error means success)
          console.log('✅ Transaction confirmed on blockchain:', signature)
          console.log('📊 Transaction details:', status.value)
          await this.handleTransactionSuccess(transactionId)
        }
      } else {
        // Transaction not found or still pending
        monitoringData.retries++
        console.log(`⏳ Transaction still pending (${monitoringData.retries}/${monitoringData.maxRetries}):`, signature)

        if (monitoringData.retries >= monitoringData.maxRetries) {
          console.log('⏰ Max retries reached, stopping monitoring:', transactionId)
          await this.handleTransactionTimeout(transactionId)
        }
      }
    } catch (error) {
      console.error('❌ Error checking transaction status:', error)
      monitoringData.retries++
      
      if (monitoringData.retries >= monitoringData.maxRetries) {
        console.log('⏰ Max retries reached due to errors, stopping monitoring:', transactionId)
        await this.handleTransactionTimeout(transactionId)
      }
    }
  }

  // Handle successful transaction confirmation
  async handleTransactionSuccess(transactionId) {
    try {
      console.log('🔄 Updating transaction status to confirmed:', transactionId)
      
      // Validate transaction ID
      if (!transactionId || transactionId === 'undefined' || transactionId === 'null') {
        console.error('❌ Invalid transaction ID for confirmation:', transactionId)
        return
      }
      
      console.log('📞 Calling cryptoTransactionService.confirmTransaction...')
      const result = await cryptoTransactionService.confirmTransaction(transactionId)
      console.log('✅ Transaction status updated to confirmed!', result)
    } catch (error) {
      console.error('❌ Error updating transaction to confirmed:', error)
    } finally {
      this.stopMonitoring(transactionId)
    }
  }

  // Handle failed transaction
  async handleTransactionFailure(transactionId, error) {
    try {
      console.log('🔄 Updating transaction status to failed:', transactionId)
      
      // Validate transaction ID
      if (!transactionId || transactionId === 'undefined' || transactionId === 'null') {
        console.error('❌ Invalid transaction ID for failure:', transactionId)
        return
      }
      
      await cryptoTransactionService.failTransaction(transactionId)
      console.log('✅ Transaction status updated to failed!')
    } catch (apiError) {
      console.error('❌ Error updating transaction to failed:', apiError)
    } finally {
      this.stopMonitoring(transactionId)
    }
  }

  // Handle transaction timeout (max retries reached)
  async handleTransactionTimeout(transactionId) {
    try {
      console.log('⏰ Transaction monitoring timeout, marking as failed:', transactionId)
      
      // Validate transaction ID
      if (!transactionId || transactionId === 'undefined' || transactionId === 'null') {
        console.error('❌ Invalid transaction ID for timeout:', transactionId)
        return
      }
      
      await cryptoTransactionService.failTransaction(transactionId)
      console.log('✅ Transaction marked as failed due to timeout!')
    } catch (error) {
      console.error('❌ Error handling transaction timeout:', error)
    } finally {
      this.stopMonitoring(transactionId)
    }
  }

  // Stop monitoring a specific transaction
  stopMonitoring(transactionId) {
    const monitoringData = this.monitoringTransactions.get(transactionId)
    if (monitoringData) {
      if (monitoringData.intervalId) {
        clearInterval(monitoringData.intervalId)
      }
      this.monitoringTransactions.delete(transactionId)
      console.log('🛑 Stopped monitoring transaction:', transactionId)
    }
  }

  // Stop monitoring all transactions
  stopAllMonitoring() {
    console.log('🛑 Stopping all transaction monitoring...')
    for (const [transactionId, monitoringData] of this.monitoringTransactions) {
      if (monitoringData.intervalId) {
        clearInterval(monitoringData.intervalId)
      }
    }
    this.monitoringTransactions.clear()
    console.log('✅ All monitoring stopped')
  }

  // Get monitoring status
  getMonitoringStatus() {
    return {
      activeTransactions: this.monitoringTransactions.size,
      transactionIds: Array.from(this.monitoringTransactions.keys())
    }
  }

  // Check if a transaction is being monitored
  isMonitoring(transactionId) {
    return this.monitoringTransactions.has(transactionId)
  }
}

// Create singleton instance
const blockchainMonitorService = new BlockchainMonitorService()

export default blockchainMonitorService
