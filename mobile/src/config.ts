/**
 * Centralized configuration for API and Socket connections.
 */

// Use EXPO_PUBLIC_ prefix for variables to be available in the app
// Defaults to the production Render URL if not specified
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://indplay-backend-v3.onrender.com';

// Ensure the URL ends correctly for different uses
export const API_BASE_URL = BASE_URL.endsWith('/api/v1') ? BASE_URL : `${BASE_URL}/api/v1`;
export const SOCKET_URL = BASE_URL.replace('/api/v1', '');

export const CONFIG = {
  API_BASE_URL,
  SOCKET_URL,
  ENDPOINTS: {
    USER_PROFILE: `${API_BASE_URL}/users/me`,
    DAILY_REWARD: `${API_BASE_URL}/users/me/daily-reward`,
    REPORTS: `${API_BASE_URL}/reports`,
    ROOMS: `${API_BASE_URL}/rooms`,
    STATS: `${API_BASE_URL}/stats/overview`,
    FRIENDS: `${API_BASE_URL}/friends/list`,
    FRIENDS_PENDING: `${API_BASE_URL}/friends/pending`,
    FRIENDS_RESPOND: `${API_BASE_URL}/friends/respond`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    TASKS: `${API_BASE_URL}/rewards/tasks`,
  }
};
