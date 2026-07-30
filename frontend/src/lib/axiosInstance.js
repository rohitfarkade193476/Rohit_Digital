
import axios from 'axios';

// Vite inlines this at build time; the fallback covers local dev where no
// .env is present and the backend runs on its default port.
const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,          // send/receive session cookies cross-origin
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
