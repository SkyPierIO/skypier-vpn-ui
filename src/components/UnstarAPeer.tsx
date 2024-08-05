import React from 'react';
import { Alert, IconButton, Snackbar } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';

interface UnstarAPeerProps {
  peerId: string;
}

const UnstarAPeer: React.FC<UnstarAPeerProps> = ({ peerId }) => {

    const [snackbarOpen, setSnackbarOpen] = React.useState(false);
    const [snackbarMessage, setSnackbarMessage] = React.useState('');

    const getStarredPeers = (): string[] => {
        const storedPeers = localStorage.getItem('starredPeers');
        return storedPeers ? JSON.parse(storedPeers) : [];
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };


    const removePeerFromLocalStorage = () => {
        const starredPeers = getStarredPeers();
        const updatedPeers = starredPeers.filter(id => id !== peerId);
        localStorage.setItem('starredPeers', JSON.stringify(updatedPeers));
        setSnackbarMessage(`Peer ID ${peerId} removed from starred peers.`);
        setSnackbarOpen(true);
    };

  return (
    <>
      <IconButton size='small' color="warning" onClick={removePeerFromLocalStorage}>
        <StarIcon />
      </IconButton>
      <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={handleSnackbarClose}
          message={snackbarMessage}

      >
          <Alert
              variant="filled"
              severity="info"
              sx={{ width: '100%' }}
          >
          {snackbarMessage}
          </Alert>
      </ Snackbar>
    </>
  );
};

export default UnstarAPeer;