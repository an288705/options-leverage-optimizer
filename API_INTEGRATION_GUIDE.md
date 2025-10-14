# API Integration Guide

This guide explains how to integrate real options data APIs to replace the mock data in the application.

## Recommended API Providers

### 1. Polygon.io ⭐ Recommended

**Pros**:

- Comprehensive options data
- Real-time and historical data
- Good documentation
- Reasonable pricing

**Pricing**: Free tier available, paid plans from $29/month

**Example Integration**:

```typescript
// src/controllers/apiService.ts

import axios from 'axios';

export class ApiService {
  private static readonly API_KEY = 'YOUR_POLYGON_API_KEY';
  private static readonly BASE_URL = 'https://api.polygon.io';

  static async fetchOptionsChain(symbol: string): Promise<OptionsChainData> {
    try {
      // 1. Fetch stock price
      const stockResponse = await axios.get(`${this.BASE_URL}/v2/aggs/ticker/${symbol}/prev`, {
        params: { apiKey: this.API_KEY },
      });

      const stockPrice = stockResponse.data.results[0].c; // close price

      // 2. Fetch options contracts
      const optionsResponse = await axios.get(`${this.BASE_URL}/v3/reference/options/contracts`, {
        params: {
          underlying_ticker: symbol,
          contract_type: 'call',
          limit: 250,
          apiKey: this.API_KEY,
        },
      });

      // 3. Get unique expiry dates
      const expiryDates = [
        ...new Set(optionsResponse.data.results.map((contract: any) => contract.expiration_date)),
      ].sort();

      // 4. For each contract, fetch greeks (including delta)
      const contracts: OptionContract[] = await Promise.all(
        optionsResponse.data.results.map(async (contract: any) => {
          const greeksResponse = await axios.get(
            `${this.BASE_URL}/v3/snapshot/options/${contract.ticker}`,
            { params: { apiKey: this.API_KEY } }
          );

          const greeks = greeksResponse.data.results;

          return {
            strike: contract.strike_price,
            expiry: contract.expiration_date,
            premium: greeks.last_quote?.ask || 0,
            delta: greeks.greeks?.delta || 0,
            symbol: contract.ticker,
            type: 'call',
          };
        })
      );

      return {
        stock: {
          symbol,
          price: stockPrice,
          timestamp: new Date().toISOString(),
        },
        expiryDates,
        contracts,
      };
    } catch (error) {
      throw new Error(`Failed to fetch data from Polygon: ${error}`);
    }
  }
}
```

### 2. Tradier

**Pros**:

- Developer-friendly
- Good documentation
- WebSocket support for real-time data

**Pricing**: Free sandbox account, $10/month for live data

**Example Integration**:

```typescript
export class ApiService {
  private static readonly API_KEY = 'YOUR_TRADIER_API_KEY';
  private static readonly BASE_URL = 'https://api.tradier.com/v1';

  static async fetchOptionsChain(symbol: string): Promise<OptionsChainData> {
    try {
      // 1. Fetch stock price
      const quoteResponse = await axios.get(`${this.BASE_URL}/markets/quotes`, {
        params: { symbols: symbol },
        headers: {
          Authorization: `Bearer ${this.API_KEY}`,
          Accept: 'application/json',
        },
      });

      const stockPrice = quoteResponse.data.quotes.quote.last;

      // 2. Fetch expiry dates
      const expiryResponse = await axios.get(`${this.BASE_URL}/markets/options/expirations`, {
        params: { symbol },
        headers: {
          Authorization: `Bearer ${this.API_KEY}`,
          Accept: 'application/json',
        },
      });

      const expiryDates = expiryResponse.data.expirations.date;

      // 3. Fetch options chain for each expiry
      const allContracts: OptionContract[] = [];

      for (const expiry of expiryDates.slice(0, 4)) {
        const chainResponse = await axios.get(`${this.BASE_URL}/markets/options/chains`, {
          params: {
            symbol,
            expiration: expiry,
            greeks: true,
          },
          headers: {
            Authorization: `Bearer ${this.API_KEY}`,
            Accept: 'application/json',
          },
        });

        const options = chainResponse.data.options.option;

        allContracts.push(
          ...options
            .filter((opt: any) => opt.option_type === 'call')
            .map((opt: any) => ({
              strike: opt.strike,
              expiry: opt.expiration_date,
              premium: opt.ask,
              delta: opt.greeks.delta,
              symbol: opt.symbol,
              type: 'call',
            }))
        );
      }

      return {
        stock: { symbol, price: stockPrice, timestamp: new Date().toISOString() },
        expiryDates: expiryDates.slice(0, 4),
        contracts: allContracts,
      };
    } catch (error) {
      throw new Error(`Failed to fetch data from Tradier: ${error}`);
    }
  }
}
```

### 3. Alpha Vantage

**Pros**:

- Free tier available
- Simple API
- No credit card required for free tier

**Cons**:

- Rate limits on free tier (5 requests/minute)
- Limited options data

**Example Integration**:

```typescript
export class ApiService {
  private static readonly API_KEY = 'YOUR_ALPHAVANTAGE_API_KEY';
  private static readonly BASE_URL = 'https://www.alphavantage.co/query';

  static async fetchOptionsChain(symbol: string): Promise<OptionsChainData> {
    try {
      // 1. Fetch stock price
      const quoteResponse = await axios.get(this.BASE_URL, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: symbol,
          apikey: this.API_KEY,
        },
      });

      const stockPrice = parseFloat(quoteResponse.data['Global Quote']['05. price']);

      // Note: Alpha Vantage has limited options support
      // You may need to use a different provider for options data
      // or implement a hybrid approach

      // This is a simplified example
      throw new Error(
        'Alpha Vantage has limited options support. Consider using Polygon.io or Tradier.'
      );
    } catch (error) {
      throw new Error(`Failed to fetch data: ${error}`);
    }
  }
}
```

## Environment Variables Setup

### 1. Create `.env` file

```bash
# .env (add to .gitignore!)
VITE_API_PROVIDER=polygon
VITE_POLYGON_API_KEY=your_polygon_key
VITE_TRADIER_API_KEY=your_tradier_key
VITE_ALPHAVANTAGE_API_KEY=your_alphavantage_key
```

### 2. Update `.gitignore`

```bash
# Add to .gitignore
.env
.env.local
.env.production
```

### 3. Access in Code

```typescript
const API_KEY = import.meta.env.VITE_POLYGON_API_KEY;
const API_PROVIDER = import.meta.env.VITE_API_PROVIDER || 'polygon';
```

## Error Handling Best Practices

```typescript
static async fetchOptionsChain(symbol: string): Promise<OptionsChainData> {
  try {
    // API call
    const response = await axios.get(url, config);
    return this.transformResponse(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with error
        throw new Error(
          `API Error: ${error.response.status} - ${error.response.data.message}`
        );
      } else if (error.request) {
        // Request made but no response
        throw new Error('Network error: No response from server');
      }
    }
    throw new Error(`Unexpected error: ${error}`);
  }
}
```

## Rate Limiting & Caching

### Implement Request Caching

```typescript
// Add to apiService.ts

private static cache = new Map<string, { data: any; timestamp: number }>();
private static readonly CACHE_DURATION = 60000; // 1 minute

static async fetchOptionsChain(symbol: string): Promise<OptionsChainData> {
  // Check cache
  const cached = this.cache.get(symbol);
  if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
    return cached.data;
  }

  // Fetch fresh data
  const data = await this.fetchFromAPI(symbol);

  // Update cache
  this.cache.set(symbol, { data, timestamp: Date.now() });

  return data;
}
```

### Implement Rate Limiting

```typescript
private static lastRequestTime = 0;
private static readonly MIN_REQUEST_INTERVAL = 200; // 200ms between requests

static async fetchOptionsChain(symbol: string): Promise<OptionsChainData> {
  // Enforce rate limit
  const now = Date.now();
  const timeSinceLastRequest = now - this.lastRequestTime;

  if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
    await new Promise(resolve =>
      setTimeout(resolve, this.MIN_REQUEST_INTERVAL - timeSinceLastRequest)
    );
  }

  this.lastRequestTime = Date.now();

  // Proceed with request
  return this.fetchFromAPI(symbol);
}
```

## Testing with Real API

### 1. Start with Sandbox/Test Environment

Most APIs provide sandbox environments:

- **Tradier**: `https://sandbox.tradier.com/v1`
- **TD Ameritrade**: Test accounts available
- **Interactive Brokers**: Paper trading account

### 2. Test with Known Symbols

Start with liquid stocks with active options:

- AAPL (Apple)
- SPY (S&P 500 ETF)
- QQQ (Nasdaq ETF)
- TSLA (Tesla)

### 3. Validate Data

```typescript
private static validateOptionsData(data: OptionsChainData): boolean {
  // Check required fields exist
  if (!data.stock || !data.expiryDates || !data.contracts) {
    throw new Error('Invalid data structure');
  }

  // Validate stock price
  if (data.stock.price <= 0) {
    throw new Error('Invalid stock price');
  }

  // Validate contracts
  data.contracts.forEach(contract => {
    if (contract.delta < 0 || contract.delta > 1) {
      throw new Error(`Invalid delta: ${contract.delta}`);
    }
    if (contract.premium < 0) {
      throw new Error(`Invalid option price: ${contract.premium}`);
    }
  });

  return true;
}
```

## Migration Steps

### Step 1: Keep Mock as Fallback

```typescript
static async fetchOptionsChain(symbol: string): Promise<OptionsChainData> {
  const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';

  if (useMockData) {
    return this.generateMockData(symbol);
  }

  try {
    return await this.fetchFromRealAPI(symbol);
  } catch (error) {
    console.warn('API failed, falling back to mock data:', error);
    return this.generateMockData(symbol);
  }
}
```

### Step 2: Add API Selection

```typescript
static async fetchOptionsChain(symbol: string): Promise<OptionsChainData> {
  const provider = import.meta.env.VITE_API_PROVIDER || 'mock';

  switch (provider) {
    case 'polygon':
      return this.fetchFromPolygon(symbol);
    case 'tradier':
      return this.fetchFromTradier(symbol);
    case 'alphavantage':
      return this.fetchFromAlphaVantage(symbol);
    default:
      return this.generateMockData(symbol);
  }
}
```

### Step 3: Update UI for Real Data

```typescript
// In InputForm.tsx
<Alert severity="info">
  Using {import.meta.env.VITE_API_PROVIDER || 'mock'} data provider
</Alert>
```

## Common Issues & Solutions

### Issue 1: CORS Errors

**Solution**: Use a proxy or enable CORS on your server

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://api.polygon.io',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  },
});
```

### Issue 2: Rate Limit Exceeded

**Solution**: Implement exponential backoff

```typescript
async function fetchWithRetry(url: string, maxRetries = 3): Promise<any> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await axios.get(url);
    } catch (error) {
      if (error.response?.status === 429) {
        const delay = Math.pow(2, i) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}
```

### Issue 3: Incomplete Options Data

**Solution**: Filter and validate

```typescript
const validContracts = contracts.filter(
  contract =>
    contract.delta !== null &&
    contract.premium > 0 &&
    contract.strike > 0 &&
    contract.delta >= 0.01 &&
    contract.delta <= 0.99
);
```

## Monitoring & Logging

```typescript
static async fetchOptionsChain(symbol: string): Promise<OptionsChainData> {
  const startTime = Date.now();

  try {
    console.log(`[API] Fetching options chain for ${symbol}`);
    const data = await this.fetchFromAPI(symbol);

    const duration = Date.now() - startTime;
    console.log(`[API] Success: ${data.contracts.length} contracts in ${duration}ms`);

    return data;
  } catch (error) {
    console.error(`[API] Error fetching ${symbol}:`, error);
    throw error;
  }
}
```

## Next Steps

1. Choose an API provider
2. Sign up and get API key
3. Set up environment variables
4. Implement API integration
5. Test with sandbox/test environment
6. Add error handling and retries
7. Implement caching
8. Deploy with production API key

## Resources

- [Polygon.io Documentation](https://polygon.io/docs/options/getting-started)
- [Tradier Documentation](https://documentation.tradier.com/)
- [Alpha Vantage Documentation](https://www.alphavantage.co/documentation/)
- [Axios Documentation](https://axios-http.com/docs/intro)
