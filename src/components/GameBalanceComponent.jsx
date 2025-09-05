import React, { useState } from 'react'
import gameBalanceService from '../services/gameBalanceService'
import authService from '../services/authService'

const GameBalanceComponent = () => {
  const [balance, setBalance] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchGameBalance = async () => {
    if (!authService.isAuthenticated()) {
      setError('Please login first to view game balance')
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('🔄 Fetching game balance...')
      const balanceData = await gameBalanceService.getGameBalance()
      
      // Handle the specific API response format
      let gameBalance = null
      if (balanceData.data) {
        gameBalance = balanceData.data
      } else {
        gameBalance = balanceData
      }

      setBalance(gameBalance)
      setLastUpdated(new Date().toLocaleTimeString())
      console.log('✅ Game balance updated:', gameBalance)
    } catch (err) {
      console.error('❌ Error fetching game balance:', err)
      setError(err.message || 'Failed to fetch game balance')
    } finally {
      setLoading(false)
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleString()
    } catch (error) {
      return dateString
    }
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
        <h3>🎮 Game Balance</h3>
        <p style={{ color: '#666' }}>🔒 Please login to view game balance</p>
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
      <h3>🎮 Game Balance</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <button
          onClick={fetchGameBalance}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.3s'
          }}
        >
          {loading ? '⏳ Loading...' : '💰 Check Game Balance'}
        </button>
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

      {balance !== null && (
        <div style={{ 
          marginBottom: '15px', 
          padding: '15px', 
          backgroundColor: '#e8f5e8', 
          border: '1px solid #4CAF50',
          borderRadius: '4px',
          color: '#2e7d32'
        }}>
          {/* Main Balance Display */}
          <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px', textAlign: 'center' }}>
            💰 Game Balance: {formatBalance(balance.balance_sol)}
          </div>
          
          {/* Balance Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <div style={{ fontSize: '14px' }}>
              <strong>Available:</strong> {formatBalance(balance.available_balance)}
            </div>
            <div style={{ fontSize: '14px' }}>
              <strong>Locked:</strong> {formatBalance(balance.locked_balance)}
            </div>
            <div style={{ fontSize: '14px' }}>
              <strong>Total Deposited:</strong> {formatBalance(balance.total_deposited)}
            </div>
            <div style={{ fontSize: '14px' }}>
              <strong>Total Withdrawn:</strong> {formatBalance(balance.total_withdrawn)}
            </div>
          </div>
          
          {/* Game Status */}
          <div style={{ 
            padding: '8px', 
            backgroundColor: balance.can_play ? '#d4edda' : '#f8d7da',
            border: `1px solid ${balance.can_play ? '#c3e6cb' : '#f5c6cb'}`,
            borderRadius: '4px',
            marginBottom: '10px',
            textAlign: 'center'
          }}>
            <strong>Game Status:</strong> 
            <span style={{ color: balance.can_play ? '#155724' : '#721c24', marginLeft: '5px' }}>
              {balance.can_play ? '✅ Can Play' : '❌ Cannot Play'}
            </span>
          </div>
          
          {/* Last Transaction */}
          {balance.last_transaction_at && (
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
              <strong>Last Transaction:</strong> {formatDate(balance.last_transaction_at)}
            </div>
          )}
          
          {/* User ID */}
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
            <strong>User ID:</strong> {balance.user_id}
          </div>
          
          {/* Last Updated */}
          {lastUpdated && (
            <div style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #c3e6cb' }}>
              Last fetched: {lastUpdated}
            </div>
          )}
        </div>
      )}

      <div style={{ fontSize: '12px', color: '#666' }}>
        <p>💡 Click the button to fetch the current game account balance</p>
        <p>🔄 Balance is fetched from: <code>http://localhost:8888/api/game/balance</code></p>
      </div>
    </div>
  )
}

export default GameBalanceComponent
