const rawServerUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
export const SERVER_URL = rawServerUrl.endsWith('/') ? rawServerUrl.slice(0, -1) : rawServerUrl;
export const API_URL = `${SERVER_URL}/api`;

