import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../config';

/**
 * Centralized Axios instance for Indplay API
 */
const apiService = axios.create({
  baseURL: CONFIG.API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for detailed logging
apiService.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('--- Indplay Network Error ---');
    if (error.response) {
      const contentType = error.response.headers['content-type'] || '';
      
      // Handle Render warming up or standard HTML error pages
      if (contentType.includes('text/html') || error.response.status === 503 || error.response.status === 502) {
        error.message = 'Server is warming up, please try again in a few seconds.';
      } else if (error.response.data?.message) {
        error.message = error.response.data.message;
      }
      
      console.log('Response Error:', {
        status: error.response.status,
        data: contentType.includes('text/html') ? '[HTML Content]' : error.response.data,
      });
    } else if (error.request) {
      // Request was made but no response was received
      console.log('Request Error (No Response):', error.request);
    } else {
      // Something happened in setting up the request
      console.log('Setup Error:', error.message);
    }
    console.log('Message:', error.message);
    console.log('-----------------------------');
    return Promise.reject(error);
  }
);

// Interceptor for JWT
apiService.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('API Interceptor Error:', error);
  }
  return config;
});

export default apiService;
