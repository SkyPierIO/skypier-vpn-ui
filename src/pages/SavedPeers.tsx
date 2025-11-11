import { useState, useEffect, useRef } from 'react';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import RefreshIcon from '@mui/icons-material/Refresh';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import PingIcon from '@mui/icons-material/NetworkPing';
import ReactCountryFlag from "react-country-flag";
import jazzicon from '@metamask/jazzicon';

// Axios
import http from "../http.common";
import { lookup } from 'ipfs-geoip';

interface PeerData {
  peerId: string;
  status: string;
  location: string;
  countryCode: string;
  lastChecked: Date;
  loading: boolean;
}

// Cache for peer locations to persist across refreshes
const locationCache: { [key: string]: { location: string; countryCode: string } } = {};

// Jazzicon component
const JazziconAvatar = ({ peerId, size = 32 }: { peerId: string; size?: number }) => {
  const avatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const generateIdenticon = async () => {
      if (avatarRef.current && peerId) {
        const sha256 = async (message: string) => {
          const msgBuffer = new TextEncoder().encode(message);
          const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
          return hashHex;
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
        '& > div': {
          borderRadius: '50%'
        }
      }}
    />
  );
};

const SavedPeers = () => {
  const [savedPeers, setSavedPeers] = useState<PeerData[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const getStarredPeers = (): string[] => {
    const storedPeers = localStorage.getItem('starredPeers');
    const peers: string[] = storedPeers ? JSON.parse(storedPeers) : [];
    // Remove duplicates from localStorage
    const uniquePeers = [...new Set(peers)];
    if (peers.length !== uniquePeers.length) {
      localStorage.setItem('starredPeers', JSON.stringify(uniquePeers));
    }
    return uniquePeers;
  };

  const removePeerFromFavorites = (peerId: string) => {
    const starredPeers = getStarredPeers();
    const updatedPeers = starredPeers.filter(id => id !== peerId);
    localStorage.setItem('starredPeers', JSON.stringify(updatedPeers));
    setSavedPeers(prev => prev.filter(peer => peer.peerId !== peerId));
  };

  const checkPeerStatus = async (peerId: string): Promise<string> => {
    try {
      const response = await http.get(`/ping/${peerId}`);
      if (response.status === 200 && response.data.result) {
        return "Online";
      }
      return "Unreachable";
    } catch (error) {
      return "Unreachable";
    }
  };

  const getPeerLocation = async (peerId: string): Promise<{ location: string; countryCode: string }> => {
    // Check cache first
    if (locationCache[peerId]) {
      console.log(`Using cached location for ${peerId}`);
      return locationCache[peerId];
    }

    try {
      const response = await http.get(`/peer/${peerId}/info`, { timeout: 5000 });
      if (response.status === 200 && response.data.length >= 1) {
        const ip = response.data[0];
        const gateways = ['https://ipfs.io', 'https://dweb.link'];
        const result = await lookup(gateways, ip);
        
        // Validate we got proper location data
        if (result && result.country_name && result.country_code) {
          const locationData = {
            location: `${result.country_name}, ${result.city || 'Unknown City'}`,
            countryCode: result.country_code
          };
          // Cache the result
          locationCache[peerId] = locationData;
          console.log(`Cached location for ${peerId}:`, locationData);
          return locationData;
        }
      }
      // Return cached data if available, otherwise empty
      return locationCache[peerId] || { location: "", countryCode: "" };
    } catch (error) {
      console.error('Error fetching peer location:', error);
      // Return cached data if available, otherwise empty
      return locationCache[peerId] || { location: "", countryCode: "" };
    }
  };

  const loadPeerData = async (peerId: string) => {
    // Check if we have cached location data
    const cachedLocation = locationCache[peerId];
    
    setSavedPeers(prev => {
      // Check if peer already exists in the current state
      const existingPeer = prev.find(p => p.peerId === peerId);
      if (existingPeer) {
        return prev; // Don't add duplicate
      }
      
      const peerData: PeerData = {
        peerId,
        status: "Checking...",
        location: cachedLocation?.location || "Loading...",
        countryCode: cachedLocation?.countryCode || "xx",
        lastChecked: new Date(),
        loading: true
      };
      return [...prev, peerData];
    });

    // Fetch status and location in parallel
    const [status, locationData] = await Promise.all([
      checkPeerStatus(peerId),
      getPeerLocation(peerId)
    ]);

    setSavedPeers(prev => prev.map(peer => {
      if (peer.peerId === peerId) {
        // Use location data if available, otherwise keep what we have
        const hasValidLocation = locationData.location && locationData.countryCode;
        return { 
          ...peer, 
          status, 
          location: hasValidLocation ? locationData.location : peer.location,
          countryCode: hasValidLocation ? locationData.countryCode : peer.countryCode,
          loading: false,
          lastChecked: new Date()
        };
      }
      return peer;
    }));
  };

  const refreshAllPeers = async () => {
    setRefreshing(true);
    
    // Mark all peers as loading but preserve location data
    setSavedPeers(prev => prev.map(peer => {
      // Store current location in cache before refresh
      if (peer.location && peer.countryCode && peer.countryCode !== "xx") {
        locationCache[peer.peerId] = {
          location: peer.location,
          countryCode: peer.countryCode
        };
      }
      return {
        ...peer,
        loading: true,
        status: "Checking..."
      };
    }));
    
    // Refresh each peer (only status, location will use cache)
    const starredPeerIds = getStarredPeers();
    for (const peerId of starredPeerIds) {
      // Only check status, use cached location
      const status = await checkPeerStatus(peerId);
      const cachedLocation = locationCache[peerId];

      setSavedPeers(prev => prev.map(peer => {
        if (peer.peerId === peerId) {
          return { 
            ...peer, 
            status,
            // Always preserve location data from cache or current state
            location: cachedLocation?.location || peer.location,
            countryCode: cachedLocation?.countryCode || peer.countryCode,
            loading: false,
            lastChecked: new Date()
          };
        }
        return peer;
      }));
    }
    
    setRefreshing(false);
  };

  useEffect(() => {
    const starredPeerIds = getStarredPeers();
    // Remove duplicates before loading
    const uniquePeerIds = [...new Set(starredPeerIds)];
    uniquePeerIds.forEach(peerId => {
      loadPeerData(peerId);
    });
  }, []);

  const truncatePeerId = (peerId: string) => {
    return `${peerId.substring(0, 10)}...${peerId.slice(-10)}`;
  };

  // Sort peers: Online first, then Unreachable, then Loading at the bottom
  const sortedPeers = [...savedPeers].sort((a, b) => {
    // Loading peers go to bottom
    if (a.loading && !b.loading) return 1;
    if (!a.loading && b.loading) return -1;
    if (a.loading && b.loading) return 0;

    // Online peers go to top
    if (a.status === "Online" && b.status !== "Online") return -1;
    if (a.status !== "Online" && b.status === "Online") return 1;

    return 0;
  });

  return (
    <Container 
      maxWidth="xl"
      sx={{ 
        px: { xs: 1, sm: 2, md: 3 },
        py: { xs: 2, sm: 3 }
      }}
    >
      <Stack 
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography 
            variant="h4" 
            color="text.primary"
            sx={{ 
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <StarIcon sx={{ color: 'warning.main' }} />
            Saved Peers
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {savedPeers.length === 0 ? "No saved peers yet" : `${savedPeers.length} peer${savedPeers.length !== 1 ? 's' : ''} in your favorites`}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={refreshAllPeers}
          disabled={refreshing || savedPeers.length === 0}
        >
          Refresh All
        </Button>
      </Stack>

      {savedPeers.length === 0 ? (
        <Paper 
          sx={{ 
            p: 8, 
            textAlign: 'center',
            bgcolor: 'background.default'
          }}
        >
          <StarIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Saved Peers
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Star peers from the Explore Peers page to see them here
          </Typography>
        </Paper>
      ) : (
        <TableContainer 
          component={Paper} 
          sx={{ 
            boxShadow: 2,
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <Table sx={{ minWidth: { xs: 300, sm: 650 } }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem' }}>
                  Location
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem' }}>
                  Peer ID
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.875rem' }}>
                  Status
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.875rem' }}>
                  Last Checked
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.875rem' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedPeers.map((peer) => (
                <TableRow
                  key={peer.peerId}
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    '&:hover': { bgcolor: 'action.hover' },
                    transition: 'background-color 0.2s',
                    opacity: peer.loading ? 0.6 : 1
                  }}
                >
                  <TableCell>
                    {peer.loading ? (
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Skeleton variant="rectangular" width={24} height={18} sx={{ borderRadius: '2px' }} />
                        <Skeleton width={130} />
                      </Stack>
                    ) : (
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box 
                          sx={{ 
                            fontSize: '1.5rem', 
                            lineHeight: 1,
                            display: 'flex',
                            alignItems: 'center',
                            minWidth: 24
                          }}
                        >
                          {peer.countryCode === "xx" ? (
                            <LocationOnIcon />
                          ) : (
                            <ReactCountryFlag 
                              countryCode={peer.countryCode} 
                              svg 
                              style={{ 
                                width: '1.5em', 
                                height: '1.125em',
                                borderRadius: '2px'
                              }}
                            />
                          )}
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {peer.location}
                        </Typography>
                      </Stack>
                    )}
                  </TableCell>
                  <TableCell>
                    {peer.loading ? (
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Skeleton variant="circular" width={32} height={32} />
                        <Skeleton width={180} />
                      </Stack>
                    ) : (
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <JazziconAvatar peerId={peer.peerId} size={32} />
                        <Tooltip title={peer.peerId} arrow>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontFamily: 'monospace',
                              fontSize: '0.8rem',
                              color: '#5df',
                              cursor: 'pointer'
                            }}
                          >
                            {truncatePeerId(peer.peerId)}
                          </Typography>
                        </Tooltip>
                      </Stack>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {peer.loading ? (
                      <Skeleton width={80} />
                    ) : (
                      <Chip 
                        label={peer.status}
                        color={peer.status === "Online" ? "success" : "default"}
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {peer.loading ? (
                      <Skeleton width={80} />
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        {peer.lastChecked.toLocaleTimeString()}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="Ping">
                        <IconButton 
                          size="small"
                          color="info"
                          disabled={peer.loading}
                          onClick={async () => {
                            try {
                              const response = await http.get(`/ping/${peer.peerId}`);
                              // Update status after ping
                              setSavedPeers(prev => prev.map(p => 
                                p.peerId === peer.peerId 
                                  ? { ...p, status: response.data.result ? "Online" : "Unreachable" }
                                  : p
                              ));
                            } catch (error) {
                              console.error(error);
                            }
                          }}
                        >
                          <PingIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Connect to peer">
                        <IconButton 
                          size="small"
                          color="primary"
                          disabled={peer.loading || peer.status !== "Online"}
                          onClick={async () => {
                            try {
                              await http.get(`/connect/${peer.peerId}`);
                            } catch (error) {
                              console.error(error);
                            }
                          }}
                        >
                          <ElectricalServicesIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Remove from favorites">
                        <IconButton 
                          size="small"
                          color="error"
                          onClick={() => removePeerFromFavorites(peer.peerId)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};
export default SavedPeers;
