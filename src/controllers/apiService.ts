import axios, { AxiosInstance } from 'axios';
import { OptionsChainData, StockData, OptionContract } from '../models/interfaces';

/**
 * API Service for fetching stock and options data from Tradier
 *
 * Tradier offers:
 * - Free sandbox account for testing (https://developer.tradier.com)
 * - Production API with real-time data (requires brokerage account)
 *
 * Configuration via environment variables (.env file):
 * - VITE_TRADIER_API_TOKEN: Your Tradier API token
 * - VITE_TRADIER_API_BASE_URL: Sandbox or production URL
 * - VITE_USE_MOCK_DATA: 'true' for mock mode, 'false' for real API
 * - VITE_API_TIMEOUT: Request timeout in milliseconds
 */
export class ApiService {
  private static readonly USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';
  private static readonly API_BASE_URL =
    import.meta.env.VITE_TRADIER_API_BASE_URL || 'https://sandbox.tradier.com';
  private static readonly API_TOKEN = import.meta.env.VITE_TRADIER_API_TOKEN;
  private static readonly API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000');
  private static readonly MOCK_API_DELAY = 1000;

  private static axiosInstance: AxiosInstance | null = null;

  /**
   * Get or create axios instance with Tradier API configuration
   */
  private static getAxiosInstance(): AxiosInstance {
    if (!this.axiosInstance) {
      this.axiosInstance = axios.create({
        baseURL: this.API_BASE_URL,
        timeout: this.API_TIMEOUT,
        headers: {
          Authorization: `Bearer ${this.API_TOKEN}`,
          Accept: 'application/json',
        },
      });

      // Add response interceptor for error handling
      this.axiosInstance.interceptors.response.use(
        response => response,
        error => {
          console.error('Tradier API Error:', error.message);
          if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
          }
          throw error;
        }
      );
    }
    return this.axiosInstance;
  }

  /**
   * Fetch options chain data for a given stock symbol
   */
  static async fetchOptionsChain(symbol: string): Promise<OptionsChainData> {
    if (this.USE_MOCK_DATA) {
      console.log(`[MOCK MODE] Fetching options chain for ${symbol}`);
      return this.fetchMockOptionsChain(symbol);
    }

    try {
      console.log(`[TRADIER API] Fetching options chain for ${symbol}`);
      return await this.fetchRealOptionsChain(symbol);
    } catch (error) {
      console.error('Failed to fetch from Tradier API, falling back to mock data:', error);
      return this.fetchMockOptionsChain(symbol);
    }
  }

  /**
   * Fetch real options chain data from Tradier API
   */
  private static async fetchRealOptionsChain(symbol: string): Promise<OptionsChainData> {
    const api = this.getAxiosInstance();

    // Step 1: Get current stock price
    const quoteResponse = await api.get(`/v1/markets/quotes`, {
      params: { symbols: symbol.toUpperCase(), greeks: false },
    });

    const quoteData = quoteResponse.data.quotes?.quote;
    if (!quoteData || !quoteData.last) {
      throw new Error(`No quote data found for symbol: ${symbol}`);
    }

    const stockPrice = parseFloat(quoteData.last);
    const stock: StockData = {
      symbol: symbol.toUpperCase(),
      price: stockPrice,
      timestamp: new Date().toISOString(),
    };

    // Step 2: Get option expiration dates
    const expirationsResponse = await api.get(`/v1/markets/options/expirations`, {
      params: { symbol: symbol.toUpperCase(), includeAllRoots: true, strikes: false },
    });

    const expiryDates: string[] = expirationsResponse.data.expirations?.date || [];

    if (expiryDates.length === 0) {
      throw new Error(`No option expirations found for symbol: ${symbol}`);
    }

    // Step 3: Fetch options chains for the first 6 expiries
    const contracts: OptionContract[] = [];
    const expiryLimit = Math.min(6, expiryDates.length);

    for (let i = 0; i < expiryLimit; i++) {
      const expiry = expiryDates[i];

      try {
        const chainResponse = await api.get(`/v1/markets/options/chains`, {
          params: {
            symbol: symbol.toUpperCase(),
            expiration: expiry,
            greeks: true, // Include Greeks (delta, gamma, etc.)
          },
        });

        const options = chainResponse.data.options?.option || [];

        // Filter for call options only
        const calls = Array.isArray(options) ? options : [options];

        calls.forEach((option: any) => {
          if (option.option_type === 'call' && option.greeks) {
            const premium = parseFloat(option.last) || parseFloat(option.bid + option.ask) / 2 || 0;
            const delta = parseFloat(option.greeks.delta) || 0;
            const strike = parseFloat(option.strike);

            if (premium > 0 && delta > 0 && strike > 0) {
              contracts.push({
                strike,
                expiry,
                premium,
                delta: Math.abs(delta), // Ensure positive delta for calls
                symbol: option.symbol,
                type: 'call',
              });
            }
          }
        });
      } catch (error) {
        console.warn(`Failed to fetch options chain for expiry ${expiry}:`, error);
      }
    }

    if (contracts.length === 0) {
      throw new Error(`No valid call options found for symbol: ${symbol}`);
    }

    return {
      stock,
      expiryDates: expiryDates.slice(0, expiryLimit),
      contracts,
    };
  }

  /**
   * Fetch mock options chain data (for development)
   */
  private static async fetchMockOptionsChain(symbol: string): Promise<OptionsChainData> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, this.MOCK_API_DELAY));

    // Generate mock data
    return this.generateMockData(symbol);
  }

  /**
   * Generate mock options chain data
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
