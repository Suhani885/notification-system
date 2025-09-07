import axios from "axios";

export const baseURL = "https://192.168.69.227:8000/";

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
