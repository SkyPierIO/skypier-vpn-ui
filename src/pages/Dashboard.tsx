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

// import VPNDataService from "../services/node.service"
import NodeDetails from "../components/NodeDetails"

const Dashboard = () => {

  // function retrieveNickname() {
  //   VPNDataService.getNickname()
  //     .then((response: any) => {
  //       this.setState({
  //         nickname: response.data
  //       });
  //       console.log(response.data);
  //     })
  //     .catch((e: Error) => {
  //       console.log(e);
  //     });
  // }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h2" gutterBottom>
          My node <span>{' '}</span><small style={{fontSize:"0.5em"}}>Dashboard</small>
      </Typography>
      <hr/>
      <Stack direction="row" spacing={2} sx={{ pt: 3}}>
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
              lorem ipsum
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
        <Card sx={{ maxWidth: 500, mt: 2, borderRadius: 4}}>
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              Metrics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <Chip  sx={{mt:2}} icon={<HistoryIcon />} label="Uptime"/>
              <Typography sx={{mb:1}} component="p">5d 14h 23min</Typography>
              <hr />
              <Chip  sx={{mt:2}} icon={<MemoryIcon />} label="Operating System"/>
              <Typography sx={{mb:1}} component="p">GNU Linux</Typography>
              <hr />
              <Chip  sx={{mt:2}} icon={<LocalOfferIcon />} label="Version"/>
              <Typography sx={{mt:1}} component="p">v0.0.1</Typography>
              <hr />
            </Typography>
          </CardContent>
          {/* <CardActions>
            <Button size="small">Details</Button>
            <Button size="small">Share</Button>
          </CardActions> */}
        </Card>
      </Stack>
    </Box>
  );
};
export default Dashboard;
