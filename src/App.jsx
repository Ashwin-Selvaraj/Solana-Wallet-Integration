import React, { useMemo } from 'react'
import './App.css'

import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react'
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { clusterApiUrl } from '@solana/web3.js'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'

import '@solana/wallet-adapter-react-ui/styles.css'

function App() {
  console.log('🚀 App component is rendering')
  console.log('🚀 App component is rendering')
  console.log('🚀 App component is rendering')

  return (
    <>
      <Context>
        <Content/>
      </Context>
    </>
  )
}

export default App

const Context = ({children}) => {
  console.log('🔧 Context component is rendering')
  console.log('🔧 Context component is rendering')
  console.log('🔧 Context component is rendering')

  // You can change this to WalletAdapterNetwork.Mainnet for production
  const network = WalletAdapterNetwork.Devnet
  const endpoint = useMemo(() => clusterApiUrl(network), [network])
  console.log('Using endpoint:', endpoint)
  // For local development, uncomment the line below and comment the lines above
  // const endpoint = "http://localhost:8899"
  
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(), 
    new SolflareWalletAdapter(), 
  ], [])
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

const Content = () => {
  console.log('📱 Content component is rendering')
  console.log('📱 Content component is rendering')
  console.log('📱 Content component is rendering')
  
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
