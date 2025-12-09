import { useEffect, useRef, useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NetworkPingIcon from '@mui/icons-material/NetworkPing';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import StarIcon from '@mui/icons-material/Star';
import ReactCountryFlag from 'react-country-flag';
import jazzicon from '@metamask/jazzicon';
import http from '../http.common';

interface PeerInfo {
  peerId: string;
  status?: string;
  city?: string;
  countryCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

interface CountryAccordionProps {
  countryCode: string;
  countryName: string;
  peers: PeerInfo[];
  selectedPeerId: string | null;
  connectedPeerId: string | null;
  onPeerSelect: (peerId: string) => void;
  onPeerConnect: (peerId: string) => void;
}

// Jazzicon component
const JazziconAvatar = ({ peerId, size = 28 }: { peerId: string; size?: number }) => {
  const avatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const generateIdenticon = async () => {
      if (avatarRef.current && peerId) {
        const sha256 = async (message: string) => {
          const msgBuffer = new TextEncoder().encode(message);
          const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        };

        const hash = await sha256(peerId);
        const numericValue = parseInt(hash.slice(0, 8), 16);
        const icon = jazzicon(size, numericValue);
        avatarRef.current.innerHTML = '';
        avatarRef.current.appendChild(icon);
      }
    };

    generateIdenticon();
  }, [peerId, size]);

  return (
    <Box
      ref={avatarRef}
      sx={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        '& > div': {
          borderRadius: '50%'
        }
      }}
    />
  );
};

const PeerRow = ({ 
  peer, 
  isSelected, 
  isConnected,
  onSelect, 
  onConnect 
}: { 
  peer: PeerInfo; 
  isSelected: boolean;
  isConnected: boolean;
  onSelect: () => void; 
  onConnect: () => void;
}) => {
  const [status, setStatus] = useState<string>(peer.status || 'Unknown');
  const [pinging, setPinging] = useState(false);
  const [isStarred, setIsStarred] = useState<boolean>(() => {
    const storedPeers = localStorage.getItem('starredPeers');
    const starredPeers: string[] = storedPeers ? JSON.parse(storedPeers) : [];
    return starredPeers.includes(peer.peerId);
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'info' });

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const truncatePeerId = (id: string) => `${id.substring(0, 8)}...${id.slice(-6)}`;

  const handleToggleStar = (e: React.MouseEvent) => {
    e.stopPropagation();
    const storedPeers = localStorage.getItem('starredPeers');
    const starredPeers: string[] = storedPeers ? JSON.parse(storedPeers) : [];
    
    if (isStarred) {
      // Remove from favorites
      const updatedPeers = starredPeers.filter(id => id !== peer.peerId);
      localStorage.setItem('starredPeers', JSON.stringify(updatedPeers));
      setIsStarred(false);
      setSnackbar({
        open: true,
        message: `Removed from favorites`,
        severity: 'info',
      });
    } else {
      // Add to favorites
      starredPeers.push(peer.peerId);
      localStorage.setItem('starredPeers', JSON.stringify(starredPeers));
      setIsStarred(true);
      setSnackbar({
        open: true,
        message: `Added to favorites`,
        severity: 'success',
      });
    }
  };

  const handlePing = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setPinging(true);
    try {
      const response = await http.get(`/ping/${peer.peerId}`);
      if (response.status === 200 && response.data.result) {
        setStatus('Online');
        setSnackbar({
          open: true,
          message: `✓ Peer ${truncatePeerId(peer.peerId)} is reachable`,
          severity: 'success',
        });
      } else {
        setStatus('Unreachable');
        setSnackbar({
          open: true,
          message: `✗ Peer ${truncatePeerId(peer.peerId)} is unreachable`,
          severity: 'warning',
        });
      }
    } catch (error) {
      setStatus('Unreachable');
      setSnackbar({
        open: true,
        message: `✗ Failed to ping peer ${truncatePeerId(peer.peerId)}`,
        severity: 'error',
      });
    }
    setPinging(false);
  };

  const handleConnect = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setSnackbar({
        open: true,
        message: `Connecting to ${truncatePeerId(peer.peerId)}...`,
        severity: 'info',
      });
      onConnect();
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Failed to connect to peer`,
        severity: 'error',
      });
    }
  };

  // Use emerald green for Online status
  const getStatusChipSx = () => {
    if (status === 'Online') {
      return { bgcolor: '#10b981', color: '#fff' };
    }
    return {};
  };
  const statusColor = status === 'Online' ? 'success' : status === 'Unreachable' ? 'default' : 'warning';

  return (
    <Box
      onClick={onSelect}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        p: 1.5,
        borderRadius: 1,
        cursor: 'pointer',
        bgcolor: isSelected ? 'action.selected' : isConnected ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
        border: isConnected ? '1px solid' : '1px solid transparent',
        borderColor: isConnected ? '#10b981' : 'transparent',
        '&:hover': {
          bgcolor: isSelected ? 'action.selected' : 'action.hover',
        },
        transition: 'background-color 0.2s',
      }}
    >
      <JazziconAvatar peerId={peer.peerId} size={28} />
      
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Tooltip title={peer.peerId} arrow>
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              color: 'primary.main',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {truncatePeerId(peer.peerId)}
          </Typography>
        </Tooltip>
        {peer.city && (
          <Typography variant="caption" color="text.secondary">
            {peer.city}
          </Typography>
        )}
      </Box>

      <Chip
        label={status}
        size="small"
        color={statusColor}
        sx={{ 
          fontSize: '0.65rem', 
          height: 20,
          minWidth: 60,
          ...(status === 'Online' && { bgcolor: '#10b981', color: '#fff' }),
        }}
      />

      <Stack direction="row" spacing={0.5}>
        <Tooltip title={isStarred ? 'Remove from favorites' : 'Add to favorites'}>
          <IconButton
            size="small"
            onClick={handleToggleStar}
            sx={{ 
              p: 0.5,
              color: isStarred ? '#f59e0b' : 'inherit',
              '&:hover': { color: '#f59e0b' }
            }}
          >
            {isStarred ? <StarIcon fontSize="small" /> : <StarBorderOutlinedIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Ping">
          <IconButton
            size="small"
            onClick={handlePing}
            disabled={pinging}
            sx={{ 
              p: 0.5,
              '&:hover': { color: 'info.main' }
            }}
          >
            <NetworkPingIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={isConnected ? 'Connected' : 'Connect'}>
          <IconButton
            size="small"
            onClick={handleConnect}
            disabled={isConnected || status === 'Unreachable'}
            sx={{ 
              p: 0.5,
              color: isConnected ? '#10b981' : 'inherit',
              '&:hover': { color: '#10b981' }
            }}
          >
            <ElectricalServicesIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

const CountryAccordion = ({
  countryCode,
  countryName,
  peers,
  selectedPeerId,
  connectedPeerId,
  onPeerSelect,
  onPeerConnect,
}: CountryAccordionProps) => {
  const onlinePeers = peers.filter(p => p.status === 'Online').length;
  
  return (
    <Accordion 
      disableGutters
      sx={{
        bgcolor: 'background.paper',
        '&:before': { display: 'none' },
        boxShadow: 1,
        '&:not(:last-child)': { mb: 1 },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          minHeight: 56,
          '& .MuiAccordionSummary-content': {
            alignItems: 'center',
            gap: 1.5,
          },
        }}
      >
        <Box sx={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center' }}>
          <ReactCountryFlag
            countryCode={countryCode}
            svg
            style={{
              width: '1.5em',
              height: '1.125em',
              borderRadius: '2px',
            }}
          />
        </Box>
        <Typography sx={{ fontWeight: 500, flex: 1 }}>
          {countryName}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          {onlinePeers > 0 && (
            <Chip
              label={`${onlinePeers} online`}
              size="small"
              sx={{ 
                fontSize: '0.7rem', 
                height: 22,
                bgcolor: '#10b981',
                color: '#fff',
              }}
            />
          )}
          <Chip
            label={`${peers.length} peer${peers.length !== 1 ? 's' : ''}`}
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.7rem', height: 22 }}
          />
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 1 }}>
        <Stack spacing={0.5}>
          {peers.map((peer) => (
            <PeerRow
              key={peer.peerId}
              peer={peer}
              isSelected={peer.peerId === selectedPeerId}
              isConnected={peer.peerId === connectedPeerId}
              onSelect={() => onPeerSelect(peer.peerId)}
              onConnect={() => onPeerConnect(peer.peerId)}
            />
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default CountryAccordion;
