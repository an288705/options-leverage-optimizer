import React from 'react';
import { Container, Box } from '@mui/material';
import { InputForm } from './InputForm';
import { ResultsDisplay } from './ResultsDisplay';

export const OptionsLeverageOptimizerRoot: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <InputForm />
        <ResultsDisplay />
      </Container>
    </Box>
  );
};
