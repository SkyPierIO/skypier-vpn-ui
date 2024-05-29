import { useState, useEffect } from "react";

// Axios
import http from "../http.common";

// MUI
import Card from "@mui/material/Card";
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import CalendarMonthSharpIcon from '@mui/icons-material/CalendarMonthSharp';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Typography from "@mui/material/Typography";
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';

// GeoIP
import { lookup, lookupPretty } from 'ipfs-geoip';
import ReactCountryFlag from "react-country-flag"



interface Props {
  node: any;
}

const PeerCard = ({ node }: Props) => {
    const handlePing = async (peerId: string) => {
        console.log("Ping requested; node ID", peerId);
        try {
          const response = await http.get(`/ping/`+peerId);
          console.log(response.status)
          if (response.status === 200) {
            console.log("ping",response)
            if (response.data.result) {
              alert(response.data.result);
              updateStatus("• Online")
            } 
          } else if (response.status === 400) {
            console.log(response)
          }
        } catch (error) {
          console.error(error);
        }
      };
    
    const handleConnect = async (peerId: string) => {
        console.log("Connection requested; node ID", peerId);
        try {
          const response = await http.get(`/connect/`+peerId);
          console.log(response.status)
          if (response.status === 200) {
            console.log("connect",response)
            if (response.data.result) {
              alert(response.data.result);
            } 
          } else if (response.status === 400) {
            console.log(response)
          }
        } catch (error) {
          console.error(error);
        }
      };
    
    const [status, updateStatus] = useState<string>("⟳ Unknown");
    const handleStatus = async () => {
        updateStatus("• Connecting...")
        console.log("Getting status for", node.peerId)
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
    const handleGeoIP = async () => { 
      // const ip = "66.135.31.216"; // Test IP, TODO get the IP from peer multiaddress
      const ip = "136.244.105.166"; // Test IP, TODO get the IP from peer multiaddress
      const gateways = ['https://ipfs.io', 'https://dweb.link']
      const result = await lookup(gateways, ip);
      console.log(result);
      updateGeoIP(result.country_name + ", " + result.city);
      updateCountryCode(result.country_code);
    }
    handleGeoIP();

    return (
    <>
        <Card sx={{ display: 'flex', m:1  }} key={node.peerId} onLoad={async () => handleStatus()}>
            <CardMedia
                component="img"
                sx={{ width: 95, height: 95, p: 3 }}
                image={"http://api.dicebear.com/7.x/identicon/svg?seed="+node.peerId }
                alt="Icon"
            />
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: '1 0 auto' }}>
                <Typography component="p">
                    Peer <span style={{color:"#5df", fontFamily: "monospace"}}>{node.peerId.substring(0, 5)}...{node.peerId.slice(-20 )}</span>
                </Typography>
                <Stack direction={"row"} sx={{mt:1}}>
                    <Chip 
                      sx={{mr:1, pl:1}} 
                      icon={(countryCode === "xx") ? <LocationOnIcon /> : <ReactCountryFlag countryCode={countryCode} svg />}
                      label={geoIP} 
                      size="small" 
                      variant={(countryCode === "xx") ? "outlined" : "outlined"}/>
                    <Chip 
                      sx={{mr:1}} 
                      icon={<CalendarMonthSharpIcon />} 
                      label={"Created "+new Date(node.timestamp * 1000).toLocaleDateString()} 
                      size="small" 
                      variant="outlined"
                    />
                </Stack>
                <Stack direction={"row"} sx={{mt:1}}>
                    <Chip 
                      sx={{mr:1}} 
                      label={status} 
                      color={(status === "• Online") ? "success" : "default"}  
                      size="small" 
                      variant="outlined" 
                    />
                </Stack>
                {/* <br/> */}
                <Stack sx={{mt:1}}>
                    {(status === "• Connecting...") ? (
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
                          <Box sx={{display: 'flex',flexDirection: 'row',justifyContent: 'right', mt:2}}>
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
        </Card>
    </>
  );
};

export default PeerCard;
