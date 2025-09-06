import React, { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import WalletBalance from './WalletBalance'
import DepositComponent from './DepositComponent'
import LoginComponent from './LoginComponent'
import GameBalanceComponent from './GameBalanceComponent'
import authService from '../services/authService'
import walletConnectService from '../services/walletConnectService'

const WalletContent = () => {
  console.log('📱 WalletContent component is rendering')
  
  const { publicKey, connected, connecting, disconnect } = useWallet()
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated())
  const [walletConnectedToBackend, setWalletConnectedToBackend] = useState(false)
  const [walletConnectionLoading, setWalletConnectionLoading] = useState(false)
  const [walletConnectionError, setWalletConnectionError] = useState(null)
  const [serverStatus, setServerStatus] = useState(null)
  const [serverStatusLoading, setServerStatusLoading] = useState(false)
  
  console.log('Wallet state:', { publicKey, connected, connecting })
  console.log('Auth state:', { isAuthenticated })
  console.log('Backend wallet state:', { walletConnectedToBackend, walletConnectionLoading })

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

  // Connect wallet to backend when wallet connects
  const connectWalletToBackend = async (retryCount = 0) => {
    if (!publicKey || !isAuthenticated) {
      console.log('⚠️ Cannot connect wallet: missing publicKey or authentication')
      return
    }

    setWalletConnectionLoading(true)
    setWalletConnectionError(null)

    try {
      console.log(`🔄 Connecting wallet to backend (attempt ${retryCount + 1}):`, publicKey.toString())
      await walletConnectService.connectWallet(publicKey.toString())
      setWalletConnectedToBackend(true)
      console.log('✅ Wallet connected to backend successfully')
    } catch (error) {
      console.error('❌ Error connecting wallet to backend:', error)
      setWalletConnectionError(error.message)
      
      // Auto-retry for network errors (up to 2 retries)
      if (retryCount < 2 && (error.message.includes('Network error') || error.message.includes('Connection failed'))) {
        console.log(`🔄 Auto-retrying connection in 2 seconds... (attempt ${retryCount + 2})`)
        setTimeout(() => {
          connectWalletToBackend(retryCount + 1)
        }, 2000)
        return
      }
    } finally {
      setWalletConnectionLoading(false)
    }
  }

  // Manual retry function
  const retryWalletConnection = () => {
    if (publicKey && isAuthenticated) {
      connectWalletToBackend()
    }
  }

  // Test server connectivity
  const testServerConnectivity = async () => {
    setServerStatusLoading(true)
    try {
      const result = await walletConnectService.testServerConnectivity()
      setServerStatus(result)
    } catch (error) {
      setServerStatus({
        success: false,
        error: 'Test failed',
        details: error.message
      })
    } finally {
      setServerStatusLoading(false)
    }
  }

  // Disconnect wallet from backend when wallet disconnects
  const disconnectWalletFromBackend = async () => {
    console.log('🔄 Disconnecting wallet (local state only)')
    
    // Just update local state - no backend API call needed for disconnection
    setWalletConnectedToBackend(false)
    setWalletConnectionError(null)
    console.log('✅ Wallet disconnected successfully (local state updated)')
  }

  // Handle wallet connection changes
  useEffect(() => {
    if (connected && publicKey && isAuthenticated) {
      connectWalletToBackend()
    } else if (!connected && walletConnectedToBackend) {
      disconnectWalletFromBackend()
    }
  }, [connected, publicKey, isAuthenticated])

  return (
    <div className='App'>
      <h1>Solana Wallet Integration</h1>
      <WalletMultiButton />
      
      {connected && publicKey && (
        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #4CAF50', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
          <h3>👛 Wallet Connected</h3>
          <p><strong>Public Key:</strong> {publicKey.toString()}</p>
          
          {/* Backend Connection Status */}
          <div style={{ marginTop: '10px' }}>
            {walletConnectionLoading ? (
              <p style={{ color: '#ff9800' }}>⏳ Connecting to backend...</p>
            ) : walletConnectedToBackend ? (
              <p style={{ color: '#4CAF50' }}>✅ Connected to backend</p>
            ) : walletConnectionError ? (
              <div>
                <p style={{ color: '#f44336' }}>❌ Backend connection failed: {walletConnectionError}</p>
                <button 
                  onClick={retryWalletConnection}
                  style={{ 
                    marginTop: '5px',
                    padding: '5px 10px',
                    backgroundColor: '#ff9800',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  🔄 Retry Connection
                </button>
              </div>
            ) : (
              <p style={{ color: '#666' }}>⏳ Waiting for backend connection...</p>
            )}
          </div>
          
          <button 
            onClick={disconnect} 
            style={{ 
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Disconnect Wallet
          </button>
        </div>
      )}
      
      {connecting && (
        <p>Connecting to wallet...</p>
      )}

      {/* Network Status Check */}
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        border: '1px solid #ccc', 
        borderRadius: '5px',
        backgroundColor: '#f9f9f9',
        fontSize: '12px'
      }}>
        <h4>🌐 Network & Server Status</h4>
        <p><strong>Online:</strong> {navigator.onLine ? '✅ Yes' : '❌ No'}</p>
        <p><strong>API Base URL:</strong> {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8888'}</p>
        <p><strong>Wallet API URL:</strong> {import.meta.env.VITE_API_BASE_URL?.replace('/api/crypto-transactions', '/api/wallet') || 'http://localhost:8888/api/wallet'}</p>
        
        <div style={{ marginTop: '10px' }}>
          <button
            onClick={testServerConnectivity}
            disabled={serverStatusLoading}
            style={{
              padding: '5px 10px',
              backgroundColor: serverStatusLoading ? '#ccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: serverStatusLoading ? 'not-allowed' : 'pointer',
              fontSize: '12px'
            }}
          >
            {serverStatusLoading ? '⏳ Testing...' : '🔍 Test Server Connection'}
          </button>
        </div>

        {serverStatus && (
          <div style={{ 
            marginTop: '10px', 
            padding: '8px', 
            backgroundColor: serverStatus.success ? '#e8f5e8' : '#ffe6e6',
            border: `1px solid ${serverStatus.success ? '#4CAF50' : '#ff6b6b'}`,
            borderRadius: '4px',
            color: serverStatus.success ? '#2e7d32' : '#d32f2f'
          }}>
            {serverStatus.success ? (
              <div>
                <strong>✅ Server Status:</strong> {serverStatus.message}
                {serverStatus.status && <div>HTTP Status: {serverStatus.status}</div>}
              </div>
            ) : (
              <div>
                <strong>❌ Server Error:</strong> {serverStatus.error}
                {serverStatus.details && <div>Details: {serverStatus.details}</div>}
              </div>
            )}
          </div>
        )}
      </div>

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
