import { UserInputs } from './interfaces';

/**
 * Application state interface
 * Defines the shape of the global app state
 */
export interface AppState {
  // User inputs
  userInputs: UserInputs;
  setUserInputs: (inputs: UserInputs) => void;
  updateUserInput: <K extends keyof UserInputs>(key: K, value: UserInputs[K]) => void;

  // Fetched data
  optionsData: OptionsChainData | null;
  setOptionsData: (data: OptionsChainData | null) => void;

  // Calculation results
  calculationResults: CalculationResult[];
  setCalculationResults: (results: CalculationResult[]) => void;

  // UI state
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  showResults: boolean;
  setShowResults: (show: boolean) => void;
}

/**
 * Default user input values
 */
export const defaultUserInputs: UserInputs = {
  totalEquity: 10000,
  leverage: 1.75, // 1.75 = 175% leverage (leveraged position)
  selectedExpiry: '',
  deltaMin: 0.3,
  deltaMax: 0.9,
  stockSymbol: 'AAPL',
};
