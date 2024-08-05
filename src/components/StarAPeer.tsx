import React, {useState} from 'react';
import { IconButton } from '@mui/material';
import StarIcon from '@mui/icons-material/StarBorderOutlined';
import { Snackbar } from '@mui/material';
import { Alert } from '@mui/material';

interface StarAPeerProps {
  peerId: string;
}

const StarAPeer: React.FC<StarAPeerProps> = ({ peerId }) => {
  
    const [snackbarOpen, setSnackbarOpen] = React.useState(false);
    const [snackbarMessage, setSnackbarMessage] = React.useState('');
    const [open, setOpen] = useState(false);
    // const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    //     if (reason === 'clickaway') {
    //         return;
    //     }
    //     setOpen(false);
    // };

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
        <>
            <IconButton color="primary" size="small" onClick={addPeerToLocalStorage}>
                <StarIcon></StarIcon>
            </IconButton>
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
        </>
    );
};

export default StarAPeer;