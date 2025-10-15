import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useContext } from 'react';
import { AppProvider, AppContext } from '../AppContext';
import { ReactNode } from 'react';
import { UserInputs, OptionsChainData, CalculationResult } from '../../models/interfaces';

// Wrapper for testing
const wrapper = ({ children }: { children: ReactNode }) => <AppProvider>{children}</AppProvider>;

describe('AppContext', () => {
  describe('initialization', () => {
    it('should initialize with default user inputs', () => {
      const { result } = renderHook(() => useContext(AppContext)!, { wrapper });

      expect(result.current.userInputs).toBeDefined();
      expect(result.current.userInputs.totalEquity).toBe(10000);
      expect(result.current.userInputs.leverage).toBe(1.75);
      expect(result.current.userInputs.deltaMin).toBe(0.3);
      expect(result.current.userInputs.deltaMax).toBe(0.9);
      expect(result.current.userInputs.stockSymbol).toBe('AAPL');
      expect(result.current.userInputs.selectedExpiry).toBe('');
    });

    it('should initialize with null options data', () => {
      const { result } = renderHook(() => useContext(AppContext)!, { wrapper });

      expect(result.current.optionsData).toBeNull();
    });

    it('should initialize with empty calculation results', () => {
      const { result } = renderHook(() => useContext(AppContext)!, { wrapper });

      expect(result.current.calculationResults).toEqual([]);
    });

    it('should initialize with loading false', () => {
      const { result } = renderHook(() => useContext(AppContext)!, { wrapper });

      expect(result.current.loading).toBe(false);
    });

    it('should initialize with null error', () => {
      const { result } = renderHook(() => useContext(AppContext)!, { wrapper });

      expect(result.current.error).toBeNull();
    });
  });

  describe('setUserInputs', () => {
    it('should update all user inputs', () => {
      const { result } = renderHook(() => useContext(AppContext)!, { wrapper });

      const newInputs: UserInputs = {
        totalEquity: 20000,
        leverage: 2.0,
        selectedExpiry: '2025-11-15',
        deltaMin: 0.4,
        deltaMax: 0.8,
        stockSymbol: 'MSFT',
      };

      act(() => {
        result.current.setUserInputs(newInputs);
      });

      expect(result.current.userInputs).toEqual(newInputs);
    });
  });

  describe('updateUserInput', () => {
    it('should update a single input field', () => {
      const { result } = renderHook(() => useContext(AppContext)!, { wrapper });

      act(() => {
        result.current.updateUserInput('totalEquity', 15000);
      });

      expect(result.current.userInputs.totalEquity).toBe(15000);
      // Other fields should remain unchanged
      expect(result.current.userInputs.leverage).toBe(1.75);
    });

    it('should update stock symbol', () => {
      const { result } = renderHook(() => useContext(AppContext)!, { wrapper });

      act(() => {
        result.current.updateUserInput('stockSymbol', 'GOOGL');
      });

      expect(result.current.userInputs.stockSymbol).toBe('GOOGL');
    });

    it('should update desired shares', () => {
      const { result } = renderHook(() => useContext(AppContext)!, { wrapper });

      act(() => {
        result.current.updateUserInput('leverage', 1.5);
      });

      expect(result.current.userInputs.leverage).toBe(1.5);
    });

    it('should update selected expiry', () => {
      const { result } = renderHook(() => useContext(AppContext)!, { wrapper });

      act(() => {
        result.current.updateUserInput('selectedExpiry', '2025-12-20');
      });

      expect(result.current.userInputs.selectedExpiry).toBe('2025-12-20');
    });

    it('should update delta min', () => {
      const { result } = renderHook(() => useContext(AppContext)!, { wrapper });

      act(() => {
        result.current.updateUserInput('deltaMin', 0.5);
      });

      expect(result.current.userInputs.deltaMin).toBe(0.5);
    });

    it('should update delta max', () => {
      const { result } = renderHook(() => useContext(AppContext)!, { wrapper });

      act(() => {
        result.current.updateUserInput('deltaMax', 0.95);
      });

      expect(result.current.userInputs.deltaMax).toBe(0.95);
    });
  });

  describe('setOptionsData', () => {
    it('should set options data', () => {
      const { result } = renderHook(() => useContext(AppContext)!, { wrapper });

      const mockOptionsData: OptionsChainData = {
        stock: {
          symbol: 'AAPL',
          price: 175.5,
          timestamp: new Date().toISOString(),
        },
        expiryDates: ['2025-11-15', '2025-12-20'],
        contracts: [
          {
            strike: 170,
            expiry: '2025-11-15',
            premium: 8.5,
            delta: 0.65,
            symbol: 'AAPL251115C170',
            type: 'call',
          },
        ],
      };

      act(() => {
        result.current.setOptionsData(mockOptionsData);
      });

      expect(result.current.optionsData).toEqual(mockOptionsData);
    });

    it('should clear options data by setting to null', () => {
      const { result } = renderHook(() => useContext(AppContext)!, { wrapper });

      const mockOptionsData: OptionsChainData = {
        stock: {
          symbol: 'AAPL',
          price: 175.5,
          timestamp: new Date().toISOString(),
        },
        expiryDates: ['2025-11-15'],
        contracts: [],
      };

      act(() => {
        result.current.setOptionsData(mockOptionsData);
      });

      expect(result.current.optionsData).not.toBeNull();

      act(() => {
        result.current.setOptionsData(null);
      });

      expect(result.current.optionsData).toBeNull();
    });
  });

  describe('setCalculationResults', () => {
    it('should set calculation results', () => {
      const { result } = renderHook(() => useContext(AppContext)!, { wrapper });

      const mockResults: CalculationResult[] = [
        {
          contract: {
            strike: 170,
            expiry: '2025-11-15',
            premium: 8.5,
            delta: 0.65,
            symbol: 'AAPL251115C170',
            type: 'call',
          },
          numberOfContracts: 2.5,
          numberOfShares: 35,
          totalCost: 8268,
          isValid: true,
        },
      ];

      act(() => {
        result.current.setCalculationResults(mockResults);
      });

      expect(result.current.calculationResults).toEqual(mockResults);
    });

    it('should clear calculation results with empty array', () => {
      const { result } = renderHook(() => useContext(AppContext)!, { wrapper });

      const mockResults: CalculationResult[] = [
        {
          contract: {
            strike: 170,
            expiry: '2025-11-15',
            premium: 8.5,
            delta: 0.65,
            symbol: 'AAPL251115C170',
            type: 'call',
          },
          numberOfContracts: 2.5,
          numberOfShares: 35,
          totalCost: 8268,
          isValid: true,
        },
      ];

      act(() => {
        result.current.setCalculationResults(mockResults);
      });

      expect(result.current.calculationResults.length).toBeGreaterThan(0);

      act(() => {
        result.current.setCalculationResults([]);
      });

      expect(result.current.calculationResults).toEqual([]);
    });
  });

  describe('setLoading', () => {
    it('should set loading to true', () => {
      const { result } = renderHook(() => useContext(AppContext)!, { wrapper });

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.loading).toBe(true);
    });

    it('should set loading to false', () => {
      const { result } = renderHook(() => useContext(AppContext)!, { wrapper });

      act(() => {
        result.current.setLoading(true);
      });

      act(() => {
        result.current.setLoading(false);
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe('setError', () => {
    it('should set error message', () => {
      const { result } = renderHook(() => useContext(AppContext)!, { wrapper });

      const errorMessage = 'Test error message';

      act(() => {
        result.current.setError(errorMessage);
      });

      expect(result.current.error).toBe(errorMessage);
    });

    it('should clear error by setting to null', () => {
      const { result } = renderHook(() => useContext(AppContext)!, { wrapper });

      act(() => {
        result.current.setError('Error');
      });

      act(() => {
        result.current.setError(null);
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('context provider', () => {
    it('should return undefined when used outside provider', () => {
      const { result } = renderHook(() => useContext(AppContext));

      expect(result.current).toBeUndefined();
    });
  });

  describe('state persistence', () => {
    it('should maintain state across multiple updates', () => {
      const { result } = renderHook(() => useContext(AppContext)!, { wrapper });

      act(() => {
        result.current.updateUserInput('totalEquity', 15000);
      });

      act(() => {
        result.current.updateUserInput('leverage', 1.5);
      });

      act(() => {
        result.current.updateUserInput('stockSymbol', 'TSLA');
      });

      expect(result.current.userInputs.totalEquity).toBe(15000);
      expect(result.current.userInputs.leverage).toBe(1.5);
      expect(result.current.userInputs.stockSymbol).toBe('TSLA');
      // Other defaults should remain
      expect(result.current.userInputs.deltaMin).toBe(0.3);
    });
  });
});
