import React, { useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction 
} from '@solana/web3.js'
import cryptoTransactionService from '../services/cryptoTransactionService'
import blockchainMonitorService from '../services/blockchainMonitorService'

const DepositComponent = () => {
  const { connection } = useConnection()
  const { publicKey, signTransaction, connected } = useWallet()
  
  // Initialize blockchain monitor when component mounts
  React.useEffect(() => {
    if (connection) {
      console.log('🔧 Initializing blockchain monitor with connection:', connection)
      blockchainMonitorService.initialize(connection)
    } else {
      console.log('⚠️ No connection available for blockchain monitor initialization')
    }
    
    // Cleanup monitoring when component unmounts
    return () => {
      console.log('🧹 Cleaning up blockchain monitor')
      blockchainMonitorService.stopAllMonitoring()
    }
  }, [connection])
  
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [txSignature, setTxSignature] = useState(null)
  const [transactionId, setTransactionId] = useState(null)

  // Get game account address from environment
  const gameAccountAddress = import.meta.env.VITE_GAME_ACCOUNT_ADDRESS || '11111111111111111111111111111112'

  const handleDeposit = async () => {
    if (!connected || !publicKey || !signTransaction) {
      setError('Please connect your wallet first')
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)
    setTxSignature(null)
    setTransactionId(null)

    try {
      console.log('🔄 Starting deposit transaction...')
      console.log('💰 Amount:', amount, 'SOL')
      console.log('🎮 Game account:', gameAccountAddress)
      console.log('👤 From account:', publicKey.toString())

      // Convert SOL to lamports
      const lamports = Math.floor(parseFloat(amount) * LAMPORTS_PER_SOL)
      
      // Validate game account address
      let gameAccountPubkey
      try {
        gameAccountPubkey = new PublicKey(gameAccountAddress)
      } catch (err) {
        throw new Error('Invalid game account address')
      }

      // Check if user has enough balance
      const balance = await connection.getBalance(publicKey)
      if (balance < lamports) {
        throw new Error('Insufficient balance')
      }

      // Create transaction
      const transaction = new Transaction()
      
      // Add transfer instruction
      const transferInstruction = SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: gameAccountPubkey,
        lamports: lamports,
      })
      
      transaction.add(transferInstruction)

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey

      console.log('📝 Transaction created, requesting signature...')

      // Sign transaction
      const signedTransaction = await signTransaction(transaction)
      
      console.log('✅ Transaction signed, sending...')

      // Send transaction
      const signature = await connection.sendRawTransaction(signedTransaction.serialize())
      
      console.log('🚀 Transaction sent:', signature)

      // Create transaction record in backend
      console.log('🔄 Creating transaction record in backend...')
      const transactionData = cryptoTransactionService.createDepositData(
        amount,
        publicKey.toString(),
        gameAccountAddress,
        signature
      )
      
      const backendTransaction = await cryptoTransactionService.createTransaction(transactionData)
      console.log('📊 Backend transaction response:', backendTransaction)
      
      // Extract transaction ID with comprehensive validation
      let txId = null
      
      // Try different possible ID fields
      if (backendTransaction.id) {
        txId = backendTransaction.id
      } else if (backendTransaction._id) {
        txId = backendTransaction._id
      } else if (backendTransaction.transactionId) {
        txId = backendTransaction.transactionId
      } else if (backendTransaction.data && backendTransaction.data.id) {
        txId = backendTransaction.data.id
      } else if (backendTransaction.data && backendTransaction.data._id) {
        txId = backendTransaction.data._id
      } else if (backendTransaction.result && backendTransaction.result.id) {
        txId = backendTransaction.result.id
      } else if (backendTransaction.result && backendTransaction.result._id) {
        txId = backendTransaction.result._id
      }
      
      console.log('📊 Extracted transaction ID:', txId)
      console.log('📊 ID type:', typeof txId)
      
      if (!txId) {
        console.error('❌ No transaction ID found in response')
        console.error('❌ Available fields:', Object.keys(backendTransaction))
        
        // Generate a temporary ID based on the transaction signature
        txId = `temp_${signature.slice(0, 8)}_${Date.now()}`
        console.warn('⚠️ Using temporary transaction ID:', txId)
        console.warn('⚠️ Note: Status updates may not work properly without backend ID')
      }
      
      setTransactionId(txId)
      console.log('✅ Transaction record created with ID:', txId)

      // Start automatic blockchain monitoring
      console.log('🔍 Starting automatic blockchain monitoring...')
      
      // Ensure monitor is initialized before starting
      if (!blockchainMonitorService.isInitialized) {
        console.log('🔧 Re-initializing blockchain monitor...')
        blockchainMonitorService.initialize(connection)
      }
      
      await blockchainMonitorService.startMonitoring(txId, signature)
      
      console.log('✅ Transaction monitoring started! Status will be updated automatically.')
      
      setSuccess(`Transaction sent! ${amount} SOL deposit is being processed. Status will be updated automatically.`)
      setTxSignature(signature)
      setAmount('') // Clear form

    } catch (err) {
      console.error('❌ Deposit error:', err)
      setError(err.message || 'Transaction failed')
    } finally {
      setLoading(false)
    }
  }

  const handleAmountChange = (e) => {
    const value = e.target.value
    // Allow only numbers and one decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value)
    }
  }

  if (!connected) {
    return (
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        border: '1px solid #ccc', 
        borderRadius: '5px',
        backgroundColor: '#f9f9f9'
      }}>
        <h3>🎮 Deposit to Game</h3>
        <p>🔒 Connect your wallet to deposit SOL to the game account</p>
      </div>
    )
  }

  return (
    <div style={{ 
      marginTop: '20px', 
      padding: '15px', 
      border: '1px solid #4CAF50', 
      borderRadius: '5px',
      backgroundColor: '#f9f9f9'
    }}>
      <h3>🎮 Deposit to Game</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Amount (SOL):
        </label>
        <input
          type="text"
          value={amount}
          onChange={handleAmountChange}
          placeholder="0.1"
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px'
          }}
          disabled={loading}
        />
      </div>

      <div style={{ marginBottom: '15px', fontSize: '12px', color: '#666' }}>
        <p><strong>Game Account:</strong> {gameAccountAddress}</p>
        <p><strong>Your Account:</strong> {publicKey?.toString()}</p>
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
          {txSignature && (
            <div style={{ marginTop: '5px', fontSize: '12px' }}>
              <strong>Transaction:</strong> 
              <a 
                href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#4CAF50', textDecoration: 'none', marginLeft: '5px' }}
              >
                View on Explorer
              </a>
            </div>
          )}
          {transactionId && (
            <div style={{ marginTop: '5px', fontSize: '12px' }}>
              <strong>Transaction ID:</strong> {transactionId}
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleDeposit}
        disabled={loading || !amount || parseFloat(amount) <= 0}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: loading ? '#ccc' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.3s'
        }}
      >
        {loading ? '⏳ Processing...' : '🎮 Deposit SOL'}
      </button>

      <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
        <p>⚠️ This will send SOL from your wallet to the game account.</p>
        <p>💡 Make sure you have enough SOL for transaction fees.</p>
      </div>
    </div>
  )
}

export default DepositComponent
