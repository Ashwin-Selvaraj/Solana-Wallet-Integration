import React from 'react'
import './App.css'
import { WalletContext, WalletContent } from './components'
import '@solana/wallet-adapter-react-ui/styles.css'

function App() {
  console.log('🚀 App component is rendering')
  console.log('🚀 App component is rendering')
  console.log('🚀 App component is rendering')

  return (
    <WalletContext>
      <WalletContent />
    </WalletContext>
  )
}

export default App
