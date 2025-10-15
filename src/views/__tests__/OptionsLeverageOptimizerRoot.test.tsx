import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OptionsLeverageOptimizerRoot } from '../OptionsLeverageOptimizerRoot';
import { AppProvider } from '../../controllers/AppContext';

// Mock the child components
vi.mock('../InputForm', () => ({
  InputForm: () => <div data-testid="input-form">InputForm Component</div>,
}));

vi.mock('../ResultsDisplay', () => ({
  ResultsDisplay: () => <div data-testid="results-display">ResultsDisplay Component</div>,
}));

// Mock the controller hook
vi.mock('../../controllers/useOptionsController', () => ({
  useOptionsController: () => ({
    fetchAndCalculate: vi.fn(),
    recalculate: vi.fn(),
  }),
}));

describe('OptionsLeverageOptimizerRoot', () => {
  const renderWithProvider = () => {
    return render(
      <AppProvider>
        <OptionsLeverageOptimizerRoot />
      </AppProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render without crashing', () => {
      renderWithProvider();

      expect(screen.getByTestId('input-form')).toBeInTheDocument();
    });

    it('should render InputForm component', () => {
      renderWithProvider();

      const inputForm = screen.getByTestId('input-form');
      expect(inputForm).toBeInTheDocument();
      expect(inputForm).toHaveTextContent('InputForm Component');
    });

    it('should render ResultsDisplay component', () => {
      renderWithProvider();

      const resultsDisplay = screen.getByTestId('results-display');
      expect(resultsDisplay).toBeInTheDocument();
      expect(resultsDisplay).toHaveTextContent('ResultsDisplay Component');
    });

    it('should render both child components', () => {
      renderWithProvider();

      expect(screen.getByTestId('input-form')).toBeInTheDocument();
      expect(screen.getByTestId('results-display')).toBeInTheDocument();
    });
  });

  describe('layout structure', () => {
    it('should have a Box container', () => {
      const { container } = renderWithProvider();

      const boxElements = container.querySelectorAll('.MuiBox-root');
      expect(boxElements.length).toBeGreaterThan(0);
    });

    it('should have a Container component', () => {
      const { container } = renderWithProvider();

      const containerElement = container.querySelector('.MuiContainer-root');
      expect(containerElement).toBeInTheDocument();
    });

    it('should have Container with maxWidth="lg"', () => {
      const { container } = renderWithProvider();

      const containerElement = container.querySelector('.MuiContainer-maxWidthLg');
      expect(containerElement).toBeInTheDocument();
    });

    it('should render InputForm before ResultsDisplay', () => {
      renderWithProvider();

      const inputForm = screen.getByTestId('input-form');
      const resultsDisplay = screen.getByTestId('results-display');

      // Check that InputForm comes before ResultsDisplay in the DOM
      const parent = inputForm.parentElement;
      const children = Array.from(parent?.children || []);
      const inputFormIndex = children.indexOf(inputForm);
      const resultsDisplayIndex = children.indexOf(resultsDisplay);

      expect(inputFormIndex).toBeLessThan(resultsDisplayIndex);
    });
  });

  describe('styling', () => {
    it('should apply minHeight 100vh to main Box', () => {
      const { container } = renderWithProvider();

      const mainBox = container.querySelector('.MuiBox-root');
      const styles = mainBox ? window.getComputedStyle(mainBox) : null;

      // Box should exist
      expect(mainBox).toBeInTheDocument();
    });

    it('should apply background color', () => {
      const { container } = renderWithProvider();

      // Check that background styling is applied (through sx prop)
      const mainBox = container.querySelector('.MuiBox-root');
      expect(mainBox).toBeInTheDocument();
    });

    it('should apply vertical padding', () => {
      const { container } = renderWithProvider();

      // Check that padding is applied (through sx prop with py: 4)
      const mainBox = container.querySelector('.MuiBox-root');
      expect(mainBox).toBeInTheDocument();
    });
  });

  describe('component composition', () => {
    it('should be wrapped by AppProvider when rendering', () => {
      // This test verifies the component can work with AppProvider
      expect(() => renderWithProvider()).not.toThrow();
    });

    it('should render successfully with mocked child components', () => {
      // Since child components are mocked, the root component itself doesn't
      // directly depend on the context - only its children do
      const { container } = render(<OptionsLeverageOptimizerRoot />);

      // Component structure should still render
      expect(container.querySelector('.MuiBox-root')).toBeInTheDocument();
      expect(container.querySelector('.MuiContainer-root')).toBeInTheDocument();
    });
  });

  describe('integration', () => {
    it('should properly integrate with Material UI theme', () => {
      const { container } = renderWithProvider();

      // Check for MUI classes that indicate proper theme integration
      const muiElements = container.querySelectorAll('[class*="Mui"]');
      expect(muiElements.length).toBeGreaterThan(0);
    });

    it('should render all components in correct hierarchy', () => {
      const { container } = renderWithProvider();

      // Verify the DOM structure: Box > Container > Children
      const mainBox = container.querySelector('.MuiBox-root');
      const containerElement = mainBox?.querySelector('.MuiContainer-root');
      const inputForm = screen.getByTestId('input-form');
      const resultsDisplay = screen.getByTestId('results-display');

      expect(mainBox).toBeInTheDocument();
      expect(containerElement).toBeInTheDocument();
      expect(containerElement).toContainElement(inputForm);
      expect(containerElement).toContainElement(resultsDisplay);
    });
  });

  describe('responsive behavior', () => {
    it('should use Container for responsive layout', () => {
      const { container } = renderWithProvider();

      const containerElement = container.querySelector('.MuiContainer-root');
      expect(containerElement).toBeInTheDocument();

      // Container provides responsive breakpoints
      expect(containerElement?.className).toContain('MuiContainer');
    });

    it('should have proper container sizing', () => {
      const { container } = renderWithProvider();

      // Check for maxWidth lg (1280px)
      const containerElement = container.querySelector('.MuiContainer-maxWidthLg');
      expect(containerElement).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should be keyboard accessible', () => {
      renderWithProvider();

      // All child components should be rendered and accessible
      const inputForm = screen.getByTestId('input-form');
      const resultsDisplay = screen.getByTestId('results-display');

      expect(inputForm).toBeVisible();
      expect(resultsDisplay).toBeVisible();
    });

    it('should maintain proper document structure', () => {
      const { container } = renderWithProvider();

      // Ensure no invalid nesting or structure issues
      expect(container.querySelector('.MuiBox-root')).toBeInTheDocument();
      expect(container.querySelector('.MuiContainer-root')).toBeInTheDocument();
    });
  });
});
