import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Fab from '@mui/material/Fab';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import LocationOnIcon from '@mui/icons-material/LocationOn';


const fabStyle = {
  borderRadius: "var(--wui-border-radius-3xl)",
  textTransform: "none",
  fontSize: "16px",
  color: "#fff",
  display: "flex",
  padding: "7px 12px 7px 8px",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  backgroundColor:"rgba(255, 255, 255, 0.05)",
  boxShadow: "none",
  gap: "8px",
  fontWeight:"bold",
  fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
  '&:hover': {
    backgroundColor:"rgba(255, 255, 255, 0.1)"
  }
};

export default function NodeDetails() {
  const [currentIP, setCurrentIP] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const previousCountry = useRef<string>("");
  const isFirstLoad = useRef<boolean>(true);

  const IpAddr = async () => {
    try {
      const config = {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS"
        }
      };
      const response = await axios.get(`http://ip-api.com/json/?fields=country,query`, config);
      // console.log(response.status)
      if (response.status === 200) {
        if (response.data.query) {
          setCurrentIP(response.data.query);
        } 
        if (response.data.country) {
          const newCountry = response.data.country;
          
          // Check if country has changed and it's not the first load
          if (previousCountry.current && previousCountry.current !== newCountry && !isFirstLoad.current) {
            setNotificationMessage(`Location changed: ${previousCountry.current} → ${newCountry}`);
            setSnackbarOpen(true);
          }
          
          // Update the country and previous country
          previousCountry.current = newCountry;
          setCountry(newCountry);
          
          // Mark first load as complete
          if (isFirstLoad.current) {
            isFirstLoad.current = false;
          }
        } 
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  
  useEffect(() => {
    const interval = setInterval(() => {
      IpAddr()
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  IpAddr();
  return (
    <div>  
      <Fab onClick={() => IpAddr()} sx={fabStyle} size="medium" variant="extended">
          <LocationOnIcon></LocationOnIcon>
          {currentIP}{" - "}{country}
      </Fab>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="info"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notificationMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};