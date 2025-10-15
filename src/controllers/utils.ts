import { AppState } from '../models/appState';
import { OptionsChainData } from '../models/interfaces';

/**
 * Utility functions
 */

export const handleShowResults = (
  appContext: AppState,
  recalculate: (data: OptionsChainData) => void
) => {
  console.log('handleShowResults called', {
    hasOptionsData: !!appContext.optionsData,
    selectedExpiry: appContext.userInputs.selectedExpiry,
    leverage: appContext.userInputs.leverage,
    totalEquity: appContext.userInputs.totalEquity,
  });

  if (appContext.optionsData && appContext.userInputs.selectedExpiry) {
    recalculate(appContext.optionsData);
    appContext.setShowResults(true);
  } else {
    console.warn('Cannot show results: missing data or expiry');
  }
};

/**
 * Handle fetching options data
 */
export const handleFetchData = (appContext: AppState, fetchAndCalculate: () => Promise<void>) => {
  appContext.setShowResults(false); // Hide results when fetching new data
  fetchAndCalculate();
};
