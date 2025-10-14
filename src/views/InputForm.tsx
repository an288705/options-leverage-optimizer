import React from 'react';
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Typography,
  Paper,
  Grid,
  InputAdornment,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useAppContext } from '../models/AppContext';
import { useOptionsController } from '../controllers/useOptionsController';

export const InputForm: React.FC = () => {
  const { userInputs, updateUserInput, optionsData, loading, setShowResults } = useAppContext();

  const { fetchAndCalculate, recalculate } = useOptionsController();

  const handleShowResults = () => {
    console.log('handleShowResults called', {
      hasOptionsData: !!optionsData,
      selectedExpiry: userInputs.selectedExpiry,
      leverage: userInputs.leverage,
      totalEquity: userInputs.totalEquity,
    });

    if (optionsData && userInputs.selectedExpiry) {
      recalculate(optionsData);
      setShowResults(true);
    } else {
      console.warn('Cannot show results: missing data or expiry');
    }
  };

  const handleFetchData = () => {
    setShowResults(false); // Hide results when fetching new data
    fetchAndCalculate();
  };

  const handleSymbolKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFetchData();
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Options Leverage Optimizer
      </Typography>

      <Grid container spacing={3}>
        {/* Stock Symbol */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Stock Symbol"
            value={userInputs.stockSymbol}
            onChange={e => updateUserInput('stockSymbol', e.target.value.toUpperCase())}
            onKeyPress={handleSymbolKeyPress}
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Search for stock">
                    <span>
                      <IconButton
                        onClick={handleFetchData}
                        disabled={loading || !userInputs.stockSymbol}
                        edge="end"
                        color="primary"
                      >
                        <SearchIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
            helperText={
              loading
                ? 'Loading options data...'
                : 'Enter ticker symbol and click the magnifier to search'
            }
          />
        </Grid>

        {/* Show additional fields only after data has been fetched */}
        {optionsData && (
          <>
            {/* Divider */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            {/* Stock Price Display */}
            <Grid item xs={12}>
              <Box sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
                <Typography variant="body1">
                  <strong>{optionsData.stock.symbol}</strong> Current Price:{' '}
                  <strong>${optionsData.stock.price.toFixed(2)}</strong>
                </Typography>
              </Box>
            </Grid>

            {/* Expiry Date */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Expiry Date"
                value={userInputs.selectedExpiry}
                onChange={e => updateUserInput('selectedExpiry', e.target.value)}
                disabled={loading}
                helperText="Select option expiration date"
              >
                {optionsData.expiryDates.map(date => (
                  <MenuItem key={date} value={date}>
                    {new Date(date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Total Equity */}
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth
                label="Total Equity (T)"
                type="number"
                value={userInputs.totalEquity === 0 ? '' : userInputs.totalEquity}
                onChange={e => {
                  const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                  updateUserInput('totalEquity', isNaN(value) ? 0 : value);
                }}
                disabled={loading}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                helperText="Total capital"
                sx={{
                  '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button':
                    {
                      WebkitAppearance: 'none',
                      margin: 0,
                    },
                  '& input[type=number]': {
                    MozAppearance: 'textfield',
                  },
                }}
              />
            </Grid>

            {/* Leverage */}
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth
                label="Leverage (L)"
                type="number"
                value={userInputs.leverage === 0 ? '' : userInputs.leverage}
                onChange={e => {
                  const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                  updateUserInput('leverage', isNaN(value) ? 0 : value);
                }}
                disabled={loading}
                helperText="Leverage ratio"
                sx={{
                  '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button':
                    {
                      WebkitAppearance: 'none',
                      margin: 0,
                    },
                  '& input[type=number]': {
                    MozAppearance: 'textfield',
                  },
                }}
              />
            </Grid>

            {/* Min Delta */}
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth
                label="Min Delta"
                type="number"
                value={userInputs.deltaMin === 0 ? '' : userInputs.deltaMin}
                onChange={e => {
                  const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                  updateUserInput('deltaMin', isNaN(value) ? 0 : value);
                }}
                disabled={loading}
                inputProps={{ min: 0, max: 1, step: 0.05 }}
                helperText="Min delta"
                sx={{
                  '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button':
                    {
                      WebkitAppearance: 'none',
                      margin: 0,
                    },
                  '& input[type=number]': {
                    MozAppearance: 'textfield',
                  },
                }}
              />
            </Grid>

            {/* Max Delta */}
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth
                label="Max Delta"
                type="number"
                value={userInputs.deltaMax === 0 ? '' : userInputs.deltaMax}
                onChange={e => {
                  const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                  updateUserInput('deltaMax', isNaN(value) ? 0 : value);
                }}
                disabled={loading}
                inputProps={{ min: 0, max: 1, step: 0.05 }}
                helperText="Max delta"
                sx={{
                  '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button':
                    {
                      WebkitAppearance: 'none',
                      margin: 0,
                    },
                  '& input[type=number]': {
                    MozAppearance: 'textfield',
                  },
                }}
              />
            </Grid>

            {/* Show Optimal Number of Call Contracts Button */}
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                size="large"
                onClick={handleShowResults}
                disabled={loading || !userInputs.selectedExpiry}
                sx={{ height: 56, mt: 2 }}
              >
                Show Optimal Number of Call Contracts
              </Button>
            </Grid>
          </>
        )}
      </Grid>
    </Paper>
  );
};
