import React from 'react';
import { Button, Box, Alert, Snackbar } from '@mui/material';
import DeleteIcon from '@mui/icons-material/DeleteOutline';

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
    <Box sx={{ p: 2 }}>
      <Button variant="outlined" color="secondary" onClick={removePeerFromLocalStorage}>
        <DeleteIcon />
      </Button>
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
    </Box>
  );
};

export default UnstarAPeer;