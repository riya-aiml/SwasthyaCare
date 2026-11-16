/**
 * SwasthyaCare — Client API Gateway Configuration
 * Automatically supports both local proxying (/api) and production cloud URLs (VITE_API_URL)
 */

export const getApiBaseUrl = () => {
  const envUrl =
    import.meta.env?.VITE_API_URL ||
    import.meta.env?.VITE_BACKEND_URL ||
    import.meta.env?.VITE_SERVER_URL ||
    import.meta.env?.VITE_API_ENDPOINT;

  if (envUrl && envUrl.trim()) {
    // Strip trailing slashes and any trailing /api to avoid duplicate /api/api
    return envUrl.trim().replace(/\/+$/, '').replace(/\/api$/, '');
  }
  // In local development, use relative path so Vite proxy forwards /api to backend
  return '';
};
