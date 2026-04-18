import axios from "axios";

const baseURL = import.meta.env.VITE_STRAPI_API_URL
  ? import.meta.env.VITE_STRAPI_API_URL.replace(/\/$/, "")
  : "http://localhost:1337";

const api = axios.create({
  baseURL,
});

export default api;