# Tradier API Setup Guide

This application supports integration with **Tradier API** for real-time stock and options data.

## 🎯 Why Tradier?

✅ **Free Sandbox Account** - No brokerage account needed for testing  
✅ **Easy Setup** - Just need an API token  
✅ **No CORS Issues** - RESTful API works great with web apps  
✅ **Good Documentation** - Clear API endpoints  
✅ **Real Options Data** - Includes Greeks (delta, gamma, theta, etc.)  

## 🚀 Quick Start

### Option 1: Mock Mode (No Setup - Default)

No setup required! The app runs in mock mode by default.

```bash
npm run dev
```

### Option 2: Tradier Sandbox (Free Testing)

1. Get a free Tradier sandbox account
2. Configure your API token
3. Use realistic test data

### Option 3: Tradier Production (Real Data)

Requires a Tradier brokerage account for live market data.

## 📋 Setup Steps

### Step 1: Create Tradier Developer Account

1. Visit: https://developer.tradier.com
2. Click "Get Started" or "Sign Up"
3. Create your account (free!)

### Step 2: Get API Token

1. Log in to https://developer.tradier.com
2. Go to "API Access" or "Your Applications"
3. Create a new application
4. Copy your **Access Token**

**Sandbox Token** - For testing (free)  
**Production Token** - For live data (requires brokerage account)

### Step 3: Configure Environment Variables

1. Copy the example file:

```bash
cp .env.example .env
```

2. Edit `.env` with your API token:

```env
# Tradier API Token
VITE_TRADIER_API_TOKEN=your_actual_api_token_here

# API Base URL
# Sandbox (free): https://sandbox.tradier.com
# Production: https://api.tradier.com
VITE_TRADIER_API_BASE_URL=https://sandbox.tradier.com

# Enable real API
VITE_USE_MOCK_DATA=false

# Timeout
VITE_API_TIMEOUT=10000
```

### Step 4: Run the Application

```bash
npm run dev
```

Open http://localhost:3000 and start using real options data!

## 🔐 Security Notes

### Important Security Practices

1. **Never commit `.env` to version control**
   - Already added to `.gitignore`
   - Contains your API token

2. **Use `.env.example` for documentation**
   - Safe to commit
   - Shows required variables without actual tokens

3. **Rotate tokens regularly**
   - Generate new tokens periodically
   - Revoke old tokens if compromised

4. **Sandbox vs Production**
   - Use sandbox for development
   - Only use production token when needed

## 📡 API Endpoints Used

The application uses the following Tradier API endpoints:

1. **Get Stock Quote**
   - `GET /v1/markets/quotes`
   - Parameters: `symbols`, `greeks`
   - Returns current stock price

2. **Get Option Expirations**
   - `GET /v1/markets/options/expirations`
   - Parameters: `symbol`, `includeAllRoots`, `strikes`
   - Returns list of expiration dates

3. **Get Options Chain**
   - `GET /v1/markets/options/chains`
   - Parameters: `symbol`, `expiration`, `greeks`
   - Returns option contracts with pricing and Greeks

## 🔄 Switching Modes

### Use Mock Data (Development)

```env
VITE_USE_MOCK_DATA=true
```

- ✅ No Tradier account needed
- ✅ Instant response
- ✅ Simulated realistic data
- ✅ Perfect for testing

### Use Sandbox (Free Testing)

```env
VITE_USE_MOCK_DATA=false
VITE_TRADIER_API_BASE_URL=https://sandbox.tradier.com
VITE_TRADIER_API_TOKEN=your_sandbox_token
```

- ✅ Free Tradier developer account
- ✅ Test data (delayed 15 minutes)
- ✅ No brokerage account needed
- ✅ All features available

### Use Production (Real-Time Data)

```env
VITE_USE_MOCK_DATA=false
VITE_TRADIER_API_BASE_URL=https://api.tradier.com
VITE_TRADIER_API_TOKEN=your_production_token
```

- ⚠️ Requires Tradier brokerage account
- ✅ Real-time market data
- ✅ Live options chains
- ⚠️ Subject to API rate limits

## ⚠️ Troubleshooting

### Common Issues

**1. 401 Unauthorized**
```
Error: Request failed with status code 401
```
**Solution:** 
- Check your API token is correct in `.env`
- Ensure token matches the API base URL (sandbox vs production)
- Generate a new token if needed

**2. 404 Not Found**
```
Error: Request failed with status code 404
```
**Solution:**
- Verify the stock symbol exists (e.g., "AAPL")
- Check symbol has listed options
- Ensure expiration date is valid

**3. 429 Rate Limited**
```
Error: Request failed with status code 429
```
**Solution:**
- Tradier has rate limits (120 requests/minute for sandbox)
- Add delays between requests
- Consider caching responses

**4. No Options Data**
```
Error: No valid call options found
```
**Solution:**
- Symbol might not have options (e.g., small-cap stocks)
- Try a major stock: AAPL, MSFT, SPY
- Check if market is open (for production API)

**5. Network Errors**
```
Error: Network Error
```
**Solution:**
- Check your internet connection
- Verify API base URL is correct
- App will automatically fallback to mock mode

## 📚 Additional Resources

- [Tradier Developer Portal](https://developer.tradier.com)
- [Tradier API Documentation](https://documentation.tradier.com/brokerage-api)
- [API Reference - Market Data](https://documentation.tradier.com/brokerage-api/markets/get-quotes)
- [API Reference - Options](https://documentation.tradier.com/brokerage-api/markets/get-options-chains)

## 🆘 Support

For Tradier API issues:
- [Tradier Support](https://support.tradier.com)
- [Developer Community](https://developer.tradier.com/community)
- Check API status: https://status.tradier.com

## 🔄 Fallback Behavior

If the Tradier API fails for any reason, the application automatically falls back to mock data mode to ensure continuous operation. Check the console logs for details.

## 💡 Rate Limits

### Sandbox Account
- 120 requests per minute
- Delayed data (15 minutes)
- Free forever

### Production Account
- 120 requests per minute
- Real-time data
- Requires brokerage account

### Best Practices
- Cache responses when possible
- Batch requests when available
- Monitor rate limit headers in responses

