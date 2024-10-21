import React, { useEffect, useState } from 'react';
import { Chip, Box, Button } from '@mui/material';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import axios from 'axios';

interface VPNStatusResponse {
  connected: boolean;
  peer_id?: string;
}

const VPNStatus: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [peerId, setPeerId] = useState<string | null>(null);

  useEffect(() => {
    const fetchVPNStatus = async () => {
      try {
        const response = await axios.get<VPNStatusResponse>('/api/v0/status');
        setIsConnected(response.data.connected);
        if (response.data.connected && response.data.peer_id) {
          setPeerId(response.data.peer_id);
        } else {
          setPeerId(null);
        }
      } catch (error) {
        console.error('Error fetching VPN status:', error);
      }
    };

    fetchVPNStatus();
    const interval = setInterval(fetchVPNStatus, 5000); // Poll every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  const handleDisconnect = async () => {
    if (peerId) {
      try {
        await axios.get(`/disconnect/${peerId}`);
        alert('Disconnected successfully');
        setIsConnected(false);
        setPeerId(null);
      } catch (error) {
        console.error('Error disconnecting:', error);
        alert('Failed to disconnect');
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, mb: 2 }}>
      <Chip
        icon={isConnected ? <CloudDoneIcon /> : <CloudOffIcon />}
        label={isConnected ? 'Connected to a remote peer.' : 'The VPN is currently not connected'}
        color={isConnected ? 'success' : 'default'}
        sx={{
          bgcolor: isConnected ? 'green' : 'grey',
          color: 'white',
          animation: isConnected ? 'ripple 1.5s infinite' : 'none',
          '@keyframes ripple': {
            '0%': {
              boxShadow: '0 0 0 0 rgba(0, 255, 0, 0.4)',
            },
            '70%': {
              boxShadow: '0 0 0 10px rgba(0, 255, 0, 0)',
            },
            '100%': {
              boxShadow: '0 0 0 0 rgba(0, 255, 0, 0)',
            },
          },
        }}
      />
      {isConnected && (
        <Button
          variant="contained"
          color="secondary"
          onClick={handleDisconnect}
          sx={{ ml: 2 }}
        >
          Disconnect
        </Button>
      )}
    </Box>
  );
};

export default VPNStatus;