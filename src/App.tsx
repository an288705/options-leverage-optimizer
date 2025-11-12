import React from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AppProvider } from './controllers/AppContext';
import { OptionsLeverageOptimizerRoot } from './views/OptionsLeverageOptimizerRoot';

// Create Material UI themes
const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
      light: '#764ba2',
    },
    secondary: {
      main: '#f093fb',
    },
    background: {
      default: '#f5f7fa',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider>
        <OptionsLeverageOptimizerRoot />
      </AppProvider>
    </ThemeProvider>
  );
};

export default App;
