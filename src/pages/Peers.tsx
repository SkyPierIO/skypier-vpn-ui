// MUI
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import InputBase from '@mui/material/InputBase';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { styled } from '@mui/material/styles';

// UNLOCK
import { PublicLockV14 } from "@unlock-protocol/contracts";
import networks from "@unlock-protocol/networks";
import { Paywall } from "@unlock-protocol/paywall";

// WAGMI
import { useAccount, useConnect, useContractRead } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { sepolia } from "wagmi/chains";

const LOCK = "0xFd25695782703df36CACF94c41306b3DB605Dc90";

const wipPeers =  [
  "12D3KooWSSqLegz7hpzhmcYLrJw77rzUbqS6hBpsoW2s1L2svHgu",
  "12D3KooWSXwxjHK4WJcHVGwL2FpRS8RxuGJisD7YudpVsV9GrApM",
  "12D3KooW9xuJVGEV83LqpPtBR88J98jFGqZW9ENbNBn9Cp4MzUwn",
  "12D3KooWHHX4hXvfUuWk7cLB4utqZSVsXicGvJxUq9MTDNkFNpvT",
  "12D3KooWL4PfMzJJmgaj2WJ7XTTg2H2yLPFuP82tMiqcb7iPh8oC",
  "12D3KooWHH65yRa5H6Fr8HuQrtGs3GR69TUnJujMymo8qaEp6Xw8",
  "12D3KooWHnKKoxfuVX9b9o3cPxjLtpmXM8ekZH2nKZPqSvUL2yyR",
  "12D3KooWFF3swE8mqgdmgiNuFU4rZRwgtoJMM3U2hJ3p86YYvhLS",
  "12D3KooWRSpZjhQdHrm1XATwvkbDq6VbTWQLw92uqNgmZ3kta4MK",
  "12D3KooWNMcnoQynAY9hyi4JxzSu64BsRGcJ9z7vKghqk8sTrpqY",
  "12D3KooWBuuuit5dsuAPCmEDRN3ToY1Jr4EsVvpWUTkhrhn6WUos",
  "12D3KooWL9hrTZiQxazk5Fy1rcbjdJY98EC1hjqujG9F1Bas9sWf",
  "12D3KooWFmnnKPV7vYzBqGWEDn7v6KftQYGH7YznJhcV5xfFz6ZK",
  "12D3KooWSwwoegRXz2uKMZgwE1wuhuZrYFf5HJHHQ8XAeGfCHDZF",
]

const Peers = () => {

  const handleClick = () => {
    console.info('Connection requested.');
    alert('Connection requested.');
  };

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
  console.log(error);
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>There was an error checking your membership status. Please reload the page!</div>;
  }

  // User not connected
  if (!isConnected) {
    return <Connect />;
  }

  // User does not have membership
  if (!isMember) {
    return <Checkout network={configuredNetworkID} />;
  }

  // All good: user is connected and they have a membership!
  return (
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
            <Divider></Divider>
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
      <Box sx={{ display: 'flex', flexWrap: "wrap", pb: 2 }}>
          {wipPeers.map((text, index) => (
            <Card sx={{ display: 'flex', m:1  }}>
              <CardMedia
                component="img"
                sx={{ width: 95, height: 95, p: 3 }}
                image={"http://api.dicebear.com/7.x/identicon/svg?seed="+text }
                alt="Icon"
              />
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: '1 0 auto' }}>
                  <Typography component="p">
                    Peer <span style={{color:"#5df", fontFamily: "monospace"}}>{text.substring(0, 3)}...{text.slice(-10 )}</span>
                  </Typography>
                  <Stack direction={"row"} sx={{mt:1}}>
                    <Typography component="p">
                      <Chip  sx={{mr:1}} label="• Online" color="success" size="small" variant="outlined"/>
                      <Chip  sx={{mr:1}} icon={<LocationOnIcon />} label="Amsterdam" size="small" variant="outlined" />
                    </Typography>
                  </Stack>
                  {/* <br/> */}
                  <Stack sx={{mt:1}}>
                    <Button size="small" variant="outlined" onClick={handleClick} endIcon={<ElectricalServicesIcon sx={{borderRadius:1}}/>}>
                      Connect
                    </Button>
                  </Stack>
                </CardContent>
              </Box>
            </Card>
          ))}
      </Box>
    </div>
  );
};
export default Peers;

/**
 * Connect subcomponent!
 * @returns
 */
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

/**
 * Checkout subcomponent!
 * @returns
 */
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
      <Container sx={{textAlign: 'center'}}>
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