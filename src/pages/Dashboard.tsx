import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';

// import VPNDataService from "../services/node.service"
import NodeDetails from "../components/NodeDetails"
import Bandwidth from '../components/Bandwidth';

const Dashboard = () => {

  return (
    <Container 
      maxWidth="xl" 
      sx={{ 
        width: '100%',
        px: { xs: 1, sm: 2, md: 3 },
        py: { xs: 2, sm: 3 }
      }}
    >
      <Typography 
        variant="h4" 
        gutterBottom 
        color="text.primary"
        sx={{
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
          mb: { xs: 2, sm: 3 }
        }}
      >
        My node <span>{' '}</span><small style={{fontSize:"0.5em"}}>Dashboard</small>
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: { xs: 2, sm: 3 } }} />
      
      <Grid container spacing={{ xs: 1, sm: 2, md: 2 }}>
        <NodeDetails />
      </Grid>
      
      <Grid container spacing={{ xs: 1, sm: 2, md: 2 }} sx={{ mt: { xs: 1, sm: 2 } }}>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <Card 
            sx={{
              borderRadius: 4,
              height: '100%'
            }} 
            className="disabled-overlay"
          >
            <CardContent sx={{ textAlign: "center" }}>
              <Typography 
                gutterBottom 
                variant="h4" 
                component="div"
                sx={{
                  fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2.125rem' }
                }}
              >
                Metrics
                <br /><small>Bandwidth</small>
              </Typography>
              <Bandwidth />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};
export default Dashboard;
