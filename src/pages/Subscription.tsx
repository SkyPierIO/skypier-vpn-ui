
// MUI
import { styled } from '@mui/material/styles';
import { Container, Link, Stack, Box, Typography, Paper, Button} from "@mui/material";

// Unlock Protocol
import { PublicLockV14 } from "@unlock-protocol/contracts";
import networks from "@unlock-protocol/networks";
import { Paywall } from "@unlock-protocol/paywall";

// Wagmi
import { useAccount, useConnect, useContractRead } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { sepolia } from "wagmi/chains";

// Components 
import UtilityCard from "../components/UtilityCard";

const LOCK = "0xFd25695782703df36CACF94c41306b3DB605Dc90";

const Subscription = () => {
  
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
    const c = () => {
      return(
        <>
          <Typography mb={1}>
            Your membership is valid. 
          </Typography>
          <Typography>
            To manage it, please visit <Link href="https://app.unlock-protocol.com/keychain" target="blank">Unlock Keychain</Link>.
          </Typography>
        </>
      );
    }
    return <UtilityCard title="🚀 VPN Subscription" content={c()}></UtilityCard>;
  };
  
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
export default Subscription;
