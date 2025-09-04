import React, { useState, useEffect } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'

const WalletBalance = () => {
  const { connection } = useConnection()
  const { publicKey, connected } = useWallet()
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchBalance = async () => {
    if (!publicKey || !connected) {
      setBalance(0)
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('🔍 Fetching balance for:', publicKey.toString())
      const balanceInLamports = await connection.getBalance(publicKey)
      const balanceInSOL = balanceInLamports / LAMPORTS_PER_SOL
      setBalance(balanceInSOL)
      console.log('💰 Balance fetched:', balanceInSOL, 'SOL')
    } catch (err) {
      console.error('❌ Error fetching balance:', err)
      setError('Failed to fetch balance')
    } finally {
      setLoading(false)
    }
  }

  // Fetch balance when wallet connects or publicKey changes
  useEffect(() => {
    fetchBalance()
  }, [publicKey, connected])

  // Auto-refresh balance every 30 seconds
  useEffect(() => {
    if (!connected) return

    const interval = setInterval(() => {
      fetchBalance()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [connected])

  if (!connected) {
    return (
      <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <p>🔒 Connect your wallet to view balance</p>
      </div>
    )
  }

  return (
    <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #4CAF50', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
      <h3>💰 Wallet Balance</h3>
      
      {loading ? (
        <p>⏳ Loading balance...</p>
      ) : error ? (
        <div>
          <p style={{ color: 'red' }}>❌ {error}</p>
          <button onClick={fetchBalance} style={{ marginTop: '10px', padding: '5px 10px' }}>
            🔄 Retry
          </button>
        </div>
      ) : (
        <div>
          <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#4CAF50' }}>
            {balance.toFixed(4)} SOL
          </p>
          <p style={{ fontSize: '12px', color: '#666' }}>
            ≈ ${(balance * 100).toFixed(2)} USD (estimated)
          </p>
          <button 
            onClick={fetchBalance} 
            style={{ 
              marginTop: '10px', 
              padding: '5px 10px', 
              fontSize: '12px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            🔄 Refresh
          </button>
        </div>
      )}
    </div>
  )
}

export default WalletBalance
