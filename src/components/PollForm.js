import React, { useState } from 'react';
import { TextField, Button, RadioGroup, FormControlLabel, Radio, Box, Snackbar, Alert } from '@mui/material';
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import axios from 'axios';
import moment from 'moment';

const PollForm = ({ onSubmission }) => {
  const [name, setName] = useState('');
  const [voteChoice, setVoteChoice] = useState('true');
  const [castedAt, setCastedAt] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name,
      voting_choice: voteChoice === 'true',
      casted_at:  moment(castedAt, 'YYYY-MM-DD').format('DD-MM-YYYY'),
    };

    try {
      await axios.post('http://localhost:3000/api/votes', payload);
      onSubmission();
      setSnackbarOpen(true);
      console.log(payload);
      setName('');
      setVoteChoice('true');
      setCastedAt(null);
    } catch (error) {
      console.error('Error submitting the vote:', error);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <RadioGroup
          row
          value={voteChoice}
          onChange={(e) => setVoteChoice(e.target.value)}
        >
          <FormControlLabel value="true" control={<Radio />} label="Yes" />
          <FormControlLabel value="false" control={<Radio />} label="No" />
        </RadioGroup>
        <TextField
        label="Date of Submission"
        type="date"
        value={moment(castedAt, 'YYYY-MM-DD').format('YYYY-MM-DD')}
        onChange={(e) => setCastedAt(moment(e.target.value).format('YYYY-MM-DD'))}
        fullWidth
      />
        <Button type="submit" variant="contained" color="primary">
          Submit
        </Button>
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity="success">
          Vote submitted successfully!
        </Alert>
      </Snackbar>
    </LocalizationProvider>
  );
};

export default PollForm;
