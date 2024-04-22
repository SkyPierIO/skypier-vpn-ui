import { useState, useEffect } from "react";
import axios from "axios";


export default function NodeDetails() {
  const [country, setCountry] = useState<string>("");

  const IpAddr = async () => {
    try {
      const config = {
        headers: {
          "Content-type": "application/json"
        }
      };
      const response = await axios.get(`http://localhost:8081/api/v0/getConfig`, config);
      console.log(response.status)
      if (response.status === 200) {
        if (response.data.nickname) {
          setCountry(response.data.nickname);
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
    <>  
          {country}
    </>
  );
};