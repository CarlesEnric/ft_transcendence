// API endpoint for user-service avatar upload
// Adjust DOMAIN as needed for your deployment
import { API_CONFIG } from './api';

export const USER_SERVICE = {
  AVATAR_UPLOAD: `https://${API_CONFIG.DOMAIN}/api/avatar`,
};
