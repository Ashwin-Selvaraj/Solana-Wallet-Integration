import React, { useState, useEffect } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import priceService from '../services/priceService'

const WalletBalance = () => {
  const { connection } = useConnection()
  const { publicKey, connected } = useWallet()
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [solPrice, setSolPrice] = useState(null)
  const [priceLoading, setPriceLoading] = useState(false)
  const [priceError, setPriceError] = useState(null)

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

  const fetchSolPrice = async () => {
    setPriceLoading(true)
    setPriceError(null)

    try {
      console.log('🔄 Starting price fetch...')
      const priceData = await priceService.getSolPriceWithFallback()
      console.log('✅ Price data received:', priceData)
      
      // Validate price data before setting state
      if (priceData && typeof priceData.price === 'number' && priceData.price > 0) {
        setSolPrice(priceData)
        console.log('💲 SOL price updated:', priceData.price, 'USD')
      } else {
        throw new Error('Invalid price data received')
      }
    } catch (err) {
      console.error('❌ Error fetching SOL price:', err)
      setPriceError('Failed to fetch SOL price')
      // Don't crash the app, just show error
    } finally {
      setPriceLoading(false)
    }
  }

  // Fetch balance and price when wallet connects or publicKey changes
  useEffect(() => {
    fetchBalance()
    fetchSolPrice()
  }, [publicKey, connected])

  // Auto-refresh balance and price every 30 seconds
  useEffect(() => {
    if (!connected) return

    const interval = setInterval(() => {
      fetchBalance()
      fetchSolPrice()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [connected])

  // Fetch price on component mount
  useEffect(() => {
    fetchSolPrice()
  }, [])

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
          
          {/* Real-time USD value */}
          {priceLoading ? (
            <p style={{ fontSize: '12px', color: '#666' }}>
              💲 Loading USD price...
            </p>
          ) : priceError ? (
            <p style={{ fontSize: '12px', color: '#ff6b6b' }}>
              ❌ Price unavailable
            </p>
          ) : solPrice ? (
            <div>
              <p style={{ fontSize: '12px', color: '#666' }}>
                ≈ ${(balance * (solPrice.price || 0)).toFixed(2)} USD
              </p>
              <p style={{ fontSize: '10px', color: '#888' }}>
                SOL: ${(solPrice.price || 0).toFixed(2)}
                {solPrice.change24h !== null && solPrice.change24h !== undefined && (
                  <span style={{ 
                    color: solPrice.change24h >= 0 ? '#4CAF50' : '#ff6b6b',
                    marginLeft: '5px'
                  }}>
                    ({solPrice.change24h >= 0 ? '+' : ''}{solPrice.change24h.toFixed(2)}% 24h)
                  </span>
                )}
              </p>
            </div>
          ) : (
            <p style={{ fontSize: '12px', color: '#666' }}>
              💲 Price loading...
            </p>
          )}
          
          <div style={{ marginTop: '10px' }}>
            <button 
              onClick={fetchBalance} 
              style={{ 
                marginRight: '5px',
                padding: '5px 10px', 
                fontSize: '12px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              🔄 Balance
            </button>
            <button 
              onClick={fetchSolPrice} 
              style={{ 
                padding: '5px 10px', 
                fontSize: '12px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              💲 Price
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default WalletBalance
