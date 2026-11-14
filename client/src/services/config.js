/**
 * SwasthyaCare — Client API Gateway Configuration
 * Automatically supports both local proxying (/api) and production cloud URLs (VITE_API_URL)
 */

export const getApiBaseUrl = () => {
  const envUrl = import.meta.env?.VITE_API_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/$/, '');
  }
  return '';
};
