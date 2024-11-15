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
}

const cache: { [key: string]: any } = {};

const PeerCard = ({ node }: Props) => {
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
          updateStatus("• Online") 
        } else {
          updateStatus("⟳ Unreachable");
        }
      } 
    } catch (error) {
      updateStatus("⟳ Unreachable");
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
        const icon = jazzicon(60, numericValue);
        identiconRef.current.innerHTML = '';
        identiconRef.current.appendChild(icon);
      }
    };

    generateIdenticon();
  }, [node.peerId]);


  return (
  <>
      <Card sx={{ display: 'flex', m:1 }} key={node.peerId} onLoad={async () => handleStatus()}>
          
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: '1 0 auto', minWidth: 350 }}>
                <Stack direction={"row"} sx={{mb: 2}}>
                  <Typography component="h2" variant="h4">
                    {(countryCode === "xx") ? <LocationOnIcon /> : <ReactCountryFlag countryCode={countryCode} svg />}
                  </Typography>
                  <Typography component="h2" variant="h6" sx={{pt:1}}>
                    {" "+geoIP} 
                  </Typography>   
                </Stack>
                <Chip 
                  sx={{mr:1, mb: 2}} 
                  label={status} 
                  color={(status === "• Online") ? "success" : "default"}  
                  size="small" 
                  variant="outlined" 
                />
                <Typography component="p" variant="caption">
                    Peer <span style={{color:"#5df", fontFamily: "monospace"}}>{node.peerId.substring(0, 5)}...{node.peerId.slice(-20 )}</span>
                </Typography>
                <Typography component="p" variant="caption">
                  Created <span style={{color:"#5df"}}>{new Date(node.timestamp * 1000).toLocaleDateString()} </span>
                </Typography>
                {/* <Stack direction={"row"} sx={{mt:1}}> */}
                    {/* <LocationModal latitude={latitude} longitude={longitude} country={geoIP.split(",")[0]} city={geoIP.split(",")[1]}/> */}
                {/* </Stack> */}
                {/* <br/> */}
                <Stack sx={{mt:1}}>
                    {(status === "• Fetching status...") ? (
                      <>
                        <Skeleton animation="wave" width={"60%"} height={20}/>
                        <Skeleton animation="wave" width={"100%"} height={40}/>
                      </>
                    ) : 
                    (status === "⟳ Unreachable" || status === "⟳ Unknown") ? (
                          <Button 
                              sx={{mt:2}}
                              size="small" 
                              variant="outlined" 
                              disabled>
                              Connect
                          </Button>
                      ) : (
                          <Box sx={{display: 'flex',flexDirection: 'row',justifyContent: 'left', mt:2}}>
                            <ButtonGroup variant="outlined">
                              <Button 
                                size="small" 
                                onClick={async () => handlePing(node.peerId)}>
                                  Ping
                              </Button>
                              <Button
                                sx={{pl:2}} 
                                size="small" 
                                onClick={async () => handleConnect(node.peerId)} endIcon={<ElectricalServicesIcon sx={{borderRadius:1}}/>}>
                                  Connect
                              </Button>
                            </ButtonGroup>
                          </Box>
                      )
                    }
                    {}
                  
                </Stack>
              </CardContent>
          </Box>
            <Stack>
            <CardMedia
            component="div"
            sx={{ width: 110, height: 110, p: 3 }}
            ref={identiconRef}
          />
            <Box sx={{textAlign: "center"}}>
              <CheckStarredPeer peerId={node.peerId}/>
            </Box>
          </Stack>
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