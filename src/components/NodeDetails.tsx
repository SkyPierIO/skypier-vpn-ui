import { useState } from "react";
import http from "../http.common";

// Components
import SubscriptionViz from './SubscriptionViz';

// MUI
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';

import MemoryIcon from '@mui/icons-material/Memory';
import HistoryIcon from '@mui/icons-material/History';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import RouterIcon from '@mui/icons-material/Router';
import InfoIcon from '@mui/icons-material/Info';
import ImportExportIcon from '@mui/icons-material/ImportExport';

export default function NodeDetails() {
  const [nickname, setNickname] = useState<string>("Unknown");
  const [peerId, setPeerId] = useState<string>("no peer ID detected");
  const [os, setOS] = useState<string>("Not detected");
  const [version, setVersion] = useState<string>("0.0.0");

  const GetPeerDetails = async () => {
    try {
      const response = await http.get(`/me`);
      if (response.status === 200) {
        if (response.data.nickname) {
          setNickname(response.data.nickname);
        } 
        if (response.data.peerId) {
          setPeerId(response.data.peerId);
        } 
        if (response.data.os) {
          setOS(response.data.os);
        }
        if (response.data.version) {
          setVersion(response.data.version);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };
  GetPeerDetails();

  return (
    <>  
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <Card 
          sx={{ 
            borderRadius: 4, 
            backgroundColor: "#f6547d",
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <CardMedia
            sx={{ height: { xs: 140, sm: 180 } }}
            image="https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            title="background"
          />
          <CardContent sx={{ flexGrow: 1 }}>
            <Typography 
              gutterBottom 
              variant="h5" 
              component="div"
              sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
            >
              {nickname}
            </Typography>
            <Typography variant="body2" color="text.primary" sx={{ wordBreak: 'break-all' }}>
              Peer ID <pre style={{ fontSize: 'inherit', margin: 0 }}>{peerId}</pre>
            </Typography>
          </CardContent>
          <CardActions sx={{ flexWrap: 'wrap', gap: 1, p: 2 }}>
            <Button 
              color="info" 
              href="/My_subscription" 
              variant="contained" 
              size="small"
              sx={{ flex: { xs: '1 1 100%', sm: '0 1 auto' } }}
            >
              Manage Subscription
            </Button>
            <Button 
              color="info" 
              href="/Explore_peers" 
              variant="contained" 
              size="small"
              sx={{ flex: { xs: '1 1 100%', sm: '0 1 auto' } }}
            >
              Connect to a remote Peer
            </Button>
          </CardActions>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <Card sx={{ borderRadius: 4, height: '100%' }}>
          <CardContent sx={{ textAlign: "center" }}>
            <Typography 
              gutterBottom 
              variant="h4" 
              component="div"
              sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}
            >
              Node details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <Chip sx={{ mt: 3 }} icon={<HistoryIcon />} label="Uptime" />
              <Typography sx={{ mb: 1 }} component="p">Unknown</Typography>
              <hr />
              <Chip sx={{ mt: 4 }} icon={<MemoryIcon />} label="Operating System" />
              <Typography sx={{ mb: 1 }} component="p">{os}</Typography>
              <hr />
              <Chip sx={{ mt: 4 }} icon={<LocalOfferIcon />} label="Version" />
              <Typography sx={{ mt: 1 }} component="p">{version}</Typography>
              <hr />
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <Card sx={{ borderRadius: 4, height: '100%' }}>
          <CardContent sx={{ textAlign: "center" }}>
            <Typography 
              gutterBottom 
              variant="h4" 
              component="div"
              sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}
            >
              VPN Interface
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
              <Chip sx={{ mt: 3 }} icon={<RouterIcon />} label="Network Interface" />
              <Typography sx={{ mb: 1 }} component="p"><pre style={{ fontSize: 'inherit', margin: 0 }}>utun8</pre></Typography>
              <hr />
              <Chip sx={{ mt: 4 }} icon={<InfoIcon />} label="Current status" />
              <Typography sx={{ mb: 1 }} component="p">Up</Typography>
              <hr />
              <Chip sx={{ mt: 4 }} icon={<ImportExportIcon />} label="MTU" />
              <Typography sx={{ mb: 1 }} component="p">1500</Typography>
              <hr />
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <Card sx={{ borderRadius: 4, height: '100%' }} className="disabled-overlay"> 
          <CardContent sx={{ textAlign: "center", flexGrow: 1 }}>
            <Typography 
              gutterBottom 
              variant="h4" 
              component="div"
              sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' } }}
            >
              My subscription
            </Typography>
            <SubscriptionViz />
          </CardContent>
          <CardActions sx={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button size="small">Manage</Button>
            <Button size="small">Extend</Button>
          </CardActions>
        </Card>
      </Grid>
    </>
  );
};