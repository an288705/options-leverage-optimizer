import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserInputs, OptionsChainData, CalculationResult } from '../types';

interface AppState {
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

const defaultUserInputs: UserInputs = {
  totalEquity: 10000,
  leverage: 1.75, // 1.75 = 175% leverage (leveraged position)
  selectedExpiry: '',
  deltaMin: 0.3,
  deltaMax: 0.9,
  stockSymbol: 'AAPL',
};

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userInputs, setUserInputs] = useState<UserInputs>(defaultUserInputs);
  const [optionsData, setOptionsData] = useState<OptionsChainData | null>(null);
  const [calculationResults, setCalculationResults] = useState<CalculationResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);

  const updateUserInput = <K extends keyof UserInputs>(key: K, value: UserInputs[K]) => {
    setUserInputs(prev => ({ ...prev, [key]: value }));
  };

  const value: AppState = {
    userInputs,
    setUserInputs,
    updateUserInput,
    optionsData,
    setOptionsData,
    calculationResults,
    setCalculationResults,
    loading,
    setLoading,
    error,
    setError,
    showResults,
    setShowResults,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppState => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
