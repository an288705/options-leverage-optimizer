import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResultsDisplay } from '../ResultsDisplay';
import { AppProvider, AppContext } from '../../controllers/AppContext';
import { CalculationResult, OptionsChainData } from '../../models/interfaces';
import { ReactNode, useContext } from 'react';

// Custom wrapper to set context state
const CustomProvider = ({
  children,
  loading = false,
  error = null,
  optionsData = null,
  calculationResults = [],
  showResults = true,
}: {
  children: ReactNode;
  loading?: boolean;
  error?: string | null;
  optionsData?: OptionsChainData | null;
  calculationResults?: CalculationResult[];
  showResults?: boolean;
}) => {
  return (
    <AppProvider>
      <TestWrapper
        loading={loading}
        error={error}
        optionsData={optionsData}
        calculationResults={calculationResults}
        showResults={showResults}
      >
        {children}
      </TestWrapper>
    </AppProvider>
  );
};

// Helper component to set state
const TestWrapper = ({
  children,
  loading,
  error,
  optionsData,
  calculationResults,
  showResults,
}: any) => {
  const context = useContext(AppContext)!;

  // Set state on mount
  if (loading !== undefined) context.setLoading(loading);
  if (error !== undefined) context.setError(error);
  if (optionsData !== undefined) context.setOptionsData(optionsData);
  if (calculationResults !== undefined) context.setCalculationResults(calculationResults);
  if (showResults !== undefined) context.setShowResults(showResults);

  return <>{children}</>;
};

describe('ResultsDisplay', () => {
  const mockOptionsData: OptionsChainData = {
    stock: {
      symbol: 'AAPL',
      price: 175.5,
      timestamp: new Date().toISOString(),
    },
    expiryDates: ['2025-11-15'],
    contracts: [],
  };

  const mockCalculationResults: CalculationResult[] = [
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
      leverage: 1.72,
      leverageDifference: 0.03,
      deltaExposure: 100,
      isValid: true,
    },
  ];

  describe('loading state', () => {
    it('should display loading message when loading', () => {
      render(
        <CustomProvider loading={true}>
          <ResultsDisplay />
        </CustomProvider>
      );

      expect(screen.getByText(/Loading options data/i)).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('should display error alert when error exists', () => {
      render(
        <CustomProvider error="Test error message">
          <ResultsDisplay />
        </CustomProvider>
      );

      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });
  });

  describe('results display', () => {
    it('should display optimal contract card', () => {
      render(
        <CustomProvider optionsData={mockOptionsData} calculationResults={mockCalculationResults}>
          <ResultsDisplay />
        </CustomProvider>
      );

      expect(screen.getByText(/Optimal Contract/i)).toBeInTheDocument();
    });

    it('should display leverage information', () => {
      render(
        <CustomProvider optionsData={mockOptionsData} calculationResults={mockCalculationResults}>
          <ResultsDisplay />
        </CustomProvider>
      );

      const leverageElements = screen.getAllByText(/Leverage/i);
      expect(leverageElements.length).toBeGreaterThan(0);
    });

    it('should display results table', () => {
      render(
        <CustomProvider optionsData={mockOptionsData} calculationResults={mockCalculationResults}>
          <ResultsDisplay />
        </CustomProvider>
      );

      expect(screen.getByText(/All Valid Options/i)).toBeInTheDocument();
    });

    it('should display OPTIMAL chip', () => {
      render(
        <CustomProvider optionsData={mockOptionsData} calculationResults={mockCalculationResults}>
          <ResultsDisplay />
        </CustomProvider>
      );

      expect(screen.getByText('OPTIMAL')).toBeInTheDocument();
    });
  });

  describe('no results state', () => {
    it('should display info message when no valid options found', () => {
      render(
        <CustomProvider optionsData={mockOptionsData} calculationResults={[]}>
          <ResultsDisplay />
        </CustomProvider>
      );

      expect(screen.getByText(/No valid options found/i)).toBeInTheDocument();
    });
  });

  describe('hidden state', () => {
    it('should not render when showResults is false', () => {
      const { container } = render(
        <CustomProvider
          optionsData={mockOptionsData}
          calculationResults={mockCalculationResults}
          showResults={false}
        >
          <ResultsDisplay />
        </CustomProvider>
      );

      expect(container.firstChild).toBeNull();
    });
  });
});
