/**
 * axiosInstance.js
 * Centralised Axios instance for all API calls.
 *
 * - baseURL points at the backend.
 * - withCredentials: true ensures cookies (better-auth session) are sent on
 *   every request so the backend can validate the session automatically.
 */
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true,          // send/receive session cookies cross-origin
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
