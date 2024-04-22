import { useState, useEffect } from "react";
import axios from "axios";
import Fab from '@mui/material/Fab';
import LocationOnIcon from '@mui/icons-material/LocationOn';


const fabStyle = {
  borderRadius: "var(--wui-border-radius-3xl)",
  display: "flex",
  padding: "7px 12px 7px 8px",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  backgroundColor:"rgba(255, 255, 255, 0.05)",
  color: "color-mix( in srgb, #010101 40% , #e4e7e7 )",
  boxShadow: "none",
  gap: "8px",
  fontWeight:"bold",
  fontFamily: "Inter, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif",
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
      console.log(response.status)
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
      <Fab onClick={() => IpAddr()} sx={fabStyle} size="medium" aria-label="fff" color="primary" variant="extended">
          <LocationOnIcon></LocationOnIcon>
          {currentIP}{" - "}{country}
      </Fab>
    </div>
  );
};