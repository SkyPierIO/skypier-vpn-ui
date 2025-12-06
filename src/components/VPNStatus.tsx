import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Chip, Snackbar, Alert, CircularProgress } from '@mui/material';
import http from '../http.common';

import CloudOffIcon from '@mui/icons-material/CloudOff';
import CloudDoneIcon from '@mui/icons-material/CloudDone';

interface VPNStatusResponse {
  status: string;
  peer_id?: string;
}

interface VPNStatusProps {
  onStatusChange?: (isConnected: boolean, peerId: string | null) => void;
}

const VPNStatus: React.FC<VPNStatusProps> = ({ onStatusChange }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [peerId, setPeerId] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('info');
  const [isDisconnecting, setIsDisconnecting] = useState<boolean>(false);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    const fetchVPNStatus = async () => {
      try {
        const response = await http.get<VPNStatusResponse>('/status', { timeout: 5000 });
        console.log(response.data);
        const connected = response.data.status === "connected";
        const pId = response.data.status && response.data.peer_id ? response.data.peer_id : null;
        setIsConnected(connected);
        setPeerId(pId);
        if (onStatusChange) {
          onStatusChange(connected, pId);
        }
      } catch (error) {
        console.error('Error fetching VPN status:', error);
      }
    };

    fetchVPNStatus();
    intervalRef.current = setInterval(fetchVPNStatus, 5000); // Poll every 5 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current); // Cleanup interval on component unmount
      }
    };
  }, [onStatusChange]);

  const handleDisconnect = async () => {
    if (peerId) {
      setIsDisconnecting(true);
      try {
        console.log('Sending disconnect request for peer:', peerId);
        const response = await http.get(`/disconnect/${peerId}`, {
          timeout: 10000, // 10 second timeout for disconnect operation
        });
        console.log('Disconnect response status:', response.status);
        console.log('Disconnect response data:', response.data);
        
        // Check if response indicates success
        if (response.status === 200 && response.data?.status === 'disconnected') {
          setSnackbarMessage('Disconnected successfully');
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
          setIsConnected(false);
          setPeerId(null);
        } else {
          console.warn('Unexpected response:', response);
          setSnackbarMessage('Failed to disconnect');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        }
      } catch (error: any) {
        console.error('Error disconnecting:', error);
        console.error('Error response:', error.response);
        console.error('Error message:', error.message);
        
        // Check if it's actually successful despite the error
        if (error.response?.status === 200 && error.response?.data?.status === 'disconnected') {
          console.log('Disconnect successful despite error thrown');
          setSnackbarMessage('Disconnected successfully');
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
          setIsConnected(false);
          setPeerId(null);
        } else {
          console.error('Disconnect truly failed');
          setSnackbarMessage('Failed to disconnect');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        }
      } finally {
        setIsDisconnecting(false);
      }
    } else {
      console.error('Peer ID not found');
      setSnackbarMessage('Peer ID not found');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, mb: 2 }}>
        <Chip
          icon={isConnected ? <CloudDoneIcon /> : <CloudOffIcon />}
          label={isConnected ? 'Connected to the peer '+peerId?.substring(0, 5)+"..."+peerId?.slice(-20 ): 'The VPN is currently not connected'}
          color={isConnected ? 'success' : 'default'}
          sx={{
            bgcolor: isConnected ? '#10b981' : 'grey',
            color: 'white',
            animation: isConnected ? 'ripple 1.5s infinite' : 'none',
            '@keyframes ripple': {
              '0%': {
                boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.4)',
              },
              '70%': {
                boxShadow: '0 0 0 10px rgba(16, 185, 129, 0)',
              },
              '100%': {
                boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)',
              },
            },
          }}
        />
        {isConnected && (
          <Button
            variant="contained"
            color="secondary"
            onClick={handleDisconnect}
            disabled={isDisconnecting}
            startIcon={isDisconnecting ? <CircularProgress size={20} color="inherit" /> : undefined}
            sx={{ ml: 2 }}
          >
            {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
          </Button>
        )}
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default VPNStatus;