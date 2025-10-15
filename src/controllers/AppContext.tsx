import React, { createContext, useState, ReactNode } from 'react';
import { AppState, defaultUserInputs } from '../models/appState';
import { UserInputs, OptionsChainData, CalculationResult } from '../models/interfaces';

/**
 * React Context for global application state
 */
export const AppContext = createContext<AppState | undefined>(undefined);

/**
 * Provider component that manages global application state
 */
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
