import React, { useState } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import withdrawalService from '../services/withdrawalService'
import authService from '../services/authService'

const WithdrawComponent = () => {
  const { publicKey, connected } = useWallet()
  const { connection } = useConnection()
  
  const [amount, setAmount] = useState('')
  const [withdrawAddress, setWithdrawAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [balanceLoading, setBalanceLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [gameBalance, setGameBalance] = useState(null)
  const [withdrawalId, setWithdrawalId] = useState(null)

  // Get game balance
  const fetchGameBalance = async () => {
    if (!authService.isAuthenticated()) {
      setError('Please login first to view game balance')
      return
    }

    setBalanceLoading(true)
    setError(null)

    try {
      console.log('🔄 Fetching game balance for withdrawal...')
      const balanceData = await withdrawalService.getGameBalance()
      
      // Handle the specific API response format
      let balance = null
      if (balanceData.data) {
        balance = balanceData.data
      } else {
        balance = balanceData
      }

      setGameBalance(balance)
      console.log('✅ Game balance updated:', balance)
    } catch (err) {
      console.error('❌ Error fetching game balance:', err)
      setError(err.message || 'Failed to fetch game balance')
    } finally {
      setBalanceLoading(false)
    }
  }

  // Handle withdrawal
  const handleWithdraw = async () => {
    if (!connected || !publicKey) {
      setError('Please connect your wallet first')
      return
    }

    if (!authService.isAuthenticated()) {
      setError('Please login first to withdraw')
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (!withdrawAddress || withdrawAddress.trim() === '') {
      setError('Please enter a withdrawal address')
      return
    }

    // Check if we have balance data
    if (!gameBalance) {
      setError('Please fetch your game balance first')
      return
    }

    // Validate withdrawal address format
    try {
      new PublicKey(withdrawAddress.trim())
    } catch (err) {
      setError('Invalid Solana wallet address format')
      return
    }

    // Check if user has enough balance
    const availableBalance = parseFloat(gameBalance.availableBalance || gameBalance.available_balance || 0)
    const withdrawAmount = parseFloat(amount)
    
    if (withdrawAmount > availableBalance) {
      setError(`Insufficient balance. Available: ${availableBalance.toFixed(4)} SOL, Requested: ${withdrawAmount.toFixed(4)} SOL`)
      return
    }

    // Check if destination wallet is active (has at least 0.002 SOL)
    try {
      console.log('🔍 Checking destination wallet balance...')
      const destinationPubkey = new PublicKey(withdrawAddress.trim())
      const destinationBalance = await connection.getBalance(destinationPubkey)
      const destinationBalanceSOL = destinationBalance / 1000000000 // Convert lamports to SOL
      
      console.log('💰 Destination wallet balance:', destinationBalanceSOL, 'SOL')
      
      if (destinationBalanceSOL < 0.002) {
        setError('This wallet is not active. Please fund it with at least 0.002 SOL first.')
        return
      }
    } catch (err) {
      console.error('❌ Error checking destination wallet balance:', err)
      setError('Failed to verify destination wallet. Please check the address and try again.')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)
    setWithdrawalId(null)

    try {
      console.log('🔄 Initiating withdrawal...')
      console.log('💰 Amount:', amount, 'SOL')
      console.log('👤 Wallet address:', publicKey.toString())

      const withdrawalData = {
        withdrawalAmount: withdrawAmount.toString(),
        userWalletAddress: withdrawAddress.trim()
      }

      const result = await withdrawalService.initiateWithdrawal(withdrawalData)
      
      // Extract withdrawal ID
      let withdrawalId = null
      if (result.id) {
        withdrawalId = result.id
      } else if (result._id) {
        withdrawalId = result._id
      } else if (result.withdrawalId) {
        withdrawalId = result.withdrawalId
      } else if (result.data && result.data.id) {
        withdrawalId = result.data.id
      } else if (result.data && result.data._id) {
        withdrawalId = result.data._id
      }

      setWithdrawalId(withdrawalId)
      setSuccess(`Withdrawal initiated successfully! ${amount} SOL withdrawal is being processed.`)
      setAmount('') // Clear form
      setWithdrawAddress('') // Clear form
      
      // Refresh balance after successful withdrawal
      await fetchGameBalance()

    } catch (err) {
      console.error('❌ Withdrawal error:', err)
      
      // Check if the error contains a withdrawal ID (for tracking failed withdrawals)
      let errorMessage = err.message || 'Withdrawal failed'
      
      // Try to extract withdrawal ID from error message if it's a JSON string
      try {
        if (typeof err.message === 'string' && err.message.includes('withdrawalId')) {
          const errorMatch = err.message.match(/"withdrawalId":\s*"([^"]+)"/)
          if (errorMatch) {
            setWithdrawalId(errorMatch[1])
          }
        }
      } catch (parseError) {
        console.warn('Could not parse withdrawal ID from error:', parseError)
      }
      
      setError(errorMessage)
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

  const formatBalance = (balance) => {
    if (balance === null || balance === undefined) return 'N/A'
    
    // If it's a number, format it as SOL
    if (typeof balance === 'number') {
      return `${balance.toFixed(4)} SOL`
    }
    
    // If it's a string, try to parse it
    if (typeof balance === 'string') {
      const numBalance = parseFloat(balance)
      if (!isNaN(numBalance)) {
        return `${numBalance.toFixed(4)} SOL`
      }
      return balance
    }
    
    // For other types, convert to string
    return String(balance)
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
        <h3>💸 Withdraw from Game</h3>
        <p>🔒 Connect your wallet to withdraw SOL from the game account</p>
      </div>
    )
  }

  if (!authService.isAuthenticated()) {
    return (
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        border: '1px solid #ccc', 
        borderRadius: '5px',
        backgroundColor: '#f9f9f9'
      }}>
        <h3>💸 Withdraw from Game</h3>
        <p>🔒 Please login to withdraw SOL from the game account</p>
      </div>
    )
  }

  return (
    <div style={{ 
      marginTop: '20px', 
      padding: '15px', 
      border: '1px solid #ff9800', 
      borderRadius: '5px',
      backgroundColor: '#f9f9f9'
    }}>
      <h3>💸 Withdraw from Game</h3>
      
      {/* Balance Section */}
      <div style={{ marginBottom: '15px' }}>
        <button
          onClick={fetchGameBalance}
          disabled={balanceLoading}
          style={{
            padding: '8px 16px',
            backgroundColor: balanceLoading ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: balanceLoading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.3s'
          }}
        >
          {balanceLoading ? '⏳ Loading...' : '💰 Check Available Balance'}
        </button>
      </div>

      {/* Balance Display */}
      {gameBalance && (
        <div style={{ 
          marginBottom: '15px', 
          padding: '10px', 
          backgroundColor: '#e8f5e8', 
          border: '1px solid #4CAF50',
          borderRadius: '4px',
          color: '#2e7d32'
        }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px' }}>
            💰 Available Balance: {formatBalance(gameBalance.availableBalance || gameBalance.available_balance)}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Total Balance: {formatBalance(gameBalance.walletbalance || gameBalance.balance_sol)} | 
            Locked: {formatBalance(gameBalance.lockedWalletbalance || gameBalance.locked_balance)}
          </div>
        </div>
      )}
      
      {/* Withdrawal Form */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Withdrawal Amount (SOL):
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

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Withdrawal Address:
        </label>
        <input
          type="text"
          value={withdrawAddress}
          onChange={(e) => setWithdrawAddress(e.target.value)}
          placeholder="Enter Solana wallet address"
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
        <p><strong>Your Wallet:</strong> {publicKey?.toString()}</p>
        <p><strong>Withdrawal API:</strong> http://localhost:8888/api/withdrawal/initiate</p>
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
          {withdrawalId && (
            <div style={{ marginTop: '5px', fontSize: '12px' }}>
              <strong>Withdrawal ID:</strong> {withdrawalId}
            </div>
          )}
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
          {withdrawalId && (
            <div style={{ marginTop: '5px', fontSize: '12px' }}>
              <strong>Withdrawal ID:</strong> {withdrawalId}
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleWithdraw}
        disabled={loading || !amount || parseFloat(amount) <= 0 || !withdrawAddress.trim() || !gameBalance}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: loading ? '#ccc' : '#ff9800',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.3s'
        }}
      >
        {loading ? '⏳ Processing...' : '💸 Withdraw SOL'}
      </button>

      {/* Debug info for button state */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ marginTop: '10px', fontSize: '10px', color: '#999', backgroundColor: '#f0f0f0', padding: '5px', borderRadius: '3px' }}>
          <strong>Debug - Button State:</strong><br/>
          Loading: {loading ? 'true' : 'false'}<br/>
          Amount: {amount || 'empty'}<br/>
          Amount Valid: {amount && parseFloat(amount) > 0 ? 'true' : 'false'}<br/>
          Withdraw Address: {withdrawAddress ? 'filled' : 'empty'}<br/>
          Game Balance: {gameBalance ? 'loaded' : 'not loaded'}<br/>
          Button Disabled: {loading || !amount || parseFloat(amount) <= 0 || !withdrawAddress.trim() || !gameBalance ? 'true' : 'false'}
        </div>
      )}

      <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
        <p>⚠️ This will initiate a withdrawal from your game balance to the specified wallet address.</p>
        <p>💡 Make sure you have enough available balance for the withdrawal.</p>
        <p>🔄 Check your balance before withdrawing to ensure sufficient funds.</p>
        <p>📍 Enter the correct Solana wallet address for withdrawal.</p>
      </div>
    </div>
  )
}

export default WithdrawComponent







