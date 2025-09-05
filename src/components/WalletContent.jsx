import React, { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import WalletBalance from './WalletBalance'
import DepositComponent from './DepositComponent'
import LoginComponent from './LoginComponent'
import GameBalanceComponent from './GameBalanceComponent'
import authService from '../services/authService'

const WalletContent = () => {
  console.log('📱 WalletContent component is rendering')
  
  const { publicKey, connected, connecting, disconnect } = useWallet()
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated())
  
  console.log('Wallet state:', { publicKey, connected, connecting })
  console.log('Auth state:', { isAuthenticated })

  // Update auth state when token changes
  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(authService.isAuthenticated())
    }
    
    // Check auth state periodically
    const interval = setInterval(checkAuth, 1000)
    
    return () => clearInterval(interval)
  }, [])

  const handleLoginSuccess = (token) => {
    setIsAuthenticated(true)
  }

  return (
    <div className='App'>
      <h1>Solana Wallet Integration</h1>
      <WalletMultiButton />
      
      {connected && publicKey && (
        <div style={{ marginTop: '20px' }}>
          <p>Wallet Connected!</p>
          <p>Public Key: {publicKey.toString()}</p>
          <button onClick={disconnect} style={{ marginTop: '10px' }}>
            Disconnect Wallet
          </button>
        </div>
      )}
      
      {connecting && (
        <p>Connecting to wallet...</p>
      )}

      {/* Authentication Component */}
      <LoginComponent onLoginSuccess={handleLoginSuccess} />

      {/* Wallet Balance Component */}
      <WalletBalance />

      {/* Game Balance Component - Only show when user is authenticated */}
      {isAuthenticated && <GameBalanceComponent />}

      {/* Deposit Component - Only show when wallet is connected AND user is authenticated */}
      {connected && isAuthenticated && <DepositComponent />}
    </div>
  )
}

export default WalletContent
