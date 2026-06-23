import Constants from 'expo-constants';

const getBackendUrl = () => {
  // hostUri holds the IP address of the developer's computer hosting the Metro dev server (e.g. 192.168.1.15:8081)
  const host = Constants.expoConfig?.hostUri;
  if (host) {
    const ip = host.split(':')[0];
    return `http://${ip}:8000/api/v1`;
  }
  return 'http://localhost:8000/api/v1'; // Fallback for local simulators
};

export const API_URL = getBackendUrl();
console.log('[Varahi App] Resolved Backend API URL:', API_URL);
