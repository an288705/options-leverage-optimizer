# 🚀 Quick Start - Tradier API

## 📋 TL;DR

```bash
# 1. Start with mock data (no setup needed)
npm run dev

# 2. When ready for real data (FREE):
# Visit https://developer.tradier.com
# Sign up for free sandbox account
# Get your API token

# 3. Configure
cp .env.example .env
# Edit .env: add your VITE_TRADIER_API_TOKEN
# Set VITE_USE_MOCK_DATA=false

# 4. Restart
npm run dev
```

## 🔐 Environment Variables

| Variable | Example | Description |
|----------|---------|-------------|
| `VITE_TRADIER_API_TOKEN` | `abc123xyz...` | Your Tradier API token |
| `VITE_TRADIER_API_BASE_URL` | `https://sandbox.tradier.com` | Sandbox or production |
| `VITE_USE_MOCK_DATA` | `true` | Toggle mock/real data |
| `VITE_API_TIMEOUT` | `10000` | Request timeout (ms) |

## 🆓 Free Sandbox Account

**No brokerage account needed!**

1. Visit: https://developer.tradier.com
2. Sign up (free)
3. Get API token
4. Use sandbox URL: `https://sandbox.tradier.com`

**Sandbox Features:**
- ✅ Free forever
- ✅ Real options chains (delayed 15 min)
- ✅ All Greeks included
- ✅ 120 requests/minute
- ✅ Perfect for development

## 🔄 Mode Comparison

| Feature | Mock Mode | Sandbox Mode | Production Mode |
|---------|-----------|--------------|-----------------|
| Cost | FREE | FREE | Requires brokerage |
| Setup | None | API token | API token + account |
| Data | Simulated | Real (delayed 15min) | Real-time |
| Account | None | Developer | Brokerage |
| Rate Limit | None | 120/min | 120/min |

## ⚡ Quick Commands

```bash
# Development (mock data)
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Format code
npm run format
```

## 🆘 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| 401 error | Check API token in `.env` |
| 404 error | Verify stock symbol exists |
| No data | Try major stocks: AAPL, MSFT, SPY |
| Network error | Check internet connection |

## 📚 Full Documentation

- Setup Guide: [TRADIER_API_SETUP.md](./TRADIER_API_SETUP.md)
- Tradier Docs: https://documentation.tradier.com

## 🔒 Security

- ✅ `.env` is in `.gitignore`
- ✅ Never commit API tokens
- ✅ Use `.env.example` for templates

