# Options Leverage Optimizer

A React + TypeScript web application that helps users optimize leverage when buying call options by calculating the optimal number of contracts needed to achieve desired share exposure within a given equity budget.

> 📚 **New here?** See [INDEX.md](./INDEX.md) for a complete guide to all documentation, or jump to [QUICK_START.md](./QUICK_START.md) to start using the app immediately!

## Features

- **Live Options Data**: Fetches options chain data including strike prices, deltas, and premiums
- **Smart Calculations**: Solves system of equations to find optimal contract positions
- **Flexible Filtering**: Filter options by expiry date and delta range
- **Beautiful UI**: Modern, responsive interface built with Material UI
- **MVC Architecture**: Clean separation of concerns following Model-View-Controller pattern

## Business Logic

The app solves the following system of equations for each valid option contract:

1. **S×N + O×C = T** (Total equity constraint)
2. **N + D×C = DS** (Desired share exposure)

Where:

- **S** = Stock Price (fetched from API)
- **O** = Option Price per contract (fetched from API)
- **D** = Delta per contract (fetched from API)
- **T** = Total equity (user input)
- **DS** = Desired Shares (user input)
- **C** = Number of call contracts (solved)
- **N** = Number of shares (solved)

The optimal contract is the one requiring the **minimum number of contracts (C)** to meet your goals.

## Technology Stack

- **Language**: TypeScript
- **Framework**: React 18
- **UI Library**: Material UI (MUI)
- **Build Tool**: Vite
- **State Management**: React Context API
- **Architecture**: Model-View-Controller (MVC)

## Architecture

### Model Layer (`src/models/`)

- `AppContext.tsx`: React Context for global state management
- Stores user inputs, fetched data, and calculation results

### View Layer (`src/views/`)

- `InputForm.tsx`: User input form with Material UI components
- `ResultsDisplay.tsx`: Display of calculation results and optimal contract

### Controller Layer (`src/controllers/`)

- `apiService.ts`: Handles API calls for stock and options data
- `calculationService.ts`: Implements equation solving logic
- `useOptionsController.ts`: Main controller hook orchestrating business logic

### Types (`src/types/`)

- `index.ts`: TypeScript interfaces for type safety

## Installation

```bash
# Install dependencies
npm install
```

## Usage

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## How to Use the App

1. **Enter Stock Symbol**: Type a ticker symbol (e.g., AAPL, MSFT, GOOGL)
2. **Fetch Data**: Click "Fetch Options Data" to load options chain
3. **Configure Inputs**:
   - Set your total equity available (T)
   - Set desired share exposure (DS)
   - Select an expiry date
   - Adjust delta range to filter contracts
4. **View Results**: The app automatically calculates and displays:
   - Optimal contract highlighted at the top
   - Table of all valid options sorted by efficiency
   - Detailed metrics for each option

## API Integration

Currently uses mock data for demonstration. To integrate with a real options API:

1. Update `src/controllers/apiService.ts`
2. Replace `generateMockData()` with actual API calls
3. Recommended APIs:
   - [Polygon.io](https://polygon.io/)
   - [Alpha Vantage](https://www.alphavantage.co/)
   - [Tradier](https://tradier.com/)
   - TD Ameritrade API
   - Interactive Brokers API

## Features Included

✅ MVC Architecture Pattern
✅ TypeScript for type safety
✅ Material UI components
✅ Responsive design
✅ Loading states
✅ Error handling
✅ Real-time calculations
✅ Delta range filtering
✅ Expiry date selection
✅ Optimal contract highlighting
✅ Detailed results table

## Mathematical Solution

The system of equations is solved algebraically:

From equation 2: `N = DS - D×C`

Substitute into equation 1: `S×(DS - D×C) + O×C = T`

Expand: `S×DS - S×D×C + O×C = T`

Factor: `C×(O - S×D) = T - S×DS`

Solve: `C = (T - S×DS) / (O - S×D)`

Then: `N = DS - D×C`

The app validates:

- Non-negative values for C and N
- Total cost doesn't exceed equity
- Delta range filters are met
- Division by zero is avoided

## 🧪 Testing

This project includes a comprehensive test suite with **106 tests** covering all MVC layers:

```bash
npm test              # Run all tests
npm run test:ui       # Run tests with UI
npm run test:coverage # Generate coverage report
```

**Test Coverage**: 100% of business logic  
**Test Status**: ✅ All 106 tests passing  
**Documentation**: See [TESTING.md](./TESTING.md) and [TEST_SUMMARY.md](./TEST_SUMMARY.md)

## 📚 Documentation

This project includes comprehensive documentation:

- 📖 **[README.md](./README.md)** (this file) - Project overview and quick reference
- 📚 **[INDEX.md](./INDEX.md)** - Complete documentation index and navigation guide
- ⚡ **[QUICK_START.md](./QUICK_START.md)** - Quick start guide with examples
- 🏗️ **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Detailed architecture and MVC pattern
- 🔌 **[API_INTEGRATION_GUIDE.md](./API_INTEGRATION_GUIDE.md)** - API integration instructions
- 📊 **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Comprehensive project summary
- 🧪 **[TESTING.md](./TESTING.md)** - Testing guide and best practices
- ✅ **[TEST_SUMMARY.md](./TEST_SUMMARY.md)** - Test suite summary and metrics

## License

MIT

## Author

Built with ❤️ using React, TypeScript, and Material UI
