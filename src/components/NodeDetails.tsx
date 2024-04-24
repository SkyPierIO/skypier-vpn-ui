import { useState } from "react";
import http from "../http.common";


export default function NodeDetails() {
  const [nickname, setNickname] = useState<string>("");

  const GetNickname = async () => {
    try {
      const response = await http.get(`/getConfig`);
      if (response.status === 200) {
        if (response.data.nickname) {
          setNickname(response.data.nickname);
        } 
      }
    } catch (error) {
      console.error(error);
    }
  };
  GetNickname();

  return (
    <>  
      {nickname}
    </>
  );
};