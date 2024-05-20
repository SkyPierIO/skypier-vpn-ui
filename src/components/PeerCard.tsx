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
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';


interface Props {
  node: any;
}

const PeerCard = ({ node }: Props) => {
    const handleClick = async (peerId: string) => {
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
    
    const [status, updateStatus] = useState<string>("⟳ Unknown");
    const handleStatus = async () => {
        updateStatus("• Connecting...")
        console.log("Getting status for", node.peerId)
      try {
        const response = await http.get(`/ping/` + node.peerId);
        console.log("ping",response)
        if (response.status === 200) {
          if (response.data.result) {
            alert(response.data.result);
            updateStatus("• Online") 
          } else {
            updateStatus("⟳ Unreachable");
          }
        } 
      } catch (error) {
        updateStatus("⟳ Unreachable");
      }
    };

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
                    Peer <span style={{color:"#5df", fontFamily: "monospace"}}>{node.peerId.substring(0, 3)}...{node.peerId.slice(-10 )}</span>
                </Typography>
                <Stack direction={"row"} sx={{mt:1}}>
                    <Chip sx={{mr:1}} label={status}   color="success" size="small" variant="outlined"/>
                    <Chip sx={{mr:1}} icon={<LocationOnIcon />} label="Unknown" size="small" variant="outlined" />
                    <Chip sx={{mr:1}} icon={<CalendarMonthSharpIcon />} label={"Created "+new Date(node.timestamp * 1000).toLocaleDateString()} size="small" variant="outlined" />
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
                              size="small" 
                              variant="outlined" 
                              disabled>
                              Connect
                          </Button>
                      ) : (
                          <Button 
                          size="small" 
                          variant="outlined" 
                          onClick={async () => handleClick(node.peerId)} endIcon={<ElectricalServicesIcon sx={{borderRadius:1}}/>}>
                              Connect
                          </Button>
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
