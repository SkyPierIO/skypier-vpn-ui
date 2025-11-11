import { useEffect, useState, useRef } from "react";

// Axios
import http from "../http.common";

// MUI
import Card from "@mui/material/Card";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Typography from "@mui/material/Typography";
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import jazzicon from '@metamask/jazzicon';


// GeoIP
import { lookup, lookupPretty } from 'ipfs-geoip';
import ReactCountryFlag from "react-country-flag"
import CheckStarredPeer from "./CheckStarredPeer";


interface Props {
  node: any;
  onMetadataUpdate?: (peerId: string, metadata: any) => void;
}

const cache: { [key: string]: any } = {};

const PeerCard = ({ node, onMetadataUpdate }: Props) => {
  const identiconRef = useRef<HTMLDivElement>(null);


  const handlePing = async (peerId: string) => {
      console.log("Ping requested; node ID", peerId);
      try {
        const response = await http.get(`/ping/`+peerId);
        console.log(response.status)
        if (response.status === 200) {
          console.log("ping",response)
          if (response.data.result) {
            updateStatus("• Online")
            setOpen(true);
            setSnackBarText(response.data.result); 
          } 
        } else if (response.status === 400) {
          console.log(response)
          setOpen(true);
          setSnackBarText(response.status.toString()); 
        }
      } catch (error) {
        console.error(error);
      }
    };
  
  // Notifications
  const [open, setOpen] = useState(false);
  const [snackBarText, setSnackBarText] = useState<string>("Oops! Error happened...");
  const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const handleConnect = async (peerId: string) => {
      console.log("Connection requested; node ID", peerId);
      try {
        const response = await http.get(`/connect/`+peerId);
        console.log(response.status)
        if (response.status === 200) {
          console.log("connect",response)
          if (response.data.result) {
            setOpen(true);
            setSnackBarText(response.data.result); 
          } 
        } else if (response.status === 400) {
          console.log(response)
          setOpen(true);
          setSnackBarText(response.data);           
        }
      } catch (error) {
        console.error(error);
      }
    };
  
  const [status, updateStatus] = useState<string>("⟳ Unknown");
  const handleStatus = async () => {
      updateStatus("• Fetching status...")
      // console.log("Getting status for", node.peerId)
    try {
      const response = await http.get(`/ping/` + node.peerId);
      console.log("ping",response)
      if (response.status === 200) {
        if (response.data.result) {
          // alert(response.data.result);
          const newStatus = "• Online";
          updateStatus(newStatus);
          if (onMetadataUpdate) {
            onMetadataUpdate(node.peerId, { status: newStatus });
          }
        } else {
          const newStatus = "⟳ Unreachable";
          updateStatus(newStatus);
          if (onMetadataUpdate) {
            onMetadataUpdate(node.peerId, { status: newStatus });
          }
        }
      } 
    } catch (error) {
      const newStatus = "⟳ Unreachable";
      updateStatus(newStatus);
      if (onMetadataUpdate) {
        onMetadataUpdate(node.peerId, { status: newStatus });
      }
    }
  };

  const [geoIP, updateGeoIP] = useState<string>("Unknown");
  const [countryCode, updateCountryCode] = useState<string>("xx");
  const [longitude, updateLongitude] = useState<number>(0);
  const [latitude, updateLatitude] = useState<number>(0);
  const handleGeoIP = async () => {
    if (cache[node.peerId]) {
      const cachedData = cache[node.peerId];
      updateGeoIP(cachedData.geoIP);
      updateCountryCode(cachedData.countryCode);
      updateLatitude(cachedData.latitude);
      updateLongitude(cachedData.longitude);
      return;
    }

    try {
      const response = await http.get(`/peer/` + node.peerId + `/info`, { timeout: 5000 });
      if (response.status === 200 && response.data.length >= 1) {
        const ip = response.data[0];
        const gateways = ['https://ipfs.io', 'https://dweb.link'];
        const result = await lookup(gateways, ip);
        const geoIPData = result.country_name + ", " + result.city;
        const countryCodeData = result.country_code;
        const latitudeData = result.latitude;
        const longitudeData = result.longitude;

        updateGeoIP(geoIPData);
        updateCountryCode(countryCodeData);
        updateLatitude(latitudeData);
        updateLongitude(longitudeData);

        cache[node.peerId] = {
          geoIP: geoIPData,
          countryCode: countryCodeData,
          latitude: latitudeData,
          longitude: longitudeData,
        };

        // Update parent with metadata
        if (onMetadataUpdate) {
          onMetadataUpdate(node.peerId, { geoIP: geoIPData, countryCode: countryCodeData });
        }
      } else {
        return;
      }
    } catch (error) {
      console.error('Error fetching peer IP address:', error);
    }
  };
  
  useEffect(() => {
    handleGeoIP();
  }, []); // Empty dependency array ensures this runs only once

  const sha256 = async (message: string) => {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  };

  useEffect(() => {
    const generateIdenticon = async () => {
      if (identiconRef.current) {
        const hash = await sha256(node.peerId);
        const numericValue = parseInt(hash.slice(0, 8), 16); // Convert first 8 characters of hash to a number
        // Adjust icon size based on container size
        const iconSize = window.innerWidth < 600 ? 60 : 70;
        const icon = jazzicon(iconSize, numericValue);
        identiconRef.current.innerHTML = '';
        identiconRef.current.appendChild(icon);
      }
    };

    generateIdenticon();
  }, [node.peerId]);


  return (
  <>
      <Card 
        sx={{ 
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          borderRadius: 2,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: 4
          }
        }} 
        key={node.peerId} 
        onLoad={async () => handleStatus()}
      >
        {/* Star Button - Top Right */}
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 12, 
            right: 12,
            zIndex: 2
          }}
        >
          <CheckStarredPeer peerId={node.peerId}/>
        </Box>

        <CardContent sx={{ p: { xs: 2, sm: 3 }, pb: { xs: 1, sm: 2 } }}>
          {/* Header: Flag + Location */}
          <Stack 
            direction="row" 
            spacing={1.5} 
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <Box 
              sx={{ 
                fontSize: { xs: '2rem', sm: '2.5rem' },
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {(countryCode === "xx") ? (
                <LocationOnIcon sx={{ fontSize: 'inherit' }} />
              ) : (
                <ReactCountryFlag 
                  countryCode={countryCode} 
                  svg 
                  style={{ 
                    width: '2em', 
                    height: '1.5em',
                    borderRadius: '4px'
                  }}
                />
              )}
            </Box>
            <Typography 
              variant="h6" 
              component="div"
              sx={{ 
                fontWeight: 600,
                fontSize: { xs: '1rem', sm: '1.125rem' },
                flex: 1,
                pr: 5
              }}
            >
              {geoIP}
            </Typography>
          </Stack>

          {/* Status Chip */}
          <Box sx={{ mb: 2 }}>
            <Chip 
              label={status} 
              color={(status === "• Online") ? "success" : "default"}  
              size="small" 
              variant="filled"
              sx={{ 
                fontWeight: 500,
                height: 24
              }}
            />
          </Box>

          {/* Jazzicon and Peer Info Side by Side */}
          <Stack 
            direction="row" 
            spacing={2} 
            alignItems="center"
            sx={{ mb: 2 }}
          >
            {/* Jazzicon */}
            <Box
              ref={identiconRef}
              sx={{ 
                width: { xs: 60, sm: 70 }, 
                height: { xs: 60, sm: 70 },
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '& > div': {
                  borderRadius: '50%'
                }
              }}
            />
            
            {/* Peer ID and Date */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography 
                variant="caption" 
                component="div"
                sx={{ 
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  mb: 0.5,
                  color: 'text.secondary'
                }}
              >
                Peer ID
              </Typography>
              <Typography 
                variant="body2"
                sx={{ 
                  fontFamily: 'monospace',
                  fontSize: { xs: '0.75rem', sm: '0.8rem' },
                  color: '#5df',
                  wordBreak: 'break-all',
                  mb: 1
                }}
              >
                {node.peerId.substring(0, 8)}...{node.peerId.slice(-8)}
              </Typography>
              <Typography 
                variant="caption"
                sx={{ 
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  color: 'text.secondary'
                }}
              >
                Created <span style={{color:"#5df"}}>{new Date(node.timestamp * 1000).toLocaleDateString()}</span>
              </Typography>
            </Box>
          </Stack>

          {/* Action Buttons */}
          <Box sx={{ mt: 2 }}>
            {(status === "• Fetching status...") ? (
              <Stack spacing={1}>
                <Skeleton animation="wave" width="60%" height={20}/>
                <Skeleton animation="wave" width="100%" height={36}/>
              </Stack>
            ) : (status === "⟳ Unreachable" || status === "⟳ Unknown") ? (
              <Button 
                size="medium" 
                variant="outlined" 
                fullWidth
                disabled
              >
                Connect
              </Button>
            ) : (
              <ButtonGroup 
                variant="contained"
                fullWidth
                sx={{
                  '& .MuiButton-root': {
                    py: 1
                  }
                }}
              >
                <Button 
                  onClick={async () => handlePing(node.peerId)}
                  sx={{ flex: 1 }}
                >
                  Ping
                </Button>
                <Button
                  onClick={async () => handleConnect(node.peerId)} 
                  endIcon={<ElectricalServicesIcon />}
                  sx={{ flex: 2 }}
                >
                  Connect
                </Button>
              </ButtonGroup>
            )}
          </Box>
        </CardContent>
      </Card>
      
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert
          onClose={handleClose}
          variant="filled"
          severity="info"
          sx={{ width: '100%' }}
        >
          {snackBarText}
        </Alert>
      </Snackbar>
  </>
  );
};

export default PeerCard;