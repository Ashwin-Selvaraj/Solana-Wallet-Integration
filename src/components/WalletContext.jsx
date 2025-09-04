import React, { useMemo } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { getSolanaEndpoint, getNetworkName, getConfig } from '../config/solana'

const WalletContext = ({ children }) => {
  console.log('🔧 WalletContext component is rendering')
  console.log('🔧 WalletContext component is rendering')
  console.log('🔧 WalletContext component is rendering')

  // Get configuration from environment variables
  const config = useMemo(() => getConfig(), [])
  const endpoint = useMemo(() => getSolanaEndpoint(), [])
  
  console.log('📋 Solana Configuration:', config)
  console.log('🌐 Using endpoint:', endpoint)
  
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

export default WalletContext
