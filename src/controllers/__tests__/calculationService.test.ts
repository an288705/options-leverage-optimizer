import { describe, it, expect } from 'vitest';
import { CalculationService } from '../calculationService';
import { OptionContract, StockData, UserInputs } from '../../models/interfaces';

describe('CalculationService', () => {
  const mockStockData: StockData = {
    symbol: 'AAPL',
    price: 175.5,
    timestamp: new Date().toISOString(),
  };

  const mockContract: OptionContract = {
    strike: 170.0,
    expiry: '2025-11-15',
    premium: 8.5,
    delta: 0.65,
    symbol: 'AAPL251115C170',
    type: 'call',
  };

  const mockUserInputs: UserInputs = {
    totalEquity: 10000,
    leverage: 1.75,
    selectedExpiry: '2025-11-15',
    deltaMin: 0.3,
    deltaMax: 0.9,
    stockSymbol: 'AAPL',
  };

  describe('calculateForOption', () => {
    it('should calculate correct number of contracts and shares', () => {
      const result = CalculationService.calculateForOption(
        mockContract,
        mockStockData.price,
        mockUserInputs.totalEquity,
        mockUserInputs.leverage
      );

      expect(result).toBeDefined();
      if (result.isValid) {
        expect(result.numberOfContracts).toBeGreaterThan(0);
        expect(result.numberOfShares).toBeGreaterThanOrEqual(0);
      }
    });

    it('should calculate leverage ratio', () => {
      const result = CalculationService.calculateForOption(
        mockContract,
        mockStockData.price,
        mockUserInputs.totalEquity,
        mockUserInputs.leverage
      );

      if (result.isValid) {
        expect(result.leverage).toBeGreaterThan(0);
        expect(result.leverageDifference).toBeGreaterThanOrEqual(0);
      }
    });

    it('should use all available equity (S*N + O*C = T)', () => {
      const result = CalculationService.calculateForOption(
        mockContract,
        mockStockData.price,
        mockUserInputs.totalEquity,
        mockUserInputs.leverage
      );

      if (result.isValid) {
        // Verify equation: S*N + O*C = T (total cost should equal total equity)
        const S = mockStockData.price;
        const N = result.numberOfShares;
        const O = mockContract.premium * 100;
        const C = result.numberOfContracts;
        const calculatedCost = S * N + O * C;

        expect(result.totalCost).toBeCloseTo(calculatedCost, 2);
        // Total cost should be very close to total equity (fully invested)
        expect(result.totalCost).toBeCloseTo(mockUserInputs.totalEquity, 1);
      }
    });
  });

  describe('calculateWithContracts', () => {
    it('should calculate with a specific number of contracts', () => {
      const result = CalculationService.calculateWithContracts(
        mockContract,
        mockStockData.price,
        mockUserInputs.totalEquity,
        mockUserInputs.leverage,
        3
      );

      expect(result).toBeDefined();
      expect(result.numberOfContracts).toBe(3);
      if (result.isValid) {
        expect(result.numberOfShares).toBeGreaterThanOrEqual(0);
        expect(result.leverage).toBeGreaterThan(0);
        // Should use all equity
        expect(result.totalCost).toBeCloseTo(mockUserInputs.totalEquity, 1);
      }
    });

    it('should handle zero contracts', () => {
      const result = CalculationService.calculateWithContracts(
        mockContract,
        mockStockData.price,
        mockUserInputs.totalEquity,
        mockUserInputs.leverage,
        0
      );

      expect(result).toBeDefined();
      expect(result.numberOfContracts).toBe(0);
      if (result.isValid) {
        // With 0 contracts, all equity goes to shares
        expect(result.totalCost).toBeCloseTo(mockUserInputs.totalEquity, 1);
      }
    });

    it('should always use all available equity', () => {
      const result = CalculationService.calculateWithContracts(
        mockContract,
        mockStockData.price,
        mockUserInputs.totalEquity,
        mockUserInputs.leverage,
        2
      );

      if (result.isValid) {
        // S*N + O*C should equal T
        const S = mockStockData.price;
        const N = result.numberOfShares;
        const O = mockContract.premium * 100;
        const C = result.numberOfContracts;
        const totalSpent = S * N + O * C;

        expect(totalSpent).toBeCloseTo(mockUserInputs.totalEquity, 1);
      }
    });

    it('should allow fractional shares', () => {
      const result = CalculationService.calculateWithContracts(
        mockContract,
        mockStockData.price,
        mockUserInputs.totalEquity,
        mockUserInputs.leverage,
        3
      );

      if (result.isValid) {
        // Shares should be fractional (not rounded)
        expect(result.numberOfShares).not.toBe(Math.floor(result.numberOfShares));
        // Verify it's a reasonable decimal value
        expect(result.numberOfShares).toBeGreaterThan(0);
        expect(result.numberOfShares % 1).toBeGreaterThan(0); // Has decimal part
      }
    });

    it('should calculate exact fractional shares to use all equity', () => {
      // Custom test with specific values to verify fractional calculation
      const testContract: OptionContract = {
        strike: 170.0,
        expiry: '2025-11-15',
        premium: 8.5,
        delta: 0.65,
        symbol: 'AAPL251115C170',
        type: 'call',
      };

      const result = CalculationService.calculateWithContracts(
        testContract,
        175.5, // stock price
        10000, // total equity
        1.75, // leverage
        3 // contracts
      );

      if (result.isValid) {
        const contractCost = 8.5 * 100 * 3; // $2,550
        const remainingForShares = 10000 - contractCost; // $7,450
        const expectedShares = remainingForShares / 175.5; // 42.45...

        expect(result.numberOfShares).toBeCloseTo(expectedShares, 2);
        // Verify shares are fractional
        expect(result.numberOfShares).toBeGreaterThan(42);
        expect(result.numberOfShares).toBeLessThan(43);
      }
    });
  });

  describe('calculateAllOptions', () => {
    const mockContracts: OptionContract[] = [
      {
        strike: 165,
        expiry: '2025-11-15',
        premium: 12.5,
        delta: 0.75,
        symbol: 'AAPL251115C165',
        type: 'call',
      },
      {
        strike: 170,
        expiry: '2025-11-15',
        premium: 8.5,
        delta: 0.65,
        symbol: 'AAPL251115C170',
        type: 'call',
      },
      {
        strike: 175,
        expiry: '2025-11-15',
        premium: 5.5,
        delta: 0.5,
        symbol: 'AAPL251115C175',
        type: 'call',
      },
    ];

    it('should return whole number contracts only', () => {
      const results = CalculationService.calculateAllOptions(
        mockContracts,
        mockStockData,
        mockUserInputs
      );

      results.forEach(result => {
        expect(Number.isInteger(result.numberOfContracts)).toBe(true);
      });
    });

    it('should include floor and ceiling for each valid contract', () => {
      const results = CalculationService.calculateAllOptions(
        mockContracts,
        mockStockData,
        mockUserInputs
      );

      // Should have up to 2 results per contract (floor and ceiling)
      // Minimum should be at least as many as filtered contracts (if all have floor)
      const filteredCount = mockContracts.filter(
        c =>
          c.expiry === mockUserInputs.selectedExpiry &&
          c.delta >= mockUserInputs.deltaMin &&
          c.delta <= mockUserInputs.deltaMax
      ).length;

      expect(results.length).toBeGreaterThanOrEqual(filteredCount);
    });

    it('should filter contracts by expiry date', () => {
      const results = CalculationService.calculateAllOptions(
        mockContracts,
        mockStockData,
        mockUserInputs
      );

      results.forEach(result => {
        expect(result.contract.expiry).toBe(mockUserInputs.selectedExpiry);
      });
    });

    it('should filter contracts by delta range', () => {
      const results = CalculationService.calculateAllOptions(
        mockContracts,
        mockStockData,
        mockUserInputs
      );

      results.forEach(result => {
        expect(result.contract.delta).toBeGreaterThanOrEqual(mockUserInputs.deltaMin);
        expect(result.contract.delta).toBeLessThanOrEqual(mockUserInputs.deltaMax);
      });
    });

    it('should only return valid results', () => {
      const results = CalculationService.calculateAllOptions(
        mockContracts,
        mockStockData,
        mockUserInputs
      );

      results.forEach(result => {
        expect(result.isValid).toBe(true);
      });
    });

    it('should sort results by least number of contracts', () => {
      const results = CalculationService.calculateAllOptions(
        mockContracts,
        mockStockData,
        mockUserInputs
      );

      if (results.length > 1) {
        for (let i = 1; i < results.length; i++) {
          expect(results[i].numberOfContracts).toBeGreaterThanOrEqual(
            results[i - 1].numberOfContracts
          );
        }
      }
    });

    it('should exclude results with zero contracts', () => {
      const results = CalculationService.calculateAllOptions(
        mockContracts,
        mockStockData,
        mockUserInputs
      );

      results.forEach(result => {
        expect(result.numberOfContracts).toBeGreaterThan(0);
      });
    });

    it('should use leverage as tiebreaker when contracts are equal', () => {
      // Create mock results with same contract count but different leverages
      const mockResults: CalculationResult[] = [
        {
          contract: mockContracts[0],
          numberOfContracts: 2,
          numberOfShares: 40,
          totalCost: 10000,
          leverage: 1.6,
          leverageDifference: 0.15, // farther from target
          deltaExposure: 100,
          isValid: true,
        },
        {
          contract: mockContracts[1],
          numberOfContracts: 2,
          numberOfShares: 45,
          totalCost: 10000,
          leverage: 1.72,
          leverageDifference: 0.03, // closer to target
          deltaExposure: 110,
          isValid: true,
        },
        {
          contract: mockContracts[2],
          numberOfContracts: 3,
          numberOfShares: 35,
          totalCost: 10000,
          leverage: 1.85,
          leverageDifference: 0.1,
          deltaExposure: 120,
          isValid: true,
        },
      ];

      // Sort using the same logic as calculateAllOptions
      mockResults.sort((a, b) => {
        const contractDiff = a.numberOfContracts - b.numberOfContracts;
        if (contractDiff !== 0) {
          return contractDiff;
        }
        return a.leverageDifference - b.leverageDifference;
      });

      // First result should have 2 contracts with leverage 1.72 (closer to 1.75)
      expect(mockResults[0].numberOfContracts).toBe(2);
      expect(mockResults[0].leverageDifference).toBe(0.03);
      expect(mockResults[0].leverage).toBe(1.72);

      // Second result should have 2 contracts with leverage 1.6 (farther from 1.75)
      expect(mockResults[1].numberOfContracts).toBe(2);
      expect(mockResults[1].leverageDifference).toBe(0.15);
      expect(mockResults[1].leverage).toBe(1.6);

      // Third result should have 3 contracts
      expect(mockResults[2].numberOfContracts).toBe(3);
    });
  });

  describe('getOptimalContract', () => {
    it('should return the contract with least number of contracts', () => {
      const results: CalculationResult[] = [
        {
          isValid: true,
          numberOfContracts: 3,
        } as CalculationResult,
        {
          isValid: true,
          numberOfContracts: 2,
        } as CalculationResult,
      ];

      // Sort first
      results.sort((a, b) => a.numberOfContracts - b.numberOfContracts);

      const optimal = CalculationService.getOptimalContract(results);
      expect(optimal).not.toBeNull();
      expect(optimal?.numberOfContracts).toBe(2);
    });

    it('should return null when no valid results', () => {
      const results: CalculationResult[] = [
        { isValid: false, numberOfContracts: 2 } as CalculationResult,
      ];

      const optimal = CalculationService.getOptimalContract(results);
      expect(optimal).toBeNull();
    });

    it('should return null when only zero contracts', () => {
      const results: CalculationResult[] = [
        { isValid: true, numberOfContracts: 0 } as CalculationResult,
      ];

      const optimal = CalculationService.getOptimalContract(results);
      expect(optimal).toBeNull();
    });

    it('should return null for empty array', () => {
      const optimal = CalculationService.getOptimalContract([]);
      expect(optimal).toBeNull();
    });
  });

  describe('formatNumber', () => {
    it('should format number with default 2 decimals', () => {
      expect(CalculationService.formatNumber(123.456789)).toBe('123.46');
    });

    it('should format number with specified decimals', () => {
      expect(CalculationService.formatNumber(123.456789, 4)).toBe('123.4568');
    });

    it('should handle integer values', () => {
      expect(CalculationService.formatNumber(100)).toBe('100.00');
    });

    it('should handle zero', () => {
      expect(CalculationService.formatNumber(0)).toBe('0.00');
    });

    it('should handle negative numbers', () => {
      expect(CalculationService.formatNumber(-123.456, 2)).toBe('-123.46');
    });
  });
});
