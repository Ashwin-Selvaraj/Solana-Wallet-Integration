import React from 'react'
import './App.css'
import { WalletContext, WalletContent } from './components'
import ErrorBoundary from './components/ErrorBoundary'
import '@solana/wallet-adapter-react-ui/styles.css'

function App() {
  console.log('🚀 App component is rendering')
  console.log('🚀 App component is rendering')
  console.log('🚀 App component is rendering')

  return (
    <WalletContext>
      <ErrorBoundary>
        <WalletContent />
      </ErrorBoundary>
    </WalletContext>
  )
}

export default App
