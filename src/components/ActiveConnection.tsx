import { useEffect, useRef } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import { alpha } from '@mui/material/styles';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import SecurityIcon from '@mui/icons-material/Security';
import ReactCountryFlag from 'react-country-flag';
import jazzicon from '@metamask/jazzicon';
import http from '../http.common';

interface PeerInfo {
  peerId: string;
  city?: string;
  country?: string;
  countryCode?: string;
}

interface ActiveConnectionProps {
  peer: PeerInfo | null;
  onDisconnect: () => void;
}

// Jazzicon component
const JazziconAvatar = ({ peerId, size = 40 }: { peerId: string; size?: number }) => {
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

const ActiveConnection = ({ peer, onDisconnect }: ActiveConnectionProps) => {
  if (!peer) return null;

  const truncatePeerId = (id: string) => `${id.substring(0, 10)}...${id.slice(-10)}`;

  const handleDisconnect = async () => {
    try {
      await http.get(`/disconnect/${peer.peerId}`);
      onDisconnect();
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  return (
    <Card
      sx={{
        mb: 3,
        background: `linear-gradient(135deg, ${alpha('#10b981', 0.9)} 0%, ${alpha('#059669', 0.95)} 100%)`,
        color: 'white',
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative circles */}
      <Box
        sx={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: alpha('#fff', 0.1),
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -20,
          left: -20,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: alpha('#fff', 0.05),
        }}
      />

      <CardContent sx={{ position: 'relative', zIndex: 1, py: 2.5, px: 3 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between"
        >
          {/* Left: Connection Status */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: alpha('#fff', 0.2),
              }}
            >
              <CloudDoneIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '1.1rem', md: '1.25rem' },
                }}
              >
                Protected
              </Typography>
              <Chip
                icon={<SecurityIcon sx={{ color: 'inherit !important', fontSize: 16 }} />}
                label="VPN Active"
                size="small"
                sx={{
                  bgcolor: alpha('#fff', 0.2),
                  color: 'white',
                  fontWeight: 600,
                  mt: 0.5,
                  '& .MuiChip-icon': { color: 'white' },
                }}
              />
            </Box>
          </Stack>

          {/* Center: Peer Info */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: { xs: 'flex-start', sm: 'center' },
          }}>
            <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
              Connected to
            </Typography>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <JazziconAvatar peerId={peer.peerId} size={32} />
              <Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  {peer.countryCode && (
                    <ReactCountryFlag
                      countryCode={peer.countryCode}
                      svg
                      style={{
                        width: '1.2em',
                        height: '0.9em',
                        borderRadius: '2px',
                      }}
                    />
                  )}
                  <Typography variant="body2" fontWeight={500}>
                    {peer.city ? `${peer.city}, ${peer.country}` : peer.country || 'Unknown Location'}
                  </Typography>
                </Stack>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: 'monospace',
                    opacity: 0.8,
                    fontSize: '0.7rem',
                    bgcolor: alpha('#fff', 0.1),
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                    display: 'inline-block',
                  }}
                >
                  {truncatePeerId(peer.peerId)}
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Right: Disconnect Button */}
          <Button
            variant="contained"
            startIcon={<PowerSettingsNewIcon />}
            onClick={handleDisconnect}
            sx={{
              bgcolor: 'white',
              color: '#dc2626',
              fontWeight: 700,
              px: 3,
              py: 1,
              borderRadius: 2,
              textTransform: 'none',
              '&:hover': {
                bgcolor: alpha('#fff', 0.9),
              },
            }}
          >
            DISCONNECT
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ActiveConnection;
