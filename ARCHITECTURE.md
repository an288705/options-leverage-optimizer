# Architecture Documentation

## MVC Pattern Implementation

This project strictly follows the **Model-View-Controller (MVC)** architectural pattern to ensure clean separation of concerns, maintainability, and testability.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      VIEW LAYER                             │
│  (React Components with Material UI)                        │
│  ┌────────────────┐         ┌─────────────────┐            │
│  │  InputForm.tsx │         │ ResultsDisplay  │            │
│  │                │         │     .tsx        │            │
│  └────────────────┘         └─────────────────┘            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   CONTROLLER LAYER                          │
│  (Business Logic & Orchestration)                           │
│  ┌──────────────────────────────────────────────┐          │
│  │  useOptionsController.ts                     │          │
│  │  - orchestrates API calls                    │          │
│  │  - triggers calculations                     │          │
│  │  - handles errors                            │          │
│  └──────────────────────────────────────────────┘          │
│  ┌──────────────────┐     ┌─────────────────────┐          │
│  │ apiService.ts    │     │ calculationService  │          │
│  │ - fetch data     │     │    .ts              │          │
│  │                  │     │ - solve equations   │          │
│  └──────────────────┘     └─────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     MODEL LAYER                             │
│  (State Management via React Context)                       │
│  ┌────────────────────────────────────────────┐            │
│  │  AppContext.tsx                            │            │
│  │  - userInputs                              │            │
│  │  - optionsData                             │            │
│  │  - calculationResults                      │            │
│  │  - loading, error states                   │            │
│  └────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

## Layer Breakdown

### 1. Model Layer (`src/models/`)

**Purpose**: Manage application state and data structures

**Components**:

- `AppContext.tsx`: React Context Provider for global state management

**Responsibilities**:

- Store user inputs (totalEquity, desiredShares, delta range, etc.)
- Store fetched options chain data
- Store calculation results
- Manage UI state (loading, errors)
- Provide state update methods

**State Structure**:

```typescript
{
  userInputs: {
    totalEquity: number;
    desiredShares: number;
    selectedExpiry: string;
    deltaMin: number;
    deltaMax: number;
    stockSymbol: string;
  },
  optionsData: OptionsChainData | null,
  calculationResults: CalculationResult[],
  loading: boolean,
  error: string | null
}
```

**Key Methods**:

- `setUserInputs()`: Update all user inputs
- `updateUserInput()`: Update a single input field
- `setOptionsData()`: Store fetched options data
- `setCalculationResults()`: Store calculation results
- `setLoading()` / `setError()`: Update UI state

### 2. View Layer (`src/views/`)

**Purpose**: Render UI and handle user interactions

**Components**:

#### `InputForm.tsx`

- Displays input form for user parameters
- Material UI text fields, selects, and buttons
- Handles user input events
- Triggers data fetching
- Responsive grid layout

**Key Features**:

- Stock symbol input with search icon
- Total equity input with $ prefix
- Desired shares input
- Expiry date dropdown (populated from API)
- Delta range sliders (min/max)
- Fetch button with loading state
- Current stock price display

#### `ResultsDisplay.tsx`

- Displays calculation results
- Optimal contract highlight card
- Sortable results table
- Error and loading states
- Informational alerts

**Key Features**:

- Gradient card for optimal contract
- Material UI Table with sticky header
- Color-coded optimal vs. valid contracts
- Responsive design
- Detailed metrics display

**View Layer Rules**:

- ✅ No business logic (calculations, API calls)
- ✅ Only UI rendering and event handling
- ✅ Use Controller hooks for actions
- ✅ Read from Model (Context) for state
- ✅ Material UI components only

### 3. Controller Layer (`src/controllers/`)

**Purpose**: Business logic, data processing, and orchestration

**Components**:

#### `useOptionsController.ts` (Main Controller)

Custom React hook that orchestrates the application flow

**Responsibilities**:

- Fetch options data via API service
- Trigger calculations via calculation service
- Update Model (Context) with results
- Handle errors and loading states
- Validate user inputs

**Key Methods**:

- `fetchAndCalculate()`: Fetch data and calculate results
- `recalculate()`: Recalculate with new inputs

#### `apiService.ts`

Service class for external data fetching

**Responsibilities**:

- Fetch stock prices
- Fetch options chain data
- Transform API responses
- Handle API errors

**Current Implementation**:

- Mock data generator for demo purposes
- Generates realistic options data
- Calculates expiry dates (3rd Friday of month)
- Generates strike prices around current price
- Calculates simplified delta and premium

**Production Integration**:
Replace `generateMockData()` with actual API calls to:

- Polygon.io
- Alpha Vantage
- Tradier
- TD Ameritrade
- Interactive Brokers

#### `calculationService.ts`

Service class for mathematical calculations

**Responsibilities**:

- Solve system of equations for each option
- Validate calculation results
- Filter valid options
- Find optimal contract
- Format numbers for display

**Mathematical Implementation**:

```typescript
// Given:
// S = Stock price
// O = Option price per contract
// D = Delta per contract
// T = Total equity
// DS = Desired shares

// System of equations:
// 1. S*N + O*C = T
// 2. N + D*C = DS

// Solution:
// C = (T - S*DS) / (O - S*D)
// N = DS - D*C
```

**Validation Rules**:

- ✅ C ≥ 0 (no short contracts)
- ✅ N ≥ 0 (no short shares)
- ✅ Total cost ≤ Total equity
- ✅ Denominator ≠ 0
- ✅ Delta in specified range

**Key Methods**:

- `calculateNumberOfContractsForOption()`: Solve for one option
- `calculateAllOptions()`: Solve for all valid options
- `getOptimalContract()`: Find minimum C
- `formatNumber()`: Format for display

### 4. Types Layer (`src/types/`)

**Purpose**: TypeScript type definitions for type safety

**Key Interfaces**:

```typescript
// Core data structures
OptionContract: strike, expiry, premium, delta, symbol, type
StockData: symbol, price, timestamp
OptionsChainData: stock, expiryDates, contracts

// User inputs
UserInputs: totalEquity, desiredShares, selectedExpiry, deltaMin, deltaMax, stockSymbol

// Calculation results
CalculationResult: contract, numberOfContracts, numberOfShares, totalCost, isValid

// API responses
ApiResponse<T>: data, error, loading
```

## Data Flow

### 1. User Enters Stock Symbol & Clicks Fetch

```
View (InputForm)
  → Controller (useOptionsController.fetchAndCalculate())
    → Controller (apiService.fetchOptionsChain())
      → Model (setOptionsData())
    → Controller (calculationService.calculateAllOptions())
      → Model (setCalculationResults())
  → View (ResultsDisplay) re-renders with new data
```

### 2. User Changes Input Parameters

```
View (InputForm)
  → Model (updateUserInput())
    → useEffect detects change
      → Controller (recalculate())
        → Controller (calculationService.calculateAllOptions())
          → Model (setCalculationResults())
  → View (ResultsDisplay) re-renders with new results
```

### 3. Error Handling Flow

```
Controller (any error)
  → Model (setError())
    → View (ResultsDisplay) shows error Alert
```

## Design Patterns Used

### 1. MVC Pattern

- **Model**: AppContext (React Context)
- **View**: React components (InputForm, ResultsDisplay)
- **Controller**: Hooks and service classes

### 2. Service Layer Pattern

- `apiService`: External data access
- `calculationService`: Business logic

### 3. Custom Hook Pattern

- `useOptionsController`: Encapsulates controller logic
- `useAppContext`: Provides Model access

### 4. Context Provider Pattern

- `AppProvider`: Global state management
- Avoids prop drilling

### 5. Separation of Concerns

- Each layer has a single responsibility
- Clear boundaries between layers
- Easy to test and maintain

## Benefits of This Architecture

### ✅ Maintainability

- Clear separation of concerns
- Easy to locate and fix bugs
- Changes in one layer don't affect others

### ✅ Testability

- Each layer can be tested independently
- Mock services for unit testing
- Easy to write integration tests

### ✅ Scalability

- Easy to add new features
- Can swap implementations (e.g., different API)
- Easy to add new views

### ✅ Reusability

- Controller logic is reusable
- Services can be used in multiple contexts
- Components are modular

### ✅ Type Safety

- TypeScript interfaces ensure type safety
- Catch errors at compile time
- Better IDE support and autocomplete

## Testing Strategy

### Model Layer Tests

```typescript
// Test state updates
// Test context provider
// Test state initialization
```

### View Layer Tests

```typescript
// Test component rendering
// Test user interactions
// Test conditional rendering
// Mock context values
```

### Controller Layer Tests

```typescript
// Test API service (mock fetch)
// Test calculation service (pure functions)
// Test useOptionsController hook
```

## Future Enhancements

### Model Layer

- Add caching for API responses
- Implement undo/redo functionality
- Add user preferences storage

### View Layer

- Add charts and visualizations
- Implement dark mode toggle
- Add keyboard shortcuts

### Controller Layer

- Integrate real-time data feeds
- Add historical data analysis
- Implement portfolio optimization

## Conclusion

This architecture provides a solid foundation for a scalable, maintainable React application. The strict adherence to MVC principles ensures that the codebase remains organized and easy to understand, even as it grows in complexity.
