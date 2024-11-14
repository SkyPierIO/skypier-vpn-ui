import React, { useState } from 'react';
import { Fab, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
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
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleConfirmQuit = async () => {
    try {
      await http.get('/quit');
      window.location.href = '/Goodbye'; // Redirect to /Goodbye route
      // sleep 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));
      window.location.reload();
    } catch (error) {
      console.error('Error quitting:', error);
      alert('Failed to quit');
    }
  };

  return (
    <>
      <Fab
        sx={fabHeaderStyle}
        aria-label="quit"
        size="medium"
        variant="extended"
        color="inherit"
        onClick={handleClickOpen}
      >
        <PowerSettingsNewIcon />
        {/* Quit */}
      </Fab>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Quit Skypier"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to quit (and disconnect) Skypier VPN?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmQuit} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default QuitButton;