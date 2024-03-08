import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import InputBase from '@mui/material/InputBase';
import Stack from '@mui/material/Stack';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';


import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';



const wipPeers =  [
  "12D3KooWSSqLegz7hpzhmcYLrJw77rzUbqS6hBpsoW2s1L2svHgu",
  "12D3KooWSXwxjHK4WJcHVGwL2FpRS8RxuGJisD7YudpVsV9GrApM",
  "12D3KooW9xuJVGEV83LqpPtBR88J98jFGqZW9ENbNBn9Cp4MzUwn",
  "12D3KooWHHX4hXvfUuWk7cLB4utqZSVsXicGvJxUq9MTDNkFNpvT",
  "12D3KooWL4PfMzJJmgaj2WJ7XTTg2H2yLPFuP82tMiqcb7iPh8oC",
  "12D3KooWHH65yRa5H6Fr8HuQrtGs3GR69TUnJujMymo8qaEp6Xw8",
  "12D3KooWHnKKoxfuVX9b9o3cPxjLtpmXM8ekZH2nKZPqSvUL2yyR",
  "12D3KooWFF3swE8mqgdmgiNuFU4rZRwgtoJMM3U2hJ3p86YYvhLS",
  "12D3KooWRSpZjhQdHrm1XATwvkbDq6VbTWQLw92uqNgmZ3kta4MK",
  "12D3KooWNMcnoQynAY9hyi4JxzSu64BsRGcJ9z7vKghqk8sTrpqY",
  "12D3KooWBuuuit5dsuAPCmEDRN3ToY1Jr4EsVvpWUTkhrhn6WUos",
  "12D3KooWL9hrTZiQxazk5Fy1rcbjdJY98EC1hjqujG9F1Bas9sWf",
  "12D3KooWFmnnKPV7vYzBqGWEDn7v6KftQYGH7YznJhcV5xfFz6ZK",
  "12D3KooWSwwoegRXz2uKMZgwE1wuhuZrYFf5HJHHQ8XAeGfCHDZF",
]

const Peers = () => {

  return (
    <div>
      <Stack direction={"row"}>
        <h1>Peers</h1>
        <Paper
          component="form"
          sx={{ p: '2px 4px', ml: 3, display: 'flex', alignItems: 'center', width: 400 }}
        >
            <IconButton sx={{ p: '10px' }} aria-label="menu">
              <FilterAltIcon />
            </IconButton>
            <Divider></Divider>
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="Search for peers"
              inputProps={{ 'aria-label': 'search for peers' }}
            />
            <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
              <SearchIcon />
            </IconButton>
        </Paper>
      </Stack>
      <br />
      <Box sx={{ display: 'flex', flexWrap: "wrap", pb: 2 }}>
          {wipPeers.map((text, index) => (
            <Card sx={{ display: 'flex', m:1  }}>
              <CardMedia
                component="img"
                sx={{ width: 95, height: 95 }}
                image={"http://api.dicebear.com/7.x/identicon/svg?seed="+text }
                alt="Icon"
              />
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: '1 0 auto' }}>
                  <Typography component="p">
                    Peer <span style={{color:"#5df", fontFamily: "monospace"}}>{text.substring(0, 3)}...{text.slice(-5)}</span>
                  </Typography>
                  <Stack direction={"row"} sx={{mt:1}}>
                    <Typography component="p">
                      <Chip  sx={{mr:1}} label="• Online" color="success" size="small" variant="outlined"/>
                      <Chip  sx={{mr:1}} icon={<ElectricalServicesIcon />} label="Connect" size="small" variant="outlined" />
                    </Typography>
                  </Stack>
                </CardContent>
              </Box>
            </Card>
          ))}
      </Box>
    </div>
  );
};
export default Peers;
