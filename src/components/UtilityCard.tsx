// MUI
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';


interface Props {
  title: any;
  content: any;
}

const UtilityCard = ({ title, content }: Props) => {
    const Item = styled(Paper)(({ theme }) => ({
      backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
      ...theme.typography.body2,
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
      flexGrow: 1,
      maxWidth: 550,
      minHeight: "20vh"
    }));

    return (
    <>
        <Container sx={{textAlign: 'center'}}>
          <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="90vh"
          >
            <Item> 
                <Stack alignItems={"center"} gap={2} mt={4} mb={4}>
                    <Typography variant='h4' mb={2}>
                      {title}
                    </Typography>
                    <Typography variant='body1' mb={1}>
                      {content}
                    </Typography>
                </Stack>
            </Item>
          </Box>
      </Container>  
    </>
  );
};

export default UtilityCard;
