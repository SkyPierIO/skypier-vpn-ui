import { useState, useEffect } from "react";
import axios from "axios";
import Fab from '@mui/material/Fab';
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
          setCountry(response.data.country);
        } 
      }
    } catch (error) {
      console.error(error);
    }
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
    </div>
  );
};