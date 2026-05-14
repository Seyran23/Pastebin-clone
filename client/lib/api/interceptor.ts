import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;
const ACCESS_TOKEN_KEY = 'accessToken';

const api = axios.create({
  baseURL: API_BASE + '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const data = error.response?.data;
    return Promise.reject({
      message: data?.message || 'Something went wrong!',
      errors: data?.errors || [],
    });
  },
);

export default api;
