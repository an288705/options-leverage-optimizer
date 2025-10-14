import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiService } from '../apiService';

describe('ApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchOptionsChain', () => {
    it('should return options chain data for valid symbol', async () => {
      const symbol = 'AAPL';
      const data = await ApiService.fetchOptionsChain(symbol);

      expect(data).toBeDefined();
      expect(data.stock).toBeDefined();
      expect(data.expiryDates).toBeDefined();
      expect(data.contracts).toBeDefined();
    });

    it('should return correct stock data structure', async () => {
      const symbol = 'AAPL';
      const data = await ApiService.fetchOptionsChain(symbol);

      expect(data.stock.symbol).toBe(symbol);
      expect(data.stock.price).toBeGreaterThan(0);
      expect(data.stock.timestamp).toBeDefined();
      expect(new Date(data.stock.timestamp)).toBeInstanceOf(Date);
    });

    it('should return known stock prices for supported symbols', async () => {
      const expectedPrices: { [key: string]: number } = {
        AAPL: 175.5,
        MSFT: 415.2,
        GOOGL: 142.3,
        TSLA: 242.8,
        NVDA: 875.4,
        AMZN: 178.65,
        META: 485.3,
      };

      for (const [symbol, expectedPrice] of Object.entries(expectedPrices)) {
        const data = await ApiService.fetchOptionsChain(symbol);
        expect(data.stock.price).toBe(expectedPrice);
      }
    }, 10000); // 10 second timeout for multiple API calls

    it('should return default price for unknown symbols', async () => {
      const data = await ApiService.fetchOptionsChain('UNKNOWN');
      expect(data.stock.price).toBe(100.0);
    });

    it('should return at least 4 expiry dates', async () => {
      const data = await ApiService.fetchOptionsChain('AAPL');
      expect(data.expiryDates.length).toBeGreaterThanOrEqual(4);
    });

    it('should return expiry dates in chronological order', async () => {
      const data = await ApiService.fetchOptionsChain('AAPL');

      for (let i = 1; i < data.expiryDates.length; i++) {
        const prevDate = new Date(data.expiryDates[i - 1]);
        const currDate = new Date(data.expiryDates[i]);
        expect(currDate.getTime()).toBeGreaterThanOrEqual(prevDate.getTime());
      }
    });

    it('should return future expiry dates only', async () => {
      const data = await ApiService.fetchOptionsChain('AAPL');
      const today = new Date();

      data.expiryDates.forEach(expiryDate => {
        const expiry = new Date(expiryDate);
        expect(expiry.getTime()).toBeGreaterThanOrEqual(today.getTime());
      });
    });

    it('should return contracts for each expiry date', async () => {
      const data = await ApiService.fetchOptionsChain('AAPL');

      data.expiryDates.forEach(expiryDate => {
        const contractsForExpiry = data.contracts.filter(
          contract => contract.expiry === expiryDate
        );
        expect(contractsForExpiry.length).toBeGreaterThan(0);
      });
    });

    it('should return contracts with valid structure', async () => {
      const data = await ApiService.fetchOptionsChain('AAPL');

      data.contracts.forEach(contract => {
        expect(contract.strike).toBeGreaterThan(0);
        expect(contract.expiry).toBeDefined();
        expect(contract.premium).toBeGreaterThan(0);
        expect(contract.delta).toBeGreaterThan(0);
        expect(contract.delta).toBeLessThanOrEqual(1);
        expect(contract.symbol).toBeDefined();
        expect(contract.type).toBe('call');
      });
    });

    it('should return strikes around current price', async () => {
      const data = await ApiService.fetchOptionsChain('AAPL');
      const stockPrice = data.stock.price;

      // At least some strikes should be within ±20% of stock price
      const nearMoneyStrikes = data.contracts.filter(contract => {
        const percentDiff = Math.abs((contract.strike - stockPrice) / stockPrice);
        return percentDiff <= 0.2;
      });

      expect(nearMoneyStrikes.length).toBeGreaterThan(0);
    });

    it('should generate higher deltas for ITM options', async () => {
      const data = await ApiService.fetchOptionsChain('AAPL');
      const stockPrice = data.stock.price;

      const itmContracts = data.contracts.filter(contract => contract.strike < stockPrice * 0.95);

      const otmContracts = data.contracts.filter(contract => contract.strike > stockPrice * 1.05);

      if (itmContracts.length > 0 && otmContracts.length > 0) {
        const avgItmDelta = itmContracts.reduce((sum, c) => sum + c.delta, 0) / itmContracts.length;
        const avgOtmDelta = otmContracts.reduce((sum, c) => sum + c.delta, 0) / otmContracts.length;

        expect(avgItmDelta).toBeGreaterThan(avgOtmDelta);
      }
    });

    it('should include intrinsic value in ITM option prices', async () => {
      const data = await ApiService.fetchOptionsChain('AAPL');
      const stockPrice = data.stock.price;

      const itmContracts = data.contracts.filter(contract => contract.strike < stockPrice);

      itmContracts.forEach(contract => {
        const intrinsicValue = stockPrice - contract.strike;
        // Option price should be at least the intrinsic value
        expect(contract.premium).toBeGreaterThanOrEqual(intrinsicValue - 0.01);
      });
    });

    it('should simulate API delay', async () => {
      const startTime = Date.now();
      await ApiService.fetchOptionsChain('AAPL');
      const endTime = Date.now();

      const duration = endTime - startTime;
      // Should take at least close to 1 second (API_DELAY)
      expect(duration).toBeGreaterThanOrEqual(900); // Allow some margin
    });

    it('should handle symbol case insensitivity', async () => {
      const upperData = await ApiService.fetchOptionsChain('AAPL');
      const lowerData = await ApiService.fetchOptionsChain('aapl');

      expect(upperData.stock.symbol).toBe('AAPL');
      expect(lowerData.stock.symbol).toBe('AAPL');
      expect(upperData.stock.price).toBe(lowerData.stock.price);
    });

    it('should generate unique contract symbols', async () => {
      const data = await ApiService.fetchOptionsChain('AAPL');

      const symbols = data.contracts.map(c => c.symbol);
      const uniqueSymbols = new Set(symbols);

      expect(uniqueSymbols.size).toBe(symbols.length);
    });

    it('should format contract symbols correctly', async () => {
      const data = await ApiService.fetchOptionsChain('AAPL');

      data.contracts.forEach(contract => {
        // Symbol should include ticker, expiry date, and strike
        expect(contract.symbol).toContain('AAPL');
        expect(contract.symbol).toContain('C'); // Call indicator
        expect(contract.symbol).toContain(String(contract.strike));
      });
    });
  });
});
