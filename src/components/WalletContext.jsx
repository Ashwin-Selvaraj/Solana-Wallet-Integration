import React, { useMemo } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { clusterApiUrl } from '@solana/web3.js'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'

const WalletContext = ({ children }) => {
  console.log('🔧 WalletContext component is rendering')
  console.log('🔧 WalletContext component is rendering')
  console.log('🔧 WalletContext component is rendering')

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

export default WalletContext
