import React from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

const WalletContent = () => {
  console.log('📱 WalletContent component is rendering')
  console.log('📱 WalletContent component is rendering')
  console.log('📱 WalletContent component is rendering')
  
  const { publicKey, connected, connecting, disconnect } = useWallet()
  console.log('Wallet state:', { publicKey, connected, connecting })

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
    </div>
  )
}

export default WalletContent
