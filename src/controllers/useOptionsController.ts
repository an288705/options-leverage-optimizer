import { useCallback } from 'react';
import { useAppContext } from '../models/AppContext';
import { ApiService } from './apiService';
import { CalculationService } from './calculationService';

/**
 * Main controller hook that orchestrates API calls and calculations
 * This follows the Controller pattern in MVC architecture
 */
export const useOptionsController = () => {
  const { userInputs, setOptionsData, setCalculationResults, setLoading, setError } =
    useAppContext();

  /**
   * Fetch options data and calculate results
   */
  const fetchAndCalculate = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Validate inputs
      if (!userInputs.stockSymbol) {
        throw new Error('Please enter a stock symbol');
      }

      if (userInputs.totalEquity <= 0) {
        throw new Error('Total equity must be greater than 0');
      }

      if (userInputs.leverage <= 0) {
        throw new Error('Leverage must be greater than 0');
      }

      // Fetch options chain data
      const data = await ApiService.fetchOptionsChain(userInputs.stockSymbol);
      setOptionsData(data);

      // If no expiry is selected, select the first one
      if (!userInputs.selectedExpiry && data.expiryDates.length > 0) {
        // Don't calculate yet, just set the data
        setCalculationResults([]);
        setLoading(false);
        return;
      }

      // Calculate results for all valid options
      const results = CalculationService.calculateAllOptions(
        data.contracts,
        data.stock,
        userInputs
      );

      setCalculationResults(results);
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      setLoading(false);
    }
  }, [userInputs, setOptionsData, setCalculationResults, setLoading, setError]);

  /**
   * Recalculate with current data (when user changes inputs)
   */
  const recalculate = useCallback(
    (optionsData: any) => {
      if (!optionsData) return;

      try {
        setError(null);

        if (!userInputs.selectedExpiry) {
          setCalculationResults([]);
          return;
        }

        const results = CalculationService.calculateAllOptions(
          optionsData.contracts,
          optionsData.stock,
          userInputs
        );

        setCalculationResults(results);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Calculation error';
        setError(errorMessage);
      }
    },
    [userInputs, setCalculationResults, setError]
  );

  return {
    fetchAndCalculate,
    recalculate,
  };
};
