import React, { useEffect, useState } from 'react';
import { Chip, Box } from '@mui/material';
import axios from 'axios';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import CloudDoneIcon from '@mui/icons-material/CloudDone';


const VPNStatus: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    const fetchVPNStatus = async () => {
      try {
        const response = await axios.get('/api/v0/status');
        setIsConnected(response.data.status === 'connected');
      } catch (error) {
        console.error('Error fetching VPN status:', error);
      }
    };

    fetchVPNStatus();
    const interval = setInterval(fetchVPNStatus, 5000); // Poll every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, mb: 2}}>
      <Chip
        icon={isConnected ? <CloudDoneIcon /> : <CloudOffIcon />}
        label={isConnected ? 'Connected to a remote peer.' : 'The VPN is currently not connected'}
        color={isConnected ? 'success' : 'default'}
        sx={{ bgcolor: isConnected ? 'green' : 'grey', color: 'white' }}
      />
    </Box>
  );
};

export default VPNStatus;