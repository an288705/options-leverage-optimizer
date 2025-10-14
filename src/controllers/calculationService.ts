import { OptionContract, CalculationResult, UserInputs, StockData } from '../types';

/**
 * Solves for optimal leverage while using ALL available equity:
 * 1. S*N + O*C = T  (Total equity equation - must equal T exactly)
 * 2. Desired leverage: L = (N + D*C)*S/T
 *
 * Where L is the leverage ratio (e.g., 1.75 = 175% leverage)
 *
 * Strategy:
 * 1. Calculate exact C = T*(L - 1) / (S*D - O) for desired leverage
 * 2. Round to floor/ceiling for realistic whole contracts (C must be integer)
 * 3. Calculate contract cost: O*C
 * 4. Use ALL remaining equity for shares: N = (T - O*C) / S
 *    Note: N can be fractional (e.g., 42.45 shares) - this is realistic with many brokers
 * 5. This ensures S*N + O*C = T (fully invested)
 * 6. Calculate actual leverage achieved: (N + D*C)*S/T
 */
export class CalculationService {
  /**
   * Calculate with a specific number of contracts (for floor/ceiling)
   */
  static calculateWithContracts(
    contract: OptionContract,
    stockPrice: number,
    totalEquity: number,
    leverage: number,
    numberOfContracts: number
  ): CalculationResult {
    const S = stockPrice;
    const O = contract.premium * 100;
    const D = contract.delta * 100;
    const T = totalEquity;
    const L = leverage;
    const C = numberOfContracts;

    // Validate inputs
    if (!S || S <= 0 || !O || O <= 0 || !D || D <= 0 || !T || T <= 0 || !L || L <= 0) {
      return {
        contract,
        numberOfContracts: 0,
        numberOfShares: 0,
        totalCost: 0,
        leverage: 0,
        leverageDifference: 0,
        deltaExposure: 0,
        isValid: false,
        validationMessage: 'Invalid input values',
      };
    }

    // First, calculate cost of contracts
    const contractCost = O * C;

    // Validate contract cost doesn't exceed equity
    if (contractCost > T) {
      return {
        contract,
        numberOfContracts: C,
        numberOfShares: 0,
        totalCost: contractCost,
        leverage: 0,
        leverageDifference: 0,
        deltaExposure: 0,
        isValid: false,
        validationMessage: 'Contract cost exceeds available equity',
      };
    }

    // Remaining equity after buying contracts
    const remainingEquity = T - contractCost;

    // Use ALL remaining equity to buy shares: S*N = T - O*C
    // Note: N can be fractional (e.g., 42.45 shares) - fractional shares are allowed
    const N = remainingEquity / S;

    // Validate N (must be non-negative)
    if (N < 0) {
      return {
        contract,
        numberOfContracts: C,
        numberOfShares: 0,
        totalCost: contractCost,
        leverage: 0,
        leverageDifference: 0,
        deltaExposure: 0,
        isValid: false,
        validationMessage: 'Negative shares required (not supported)',
      };
    }

    // Total cost should now equal T (within rounding error)
    const totalCost = S * N + O * C;

    // Calculate delta exposure
    const deltaExposure = N + D * C;

    // Calculate actual leverage achieved
    const actualLeverage = (deltaExposure * S) / T;

    // Calculate leverage difference
    const leverageDifference = Math.abs(actualLeverage - L);

    // Check for NaN
    if (isNaN(N) || isNaN(C) || isNaN(totalCost) || isNaN(actualLeverage) || isNaN(deltaExposure)) {
      return {
        contract,
        numberOfContracts: C,
        numberOfShares: 0,
        totalCost: 0,
        leverage: 0,
        leverageDifference: 0,
        deltaExposure: 0,
        isValid: false,
        validationMessage: 'Calculation produced invalid values',
      };
    }

    return {
      contract,
      numberOfContracts: C,
      numberOfShares: N,
      totalCost,
      leverage: actualLeverage,
      leverageDifference,
      deltaExposure,
      isValid: true,
    };
  }

  /**
   * Calculate the number of contracts and shares for a given option
   */
  static calculateForOption(
    contract: OptionContract,
    stockPrice: number,
    totalEquity: number,
    leverage: number
  ): CalculationResult {
    const S = stockPrice;
    const O = contract.premium * 100; // Option price per contract (100 shares)
    const D = contract.delta * 100; // Delta per contract (100 shares)
    const T = totalEquity;
    const L = leverage;

    // Validate inputs
    if (!S || S <= 0 || !O || O <= 0 || !D || D <= 0 || !T || T <= 0 || !L || L <= 0) {
      return {
        contract,
        numberOfContracts: 0,
        numberOfShares: 0,
        totalCost: 0,
        leverage: 0,
        leverageDifference: 0,
        deltaExposure: 0,
        isValid: false,
        validationMessage: 'Invalid input values',
      };
    }

    // Calculate denominator for leverage formula
    // For L > 1: C = T*(L-1) / (S*D - O)
    const numerator = T * (L - 1);
    const denominator = S * D - O;

    // Validate denominator (avoid division by zero)
    if (Math.abs(denominator) < 0.01) {
      return {
        contract,
        numberOfContracts: 0,
        numberOfShares: 0,
        totalCost: 0,
        leverage: 0,
        leverageDifference: 0,
        deltaExposure: 0,
        isValid: false,
        validationMessage: 'Invalid calculation: denominator too close to zero',
      };
    }

    // Calculate exact number of contracts using leverage
    const C = numerator / denominator;

    // Validate C (must be non-negative)
    if (C < 0) {
      return {
        contract,
        numberOfContracts: 0,
        numberOfShares: 0,
        totalCost: 0,
        leverage: 0,
        leverageDifference: 0,
        deltaExposure: 0,
        isValid: false,
        validationMessage: 'Cannot achieve desired leverage (requires short position)',
      };
    }

    // Calculate number of shares
    const N = (L * T) / S - D * C;

    // Validate N (must be non-negative)
    if (N < 0) {
      return {
        contract,
        numberOfContracts: 0,
        numberOfShares: 0,
        totalCost: 0,
        leverage: 0,
        leverageDifference: 0,
        deltaExposure: 0,
        isValid: false,
        validationMessage: 'Negative shares required (not supported)',
      };
    }

    // Calculate total cost
    const totalCost = S * N + O * C;

    // Calculate delta exposure
    const deltaExposure = N + D * C;

    // Calculate actual leverage achieved
    const actualLeverage = (deltaExposure * S) / T;

    // Calculate leverage difference
    const leverageDifference = Math.abs(actualLeverage - L);

    // Check for NaN
    if (isNaN(N) || isNaN(C) || isNaN(totalCost) || isNaN(actualLeverage) || isNaN(deltaExposure)) {
      return {
        contract,
        numberOfContracts: 0,
        numberOfShares: 0,
        totalCost: 0,
        leverage: 0,
        leverageDifference: 0,
        deltaExposure: 0,
        isValid: false,
        validationMessage: 'Calculation produced invalid values',
      };
    }

    // Validate total cost doesn't exceed equity
    if (totalCost > T + 0.01) {
      return {
        contract,
        numberOfContracts: C,
        numberOfShares: N,
        totalCost,
        leverage: actualLeverage,
        leverageDifference,
        deltaExposure,
        isValid: false,
        validationMessage: 'Total cost exceeds available equity',
      };
    }

    return {
      contract,
      numberOfContracts: C,
      numberOfShares: N,
      totalCost,
      leverage: actualLeverage,
      leverageDifference,
      deltaExposure,
      isValid: true,
    };
  }

  /**
   * Calculate results for all valid options and find the optimal one
   */
  static calculateAllOptions(
    contracts: OptionContract[],
    stock: StockData,
    inputs: UserInputs
  ): CalculationResult[] {
    // Filter contracts by expiry and delta range
    const filteredContracts = contracts.filter(contract => {
      return (
        contract.expiry === inputs.selectedExpiry &&
        contract.delta >= inputs.deltaMin &&
        contract.delta <= inputs.deltaMax &&
        contract.type === 'call'
      );
    });

    const results: CalculationResult[] = [];

    // For each contract, calculate exact value to get floor and ceiling
    filteredContracts.forEach(contract => {
      // First calculate exact to determine floor and ceiling
      const exactResult = this.calculateForOption(
        contract,
        stock.price,
        inputs.totalEquity,
        inputs.leverage
      );

      if (exactResult.isValid) {
        const exactContracts = exactResult.numberOfContracts;

        // Calculate with floor (round down)
        const floorContracts = Math.floor(exactContracts);
        if (floorContracts > 0) {
          // Only include if contracts > 0
          const floorResult = this.calculateWithContracts(
            contract,
            stock.price,
            inputs.totalEquity,
            inputs.leverage,
            floorContracts
          );
          if (floorResult.isValid && floorResult.numberOfContracts > 0) {
            results.push(floorResult);
          }
        }

        // Calculate with ceiling (round up)
        const ceilingContracts = Math.ceil(exactContracts);
        if (ceilingContracts !== floorContracts && ceilingContracts > 0) {
          // Only add ceiling if different from floor and > 0
          const ceilingResult = this.calculateWithContracts(
            contract,
            stock.price,
            inputs.totalEquity,
            inputs.leverage,
            ceilingContracts
          );
          if (ceilingResult.isValid && ceilingResult.numberOfContracts > 0) {
            results.push(ceilingResult);
          }
        }

        // alert(`Exact contracts: ${exactContracts} floor: ${floorContracts} ceiling: ${ceilingContracts}`);
      }
    });

    // Sort by least number of contracts (optimal = fewest contracts)
    // Tiebreaker: if contracts are equal, sort by closest leverage to desired
    results.sort((a, b) => {
      const contractDiff = a.numberOfContracts - b.numberOfContracts;
      if (contractDiff !== 0) {
        return contractDiff; // Primary: sort by fewest contracts
      }
      return a.leverageDifference - b.leverageDifference; // Tiebreaker: closest leverage
    });

    return results;
  }

  /**
   * Get the optimal contract (least number of contracts, with tiebreaker)
   */
  static getOptimalContract(results: CalculationResult[]): CalculationResult | null {
    const validResults = results.filter(r => r.isValid && r.numberOfContracts > 0);
    if (validResults.length === 0) return null;

    // Results are already sorted by numberOfContracts (ascending),
    // with tiebreaker by leverageDifference, so first one is optimal
    return validResults[0];
  }

  /**
   * Format number for display
   */
  static formatNumber(num: number, decimals: number = 2): string {
    return num.toFixed(decimals);
  }
}
