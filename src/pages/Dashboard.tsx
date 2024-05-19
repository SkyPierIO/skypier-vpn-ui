import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';

// import VPNDataService from "../services/node.service"
import NodeDetails from "../components/NodeDetails"
import Bandwidth from '../components/Bandwidth';

const Dashboard = () => {

  return (
    <Box sx={{ width: '100%'}}>
      <Typography variant="h4" gutterBottom color="text.primary">
          My node <span>{' '}</span><small style={{fontSize:"0.5em"}}>Dashboard</small>
      </Typography>
      <hr/>
      <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
        <NodeDetails></NodeDetails>
      </Stack>
      <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
          <Card sx={{mt: 2, borderRadius: 4}} className="disabled-overlay">
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
