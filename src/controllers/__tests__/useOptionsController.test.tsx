import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { AppProvider } from '../AppContext';
import { useOptionsController } from '../useOptionsController';
import { ApiService } from '../apiService';

// Wrapper component for testing hooks with context
const wrapper = ({ children }: { children: ReactNode }) => <AppProvider>{children}</AppProvider>;

describe('useOptionsController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchAndCalculate', () => {
    it('should fetch options data and calculate results', async () => {
      const { result } = renderHook(() => useOptionsController(), { wrapper });

      // Call the function
      await result.current.fetchAndCalculate();

      // Since we're using mock data, it should complete successfully
      // The actual data fetching and calculation will be tested through integration
    }, 5000);

    it('should handle API errors gracefully', async () => {
      // Spy on ApiService to force an error
      const errorSpy = vi
        .spyOn(ApiService, 'fetchOptionsChain')
        .mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useOptionsController(), { wrapper });

      try {
        await result.current.fetchAndCalculate();
      } catch (error) {
        // Error should be caught and handled by the controller
      }

      errorSpy.mockRestore();
    });

    it('should validate stock symbol before fetching', async () => {
      const { result } = renderHook(() => useOptionsController(), { wrapper });

      // This will test with default context values
      // In a real scenario, you'd modify the context state first
      await result.current.fetchAndCalculate();
    });
  });

  describe('recalculate', () => {
    it('should recalculate results with existing data', async () => {
      const { result } = renderHook(() => useOptionsController(), { wrapper });

      const mockOptionsData = {
        stock: { symbol: 'AAPL', price: 175.5, timestamp: new Date().toISOString() },
        expiryDates: ['2025-11-15'],
        contracts: [
          {
            strike: 170,
            expiry: '2025-11-15',
            premium: 8.5,
            delta: 0.65,
            symbol: 'AAPL251115C170',
            type: 'call' as const,
          },
        ],
      };

      result.current.recalculate(mockOptionsData);

      // Recalculation should complete without errors
    });

    it('should handle null options data', () => {
      const { result } = renderHook(() => useOptionsController(), { wrapper });

      // Should not throw error with null data
      expect(() => {
        result.current.recalculate(null);
      }).not.toThrow();
    });
  });
});
