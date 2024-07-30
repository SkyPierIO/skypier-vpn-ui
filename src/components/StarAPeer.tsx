import React from 'react';
import { Button, Box, Typography } from '@mui/material';
import StarIcon from '@mui/icons-material/StarBorderOutlined';
import { Snackbar } from '@mui/material';
import { Alert } from '@mui/material';

interface StarAPeerProps {
  peerId: string;
}

const StarAPeer: React.FC<StarAPeerProps> = ({ peerId }) => {
  
    const [snackbarOpen, setSnackbarOpen] = React.useState(false);
    const [snackbarMessage, setSnackbarMessage] = React.useState('');

    const getStarredPeers = (): string[] => {
        const storedPeers = localStorage.getItem('starredPeers');
        return storedPeers ? JSON.parse(storedPeers) : [];
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const addPeerToLocalStorage = () => {
        const starredPeers = getStarredPeers();
        if (!starredPeers.includes(peerId)) {
            starredPeers.push(peerId);
            localStorage.setItem('starredPeers', JSON.stringify(starredPeers));
            setSnackbarMessage(`Peer ID ${peerId} added to starred peers.`);
        } else {
            setSnackbarMessage(`Peer ID ${peerId} is already in starred peers.`);
        }
        setSnackbarOpen(true);
    };

    return (
        <Box sx={{ p: 2 }}>
            <Button variant="outlined" color="primary" onClick={addPeerToLocalStorage}>
                <StarIcon></StarIcon>
            </Button>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                message={snackbarMessage}

            >
                <Alert
                    variant="filled"
                    severity="success"
                    sx={{ width: '100%' }}
                >
                {snackbarMessage}
                </Alert>
            </ Snackbar>
        </Box>
    );
};

export default StarAPeer;