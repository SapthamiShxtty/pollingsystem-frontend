import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, 
  TextField, Button, MenuItem, Select 
} from '@mui/material';
import { Line, Bar } from 'react-chartjs-2';
import moment from 'moment';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Stack } from '@mui/material';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, BarElement, CategoryScale, LinearScale,PointElement } from 'chart.js';
ChartJS.register(Title, Tooltip, Legend, LineElement, BarElement, CategoryScale, LinearScale, PointElement);

const PollData = ({ refreshData }) => {
  const [polls, setPolls] = useState([]);
  const [lineData, setLineData] = useState(null);
  const [barData, setBarData] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [updatedName, setUpdatedName] = useState('');
  const [updatedVoteChoice, setUpdatedVoteChoice] = useState(true);
  const [updatedCastedAt, setUpdatedCastedAt] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pollToDelete, setPollToDelete] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const pollResponse = await axios.get('http://localhost:3000/api/votes');
        setPolls(pollResponse.data.map(poll => ({
          ...poll,
          casted_at: moment(poll.casted_at, 'DD-MM-YYYY').format('YYYY-MM-DD')
        })));

        const yesResponse = await axios.get('http://localhost:3000/api/votes/counts-by-choice?voting_choice=true');
        const noResponse = await axios.get('http://localhost:3000/api/votes/counts-by-choice?voting_choice=false');
        
        const lineChartData = {
          labels: yesResponse.data.data.map(item => moment(item.casted_at, 'YYYY-MM-DD').format('YYYY-MM-DD')), 
          datasets: [
            {
              label: 'Yes Votes',
              data: yesResponse.data.data.map(item => item.count),
              fill: false,
              borderColor: 'green',
              backgroundColor: 'green',
              tension: 0.2,
            },
            {
              label: 'No Votes',
              data: noResponse.data.data.map(item => item.count),
              fill: false,
              borderColor: 'red',
              backgroundColor: 'red',
              tension: 0.2,
            }
          ]
        };
        setLineData(lineChartData);

        const resultsResponse = await axios.get('http://localhost:3000/api/votes/results');
        const barChartData = {
          labels: ['Yes', 'No'],
          datasets: [
            {
              label: 'Total Votes',
              data: [
                resultsResponse.data.data.find(item => item.voting_choice === true)?.count || 0,
                resultsResponse.data.data.find(item => item.voting_choice === false)?.count || 0
              ],
              backgroundColor: ['green', 'red'],
            }
          ]
        };
        setBarData(barChartData);

      } catch (error) {
        console.error('Error fetching poll data:', error);
      }
    };

    fetchData();
  }, [refreshData]); 

  const handleEditClick = (poll) => {
    setSelectedPoll(poll);
    setUpdatedName(poll.name);
    setUpdatedVoteChoice(poll.voting_choice);
    setUpdatedCastedAt(moment(poll.casted_at, 'YYYY-MM-DD').format('DD-MM-YYYY')); 
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    try {
      await axios.put(`http://localhost:3000/api/votes/${selectedPoll.id}`, {
        name: updatedName,
        voting_choice: updatedVoteChoice,
        casted_at: moment(updatedCastedAt, 'DD-MM-YYYY').format('YYYY-MM-DD') // Convert to YYYY-MM-DD
      });
      setPolls(polls.map(poll => 
        poll.id === selectedPoll.id 
        ? { ...poll, name: updatedName, voting_choice: updatedVoteChoice, casted_at: moment(updatedCastedAt, 'DD-MM-YYYY').format('YYYY-MM-DD') } 
        : poll
      ));
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating the vote:', error);
    }
  };

  const handleDeleteClick = (poll) => {
    setPollToDelete(poll);
    setConfirmDialogOpen(true);
  };
  
  const handleConfirmDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/votes/${id}`);
      setPolls(polls.filter(poll => poll.id !== id));
      setConfirmDialogOpen(false);
    } catch (error) {
      console.error('Error deleting the vote:', error);
    }
  }; 

  return (
    <div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Vote Choice</TableCell>
              <TableCell>Casted At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {polls.map((poll, index) => (
              <TableRow key={poll.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{poll.name}</TableCell>
                <TableCell>{poll.voting_choice ? 'Yes' : 'No'}</TableCell>
                <TableCell>{moment(poll.casted_at).format('DD-MM-YYYY')}</TableCell>
                <TableCell>
                  <IconButton sx={{ color: 'blue' }} onClick={() => handleEditClick(poll)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton sx={{ color: 'red' }} onClick={() => handleDeleteClick(poll.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <h3>Voting Trends</h3>
      {lineData && <Line data={lineData} options={{ responsive: true, maintainAspectRatio: true }} />}

      <h3>Overall Voting Results</h3>
      {barData && <Bar data={barData} options={{ responsive: true, maintainAspectRatio: true }} />}

      <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          sx={{ '& .MuiDialog-paper': { width: '400px' } }}
        >
          <DialogTitle>Edit Vote</DialogTitle>
          <br></br>
          <DialogContent>
            <Stack spacing={2}>
              <TextField
                label="Name"
                value={updatedName}
                onChange={(e) => setUpdatedName(e.target.value)}
                fullWidth
              />
              <Select
                label="Vote Choice"
                value={updatedVoteChoice ? 'true' : 'false'}
                onChange={(e) => setUpdatedVoteChoice(e.target.value === 'true')}
                fullWidth
              >
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </Select>
              <TextField
                label="Date of Submission"
                type="date"
                value={moment(updatedCastedAt, 'DD-MM-YYYY').format('YYYY-MM-DD')}
                onChange={(e) => setUpdatedCastedAt(moment(e.target.value, 'YYYY-MM-DD').format('DD-MM-YYYY'))}
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={handleEditSave} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
            open={confirmDialogOpen}
            onClose={() => setConfirmDialogOpen(false)}
          >
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogContent>
              <p>Are you sure you want to delete this vote?</p>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setConfirmDialogOpen(false)} color="primary">
                No
              </Button>
              <Button
                onClick={() => handleConfirmDelete(pollToDelete)}
                color="primary"
              >
                Yes
              </Button>
            </DialogActions>
          </Dialog>
    </div>
  );
};

export default PollData;






