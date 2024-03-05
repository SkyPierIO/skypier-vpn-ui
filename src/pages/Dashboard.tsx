import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';

const Dashboard = () => {

  return (
    <Box sx={{ width: '100%', maxWidth: 500 }}>
      <Typography variant="h2" gutterBottom>
          My node <span>{' '}</span><small style={{fontSize:"0.5em"}}>Dashboard</small>
      </Typography>
      Hello
      <hr/>
      <Card sx={{ maxWidth: 345 }}>
        <CardMedia
          sx={{ height: 140 }}
          image="https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          title="background"
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            Stats
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
    </Box>
  );
};
export default Dashboard;
