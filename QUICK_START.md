# Quick Start Guide

## 🚀 Getting Started

The application is now ready to use! Follow these steps:

### 1. Start the Development Server

The server is already running on `http://localhost:3000` (it should open automatically in your browser).

If you need to restart it:

```bash
cd /Users/ajadvincula/visual-studio-workspace/options-leverage-optimizer
npm run dev
```

### 2. Using the Application

#### Step 1: Enter a Stock Symbol

- Type a ticker symbol in the "Stock Symbol" field (e.g., `AAPL`, `MSFT`, `GOOGL`, `TSLA`)
- Click "Fetch Options Data" or press Enter

#### Step 2: Configure Your Parameters

- **Total Equity (T)**: Your total investment capital (default: $10,000)
- **Desired Shares (DS)**: Target number of shares exposure you want (default: 100)
- **Expiry Date**: Select from available option expiration dates
- **Delta Range**: Filter options by delta (default: 0.3 to 0.9)

#### Step 3: View Results

The app will automatically calculate and display:

- **Optimal Contract** (highlighted in purple) - requires the fewest contracts
- **All Valid Options** table with detailed metrics
- Total cost, delta exposure, and breakdown for each option

## 📊 Understanding the Results

### Optimal Contract Card

Shows the best option requiring the minimum number of contracts to achieve your goals:

- **Strike Price**: The option's strike price
- **Contracts Needed (C)**: How many option contracts to buy
- **Shares Needed (N)**: How many shares to buy directly
- **Delta**: The option's delta value
- **Total Cost**: Total investment (should equal your equity)

### Results Table

All valid options sorted by efficiency (fewest contracts first):

- **Strike**: Option strike price
- **Delta**: Delta per contract
- **Premium**: Cost per share for the option
- **Contracts (C)**: Number of contracts to purchase
- **Shares (N)**: Number of shares to purchase
- **Total Cost**: Total investment (S×N + O×C)
- **Delta Exposure**: Effective shares exposure (N + D×C)

## 🔧 Available Stock Symbols (Mock Data)

The current implementation uses mock data for the following symbols:

- **AAPL**: $175.50
- **MSFT**: $415.20
- **GOOGL**: $142.30
- **TSLA**: $242.80
- **NVDA**: $875.40
- **AMZN**: $178.65
- **META**: $485.30

You can enter any symbol, and the app will generate realistic mock options data.

## 🧮 The Math Behind It

The optimizer solves this system of equations for each option:

1. **S×N + O×C = T**
   - S = Stock price
   - N = Number of shares to buy
   - O = Option premium per contract
   - C = Number of contracts to buy
   - T = Your total equity

2. **N + D×C = DS**
   - D = Delta per contract
   - DS = Your desired share exposure

**Solution:**

- C = (T - S×DS) / (O - S×D)
- N = DS - D×C

The app finds the option with the **minimum C** value.

## 🎯 Example Scenario

**Goal**: Get exposure to 100 shares of AAPL with $10,000

**Without optimization:**

- Buy 100 shares at $175.50 = $17,550 (need $7,550 more!)

**With optimization:**

- Option: Strike $170, Delta 0.65, Premium $8.50
- Buy 2.5 contracts (C) + 35 shares (N)
- Cost: 35×$175.50 + 2.5×100×$8.50 = $6,143 + $2,125 = $8,268
- Exposure: 35 + 2.5×100×0.65 = 35 + 162.5 ≈ 197.5 shares equivalent
- **Leverage achieved!** Get more exposure for less capital

## 📁 Project Structure

```
options-leverage-optimizer/
├── src/
│   ├── models/          # Model layer (React Context)
│   │   └── AppContext.tsx
│   ├── views/           # View layer (UI Components)
│   │   ├── InputForm.tsx
│   │   └── ResultsDisplay.tsx
│   ├── controllers/     # Controller layer (Business Logic)
│   │   ├── apiService.ts
│   │   ├── calculationService.ts
│   │   └── useOptionsController.ts
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🔌 Integrating Real API Data

To connect to a real options data provider:

1. Choose an API provider (Polygon.io, Alpha Vantage, Tradier, etc.)
2. Get an API key
3. Update `src/controllers/apiService.ts`:

```typescript
// Replace the fetchOptionsChain method with:
static async fetchOptionsChain(symbol: string): Promise<OptionsChainData> {
  const apiKey = 'YOUR_API_KEY';
  const response = await axios.get(
    `https://api.provider.com/options/${symbol}`,
    { headers: { 'Authorization': `Bearer ${apiKey}` } }
  );

  // Transform the API response to match OptionsChainData interface
  return transformApiResponse(response.data);
}
```

## 🎨 Customization

### Change Theme Colors

Edit `src/App.tsx` and modify the theme:

```typescript
const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea', // Change this
    },
    // ... more customization
  },
});
```

### Adjust Default Values

Edit `src/models/AppContext.tsx`:

```typescript
const defaultUserInputs: UserInputs = {
  totalEquity: 10000, // Change default equity
  desiredShares: 100, // Change default shares
  deltaMin: 0.3, // Change delta range
  deltaMax: 0.9,
  stockSymbol: 'AAPL', // Change default symbol
};
```

## 🐛 Troubleshooting

### Port Already in Use

If port 3000 is busy, edit `vite.config.ts`:

```typescript
server: {
  port: 3001,  // Change to any available port
}
```

### Build Errors

Clear the build cache:

```bash
rm -rf dist node_modules
npm install
npm run build
```

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Material UI Documentation](https://mui.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Vite Documentation](https://vitejs.dev/)

## 🎉 You're All Set!

The application is fully functional and ready to use. Open `http://localhost:3000` in your browser and start optimizing your options strategies!
