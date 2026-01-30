
// MUI
import { styled } from '@mui/material/styles';
import { Container, Link, Stack, Box, Typography, Paper, Button, Card, CardContent, CardMedia, Chip, Divider, CircularProgress, Alert } from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ImageIcon from '@mui/icons-material/Image';

// Unlock Protocol
import { PublicLockV14 } from "@unlock-protocol/contracts";
import networks from "@unlock-protocol/networks";
import { Paywall } from "@unlock-protocol/paywall";

// Wagmi
import { useAccount, useConnect, useContractRead } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { sepolia } from "wagmi/chains";

// React
import { useState, useEffect } from "react";

const LOCK = "0xFd25695782703df36CACF94c41306b3DB605Dc90";

// NFT Metadata interface
interface NFTMetadata {
  name?: string;
  description?: string;
  image?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  external_url?: string;
}

const Subscription = () => {
  
    const configuredNetworkID = sepolia.id;
    const { isConnected, address } = useAccount();
    const [nftMetadata, setNftMetadata] = useState<NFTMetadata | null>(null);
    const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
    const [metadataError, setMetadataError] = useState<string | null>(null);
  
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

    // Get token ID for the user
    const {
      data: tokenId,
    } = useContractRead({
      address: LOCK,
      abi: PublicLockV14.abi,
      functionName: "tokenOfOwnerByIndex",
      chainId: configuredNetworkID,
      enabled: !!address && !!isMember,
      args: [address, 0], // Get first token
      watch: true,
    }) as { data: bigint | undefined };

    // Get token URI
    const {
      data: tokenURI,
    } = useContractRead({
      address: LOCK,
      abi: PublicLockV14.abi,
      functionName: "tokenURI",
      chainId: configuredNetworkID,
      enabled: !!tokenId,
      args: [tokenId],
      watch: true,
    }) as { data: string | undefined };

    // Fetch NFT metadata when tokenURI is available
    useEffect(() => {
      const fetchMetadata = async () => {
        if (!tokenURI) return;
        
        setIsLoadingMetadata(true);
        setMetadataError(null);
        
        try {
          let metadataUrl = tokenURI as string;
          
          // Handle IPFS URIs
          if (metadataUrl.startsWith('ipfs://')) {
            metadataUrl = metadataUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
          }
          
          // Handle data URIs (base64 encoded JSON)
          if (metadataUrl.startsWith('data:application/json;base64,')) {
            const base64Data = metadataUrl.split(',')[1];
            const jsonString = atob(base64Data);
            const metadata = JSON.parse(jsonString);
            setNftMetadata(metadata);
            setIsLoadingMetadata(false);
            return;
          }
          
          // Fetch from HTTP(S) URL
          const response = await fetch(metadataUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch metadata: ${response.statusText}`);
          }
          
          const metadata = await response.json();
          setNftMetadata(metadata);
        } catch (err) {
          console.error('Error fetching NFT metadata:', err);
          setMetadataError(err instanceof Error ? err.message : 'Failed to load NFT metadata');
        } finally {
          setIsLoadingMetadata(false);
        }
      };
      
      fetchMetadata();
    }, [tokenURI]);

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
    const MembershipContent = () => {
      return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Stack spacing={3}>
            {/* Membership Status */}
            <Card elevation={3}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <CheckCircleIcon color="success" fontSize="large" />
                  <Typography variant="h5" component="h2">
                    Active Membership
                  </Typography>
                </Stack>
                <Typography color="text.secondary" gutterBottom>
                  Your Skypier VPN subscription is valid and active.
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  To manage your membership, please visit{' '}
                  <Link href="https://app.unlock-protocol.com/keychain" target="_blank" rel="noopener">
                    Unlock Keychain
                  </Link>
                </Typography>
              </CardContent>
            </Card>

            {/* NFT Information */}
            {tokenId !== undefined && tokenId !== null && (
              <Card elevation={3}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                    <ImageIcon color="primary" />
                    <Typography variant="h6" component="h3">
                      Your Skypier NFT
                    </Typography>
                  </Stack>
                  
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Token ID: <Chip label={`#${tokenId?.toString() || ''}`} size="small" />
                      </Typography>
                    </Box>

                    {isLoadingMetadata && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <CircularProgress size={20} />
                        <Typography variant="body2" color="text.secondary">
                          Loading NFT metadata...
                        </Typography>
                      </Box>
                    )}

                    {metadataError && (
                      <Alert severity="warning">
                        {metadataError}
                      </Alert>
                    )}

                    {nftMetadata && (
                      <Box>
                        {nftMetadata.image && (
                          <CardMedia
                            component="img"
                            image={nftMetadata.image.startsWith('ipfs://') 
                              ? nftMetadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/')
                              : nftMetadata.image}
                            alt={nftMetadata.name || 'NFT Image'}
                            sx={{ 
                              maxWidth: 300, 
                              borderRadius: 2, 
                              mb: 2,
                              mx: 'auto',
                              display: 'block'
                            }}
                            onError={(e) => {
                              // Hide image if it fails to load
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}

                        {nftMetadata.name && (
                          <Typography variant="h6" gutterBottom>
                            {nftMetadata.name}
                          </Typography>
                        )}

                        {nftMetadata.description && (
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {nftMetadata.description}
                          </Typography>
                        )}

                        {nftMetadata.attributes && nftMetadata.attributes.length > 0 && (
                          <Box>
                            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                              Attributes:
                            </Typography>
                            <Stack direction="row" flexWrap="wrap" gap={1}>
                              {nftMetadata.attributes.map((attr, index) => (
                                <Chip
                                  key={index}
                                  label={`${attr.trait_type}: ${attr.value}`}
                                  size="small"
                                  variant="outlined"
                                />
                              ))}
                            </Stack>
                          </Box>
                        )}

                        {nftMetadata.external_url && (
                          <Box sx={{ mt: 2 }}>
                            <Button
                              variant="outlined"
                              size="small"
                              href={nftMetadata.external_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View on External Site
                            </Button>
                          </Box>
                        )}
                      </Box>
                    )}

                    {tokenURI && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Metadata URI:
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            wordBreak: 'break-all',
                            fontFamily: 'monospace',
                            fontSize: '0.7rem'
                          }}
                        >
                          {tokenURI}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* Contract Information */}
            <Card elevation={2}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Contract Details
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  {LOCK}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Network: Sepolia Testnet
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Container>
      );
    };

    return <MembershipContent />;
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
