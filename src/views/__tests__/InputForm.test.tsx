import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InputForm } from '../InputForm';
import { AppProvider } from '../../models/AppContext';
import { ThemeProvider, createTheme } from '@mui/material';

// Mock the controller hook
vi.mock('../../controllers/useOptionsController', () => ({
  useOptionsController: () => ({
    fetchAndCalculate: vi.fn(),
    recalculate: vi.fn(),
  }),
}));

const theme = createTheme();

describe('InputForm', () => {
  const renderWithProvider = () => {
    return render(
      <ThemeProvider theme={theme}>
        <AppProvider>
          <InputForm />
        </AppProvider>
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render stock symbol field initially', () => {
      renderWithProvider();

      expect(screen.getByLabelText(/Stock Symbol/i)).toBeInTheDocument();
    });

    it('should render clickable search icon', () => {
      renderWithProvider();

      const searchIcons = document.querySelectorAll('[data-testid="SearchIcon"]');
      expect(searchIcons.length).toBeGreaterThan(0);
    });

    it('should render title', () => {
      renderWithProvider();

      expect(screen.getByText('Options Leverage Optimizer')).toBeInTheDocument();
    });

    it('should not render additional fields before data is fetched', () => {
      renderWithProvider();

      // These should not be visible initially
      expect(screen.queryByLabelText(/Total Equity/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/Desired Shares/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/Min Delta/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/Max Delta/i)).not.toBeInTheDocument();
    });
  });

  describe('user interactions', () => {
    it('should allow typing in stock symbol input', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      const stockSymbolInput = screen.getByLabelText(/Stock Symbol/i) as HTMLInputElement;

      await user.clear(stockSymbolInput);
      await user.type(stockSymbolInput, 'MSFT');

      expect(stockSymbolInput.value).toBe('MSFT');
    });

    it('should convert stock symbol to uppercase', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      const stockSymbolInput = screen.getByLabelText(/Stock Symbol/i) as HTMLInputElement;

      await user.clear(stockSymbolInput);
      await user.type(stockSymbolInput, 'msft');

      expect(stockSymbolInput.value).toBe('MSFT');
    });
  });

  describe('form validation', () => {
    it('should disable search icon when stock symbol is empty', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      const stockSymbolInput = screen.getByLabelText(/Stock Symbol/i) as HTMLInputElement;

      await user.clear(stockSymbolInput);

      // Search icon button should be disabled when symbol is empty
      const iconButtons = document.querySelectorAll('button');
      const searchButton = Array.from(iconButtons).find(btn =>
        btn.querySelector('[data-testid="SearchIcon"]')
      );
      expect(searchButton).toBeDisabled();
    });

    it('should enable search icon when stock symbol is present', () => {
      renderWithProvider();

      // Default symbol is AAPL, so search icon should be enabled
      const iconButtons = document.querySelectorAll('button');
      const searchButton = Array.from(iconButtons).find(btn =>
        btn.querySelector('[data-testid="SearchIcon"]')
      );
      expect(searchButton).not.toBeDisabled();

      // Other fields should NOT be visible until data is fetched
      expect(screen.queryByLabelText(/Total Equity/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/Desired Shares/i)).not.toBeInTheDocument();
    });
  });

  describe('helper text', () => {
    it('should display helper text for stock symbol', () => {
      renderWithProvider();

      expect(screen.getByText(/click the magnifier to search/i)).toBeInTheDocument();
    });
  });

  describe('input adornments', () => {
    it('should display search icon for stock symbol', () => {
      renderWithProvider();

      const searchIcons = document.querySelectorAll('[data-testid="SearchIcon"]');
      expect(searchIcons.length).toBeGreaterThan(0);
    });
  });

  describe('responsive layout', () => {
    it('should use grid layout', () => {
      renderWithProvider();

      const grids = document.querySelectorAll('.MuiGrid-root');
      expect(grids.length).toBeGreaterThan(0);
    });
  });

  describe('progressive disclosure', () => {
    it('should show only stock symbol initially', () => {
      renderWithProvider();

      expect(screen.getByLabelText(/Stock Symbol/i)).toBeInTheDocument();
      expect(screen.queryByLabelText(/Expiry Date/i)).not.toBeInTheDocument();
    });

    it('should have clickable search icon', () => {
      renderWithProvider();

      const searchIcons = document.querySelectorAll('[data-testid="SearchIcon"]');
      expect(searchIcons.length).toBeGreaterThan(0);
    });
  });
});
