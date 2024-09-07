import React, { useState } from 'react';
import { Container, CssBaseline, Typography, Box, Grid, Grid2 } from '@mui/material';
import PollForm from './components/PollForm';
import PollData from './components/PollData';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const App = () => {
  const [refreshData, setRefreshData] = useState(false);

  const handleSubmission = () => {
    setRefreshData(prev => !prev);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container component="main" maxWidth="md">
        <CssBaseline />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mt: 8,
            mb: 4,
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Polling System
          </Typography>
          <Grid2 container spacing={5}>
            <Grid2 item xs={12} md={4}>
              <PollForm onSubmission={handleSubmission} />
            </Grid2>
            <Grid2 item xs={12} md={8}>
              <PollData refreshData={refreshData} />
            </Grid2>
          </Grid2>
        </Box>
      </Container>
    </LocalizationProvider>
  );
};

export default App;
