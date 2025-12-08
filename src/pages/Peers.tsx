// React
import { useState, useMemo, useEffect, useRef } from "react";

// GraphQL
import { gql, useQuery } from "@apollo/client";

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
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import { styled } from "@mui/material/styles";
import { PublicLockV14 } from "@unlock-protocol/contracts";
import networks from "@unlock-protocol/networks";
import { Paywall } from "@unlock-protocol/paywall";
import { useAccount, useConnect, useContractRead } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { sepolia } from "wagmi/chains";
import UtilityCard from "../components/UtilityCard";

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

// Cache for peer geo data
const geoCache: { [key: string]: PeerLocation } = {};

const Peers = () => {
  const configuredNetworkID = sepolia.id;
  const { isConnected: isWalletConnected, address, connector } = useAccount();

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("all");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const filterOpen = Boolean(anchorEl);

  // Peer selection and connection states
  const [selectedPeerId, setSelectedPeerId] = useState<string | null>(null);
  const [connectedPeerId, setConnectedPeerId] = useState<string | null>(null);
  const [isVpnConnected, setIsVpnConnected] = useState(false);

  // Peer locations with geo data
  const [peerLocations, setPeerLocations] = useState<{
    [key: string]: PeerLocation;
  }>({});

  // Loading state for geo lookup
  const [isGeoLoading, setIsGeoLoading] = useState(false);

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

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const handleFilterSelect = (filter: string) => {
    setFilterType(filter);
    handleFilterClose();
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handlePeerSelect = (peerId: string) => {
    setSelectedPeerId(peerId === selectedPeerId ? null : peerId);
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

  const {
    data: isMember,
    isError,
    isLoading,
  } = useContractRead({
    address: LOCK,
    abi: PublicLockV14.abi,
    functionName: "balanceOf",
    chainId: configuredNetworkID,
    enabled: !!address,
    args: [address],
    watch: true,
    select: (data: any) => {
      return data > 0;
    },
  });

  const NODES_GRAPHQL = `
  {
    newPeers(first: 100) {
      from
      timestamp
      peerId
    }
  }
  `;

  const NODES_GQL = gql(NODES_GRAPHQL);
  const nodesData = useQuery(NODES_GQL, { pollInterval: 5 * 60000 });

  // Load all peers immediately, then fetch geo data
  useEffect(() => {
    if (!nodesData.data?.newPeers) return;

    const loadAllGeoData = async () => {
      setIsGeoLoading(true);
      const peers = nodesData.data.newPeers.filter(
        (node: any, index: any, self: any) =>
          node.peerId &&
          node.peerId.length > 43 &&
          index ===
            self.findIndex(
              (item: { peerId: any }) => item.peerId === node.peerId
            )
      );

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
  }, [nodesData.data]);

  // Get all peers with location data
  const peersWithLocation = useMemo(() => {
    return Object.values(peerLocations);
  }, [peerLocations]);

  // Filter and search peers
  const filteredPeers = useMemo(() => {
    let peers = peersWithLocation;

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

        return false;
      });
    }

    return peers;
  }, [peersWithLocation, searchQuery, filterType]);

  // Group peers by country (sorted alphabetically, Unknown at end)
  const peersByCountry = useMemo(() => {
    const grouped: {
      [country: string]: { countryCode: string; peers: PeerLocation[] };
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

  return nodesData.loading ? (
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
              Getting on-chain peers data...
            </Typography>
          </Stack>
        </Item>
      </Box>
    </Container>
  ) : (
    <Container
      maxWidth="xl"
      sx={{
        px: { xs: 1, sm: 2, md: 3 },
        py: { xs: 2, sm: 3 },
      }}
    >
      {/* Page Title */}
      <Typography
        variant="h4"
        color="text.primary"
        sx={{
          fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
          mb: 2,
        }}
      >
        Explore Peers
      </Typography>

      {/* Active Connection Card */}
      {isVpnConnected && connectedPeerInfo && (
        <ActiveConnection
          peer={connectedPeerInfo}
          onDisconnect={handleDisconnect}
        />
      )}

      {/* Main Layout: Left Panel + Right Map */}
      <Grid container spacing={0} sx={{ height: { md: "calc(100vh - 200px)" } }}>
        {/* Left Panel: Search + Peer List */}
        <Grid
          size={{ xs: 12, md: 5, lg: 4 }}
          sx={{
            height: { md: "100%" },
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Paper
            elevation={2}
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              borderRadius: { xs: 2, md: "8px 0 0 8px" },
              p: 2,
              overflow: "hidden",
            }}
          >
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
                mb: 2,
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
              sx={{ mb: 2 }}
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
            </Stack>
          )}

          {/* Results count */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {filteredPeers.length === 0
              ? "No peers found"
              : `${filteredPeers.length} peer${
                  filteredPeers.length !== 1 ? "s" : ""
                } in ${peersByCountry.length} countr${
                  peersByCountry.length !== 1 ? "ies" : "y"
                }`}
          </Typography>

          {/* Country Accordions */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              pr: { md: 1 },
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
                />
              ))
            )}
          </Box>
          </Paper>
        </Grid>

        {/* Right Panel: World Map (hidden on mobile) */}
        <Grid
          size={{ xs: 12, md: 7, lg: 8 }}
          sx={{
            display: { xs: "none", md: "block" },
            height: "100%",
          }}
        >
          <Paper
            sx={{
              height: "100%",
              borderRadius: "0 8px 8px 0",
              overflow: "hidden",
              p: 0,
            }}
          >
            <WorldMap
              peers={peersWithLocation}
              selectedPeerId={selectedPeerId}
              connectedPeerId={connectedPeerId}
              userLocation={userLocation}
              onPeerSelect={handlePeerSelect}
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Peers;

const Connect = () => {
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  return (
    <section>
      <p className="mb-4">
        To continue using the app you need to have a valid membership!
      </p>
      <button
        onClick={() => connect()}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Sign-In
      </button>
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
