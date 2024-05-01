import { BrowserRouter, Route, Routes, Link } from 'react-router-dom';

// MUI
import { styled } from '@mui/material/styles';
import { Container, Stack, Box, Typography, Paper} from "@mui/material";

// WAGMI
import { useAccount } from 'wagmi'

// COMPONENTS
import SkypierRouter from './SkypierRouter';


const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    flexGrow: 1,
    maxWidth: 550,
    minHeight: "20vh"
  }));

export default function Login() {

    const account = useAccount();

    return (
        <>
            {account.status === 'connected' ? <SkypierRouter/> : 
                <Container sx={{textAlign: 'center'}}>
                    <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    minHeight="90vh"
                    >
                        <Item> 
                            <Stack alignItems={"center"} gap={2} mt={4} mb={4}>
                                <img
                                    src="/logo.svg"
                                    alt="Skypier Logo"
                                    height="75"
                                />
                                <Typography variant='h6' mb={2}>
                                    Please connect your wallet to be able to use the app.
                                </Typography>
                                <w3m-button />
                            </Stack>
                        </Item>
                    </Box>
                </Container>        
            }
        </>
    );
}