import axios from "axios";

export const baseURL = "https://10.21.99.178:8000/";

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
