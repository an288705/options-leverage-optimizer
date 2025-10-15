// Core data types
export interface OptionContract {
  strike: number;
  expiry: string;
  premium: number; // O - Premium per contract (per share, multiply by 100 for contract)
  delta: number; // D - Delta per contract
  symbol: string;
  type: 'call' | 'put';
}

export interface StockData {
  symbol: string;
  price: number; // S - Current stock price
  timestamp: string;
}

export interface OptionsChainData {
  stock: StockData;
  expiryDates: string[];
  contracts: OptionContract[];
}

// User input types
export interface UserInputs {
  totalEquity: number; // T - Total equity available
  leverage: number; // L - Desired leverage ratio (L = DS*S/T)
  selectedExpiry: string;
  deltaMin: number;
  deltaMax: number;
  stockSymbol: string;
}

// Calculation result types
export interface CalculationResult {
  contract: OptionContract;
  numberOfContracts: number; // C - Number of contracts to buy
  numberOfShares: number; // N - Number of shares to buy
  totalCost: number; // S*N + O*C
  leverage: number; // Actual leverage achieved: (N+D*C)*S/T
  leverageDifference: number; // |leverage - desiredLeverage|
  deltaExposure: number; // N + D*C
  isValid: boolean;
  validationMessage?: string;
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  loading: boolean;
}
