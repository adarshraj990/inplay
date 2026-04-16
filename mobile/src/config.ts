/**
 * Centralized configuration for API and Socket connections.
 * 
 * IMPORTANT FOR APK BUILDS:
 * Replace 'localhost' with your computer's Local IP Address (e.g., '192.168.1.10')
 * to allow the APK to connect to your local backend.
 */

const IS_PRODUCTION = true; 
const PROD_URL = 'https://indplay-backend.onrender.com';
const DEV_IP = 'localhost'; 
const PORT = '5000'; // Updated to match backend change

export const API_BASE_URL = IS_PRODUCTION ? `${PROD_URL}/api/v1` : `http://${DEV_IP}:${PORT}/api/v1`;
export const SOCKET_URL = IS_PRODUCTION ? PROD_URL : `http://${DEV_IP}:${PORT}`;

export const CONFIG = {
  API_BASE_URL,
  SOCKET_URL,
  ENDPOINTS: {
    DAILY_REWARD: `${API_BASE_URL}/users/me/daily-reward`,
    REPORTS: `${API_BASE_URL}/reports`,
  }
};
