
// React
import { useState, useMemo } from "react";

// GrapQL
import { gql, useQuery } from "@apollo/client";

// Commponents
import PeerCard from "../components/PeerCard"

// MUI
import Typography from "@mui/material/Typography";
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import InputBase from '@mui/material/InputBase';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ClearIcon from '@mui/icons-material/Clear';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import { styled } from '@mui/material/styles';
import { PublicLockV14 } from "@unlock-protocol/contracts";
import networks from "@unlock-protocol/networks";
import { Paywall } from "@unlock-protocol/paywall";
import { useAccount, useConnect, useContractRead } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { sepolia } from "wagmi/chains";
import VPNStatus from "../components/VPNStatus";
import UtilityCard from "../components/UtilityCard";

const LOCK = "0xFd25695782703df36CACF94c41306b3DB605Dc90";

const Item = styled(Paper)(({ theme }: { theme: any }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  flexGrow: 1,
  maxWidth: 550,
  minHeight: "20vh"
}));

const Peers = () => {
  const configuredNetworkID = sepolia.id;
  const { isConnected, address } = useAccount();
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("all");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const filterOpen = Boolean(anchorEl);

  // VPN connection state
  const [vpnConnected, setVpnConnected] = useState<boolean>(false);
  const [connectedPeerId, setConnectedPeerId] = useState<string | null>(null);

  const handleVpnStatusChange = (connected: boolean, peerId: string | null) => {
    setVpnConnected(connected);
    setConnectedPeerId(peerId);
  };

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
  
  const {
    data: isMember,
    isError,
    isLoading,
    error,
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
  const nodesData = useQuery(NODES_GQL, { pollInterval: 5 * 60000 }); // Fetch nodes data every 5 minutes

  // Store peer metadata (location info etc)
  const [peerMetadata, setPeerMetadata] = useState<{[key: string]: any}>({});

  const updatePeerMetadata = (peerId: string, metadata: any) => {
    setPeerMetadata(prev => ({
      ...prev,
      [peerId]: { ...prev[peerId], ...metadata }
    }));
  };

  // Filter and search peers
  const filteredPeers = useMemo(() => {
    if (!nodesData.data?.newPeers) return [];

    // First, deduplicate and filter valid peers
    let peers = nodesData.data.newPeers
      .filter(
        (node: any, index: any, self: any) =>
          node.peerId && 
          node.peerId.length > 43 && 
          index === self.findIndex((item: { peerId: any; }) => item.peerId === node.peerId)
      )
      .sort(function (a: any, b: any) {
        if (a.peerId.toLowerCase() > b.peerId.toLowerCase()) return -1;
        if (a.peerId.toLowerCase() < b.peerId.toLowerCase()) return 1;
        return 0;
      });

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      peers = peers.filter((node: any) => {
        const metadata = peerMetadata[node.peerId];
        
        // Search by peer ID
        if (filterType === "peerId" || filterType === "all") {
          if (node.peerId.toLowerCase().includes(query)) return true;
        }
        
        // Search by location
        if ((filterType === "location" || filterType === "all") && metadata?.geoIP) {
          if (metadata.geoIP.toLowerCase().includes(query)) return true;
        }
        
        // Search by status
        if ((filterType === "status" || filterType === "all") && metadata?.status) {
          if (metadata.status.toLowerCase().includes(query)) return true;
        }
        
        return false;
      });
    }

    return peers;
  }, [nodesData.data, searchQuery, filterType, peerMetadata]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    const c = () => {
      return(
        <>
          <Typography mb={1}>
            Please reload the page!
          </Typography>
          <Typography>
            There was an error checking your membership status. Please reload the page!
          </Typography>
        </>
      );
    }
    return <UtilityCard title="🪢 Error checking your membership status" content={c()}></UtilityCard>;
  }

  if (!isConnected) {
    return <Connect />;
  }

  if (!isMember) {
    return <Checkout network={configuredNetworkID} />;
  }

  return nodesData.loading ? (
    <Container 
      maxWidth="xl"
      sx={{ 
        textAlign: 'center',
        px: { xs: 1, sm: 2, md: 3 },
        py: { xs: 2, sm: 3 }
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
            <Typography variant='h6' mb={2}>
              Loading...
            </Typography>
            <Box sx={{ width: '100%' }}>
              <LinearProgress />
            </Box>
            <Typography variant='body1' mb={2}>
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
        py: { xs: 2, sm: 3 }
      }}
    >
      <Stack 
        direction={{ xs: "column", md: "row" }}
        spacing={{ xs: 2, md: 3 }}
        alignItems={{ xs: "stretch", md: "center" }}
        sx={{ mb: 3 }}
      >
        <Typography 
          variant="h4" 
          color="text.primary"
          sx={{ 
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
          }}
        >
          Peers
        </Typography>
        
        <Box sx={{ flex: 1, maxWidth: { md: 500 } }}>
          <Paper
            component="form"
            onSubmit={(e) => e.preventDefault()}
            sx={{ 
              p: '2px 4px', 
              display: 'flex', 
              alignItems: 'center',
              width: '100%'
            }}
          >
            <IconButton 
              sx={{ p: '10px' }} 
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
                vertical: 'bottom',
                horizontal: 'left',
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
              placeholder={`Search ${filterType === "all" ? "peers" : `by ${filterType}`}...`}
              inputProps={{ 'aria-label': 'search for peers' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <IconButton 
                sx={{ p: '10px' }} 
                aria-label="clear"
                onClick={handleClearSearch}
              >
                <ClearIcon />
              </IconButton>
            )}
            <Divider orientation="vertical" flexItem />
            <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
              <SearchIcon />
            </IconButton>
          </Paper>
          
          {/* Active Filter Chips */}
          {(searchQuery || filterType !== "all") && (
            <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
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
        </Box>
      </Stack>
      
      <Box sx={{ mb: 3 }}>
        <VPNStatus onStatusChange={handleVpnStatusChange} />
      </Box>
      
      {/* Results count */}
      <Typography 
        variant="body2" 
        color="text.secondary" 
        sx={{ mb: 2 }}
      >
        {filteredPeers.length === 0 ? "No peers found" : `Showing ${filteredPeers.length} peer${filteredPeers.length !== 1 ? 's' : ''}`}
      </Typography>

      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(auto-fill, minmax(350px, 1fr))'
          },
          gap: { xs: 1, sm: 2 },
          pb: 2
        }}
      >
        {filteredPeers.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, gridColumn: '1 / -1' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No peers found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchQuery ? "Try adjusting your search query" : "No peers available at the moment"}
            </Typography>
          </Box>
        ) : (
          filteredPeers.map((node: any) => (
            <PeerCard 
              node={node} 
              key={node.peerId}
              onMetadataUpdate={updatePeerMetadata}
              isVpnConnected={vpnConnected}
              connectedPeerId={connectedPeerId}
            />
          ))
        )}
      </Box>
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
      <p className="mb-4">To continue using the app you need to have a valid membership!</p>
      <button
        onClick={() => connect()}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Sign-In
      </button>
    </section>
  );
};

const Checkout = ({ network }: { network: number }) => {
  const { connector } = useAccount();
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

  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(3),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    flexGrow: 1,
    maxWidth: 550,
    minHeight: "20vh",
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    }
  }));

  return (
    <section>
      <Container 
        maxWidth="xl"
        sx={{ 
          textAlign: 'center',
          px: { xs: 1, sm: 2, md: 3 },
          py: { xs: 2, sm: 3 }
        }}
      >
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="90vh"
        >
          <Item>
            <Stack alignItems={"center"} gap={2} mt={{ xs: 2, sm: 4 }} mb={{ xs: 2, sm: 4 }}>
              <Typography 
                variant='h4' 
                mb={2}
                sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}
              >
                Before accessing our service...
              </Typography>
              <Typography 
                variant='subtitle1'
                sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
              >
                You currently don't have a membership!
              </Typography>
              <Typography 
                variant='subtitle1'
                sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
              >
                To be able to connect to a peer, you need to purchase a Skypier subscription.
              </Typography>
              <Button
                variant="outlined"
                onClick={() => checkout()}
                sx={{
                  mt: 2,
                  px: { xs: 2, sm: 4 },
                  py: { xs: 1, sm: 2 },
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                Purchase subscription!
              </Button>
            </Stack>
          </Item>
        </Box>
      </Container>
    </section>
  );
};