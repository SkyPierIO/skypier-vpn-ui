import React, { useEffect, useState } from 'react';
import { Chip, Box, Button } from '@mui/material';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudOffIcon from '@mui/icons-material/CloudOff';

// Axios
import http from "../http.common";

interface VPNStatusResponse {
  status: string;
  peer_id?: string;
}

const VPNStatus: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [peerId, setPeerId] = useState<string | null>(null);

  useEffect(() => {
    const fetchVPNStatus = async () => {
      try {
        const response = await http.get<VPNStatusResponse>('/status');
        console.log(response.data);
        setIsConnected(response.data.status === "connected");
        if (response.data.status && response.data.peer_id) {
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
        await http.get(`/disconnect/${peerId}`);
        alert('Disconnected successfully');
        setIsConnected(false);
        setPeerId(null);
      } catch (error) {
        console.error('Error disconnecting:', error);
        alert('Failed to disconnect');
      }
    } else {
      console.error('Peer ID not found');
      alert('Peer ID not found');
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, mb: 2 }}>
      <Chip
        icon={isConnected ? <CloudDoneIcon /> : <CloudOffIcon />}
        label={isConnected ? 'Connected to the peer '+peerId?.substring(0, 5)+"..."+peerId?.slice(-20 ): 'The VPN is currently not connected'}
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