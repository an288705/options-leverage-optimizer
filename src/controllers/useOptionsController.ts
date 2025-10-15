import { useCallback, useContext } from 'react';
import { AppContext } from './AppContext';
import { ApiService } from './apiService';
import { CalculationService } from './calculationService';

/**
 * Main controller hook that orchestrates API calls and calculations
 * This follows the Controller pattern in MVC architecture
 */
export const useOptionsController = () => {
  const appContext = useContext(AppContext)!;

  /**
   * Fetch options data and calculate results
   */
  const fetchAndCalculate = useCallback(async () => {
    appContext.setLoading(true);
    appContext.setError(null);

    try {
      // Validate inputs
      if (!appContext.userInputs.stockSymbol) {
        throw new Error('Please enter a stock symbol');
      }

      if (appContext.userInputs.totalEquity <= 0) {
        throw new Error('Total equity must be greater than 0');
      }

      if (appContext.userInputs.leverage <= 0) {
        throw new Error('Leverage must be greater than 0');
      }

      // Fetch options chain data
      const data = await ApiService.fetchOptionsChain(appContext.userInputs.stockSymbol);
      appContext.setOptionsData(data);

      // If no expiry is selected, select the first one
      if (!appContext.userInputs.selectedExpiry && data.expiryDates.length > 0) {
        // Don't calculate yet, just set the data
        appContext.setCalculationResults([]);
        appContext.setLoading(false);
        return;
      }

      // Calculate results for all valid options
      const results = CalculationService.calculateAllOptions(
        data.contracts,
        data.stock,
        appContext.userInputs
      );

      appContext.setCalculationResults(results);
      appContext.setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      appContext.setError(errorMessage);
      appContext.setLoading(false);
    }
  }, [appContext]);

  /**
   * Recalculate with current data (when user changes inputs)
   */
  const recalculate = useCallback(
    (optionsData: any) => {
      if (!optionsData) return;

      try {
        appContext.setError(null);

        if (!appContext.userInputs.selectedExpiry) {
          appContext.setCalculationResults([]);
          return;
        }

        const results = CalculationService.calculateAllOptions(
          optionsData.contracts,
          optionsData.stock,
          appContext.userInputs
        );

        appContext.setCalculationResults(results);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Calculation error';
        appContext.setError(errorMessage);
      }
    },
    [appContext]
  );

  return {
    fetchAndCalculate,
    recalculate,
  };
};
