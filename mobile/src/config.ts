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
    USER_PROFILE: `${BASE_URL}/api/users/me`,
    PROFILE_UPDATE: `${BASE_URL}/api/users/me`,
    DAILY_REWARD: `${BASE_URL}/api/users/me/daily-reward`,
    REPORTS: `${BASE_URL}/api/reports`,
    ROOMS: `${BASE_URL}/api/v1/rooms`,
    STATS: `${BASE_URL}/api/v1/stats/overview`,
    SOCIAL: {
      FRIENDS: `${BASE_URL}/api/social/friends`,
      REQUESTS: `${BASE_URL}/api/social/friends/requests`,
      RESPOND: `${BASE_URL}/api/social/friends/respond`,
      SEND_REQUEST: `${BASE_URL}/api/social/friends/request`,
      NOTIFICATIONS: `${BASE_URL}/api/social/notifications/stats`,
    },
    LOGIN: `${BASE_URL}/api/auth/login`,
    REGISTER: `${BASE_URL}/api/auth/register`,
    TASKS: `${BASE_URL}/api/rewards/tasks`,
  }
};
