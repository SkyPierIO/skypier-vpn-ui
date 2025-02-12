import axios from "axios";

export default axios.create({
  baseURL: "http://127.0.0.1:8081/api/v0",
  headers: {
    "Content-type": "application/json"
  }
}); 