import React from 'react';
import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { Fab } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

export default function ConnectWalletButton({ header }: { header?: boolean }) {
  const { isConnected, address } = useAccount();
  const { open } = useAppKit();

  const handleClick = () => {
    open();
  };

  const label = isConnected 
    ? `${address?.slice(0, 6)}...${address?.slice(-4)}`
    : "Connect Wallet";

  return (
    <Fab
      sx={{
        borderRadius: "1000px",
        textTransform: "none",
        fontSize: "16px",
        display: "flex",
        padding: "7px 16px",
        border: "1px solid",
        borderColor: (theme) => (header || theme.palette.mode === 'dark') ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        backgroundColor: (theme) => (header || theme.palette.mode === 'dark') ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
        color: (theme) => (header || theme.palette.mode === 'dark') ? "#fff" : theme.palette.text.primary,
        boxShadow: "none",
        gap: "8px",
        fontWeight: "bold",
        fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
        '&:hover': {
          backgroundColor: (theme) => (header || theme.palette.mode === 'dark') ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        }
      }}
      onClick={handleClick}
      size="medium"
      variant="extended"
      color="inherit"
    >
      <AccountBalanceWalletIcon fontSize="small" />
      {label}
    </Fab>
  );
}
