import { OptionsChainData, StockData, OptionContract } from '../types';

/**
 * API Service for fetching stock and options data
 *
 * Note: This implementation uses mock data for demonstration.
 * In production, you can integrate with real APIs like:
 * - Polygon.io
 * - Alpha Vantage
 * - Tradier
 * - Yahoo Finance
 * - Other market data providers
 *
 * Interactive Brokers API requires IBKR Pro account.
 */
export class ApiService {
  private static readonly API_DELAY = 1000; // Simulate network delay

  /**
   * Fetch options chain data for a given stock symbol
   */
  static async fetchOptionsChain(symbol: string): Promise<OptionsChainData> {
    console.log(`[MOCK MODE] Fetching options chain for ${symbol}`);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, this.API_DELAY));

    // Generate mock data
    return this.generateMockData(symbol);
  }

  /**
   * Generate mock options chain data
   * In production, replace this with actual API integration
   */
  private static generateMockData(symbol: string): OptionsChainData {
    // Mock stock prices for common symbols
    const stockPrices: { [key: string]: number } = {
      AAPL: 175.5,
      MSFT: 415.2,
      GOOGL: 142.3,
      TSLA: 242.8,
      NVDA: 875.4,
      AMZN: 178.65,
      META: 485.3,
    };

    const stockPrice = stockPrices[symbol.toUpperCase()] || 100.0;

    const stock: StockData = {
      symbol: symbol.toUpperCase(),
      price: stockPrice,
      timestamp: new Date().toISOString(),
    };

    // Generate expiry dates (next 6 monthly expiries)
    const expiryDates: string[] = [];
    const today = new Date();

    for (let i = 0; i < 6; i++) {
      const expiryDate = new Date(today);
      expiryDate.setMonth(today.getMonth() + i + 1);
      expiryDate.setDate(15); // Standard monthly expiry (3rd Friday, approximated as 15th)
      expiryDates.push(expiryDate.toISOString().split('T')[0]);
    }

    // Generate option contracts for each expiry
    const contracts: OptionContract[] = [];

    expiryDates.forEach(expiry => {
      // Generate strikes from 80% to 120% of stock price
      const strikes = [];
      for (let i = -4; i <= 4; i++) {
        const strikeInterval = Math.max(1, Math.round(stockPrice * 0.05));
        const strike =
          Math.round((stockPrice + i * strikeInterval) / strikeInterval) * strikeInterval;
        strikes.push(strike);
      }

      strikes.forEach(strike => {
        const daysToExpiry = this.getDaysToExpiry(expiry);
        const { delta, premium } = this.calculateOptionMetrics(stockPrice, strike, daysToExpiry);

        contracts.push({
          strike,
          expiry,
          premium: premium,
          delta,
          symbol: `${symbol.toUpperCase()}${expiry.replace(/-/g, '')}C${strike}`,
          type: 'call',
        });
      });
    });

    return {
      stock,
      expiryDates,
      contracts,
    };
  }

  /**
   * Calculate days to expiry from date string
   */
  private static getDaysToExpiry(expiryDate: string): number {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  }

  /**
   * Calculate simplified option metrics (delta and premium)
   * Using simplified Black-Scholes approximations
   */
  private static calculateOptionMetrics(
    stockPrice: number,
    strike: number,
    daysToExpiry: number
  ): { delta: number; premium: number } {
    const moneyness = stockPrice / strike;
    const timeValue = Math.sqrt(daysToExpiry / 365);

    // Simplified delta calculation
    let delta: number;
    if (moneyness > 1.1) {
      // Deep ITM
      delta = 0.8 + (moneyness - 1.1) * 0.5;
    } else if (moneyness > 1.0) {
      // Slightly ITM
      delta = 0.5 + (moneyness - 1.0) * 3;
    } else if (moneyness > 0.9) {
      // Slightly OTM
      delta = 0.2 + (moneyness - 0.9) * 3;
    } else {
      // Deep OTM
      delta = 0.1 + moneyness * 0.1;
    }

    // Clamp delta between 0.05 and 0.95
    delta = Math.max(0.05, Math.min(0.95, delta));

    // Simplified premium calculation
    const intrinsicValue = Math.max(0, stockPrice - strike);
    const extrinsicValue = stockPrice * 0.02 * timeValue * (1 - Math.abs(moneyness - 1));
    const premium = intrinsicValue + extrinsicValue;

    return { delta, premium: Math.max(0.1, premium) };
  }
}
