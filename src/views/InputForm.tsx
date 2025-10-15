import React, { useContext } from 'react';
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
import { AppContext } from '../controllers/AppContext';
import { useOptionsController } from '../controllers/useOptionsController';
import * as utils from '../controllers/utils';

export const InputForm: React.FC = () => {
  const appContext = useContext(AppContext)!;
  const { fetchAndCalculate, recalculate } = useOptionsController();

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
            value={appContext.userInputs.stockSymbol}
            onChange={e => appContext.updateUserInput('stockSymbol', e.target.value.toUpperCase())}
            onKeyPress={e =>
              e.key === 'Enter' && utils.handleFetchData(appContext, fetchAndCalculate)
            }
            disabled={appContext.loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Search for stock">
                    <span>
                      <IconButton
                        onClick={() => utils.handleFetchData(appContext, fetchAndCalculate)}
                        disabled={appContext.loading || !appContext.userInputs.stockSymbol}
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
              appContext.loading
                ? 'Loading options data...'
                : 'Enter ticker symbol and click the magnifier to search'
            }
          />
        </Grid>

        {/* Show additional fields only after data has been fetched */}
        {appContext.optionsData && (
          <>
            {/* Divider */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            {/* Stock Price Display */}
            <Grid item xs={12}>
              <Box sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
                <Typography variant="body1">
                  <strong>{appContext.optionsData.stock.symbol}</strong> Current Price:{' '}
                  <strong>${appContext.optionsData.stock.price.toFixed(2)}</strong>
                </Typography>
              </Box>
            </Grid>

            {/* Expiry Date */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Expiry Date"
                value={appContext.userInputs.selectedExpiry}
                onChange={e => appContext.updateUserInput('selectedExpiry', e.target.value)}
                disabled={appContext.loading}
                helperText="Select option expiration date"
              >
                {appContext.optionsData.expiryDates.map(date => (
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
                value={
                  appContext.userInputs.totalEquity === 0 ? '' : appContext.userInputs.totalEquity
                }
                onChange={e => {
                  const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                  appContext.updateUserInput('totalEquity', isNaN(value) ? 0 : value);
                }}
                disabled={appContext.loading}
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
                value={appContext.userInputs.leverage === 0 ? '' : appContext.userInputs.leverage}
                onChange={e => {
                  const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                  appContext.updateUserInput('leverage', isNaN(value) ? 0 : value);
                }}
                disabled={appContext.loading}
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
                value={appContext.userInputs.deltaMin === 0 ? '' : appContext.userInputs.deltaMin}
                onChange={e => {
                  const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                  appContext.updateUserInput('deltaMin', isNaN(value) ? 0 : value);
                }}
                disabled={appContext.loading}
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
                value={appContext.userInputs.deltaMax === 0 ? '' : appContext.userInputs.deltaMax}
                onChange={e => {
                  const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                  appContext.updateUserInput('deltaMax', isNaN(value) ? 0 : value);
                }}
                disabled={appContext.loading}
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
                color="primary"
                size="large"
                onClick={() => utils.handleShowResults(appContext, recalculate)}
                disabled={appContext.loading || !appContext.userInputs.selectedExpiry}
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
