import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { clusterApiUrl } from '@solana/web3.js'

// Get network from environment variable
const getNetworkFromEnv = () => {
  const network = import.meta.env.VITE_SOLANA_NETWORK?.toLowerCase()
  
  switch (network) {
    case 'mainnet':
      return WalletAdapterNetwork.Mainnet
    case 'testnet':
      return WalletAdapterNetwork.Testnet
    case 'devnet':
      return WalletAdapterNetwork.Devnet
    case 'localhost':
      return 'localhost'
    default:
      console.warn(`Unknown network: ${network}, defaulting to devnet`)
      return WalletAdapterNetwork.Devnet
  }
}

// Get RPC endpoint based on environment configuration
export const getSolanaEndpoint = () => {
  // Check if custom RPC URL is provided
  const customRpcUrl = import.meta.env.VITE_SOLANA_RPC_URL
  if (customRpcUrl) {
    console.log('🌐 Using custom RPC URL:', customRpcUrl)
    return customRpcUrl
  }

  // Check if using localhost
  const localRpcUrl = import.meta.env.VITE_LOCAL_RPC_URL
  const network = getNetworkFromEnv()
  
  if (network === 'localhost' && localRpcUrl) {
    console.log('🏠 Using local RPC URL:', localRpcUrl)
    return localRpcUrl
  }

  // Use standard cluster API URLs
  if (network !== 'localhost') {
    const endpoint = clusterApiUrl(network)
    console.log('🌐 Using cluster API URL:', endpoint)
    return endpoint
  }

  // Fallback to devnet
  console.warn('⚠️ No valid network configuration found, defaulting to devnet')
  return clusterApiUrl(WalletAdapterNetwork.Devnet)
}

// Get network name for display
export const getNetworkName = () => {
  const network = import.meta.env.VITE_SOLANA_NETWORK?.toLowerCase()
  return network || 'devnet'
}

// Check if we're in development mode
export const isDevelopment = () => {
  return import.meta.env.DEV
}

// Get API base URL from environment
export const getApiBaseUrl = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8888'
  return `${baseUrl}/api/crypto-transactions`
}

// Get all configuration for debugging
export const getConfig = () => {
  return {
    network: getNetworkFromEnv(),
    endpoint: getSolanaEndpoint(),
    networkName: getNetworkName(),
    isDevelopment: isDevelopment(),
    apiBaseUrl: getApiBaseUrl(),
    env: {
      VITE_SOLANA_NETWORK: import.meta.env.VITE_SOLANA_NETWORK,
      VITE_SOLANA_RPC_URL: import.meta.env.VITE_SOLANA_RPC_URL,
      VITE_LOCAL_RPC_URL: import.meta.env.VITE_LOCAL_RPC_URL,
      VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    }
  }
}
