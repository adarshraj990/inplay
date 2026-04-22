import { useState, useEffect } from 'react';
import apiService from '../services/apiService';
import { CONFIG } from '../config';

export const useNotificationStats = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchStats = async () => {
    try {
      const response = await apiService.get('/social/notifications/stats');
      if (response.data.success) {
        setUnreadCount(response.data.data.total);
      }
    } catch (e) {
      console.error('Notification stats error:', e);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return unreadCount;
};
