import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';

import MemoryIcon from '@mui/icons-material/Memory';
import HistoryIcon from '@mui/icons-material/History';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import RouterIcon from '@mui/icons-material/Router';
import InfoIcon from '@mui/icons-material/Info';
import ImportExportIcon from '@mui/icons-material/ImportExport';



// import VPNDataService from "../services/node.service"
import NodeDetails from "../components/NodeDetails"
import Bandwidth from '../components/Bandwidth';
import SubscriptionViz from '../components/SubscriptionViz';

const Dashboard = () => {

  return (
    <Box sx={{ width: '100%'}}>
      <Typography variant="h2" gutterBottom>
          My node <span>{' '}</span><small style={{fontSize:"0.5em"}}>Dashboard</small>
      </Typography>
      <hr/>
      <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
        <Card sx={{ minWidth: 350, mt: 2, borderRadius: 4, backgroundColor: "#f6547d"}}>
          <CardMedia
            sx={{ height: 180 }}
            image="https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            title="background"
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              <NodeDetails></NodeDetails>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Node details
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small">Details</Button>
            <Button size="small">Share</Button>
          </CardActions>
        </Card>
        {/* ------------------ */}
        {/* ------------------ */}
        {/* ------------------ */}
        {/* ------------------ */}
        <Card sx={{ minWidth: 250, mt: 2, borderRadius: 4 }}>
          <CardContent sx={{textAlign: "center"}}>
            <Typography gutterBottom variant="h4" component="div">
              Node details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <Chip  sx={{mt:3}} icon={<HistoryIcon />} label="Uptime"/>
              <Typography sx={{mb:1}} component="p">5d 14h 23min</Typography>
              <hr />
              <Chip  sx={{mt:4}} icon={<MemoryIcon />} label="Operating System"/>
              <Typography sx={{mb:1}} component="p">GNU Linux</Typography>
              <hr />
              <Chip  sx={{mt:4}} icon={<LocalOfferIcon />} label="Version"/>
              <Typography sx={{mt:1}} component="p">v0.0.1</Typography>
              <hr />
            </Typography>
          </CardContent>
          {/* <CardActions>
            <Button size="small">Details</Button>
            <Button size="small">Share</Button>
          </CardActions> */}
        </Card>
        {/* ------------------ */}
        {/* ------------------ */}
        {/* ------------------ */}
        {/* ------------------ */}
        <Card sx={{ maxWidth: 500, mt: 2, borderRadius: 4}}>
          <CardContent sx={{textAlign: "center"}}>
            <Typography gutterBottom variant="h4" component="div">
              VPN Interface
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{textAlign: "center"}}>
              <Chip  sx={{mt:3}} icon={<RouterIcon />} label="Network Interface"/>
              <Typography sx={{mb:1}} component="p"><pre>skypier0</pre></Typography>
              <hr/>
              <Chip  sx={{mt:4}} icon={<InfoIcon />} label="Current status"/>
              <Typography sx={{mb:1}} component="p">Up</Typography>
              <hr/>
              <Chip  sx={{mt:4}} icon={<ImportExportIcon />} label="MTU"/>
              <Typography sx={{mb:1}} component="p">1500</Typography>
              <hr/>
            </Typography>
          </CardContent>
        </Card>
        {/* ------------------ */}
        {/* ------------------ */}
        {/* ------------------ */}
        {/* ------------------ */}
        <Card sx={{ maxWidth: 500, mt: 2, borderRadius: 4}}>
          <CardContent sx={{textAlign: "center"}}>
            <Typography gutterBottom variant="h4" component="div">
              My subscription
            </Typography>
            <SubscriptionViz></SubscriptionViz>
          </CardContent>
           <CardActions>
            <Button size="small">Manage</Button>
            <Button size="small">Extend</Button>
          </CardActions>
        </Card>
    </Stack>
    <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
        <Card sx={{mt: 2, borderRadius: 4}}>
          <CardContent sx={{textAlign: "center"}}>
            <Typography gutterBottom variant="h4" component="div">
              Metrics
              <br /><small>Bandwidth</small>
            </Typography>
            <Bandwidth></Bandwidth>
          </CardContent>
        </Card>
    </Stack>
    </Box>
  );
};
export default Dashboard;
