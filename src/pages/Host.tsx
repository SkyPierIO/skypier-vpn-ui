import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

import LinkedInIcon from '@mui/icons-material/LinkedIn';
import XIcon from '@mui/icons-material/X';
import GitHubIcon from '@mui/icons-material/GitHub';

// Components 
import UtilityCard from "../components/UtilityCard";

const Host = () => {


  const c = () => {
    return(
      <>
        <Typography mb={1}>
          Node hosting is not available yet. 
        </Typography>
        <Typography mb={4}>
          We're working on providing the Skypier Node Host Kit as soon as possible. 
          Stay tuned to our socials to find out when you can become a member of the Skypier network and start earning rewards.
        </Typography>
        <Stack direction="row" spacing={2} sx={{justifyContent: "center"}}>
          <Button href="https://x.com/SkypierIO" target='blank' variant='outlined' startIcon={<XIcon />}>
            Twitter/X
          </Button>
          <Button href="https://github.com/SkypierIO" target='blank' variant='outlined' startIcon={<GitHubIcon />}>
            GitHub
          </Button>
          <Button href="https://www.linkedin.com/company/skypier/about/" target='blank' variant='outlined' startIcon={<LinkedInIcon />}>
            LinkedIn
          </Button>
        </Stack>
      </>
    );
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom color="text.primary">
        <UtilityCard title="📢 Stay tuned!" content={c()}></UtilityCard>
      </Typography>
    </div>
  );
};
export default Host;
