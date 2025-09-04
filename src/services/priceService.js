// Price fetching service for SOL/USD
class PriceService {
  constructor() {
    this.cache = new Map()
    this.cacheTimeout = 60000 // 1 minute cache
  }

  // Get SOL price from CoinGecko API
  async getSolPrice() {
    const cacheKey = 'sol_price'
    const cached = this.cache.get(cacheKey)
    
    // Return cached price if still valid
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log('💰 Using cached SOL price:', cached.price)
      return cached.price
    }

    try {
      console.log('🔄 Fetching SOL price from CoinGecko...')
      
      // CoinGecko API - free tier, no API key required
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true'
      )
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('📊 CoinGecko response:', data)
      
      const price = data.solana?.usd
      const change24h = data.solana?.usd_24h_change
      
      if (!price || typeof price !== 'number' || price <= 0) {
        throw new Error('Invalid price data from CoinGecko')
      }

      // Cache the result
      this.cache.set(cacheKey, {
        price,
        change24h,
        timestamp: Date.now()
      })

      console.log('✅ SOL price fetched:', price, 'USD (24h change:', change24h, '%)')
      
      return { price, change24h }
    } catch (error) {
      console.error('❌ Error fetching SOL price:', error)
      
      // Return cached price if available, even if expired
      if (cached) {
        console.log('⚠️ Using expired cached price due to API error')
        return { price: cached.price, change24h: cached.change24h }
      }
      
      throw error
    }
  }

  // Alternative API - Jupiter API (Solana ecosystem)
  async getSolPriceFromJupiter() {
    try {
      console.log('🔄 Fetching SOL price from Jupiter...')
      
      const response = await fetch(
        'https://price.jup.ag/v4/price?ids=SOL'
      )
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('📊 Jupiter response:', data)
      
      const price = data.data?.SOL?.price
      
      if (!price || typeof price !== 'number' || price <= 0) {
        throw new Error('Invalid price data from Jupiter')
      }

      console.log('✅ SOL price from Jupiter:', price, 'USD')
      return { price, change24h: null }
    } catch (error) {
      console.error('❌ Error fetching SOL price from Jupiter:', error)
      throw error
    }
  }

  // Get price with fallback APIs
  async getSolPriceWithFallback() {
    try {
      // Try CoinGecko first
      return await this.getSolPrice()
    } catch (error) {
      console.log('🔄 CoinGecko failed, trying Jupiter...')
      try {
        // Fallback to Jupiter
        return await this.getSolPriceFromJupiter()
      } catch (jupiterError) {
        console.error('❌ All price APIs failed')
        throw new Error('Unable to fetch SOL price from any source')
      }
    }
  }

  // Clear cache
  clearCache() {
    this.cache.clear()
    console.log('🗑️ Price cache cleared')
  }
}

// Create singleton instance
const priceService = new PriceService()

export default priceService
