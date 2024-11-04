import React from 'react';
import { Fab } from '@mui/material';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';

// Axios
import http from "../http.common";

const fabHeaderStyle = {
  borderRadius: "var(--wui-border-radius-3xl)",
  textTransform: "none",
  fontSize: "16px",
  color: "#fff",
  display: "flex",
  padding: "7px 12px 7px 8px",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  boxShadow: "none",
  gap: "8px",
  fontWeight: "bold",
  fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
  '&:hover': {
    backgroundColor: "rgba(255, 255, 255, 0.1)"
  }
};

const QuitButton: React.FC = () => {
  const handleQuit = async () => {
    try {
      await http.get('/quit');
      window.location.reload();
    } catch (error) {
      console.error('Error quitting:', error);
      alert('Failed to quit');
    }
  };

  return (
    <Fab
      sx={fabHeaderStyle}
      aria-label="quit"
      size="medium" 
      variant="extended" 
      color="inherit"
      onClick={handleQuit}
    >
      <PowerSettingsNewIcon />
      {/* Quit */}
    </Fab>
  );
};

export default QuitButton;