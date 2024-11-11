
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
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
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
    <Container sx={{ textAlign: 'center' }}>
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
    <div>
      <Stack direction={"row"}>
        <Typography variant="h4" color="text.primary">
          Peers
        </Typography>
        <Paper
          component="form"
          sx={{ p: '2px 4px', ml: 3, display: 'flex', alignItems: 'center', width: 400 }}
        >
          <IconButton sx={{ p: '10px' }} aria-label="menu">
            <FilterAltIcon />
          </IconButton>
          <Divider />
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Search for peers"
            inputProps={{ 'aria-label': 'search for peers' }}
          />
          <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
            <SearchIcon />
          </IconButton>
        </Paper>
      </Stack>
      <br />
      <VPNStatus />
      <Box sx={{ display: 'flex', flexWrap: "wrap", pb: 2 }}>
        {nodesData.data.newPeers
          .filter(
            (node: any, index: any, self: any, item: any) =>
              node.peerId && node.peerId.length > 43 && index === self.findIndex((item: { peerId: any; }) => item.peerId === node.peerId),
          )
          .sort(function (a: any, b: any) {
            if (a.peerId.toLowerCase() > b.peerId.toLowerCase()) return -1;
            if (a.peerId.toLowerCase() < b.peerId.toLowerCase()) return 1;
            return 0;
          })
          .map((node: any, index: number) => (
            <PeerCard node={node} key={node.peerId}></PeerCard>
          ))}
      </Box>
    </div>
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
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    flexGrow: 1,
    maxWidth: 550,
    minHeight: "20vh"
  }));

  return (
    <section>
      <Container sx={{ textAlign: 'center' }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="90vh"
        >
          <Item>
            <Stack alignItems={"center"} gap={2} mt={4} mb={4}>
              <Typography variant='h4' mb={2}>
                Before accessing our service...
              </Typography>
              <Typography variant='subtitle1'>
                You currently don't have a membership!
              </Typography>
              <Typography variant='subtitle1'>
                To be able to connect to a peer, you need to purchase a Skypier subscription.
              </Typography>
              <Button
                variant="outlined"
                onClick={() => checkout()}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
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