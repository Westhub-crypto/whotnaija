import axios from 'axios';

const adminApi = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 15000,
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('whotnaija_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('whotnaija_admin_token');
      window.location.href = '/masteradmin';
    }
    return Promise.reject(error);
  }
);

export default adminApi;
