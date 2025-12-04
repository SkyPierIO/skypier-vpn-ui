import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Container,
  Button,
  Chip,
  Avatar,
  LinearProgress,
  IconButton,
  Tooltip,
  Paper,
  Fade,
  Skeleton,
  useMediaQuery,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useTheme, alpha } from '@mui/material/styles';

// Icons
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import SpeedIcon from '@mui/icons-material/Speed';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import TimerIcon from '@mui/icons-material/Timer';
import SecurityIcon from '@mui/icons-material/Security';
import RouterIcon from '@mui/icons-material/Router';
import PublicIcon from '@mui/icons-material/Public';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import DevicesIcon from '@mui/icons-material/Devices';
import VpnKeyIcon from '@mui/icons-material/VpnKey';

// Components & Services
import Bandwidth from '../components/Bandwidth';
import http from '../http.common';
import StatsService from '../services/stats.service';
import { ConnectionStats, formatBytes, formatBitrate, formatDuration } from '../types/stats.type';

interface VPNStatusData {
  status: string;
  interface?: string;
  peer_id?: string;
  ip?: string;
  country?: string;
}

interface NodeInfo {
  peerId: string;
  nickname: string;
  os: string;
  version: string;
}

interface PeerCount {
  connected_peers_count: number;
  routing_table_peers: number;
  active_vpn_connections: number;
}

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // State
  const [vpnStatus, setVpnStatus] = useState<VPNStatusData | null>(null);
  const [nodeInfo, setNodeInfo] = useState<NodeInfo | null>(null);
  const [peerCount, setPeerCount] = useState<PeerCount | null>(null);
  const [stats, setStats] = useState<ConnectionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch VPN status
  const fetchStatus = useCallback(async () => {
    try {
      const [statusRes, nodeRes, peersRes] = await Promise.all([
        http.get<VPNStatusData>('/status'),
        http.get<NodeInfo>('/me'),
        http.get<PeerCount>('/connected_peers_count'),
      ]);
      setVpnStatus(statusRes.data);
      setNodeInfo(nodeRes.data);
      setPeerCount(peersRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching status:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  // Poll stats when connected
  useEffect(() => {
    if (vpnStatus?.status === 'connected' && vpnStatus.peer_id) {
      const cleanup = StatsService.pollStats(vpnStatus.peer_id, setStats, 1000);
      return cleanup;
    }
  }, [vpnStatus?.status, vpnStatus?.peer_id]);

  const isConnected = vpnStatus?.status === 'connected';

  const handleDisconnect = async () => {
    if (vpnStatus?.peer_id) {
      setConnecting(true);
      try {
        await http.get(`/disconnect/${vpnStatus.peer_id}`);
        setVpnStatus({ status: 'disconnected' });
        setStats(null);
      } catch (error) {
        console.error('Error disconnecting:', error);
      }
      setConnecting(false);
    }
  };

  const copyPeerId = () => {
    if (nodeInfo?.peerId) {
      navigator.clipboard.writeText(nodeInfo.peerId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncatePeerId = (id: string, chars: number = 8) => {
    if (id.length <= chars * 2) return id;
    return `${id.slice(0, chars)}...${id.slice(-chars)}`;
  };

  // Connection Status Hero Card
  const ConnectionHero = () => (
    <Card
      sx={{
        background: isConnected
          ? `linear-gradient(135deg, ${alpha('#10b981', 0.9)} 0%, ${alpha('#059669', 0.95)} 100%)`
          : `linear-gradient(135deg, ${alpha('#6366f1', 0.9)} 0%, ${alpha('#4f46e5', 0.95)} 100%)`,
        color: 'white',
        borderRadius: 4,
        position: 'relative',
        overflow: 'hidden',
        minHeight: { xs: 280, md: 320 },
      }}
    >
      {/* Decorative circles */}
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: alpha('#fff', 0.1),
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -30,
          left: -30,
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: alpha('#fff', 0.05),
        }}
      />

      <CardContent sx={{ position: 'relative', zIndex: 1, p: { xs: 3, md: 4 } }}>
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, md: 7 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                sx={{
                  width: { xs: 60, md: 80 },
                  height: { xs: 60, md: 80 },
                  bgcolor: alpha('#fff', 0.2),
                  mr: 2,
                }}
              >
                {isConnected ? (
                  <CloudDoneIcon sx={{ fontSize: { xs: 32, md: 40 } }} />
                ) : (
                  <CloudOffIcon sx={{ fontSize: { xs: 32, md: 40 } }} />
                )}
              </Avatar>
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                  }}
                >
                  {isConnected ? 'Protected' : 'Not Protected'}
                </Typography>
                <Chip
                  icon={<SecurityIcon sx={{ color: 'inherit !important' }} />}
                  label={isConnected ? 'VPN Active' : 'VPN Inactive'}
                  sx={{
                    bgcolor: alpha('#fff', 0.2),
                    color: 'white',
                    fontWeight: 600,
                    mt: 0.5,
                  }}
                />
              </Box>
            </Box>

            {isConnected && vpnStatus?.peer_id && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
                  Connected to
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: 'monospace',
                    bgcolor: alpha('#fff', 0.1),
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    display: 'inline-block',
                    wordBreak: 'break-all',
                    fontSize: { xs: '0.75rem', md: '0.875rem' },
                  }}
                >
                  {isMobile ? truncatePeerId(vpnStatus.peer_id, 6) : truncatePeerId(vpnStatus.peer_id, 12)}
                </Typography>
              </Box>
            )}

            {isConnected && vpnStatus?.interface && (
              <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                <Chip
                  icon={<RouterIcon />}
                  label={vpnStatus.interface}
                  size="small"
                  sx={{ bgcolor: alpha('#fff', 0.15), color: 'white' }}
                />
                {stats && (
                  <Chip
                    icon={<TimerIcon />}
                    label={stats.duration || formatDuration(stats.durationSeconds || 0)}
                    size="small"
                    sx={{ bgcolor: alpha('#fff', 0.15), color: 'white' }}
                  />
                )}
              </Box>
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: { xs: 'stretch', md: 'flex-end' },
                gap: 2,
              }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={isConnected ? handleDisconnect : () => window.location.href = '/Explore_peers'}
                disabled={connecting}
                startIcon={<PowerSettingsNewIcon />}
                sx={{
                  bgcolor: 'white',
                  color: isConnected ? '#059669' : '#4f46e5',
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  fontSize: { xs: '0.9rem', md: '1rem' },
                  '&:hover': {
                    bgcolor: alpha('#fff', 0.9),
                  },
                }}
              >
                {connecting ? 'Please wait...' : isConnected ? 'Disconnect' : 'Connect Now'}
              </Button>

              {!isConnected && (
                <Typography variant="body2" sx={{ opacity: 0.8, textAlign: { xs: 'center', md: 'right' } }}>
                  Choose a peer to connect
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  // Stats Card Component
  const StatsCard = ({
    icon,
    title,
    value,
    subtitle,
    color,
  }: {
    icon: React.ReactNode;
    title: string;
    value: string;
    subtitle?: string;
    color: string;
  }) => (
    <Card sx={{ borderRadius: 3, height: '100%' }}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {title}
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color,
                fontSize: { xs: '1.25rem', md: '1.5rem' },
              }}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: alpha(color, 0.1), color }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  // Node Info Card
  const NodeInfoCard = () => (
    <Card sx={{ borderRadius: 3, height: '100%' }}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Your Node
          </Typography>
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={fetchStatus}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {loading ? (
          <Box>
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="40%" />
          </Box>
        ) : (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: '#f6547d', mr: 2 }}>
                <VpnKeyIcon />
              </Avatar>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {nodeInfo?.nickname || 'My Skypier Node'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: 'monospace',
                      color: 'text.secondary',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {nodeInfo?.peerId ? truncatePeerId(nodeInfo.peerId, 8) : 'Loading...'}
                  </Typography>
                  <Tooltip title={copied ? 'Copied!' : 'Copy Peer ID'}>
                    <IconButton size="small" onClick={copyPeerId}>
                      <ContentCopyIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Box>

            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'action.hover', borderRadius: 2 }}>
                  <DevicesIcon sx={{ color: 'text.secondary', mb: 0.5 }} />
                  <Typography variant="caption" display="block" color="text.secondary">
                    Platform
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                    {nodeInfo?.os || 'Unknown'}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'action.hover', borderRadius: 2 }}>
                  <DataUsageIcon sx={{ color: 'text.secondary', mb: 0.5 }} />
                  <Typography variant="caption" display="block" color="text.secondary">
                    Version
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {nodeInfo?.version || 'v0.0.0'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  // Network Stats Card
  const NetworkStatsCard = () => (
    <Card sx={{ borderRadius: 3, height: '100%' }}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Network
        </Typography>
        
        <Grid container spacing={2}>
          <Grid size={{ xs: 4 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#6366f1' }}>
                {peerCount?.connected_peers_count ?? '-'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Connected
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#10b981' }}>
                {peerCount?.routing_table_peers ?? '-'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Known Peers
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#f6547d' }}>
                {peerCount?.active_vpn_connections ?? '-'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                VPN Active
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <Container
      maxWidth="xl"
      sx={{
        width: '100%',
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 2, sm: 3, md: 4 },
      }}
    >
      {/* Header */}
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
            mb: 0.5,
          }}
        >
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Monitor your VPN connection and network status
        </Typography>
      </Box>

      {/* Main Connection Hero */}
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <ConnectionHero />
      </Box>

      {/* Stats Row - Only when connected */}
      <Fade in={isConnected && !!stats}>
        <Box sx={{ mb: { xs: 3, md: 4 } }}>
          <Grid container spacing={{ xs: 2, md: 3 }}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatsCard
                icon={<CloudDownloadIcon />}
                title="Download"
                value={stats?.currentDownloadFormatted || formatBitrate(stats?.currentDownloadBps || 0)}
                subtitle={`Total: ${stats?.bytesReceivedFormatted || formatBytes(stats?.bytesReceived || 0)}`}
                color="#641691"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatsCard
                icon={<CloudUploadIcon />}
                title="Upload"
                value={stats?.currentUploadFormatted || formatBitrate(stats?.currentUploadBps || 0)}
                subtitle={`Total: ${stats?.bytesSentFormatted || formatBytes(stats?.bytesSent || 0)}`}
                color="#f6547d"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatsCard
                icon={<TrendingUpIcon />}
                title="Peak Download"
                value={stats?.peakDownloadFormatted || formatBitrate(stats?.peakDownloadBps || 0)}
                color="#10b981"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatsCard
                icon={<SpeedIcon />}
                title="Peak Upload"
                value={stats?.peakUploadFormatted || formatBitrate(stats?.peakUploadBps || 0)}
                color="#f59e0b"
              />
            </Grid>
          </Grid>
        </Box>
      </Fade>

      {/* Bottom Section */}
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {/* Node Info */}
        <Grid size={{ xs: 12, md: 4 }}>
          <NodeInfoCard />
        </Grid>

        {/* Network Stats */}
        <Grid size={{ xs: 12, md: 4 }}>
          <NetworkStatsCard />
        </Grid>

        {/* Quick Actions */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  href="/Explore_peers"
                  startIcon={<PublicIcon />}
                  sx={{ justifyContent: 'flex-start', py: 1.5, borderRadius: 2 }}
                >
                  Browse Available Peers
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  href="/Saved_peers"
                  startIcon={<VpnKeyIcon />}
                  sx={{ justifyContent: 'flex-start', py: 1.5, borderRadius: 2 }}
                >
                  Saved Peers
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  href="/Settings"
                  startIcon={<SecurityIcon />}
                  sx={{ justifyContent: 'flex-start', py: 1.5, borderRadius: 2 }}
                >
                  Settings
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Bandwidth Chart - Full width when connected */}
        {isConnected && (
          <Grid size={{ xs: 12 }}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Bandwidth Monitor
                </Typography>
                <Box sx={{ width: '100%', overflowX: 'auto' }}>
                  <Bandwidth peerId={vpnStatus?.peer_id} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default Dashboard;
