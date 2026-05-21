// React
import { useState, useMemo, useEffect, useRef } from "react";

// Components
import WorldMap from "../components/WorldMap";
import CountryAccordion from "../components/CountryAccordion";
import ActiveConnection from "../components/ActiveConnection";

// MUI
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import InputBase from "@mui/material/InputBase";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import ClearIcon from "@mui/icons-material/Clear";
import TerminalIcon from "@mui/icons-material/Terminal";
import WindowIcon from "@mui/icons-material/Window";
import LaptopMacIcon from "@mui/icons-material/LaptopMac";
import DnsOutlinedIcon from "@mui/icons-material/DnsOutlined";
import ElectricalServicesIcon from "@mui/icons-material/ElectricalServices";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import Drawer from "@mui/material/Drawer";
import Skeleton from "@mui/material/Skeleton";
import { styled } from "@mui/material/styles";
import { PublicLockV14 } from "@unlock-protocol/contracts";
import networks from "@unlock-protocol/networks";
import { Paywall } from "@unlock-protocol/paywall";
import { useAccount, useReadContract } from "wagmi";
import { sepolia } from "viem/chains";
import ConnectWalletButton from "../components/ConnectWalletButton";
import UtilityCard from "../components/UtilityCard";
import ReactCountryFlag from "react-country-flag";
import jazzicon from "@metamask/jazzicon";

// Axios
import http from "../http.common";

// GeoIP
import { lookup } from "ipfs-geoip";

const LOCK = "0xFd25695782703df36CACF94c41306b3DB605Dc90";

const Item = styled(Paper)(({ theme }: { theme: any }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
  flexGrow: 1,
  maxWidth: 550,
  minHeight: "20vh",
}));

const JazziconAvatar = ({ peerId, size = 40 }: { peerId: string; size?: number }) => {
  const avatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const generateIdenticon = async () => {
      if (avatarRef.current && peerId) {
        const sha256 = async (message: string) => {
          const msgBuffer = new TextEncoder().encode(message);
          const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
        };

        const hash = await sha256(peerId);
        const numericValue = parseInt(hash.slice(0, 8), 16);
        const icon = jazzicon(size, numericValue);
        avatarRef.current.innerHTML = "";
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
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        "& > div": {
          borderRadius: "50%",
        },
      }}
    />
  );
};

const getOsFingerprintIcon = (os?: string) => {
  const normalized = (os || "").toLowerCase();
  if (normalized.includes("linux")) {
    return <TerminalIcon fontSize="small" />;
  }
  if (normalized.includes("win")) {
    return <WindowIcon fontSize="small" />;
  }
  if (normalized.includes("darwin") || normalized.includes("mac") || normalized.includes("osx")) {
    return <LaptopMacIcon fontSize="small" />;
  }
  return <DnsOutlinedIcon fontSize="small" />;
};

interface PeerLocation {
  peerId: string;
  latitude: number;
  longitude: number;
  countryCode: string;
  city: string;
  country: string;
  status?: string;
  timestamp?: string;
}

interface VPNStatusResponse {
  status: string;
  peer_id?: string;
}

interface NodeRegistryApiEntry {
  peerId: string;
  stale: boolean;
  firstSeenAt?: string;
  lastSeenAt?: string;
  lastValidSignatureAt?: string;
  sourceTopic?: string;
  ageSeconds?: number;
  metadata?: {
    peerId?: string;
    skypierId?: string;
    status?: string;
    statusHex?: string;
    nickname?: string;
    timestamp?: number;
    uptimeSeconds?: number;
    resourceStatus?: string;
    version?: string;
    os?: string;
  };
}

type StabilityFilter = "all" | "stable" | "degraded" | "critical" | "unknown";

interface PeerViewModel extends PeerLocation {
  nickname?: string;
  resourceStatus?: string;
  uptimeSeconds?: number;
  version?: string;
  os?: string;
  skypierId?: string;
  nodeStatus?: string;
  statusHex?: string;
  firstSeenAt?: string;
  lastSeenAt?: string;
  lastValidSignatureAt?: string;
  sourceTopic?: string;
  ageSeconds?: number;
  stale?: boolean;
}

const getStabilityChipColor = (
  resourceStatus?: string
): "default" | "success" | "warning" | "error" => {
  switch ((resourceStatus || "").toLowerCase()) {
    case "stable":
      return "success";
    case "degraded":
      return "warning";
    case "critical":
      return "error";
    default:
      return "default";
  }
};

const formatUptime = (uptimeSeconds?: number): string => {
  if (!uptimeSeconds || uptimeSeconds <= 0) {
    return "N/A";
  }

  const days = Math.floor(uptimeSeconds / 86400);
  const hours = Math.floor((uptimeSeconds % 86400) / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

// Cache for peer geo data
const geoCache: { [key: string]: PeerLocation } = {};

const Peers = () => {
  const configuredNetworkID = sepolia.id;
  const { isConnected: isWalletConnected, address, connector } = useAccount();

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<
    "all" | "peerId" | "location" | "status" | "nickname" | "stability"
  >("all");
  const [stabilityFilter, setStabilityFilter] =
    useState<StabilityFilter>("all");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const filterOpen = Boolean(anchorEl);

  // Peer selection and connection states
  const [selectedPeerId, setSelectedPeerId] = useState<string | null>(null);
  const [connectedPeerId, setConnectedPeerId] = useState<string | null>(null);
  const [isVpnConnected, setIsVpnConnected] = useState(false);
  const [detailsPeerId, setDetailsPeerId] = useState<string | null>(null);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [drawerActionLoading, setDrawerActionLoading] = useState(false);

  // Peer locations with geo data
  const [peerLocations, setPeerLocations] = useState<{
    [key: string]: PeerLocation;
  }>({});

  // Loading state for geo lookup
  const [isGeoLoading, setIsGeoLoading] = useState(false);
  const [nodesLoading, setNodesLoading] = useState(true);
  const [registryPeers, setRegistryPeers] = useState<NodeRegistryApiEntry[]>([]);

  // User's current location
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch user's location
  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        const response = await fetch("http://ip-api.com/json/?fields=lat,lon");
        const data = await response.json();
        if (data.lat && data.lon) {
          setUserLocation({ latitude: data.lat, longitude: data.lon });
        }
      } catch (error) {
        console.error("Error fetching user location:", error);
      }
    };
    fetchUserLocation();
  }, []);

  // Poll VPN status
  useEffect(() => {
    const fetchVPNStatus = async () => {
      try {
        const response = await http.get<VPNStatusResponse>("/status", {
          timeout: 5000,
        });
        setIsVpnConnected(response.data.status === "connected");
        if (response.data.status === "connected" && response.data.peer_id) {
          setConnectedPeerId(response.data.peer_id);
        } else {
          setConnectedPeerId(null);
        }
      } catch (error) {
        console.error("Error fetching VPN status:", error);
      }
    };

    fetchVPNStatus();
    intervalRef.current = setInterval(fetchVPNStatus, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const response = await http.get("/nodes", { timeout: 5000 });
        const rawNodes: NodeRegistryApiEntry[] = response.data?.nodes || [];
        const deduped = rawNodes
          .filter((node) => !node.stale)
          .filter(
            (node, index, self) =>
              Boolean(node.peerId && node.peerId.length > 43) &&
              index === self.findIndex((item) => item.peerId === node.peerId)
          );

        setRegistryPeers(deduped);
      } catch (error) {
        console.error("Error fetching nodes from backend:", error);
        setRegistryPeers([]);
      } finally {
        setNodesLoading(false);
      }
    };

    fetchNodes();
    const nodesPoller = setInterval(fetchNodes, 20000);

    return () => {
      clearInterval(nodesPoller);
    };
  }, []);

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const handleFilterSelect = (
    filter: "all" | "peerId" | "location" | "status" | "nickname" | "stability"
  ) => {
    setFilterType(filter);
    handleFilterClose();
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handlePeerSelect = (peerId: string) => {
    setSelectedPeerId(peerId === selectedPeerId ? null : peerId);
  };

  const handlePeerOpenDetails = (peerId: string) => {
    setSelectedPeerId(peerId);
    setDetailsPeerId(peerId);
    setDetailsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDetailsDrawerOpen(false);
  };

  const handlePeerConnect = async (peerId: string) => {
    try {
      const response = await http.get(`/connect/${peerId}`);
      if (response.status === 200) {
        setConnectedPeerId(peerId);
        setIsVpnConnected(true);
      }
    } catch (error) {
      console.error("Error connecting to peer:", error);
    }
  };

  const handleDisconnect = () => {
    setConnectedPeerId(null);
    setIsVpnConnected(false);
  };

  const handlePeerDisconnect = async (peerId: string) => {
    try {
      await http.get(`/disconnect/${peerId}`);
      setConnectedPeerId(null);
      setIsVpnConnected(false);
    } catch (error) {
      console.error("Error disconnecting from peer:", error);
    }
  };

  // Fetch geo data for a peer
  const fetchPeerGeoData = async (
    peerId: string
  ): Promise<PeerLocation | null> => {
    if (geoCache[peerId]) {
      return geoCache[peerId];
    }

    try {
      const response = await http.get(`/peer/${peerId}/info`, { timeout: 5000 });
      if (response.status === 200 && response.data.length >= 1) {
        const ip = response.data[0];
        const gateways = ["https://ipfs.io", "https://dweb.link"];
        const result = await lookup(gateways, ip);

        if (result && result.country_name && result.country_code) {
          const peerLocation: PeerLocation = {
            peerId,
            latitude: result.latitude,
            longitude: result.longitude,
            countryCode: result.country_code,
            city: result.city || "Unknown",
            country: result.country_name,
            status: "Unknown",
          };
          geoCache[peerId] = peerLocation;
          return peerLocation;
        }
      }
    } catch (error) {
      console.error(`Error fetching geo data for ${peerId}:`, error);
    }
    return null;
  };

  // Check peer status
  const checkPeerStatus = async (peerId: string): Promise<string> => {
    try {
      const response = await http.get(`/ping/${peerId}`, { timeout: 5000 });
      return response.status === 200 && response.data.result
        ? "Online"
        : "Unreachable";
    } catch {
      return "Unreachable";
    }
  };

  const handleDrawerConnectionAction = async (peerId: string) => {
    setDrawerActionLoading(true);
    try {
      if (connectedPeerId === peerId) {
        await handlePeerDisconnect(peerId);
      } else {
        await handlePeerConnect(peerId);
      }
    } finally {
      setDrawerActionLoading(false);
    }
  };

  const {
    data: isMember,
    isError,
    isLoading,
  } = useReadContract({
    address: LOCK,
    abi: PublicLockV14.abi,
    functionName: "balanceOf",
    chainId: configuredNetworkID,
    args: [address!],
    query: {
      enabled: !!address,
      select: (data: any) => data > 0,
    },
  });

  // Load all peers immediately, then fetch geo data
  useEffect(() => {
    if (!registryPeers.length) return;

    const loadAllGeoData = async () => {
      setIsGeoLoading(true);
      const peers = registryPeers.map((node) => {
        const fallbackTimestamp = node.lastSeenAt
          ? Math.floor(Date.parse(node.lastSeenAt) / 1000)
          : Math.floor(Date.now() / 1000);

        return {
          peerId: node.peerId,
          timestamp: node.metadata?.timestamp ?? fallbackTimestamp,
        };
      });

      // First, add all peers - use cached data if available, otherwise "Unknown"
      const initialPeers: { [key: string]: PeerLocation } = {};
      const peersNeedingGeoLookup: any[] = [];

      peers.forEach((peer: any) => {
        if (geoCache[peer.peerId]) {
          // Use cached geo data
          initialPeers[peer.peerId] = {
            ...geoCache[peer.peerId],
            status: "Checking...",
            timestamp: peer.timestamp,
          };
        } else {
          // Mark for geo lookup
          initialPeers[peer.peerId] = {
            peerId: peer.peerId,
            latitude: 0,
            longitude: 0,
            countryCode: "xx",
            city: "Unknown",
            country: "Unknown",
            status: "Checking...",
            timestamp: peer.timestamp,
          };
          peersNeedingGeoLookup.push(peer);
        }
      });

      // Add initial peers to state immediately
      if (Object.keys(initialPeers).length > 0) {
        setPeerLocations((prev) => ({ ...prev, ...initialPeers }));
      }

      // Fetch geo data in parallel for peers that aren't cached
      const geoPromises = peersNeedingGeoLookup.map(async (peer) => {
        const geoData = await fetchPeerGeoData(peer.peerId);
        return { peer, geoData };
      });

      // Process geo results as they come in
      const geoResults = await Promise.all(geoPromises);
      
      // Batch update geo data
      const geoUpdates: { [key: string]: PeerLocation } = {};
      geoResults.forEach(({ peer, geoData }) => {
        if (geoData) {
          geoUpdates[peer.peerId] = {
            ...geoData,
            status: "Checking...",
            timestamp: peer.timestamp,
          };
        }
      });

      if (Object.keys(geoUpdates).length > 0) {
        setPeerLocations((prev) => ({ ...prev, ...geoUpdates }));
      }

      // Now check status for all peers in parallel
      const statusPromises = peers.map(async (peer: any) => {
        const status = await checkPeerStatus(peer.peerId);
        return { peerId: peer.peerId, status };
      });

      const statusResults = await Promise.all(statusPromises);
      
      // Batch update status
      setPeerLocations((prev) => {
        const updated = { ...prev };
        statusResults.forEach(({ peerId, status }) => {
          if (updated[peerId]) {
            updated[peerId] = { ...updated[peerId], status };
          }
        });
        return updated;
      });
      setIsGeoLoading(false);
    };

    loadAllGeoData();
  }, [registryPeers]);

  const registryByPeerId = useMemo(() => {
    return registryPeers.reduce<Record<string, NodeRegistryApiEntry>>(
      (acc, node) => {
        acc[node.peerId] = node;
        return acc;
      },
      {}
    );
  }, [registryPeers]);

  // Merge GeoIP state with node registry metadata.
  const peersWithLocation = useMemo<PeerViewModel[]>(() => {
    return Object.values(peerLocations).map((peer) => {
      const registryEntry = registryByPeerId[peer.peerId];
      const metadata = registryEntry?.metadata;

      return {
        ...peer,
        nickname: metadata?.nickname,
        resourceStatus: metadata?.resourceStatus,
        uptimeSeconds: metadata?.uptimeSeconds,
        version: metadata?.version,
        os: metadata?.os,
        skypierId: metadata?.skypierId,
        nodeStatus: metadata?.status,
        statusHex: metadata?.statusHex,
        firstSeenAt: registryEntry?.firstSeenAt,
        lastSeenAt: registryEntry?.lastSeenAt,
        lastValidSignatureAt: registryEntry?.lastValidSignatureAt,
        sourceTopic: registryEntry?.sourceTopic,
        ageSeconds: registryEntry?.ageSeconds,
        stale: registryEntry?.stale,
      };
    });
  }, [peerLocations, registryByPeerId]);

  const availableStabilityFilters = useMemo<StabilityFilter[]>(() => {
    const statuses = new Set<StabilityFilter>();
    peersWithLocation.forEach((peer) => {
      const normalized = (peer.resourceStatus || "unknown").toLowerCase() as StabilityFilter;
      if (["stable", "degraded", "critical", "unknown"].includes(normalized)) {
        statuses.add(normalized);
      }
    });
    return ["all", ...Array.from(statuses)];
  }, [peersWithLocation]);

  // Filter and search peers
  const filteredPeers = useMemo(() => {
    let peers = peersWithLocation;

    if (stabilityFilter !== "all") {
      peers = peers.filter(
        (peer) => (peer.resourceStatus || "unknown").toLowerCase() === stabilityFilter
      );
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      peers = peers.filter((peer) => {
        // Search by peer ID
        if (filterType === "peerId" || filterType === "all") {
          if (peer.peerId.toLowerCase().includes(query)) return true;
        }

        // Search by location
        if (filterType === "location" || filterType === "all") {
          if (peer.country?.toLowerCase().includes(query)) return true;
          if (peer.city?.toLowerCase().includes(query)) return true;
        }

        // Search by status
        if (filterType === "status" || filterType === "all") {
          if (peer.status?.toLowerCase().includes(query)) return true;
        }

        // Search by nickname
        if (filterType === "nickname" || filterType === "all") {
          if (peer.nickname?.toLowerCase().includes(query)) return true;
        }

        // Search by stability/resource state
        if (filterType === "stability" || filterType === "all") {
          if (peer.resourceStatus?.toLowerCase().includes(query)) return true;
        }

        // Include version and OS in broad search mode.
        if (filterType === "all") {
          if (peer.version?.toLowerCase().includes(query)) return true;
          if (peer.os?.toLowerCase().includes(query)) return true;
        }

        return false;
      });
    }

    return peers;
  }, [peersWithLocation, searchQuery, filterType, stabilityFilter]);

  const selectedPeerDetails = useMemo(() => {
    if (!detailsPeerId) {
      return null;
    }
    return peersWithLocation.find((peer) => peer.peerId === detailsPeerId) || null;
  }, [detailsPeerId, peersWithLocation]);

  // Group peers by country (sorted alphabetically, Unknown at end)
  const peersByCountry = useMemo(() => {
    const grouped: {
      [country: string]: { countryCode: string; peers: PeerViewModel[] };
    } = {};

    filteredPeers.forEach((peer) => {
      const country = peer.country || "Unknown";
      if (!grouped[country]) {
        grouped[country] = { countryCode: peer.countryCode || "xx", peers: [] };
      }
      grouped[country].peers.push(peer);
    });

    // Sort by country name alphabetically, but keep "Unknown" at the end
    const sortedEntries = Object.entries(grouped).sort(([a], [b]) => {
      if (a === "Unknown") return 1;
      if (b === "Unknown") return -1;
      return a.localeCompare(b);
    });
    return sortedEntries;
  }, [filteredPeers]);

  // Get connected peer info
  const connectedPeerInfo = connectedPeerId
    ? peerLocations[connectedPeerId]
    : null;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    const c = () => {
      return (
        <>
          <Typography mb={1}>Please reload the page!</Typography>
          <Typography>
            There was an error checking your membership status. Please reload
            the page!
          </Typography>
        </>
      );
    };
    return (
      <UtilityCard
        title="Error checking your membership status"
        content={c()}
      ></UtilityCard>
    );
  }

  if (!isWalletConnected) {
    return <Connect />;
  }

  if (!isMember) {
    return <Checkout network={configuredNetworkID} connector={connector} />;
  }

  return nodesLoading ? (
    <Container
      maxWidth="xl"
      sx={{
        textAlign: "center",
        px: { xs: 1, sm: 2, md: 3 },
        py: { xs: 2, sm: 3 },
      }}
    >
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="90vh"
      >
        <Item>
          <Stack alignItems={"center"} gap={2} mt={4} mb={4}>
            <Typography variant="h6" mb={2}>
              Loading...
            </Typography>
            <Box sx={{ width: "100%" }}>
              <LinearProgress />
            </Box>
            <Typography variant="body1" mb={2}>
              Getting peers data from node registry...
            </Typography>
          </Stack>
        </Item>
      </Box>
    </Container>
  ) : (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: 'calc(100vh - 64px)',
        overflow: 'hidden',
      }}
    >
      {/* Full-screen World Map Background */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
        }}
      >
        <WorldMap
          peers={peersWithLocation}
          selectedPeerId={selectedPeerId}
          connectedPeerId={connectedPeerId}
          userLocation={userLocation}
          onPeerSelect={handlePeerOpenDetails}
          fullscreen
        />
      </Box>

      {/* Floating Content Layer */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          pointerEvents: 'none',
          height: '100%',
          p: { xs: 1, sm: 2, md: 3 },
          overflow: 'auto',
        }}
      >
        {/* Page Title */}
        <Typography
          variant="h4"
          sx={{
            fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
            mb: 2,
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            pointerEvents: 'auto',
          }}
        >
          Explore Peers
        </Typography>

        {/* Active Connection Card */}
        {isVpnConnected && connectedPeerInfo && (
          <Box sx={{ pointerEvents: 'auto', maxWidth: 600, mb: 2 }}>
            <ActiveConnection
              peer={connectedPeerInfo}
              onDisconnect={handleDisconnect}
            />
          </Box>
        )}

        {/* Floating Peer Selection Panel */}
        <Paper
          elevation={8}
          sx={{
            pointerEvents: 'auto',
            width: { xs: '100%', sm: 400, md: 420 },
            maxHeight: { xs: 'calc(100vh - 200px)', md: 'calc(100vh - 180px)' },
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            overflow: 'hidden',
            backdropFilter: 'blur(10px)',
            bgcolor: (theme) => 
              theme.palette.mode === 'dark' 
                ? 'rgba(23, 24, 27, 0.95)' 
                : 'rgba(255, 255, 255, 0.95)',
          }}
        >
          {/* Panel Header */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            {/* Search Bar */}
            <Paper
              component="form"
              onSubmit={(e) => e.preventDefault()}
              elevation={0}
              sx={{
                p: "2px 4px",
                display: "flex",
                alignItems: "center",
                width: "100%",
                border: 1,
                borderColor: "divider",
              }}
            >
            <IconButton
              sx={{ p: "10px" }}
              aria-label="filter"
              onClick={handleFilterClick}
            >
              <FilterAltIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={filterOpen}
              onClose={handleFilterClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
            >
              <MenuItem onClick={() => handleFilterSelect("all")}>
                All Fields
              </MenuItem>
              <MenuItem onClick={() => handleFilterSelect("peerId")}>
                Peer ID
              </MenuItem>
              <MenuItem onClick={() => handleFilterSelect("location")}>
                Location
              </MenuItem>
              <MenuItem onClick={() => handleFilterSelect("status")}>
                Status
              </MenuItem>
              <MenuItem onClick={() => handleFilterSelect("nickname")}>
                Nickname
              </MenuItem>
              <MenuItem onClick={() => handleFilterSelect("stability")}>
                Stability
              </MenuItem>
            </Menu>
            <Divider orientation="vertical" flexItem />
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder={`Search ${
                filterType === "all" ? "peers" : `by ${filterType}`
              }...`}
              inputProps={{ "aria-label": "search for peers" }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <IconButton
                sx={{ p: "10px" }}
                aria-label="clear"
                onClick={handleClearSearch}
              >
                <ClearIcon />
              </IconButton>
            )}
            <Divider orientation="vertical" flexItem />
            <IconButton type="submit" sx={{ p: "10px" }} aria-label="search">
              <SearchIcon />
            </IconButton>
          </Paper>

          {/* Active Filter Chips */}
          {(searchQuery || filterType !== "all") && (
            <Stack
              direction="row"
              spacing={1}
              sx={{ mt: 1.5 }}
              flexWrap="wrap"
              useFlexGap
            >
              {filterType !== "all" && (
                <Chip
                  label={`Filter: ${filterType}`}
                  size="small"
                  onDelete={() => setFilterType("all")}
                  color="primary"
                  variant="outlined"
                />
              )}
              {searchQuery && (
                <Chip
                  label={`Search: "${searchQuery}"`}
                  size="small"
                  onDelete={handleClearSearch}
                  color="secondary"
                  variant="outlined"
                />
              )}
              {stabilityFilter !== "all" && (
                <Chip
                  label={`Stability: ${stabilityFilter}`}
                  size="small"
                  onDelete={() => setStabilityFilter("all")}
                  color={getStabilityChipColor(stabilityFilter)}
                  variant="outlined"
                />
              )}
            </Stack>
          )}

          <Stack
            direction="row"
            spacing={1}
            sx={{ mt: 1.5 }}
            flexWrap="wrap"
            useFlexGap
          >
            {availableStabilityFilters.map((status) => (
              <Chip
                key={status}
                label={status === "all" ? "All Stability" : status}
                size="small"
                clickable
                color={
                  status === "all" ? "default" : getStabilityChipColor(status)
                }
                variant={stabilityFilter === status ? "filled" : "outlined"}
                onClick={() => setStabilityFilter(status)}
                sx={{ textTransform: "capitalize" }}
              />
            ))}
          </Stack>
          </Box>

          {/* Results count */}
          <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary">
              {filteredPeers.length === 0
                ? "No peers found"
                : `${filteredPeers.length} peer${
                    filteredPeers.length !== 1 ? "s" : ""
                  } in ${peersByCountry.length} countr${
                    peersByCountry.length !== 1 ? "ies" : "y"
                  }`}
            </Typography>
          </Box>

          {/* Country Accordions */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              p: 1,
            }}
          >
            {/* Skeleton loading state */}
            {isGeoLoading && peersByCountry.length === 0 && (
              <Stack spacing={1}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Paper key={i} sx={{ p: 0, overflow: "hidden" }}>
                    <Box sx={{ display: "flex", alignItems: "center", p: 1.5 }}>
                      <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1.5 }} />
                      <Skeleton variant="text" width={120} height={28} />
                      <Box sx={{ flexGrow: 1 }} />
                      <Skeleton variant="rounded" width={40} height={24} sx={{ mr: 1 }} />
                      <Skeleton variant="circular" width={24} height={24} />
                    </Box>
                  </Paper>
                ))}
                <Typography variant="caption" color="text.secondary" sx={{ textAlign: "center", mt: 2 }}>
                  Looking up peer locations...
                </Typography>
              </Stack>
            )}

            {/* Show skeleton alongside accordions when still loading */}
            {isGeoLoading && peersByCountry.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <LinearProgress sx={{ borderRadius: 1, height: 4 }} />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                  Resolving remaining peer locations...
                </Typography>
              </Box>
            )}

            {peersByCountry.length === 0 && !isGeoLoading ? (
              <Paper sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No peers found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchQuery
                    ? "Try adjusting your search query"
                    : "Loading peer data..."}
                </Typography>
              </Paper>
            ) : (
              peersByCountry.map(([country, { countryCode, peers }]) => (
                <CountryAccordion
                  key={country}
                  countryCode={countryCode}
                  countryName={country}
                  peers={peers}
                  selectedPeerId={selectedPeerId}
                  connectedPeerId={connectedPeerId}
                  onPeerSelect={handlePeerSelect}
                  onPeerConnect={handlePeerConnect}
                  onPeerOpenDetails={handlePeerOpenDetails}
                />
              ))
            )}
          </Box>
        </Paper>
      </Box>

      <Drawer
        anchor="bottom"
        open={detailsDrawerOpen}
        onClose={handleDrawerClose}
        PaperProps={{
          sx: {
            width: { xs: "100%", md: "min(860px, calc(100vw - 64px))" },
            maxHeight: "70vh",
            left: { xs: 0, md: "50%" },
            right: { xs: 0, md: "auto" },
            transform: { xs: "none", md: "translateX(-50%)" },
            mb: { xs: 0, md: 2 },
            borderTopLeftRadius: { xs: 16, md: 18 },
            borderTopRightRadius: { xs: 16, md: 18 },
            borderBottomLeftRadius: { xs: 0, md: 18 },
            borderBottomRightRadius: { xs: 0, md: 18 },
            border: 1,
            borderColor: "divider",
            backdropFilter: "blur(12px)",
            bgcolor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(23, 24, 27, 0.94)"
                : "rgba(255, 255, 255, 0.94)",
            backgroundImage: "none",
            overflow: "hidden",
          },
        }}
      >
        <Box sx={{ overflowY: "auto", p: { xs: 2, sm: 3 } }}>
          {selectedPeerDetails ? (
            <Stack spacing={2.5}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                  <JazziconAvatar peerId={selectedPeerDetails.peerId} size={42} />
                  <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.25 }}>
                      <Typography variant="h6" sx={{ lineHeight: 1.15 }}>
                        {selectedPeerDetails.nickname || "Unnamed Node"}
                      </Typography>
                      {selectedPeerDetails.countryCode &&
                        selectedPeerDetails.countryCode !== "xx" && (
                          <ReactCountryFlag
                            countryCode={selectedPeerDetails.countryCode.toUpperCase()}
                            svg
                            style={{ width: "1.15rem", height: "0.95rem", borderRadius: 2 }}
                          />
                        )}
                    </Stack>
                    <Typography
                      variant="caption"
                      sx={{ fontFamily: "monospace", opacity: 0.9, wordBreak: "break-all" }}
                    >
                      {selectedPeerDetails.peerId}
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
                  <Chip
                    label={selectedPeerDetails.status || "Unknown"}
                    color={selectedPeerDetails.status === "Online" ? "success" : "default"}
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                  <Chip
                    label={selectedPeerDetails.resourceStatus || "unknown"}
                    color={getStabilityChipColor(selectedPeerDetails.resourceStatus)}
                    variant="outlined"
                    size="small"
                    sx={{ textTransform: "capitalize" }}
                  />
                </Stack>
              </Stack>

              <Button
                onClick={() => handleDrawerConnectionAction(selectedPeerDetails.peerId)}
                disabled={drawerActionLoading}
                startIcon={
                  connectedPeerId === selectedPeerDetails.peerId ? (
                    <LinkOffIcon />
                  ) : (
                    <ElectricalServicesIcon />
                  )
                }
                sx={{
                  alignSelf: "flex-start",
                  px: 2.2,
                  py: 1,
                  borderRadius: 999,
                  fontWeight: 700,
                  textTransform: "none",
                  letterSpacing: 0.2,
                  color: "#fff",
                  bgcolor:
                    connectedPeerId === selectedPeerDetails.peerId
                      ? "#dc2626"
                      : "#0f766e",
                  boxShadow:
                    connectedPeerId === selectedPeerDetails.peerId
                      ? "0 10px 22px rgba(220, 38, 38, 0.28)"
                      : "0 10px 22px rgba(15, 118, 110, 0.28)",
                  "&:hover": {
                    bgcolor:
                      connectedPeerId === selectedPeerDetails.peerId
                        ? "#b91c1c"
                        : "#0d6660",
                  },
                }}
              >
                {drawerActionLoading
                  ? "Working..."
                  : connectedPeerId === selectedPeerDetails.peerId
                  ? "Disconnect"
                  : "Connect"}
              </Button>

              <Divider />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} useFlexGap flexWrap="wrap">
                <Chip
                  icon={getOsFingerprintIcon(selectedPeerDetails.os)}
                  label={selectedPeerDetails.os || "unknown os"}
                  variant="outlined"
                  size="small"
                  sx={{ textTransform: "capitalize" }}
                />
                <Chip
                  label={`Uptime ${formatUptime(selectedPeerDetails.uptimeSeconds)}`}
                  variant="outlined"
                  size="small"
                />
                <Chip
                  label={selectedPeerDetails.version || "Version N/A"}
                  variant="outlined"
                  size="small"
                />
              </Stack>

              <Stack spacing={1}>
                <Typography variant="body2">
                  Location: {selectedPeerDetails.city || "Unknown"}, {selectedPeerDetails.country || "Unknown"}
                </Typography>
                <Typography variant="body2">
                  Node Status: {selectedPeerDetails.nodeStatus || "N/A"}
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: "monospace", wordBreak: "break-all" }}>
                  Skypier ID: {selectedPeerDetails.skypierId || "N/A"}
                </Typography>
                <Typography variant="body2">
                  Last Seen: {selectedPeerDetails.lastSeenAt ? new Date(selectedPeerDetails.lastSeenAt).toLocaleString() : "N/A"}
                </Typography>
                <Typography variant="body2">
                  First Seen: {selectedPeerDetails.firstSeenAt ? new Date(selectedPeerDetails.firstSeenAt).toLocaleString() : "N/A"}
                </Typography>
                <Typography variant="body2">
                  Last Valid Signature: {selectedPeerDetails.lastValidSignatureAt ? new Date(selectedPeerDetails.lastValidSignatureAt).toLocaleString() : "N/A"}
                </Typography>
                <Typography variant="body2">
                  Source Topic: {selectedPeerDetails.sourceTopic || "N/A"}
                </Typography>
                <Typography variant="body2">
                  Age Seconds: {selectedPeerDetails.ageSeconds ?? "N/A"}
                </Typography>
              </Stack>
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Select a peer to view details.
            </Typography>
          )}
        </Box>
      </Drawer>
    </Box>
  );
};

export default Peers;

const Connect = () => {
  return (
    <section>
      <p className="mb-4">
        To continue using the app you need to have a valid membership!
      </p>
      <ConnectWalletButton />
    </section>
  );
};

const Checkout = ({
  network,
  connector,
}: {
  network: number;
  connector: any;
}) => {
  const checkout = async () => {
    const paywall = new Paywall(networks);
    const provider = await connector!.getProvider();
    paywall.connect(provider);
    paywall.loadCheckoutModal({
      locks: {
        [LOCK]: {
          network: network,
        },
      },
      pessimistic: true,
    });
  };

  const CheckoutItem = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
    ...theme.typography.body2,
    padding: theme.spacing(3),
    textAlign: "center",
    color: theme.palette.text.secondary,
    flexGrow: 1,
    maxWidth: 550,
    minHeight: "20vh",
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(2),
    },
  }));

  return (
    <section>
      <Container
        maxWidth="xl"
        sx={{
          textAlign: "center",
          px: { xs: 1, sm: 2, md: 3 },
          py: { xs: 2, sm: 3 },
        }}
      >
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="90vh"
        >
          <CheckoutItem>
            <Stack
              alignItems={"center"}
              gap={2}
              mt={{ xs: 2, sm: 4 }}
              mb={{ xs: 2, sm: 4 }}
            >
              <Typography
                variant="h4"
                mb={2}
                sx={{ fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" } }}
              >
                Before accessing our service...
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
              >
                You currently don't have a membership!
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
              >
                To be able to connect to a peer, you need to purchase a Skypier
                subscription.
              </Typography>
              <Button
                variant="outlined"
                onClick={() => checkout()}
                sx={{
                  mt: 2,
                  px: { xs: 2, sm: 4 },
                  py: { xs: 1, sm: 2 },
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                }}
              >
                Purchase subscription!
              </Button>
            </Stack>
          </CheckoutItem>
        </Box>
      </Container>
    </section>
  );
};
