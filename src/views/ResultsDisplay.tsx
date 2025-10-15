import React, { useContext } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { AppContext } from '../controllers/AppContext';
import { CalculationService } from '../controllers/calculationService';

export const ResultsDisplay: React.FC = () => {
  const appContext = useContext(AppContext)!;
  const optimalResult = CalculationService.getOptimalContract(appContext.calculationResults);

  return !appContext.showResults ? null : appContext.error ? (
    <Alert severity="error" sx={{ mb: 3 }}>
      {appContext.error}
    </Alert>
  ) : appContext.loading ? (
    <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
      <Typography>Loading options data...</Typography>
    </Paper>
  ) : !appContext.optionsData ? (
    <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
      <Typography color="text.secondary">
        Enter a stock symbol and click the magnifier to search
      </Typography>
    </Paper>
  ) : !appContext.calculationResults || appContext.calculationResults.length === 0 ? (
    <Alert severity="info" sx={{ mb: 3 }}>
      No valid options found matching your criteria. Try adjusting the delta range or leverage.
    </Alert>
  ) : (
    <Box>
      {/* Optimal Contract Highlight */}
      {optimalResult && (
        <Card
          elevation={4}
          sx={{
            mb: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CheckCircleIcon sx={{ mr: 1, fontSize: 32 }} />
              <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
                Optimal Contract (Fewest Contracts, Best Leverage)
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={2}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Strike Price
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  ${optimalResult.contract.strike.toFixed(2)}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Delta
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {optimalResult.contract.delta.toFixed(3)}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Contracts
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {CalculationService.formatNumber(optimalResult.numberOfContracts, 2)}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Shares
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {CalculationService.formatNumber(optimalResult.numberOfShares, 0)}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Leverage
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {optimalResult.leverage.toFixed(2)}x
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Cost
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  ${CalculationService.formatNumber(optimalResult.totalCost, 2)}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* All Results Table */}
      <Paper elevation={2}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TrendingUpIcon sx={{ mr: 1 }} />
            <Typography variant="h6" component="div">
              All Valid Options ({appContext.calculationResults.length})
            </Typography>
          </Box>
        </Box>

        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Strike</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Delta</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Premium</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">
                  Contracts
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">
                  Shares
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">
                  Leverage
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">
                  Total Cost
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">
                  Status
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appContext.calculationResults.map(result => {
                const isOptimal = result === optimalResult;
                return (
                  <TableRow
                    key={result.contract.symbol}
                    sx={{
                      backgroundColor: isOptimal ? 'rgba(102, 126, 234, 0.1)' : 'inherit',
                      '&:hover': { backgroundColor: 'action.hover' },
                    }}
                  >
                    <TableCell>
                      <strong>${result.contract.strike.toFixed(2)}</strong>
                    </TableCell>
                    <TableCell>{result.contract.delta.toFixed(3)}</TableCell>
                    <TableCell>${result.contract.premium.toFixed(2)}</TableCell>
                    <TableCell align="right">
                      {CalculationService.formatNumber(result.numberOfContracts, 2)}
                    </TableCell>
                    <TableCell align="right">
                      {CalculationService.formatNumber(result.numberOfShares, 0)}
                    </TableCell>
                    <TableCell align="right">
                      <strong>{result.leverage.toFixed(2)}x</strong>
                    </TableCell>
                    <TableCell align="right">
                      ${CalculationService.formatNumber(result.totalCost, 2)}
                    </TableCell>
                    <TableCell align="center">
                      {isOptimal ? (
                        <Chip
                          label="OPTIMAL"
                          color="primary"
                          size="small"
                          icon={<CheckCircleIcon />}
                        />
                      ) : (
                        <Chip label="Valid" color="success" size="small" variant="outlined" />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Explanation */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>How it works:</strong>
        </Typography>
        <Typography variant="body2" component="div">
          The optimizer solves for optimal leverage while using ALL available capital:
          <ul style={{ marginTop: 8, marginBottom: 8 }}>
            <li>
              <strong>Step 1:</strong> Calculate target contracts: C = T×(L - 1) / (S×D - O)
            </li>
            <li>
              <strong>Step 2:</strong> Round to floor & ceiling (whole contracts only)
            </li>
            <li>
              <strong>Step 3:</strong> Buy contracts, then use ALL remaining equity for shares: N =
              (T - O×C) / S
            </li>
            <li>
              <strong>Result:</strong> S×N + O×C = T (fully invested!)
            </li>
            <li>
              <strong>Leverage:</strong> (N + D×C)×S/T (actual leverage achieved)
            </li>
            <li>
              All results sorted by <strong>least number of contracts</strong>; if tied, by{' '}
              <strong>closest leverage to target</strong>
            </li>
          </ul>
          <strong>Key insights:</strong>
          <ul style={{ marginTop: 4, marginBottom: 4 }}>
            <li>Contracts must be whole numbers (can't buy 2.5 contracts)</li>
            <li>Shares can be fractional (42.45 shares is fine with most brokers)</li>
            <li>ALL remaining capital after buying contracts goes to shares (fully invested!)</li>
          </ul>
        </Typography>
      </Alert>
    </Box>
  );
};
