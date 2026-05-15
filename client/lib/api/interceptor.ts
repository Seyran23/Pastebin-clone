import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

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

let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) throw new Error('No refresh token');

  const res = await axios.post(`${API_BASE}/api/auth/refresh`, { refreshToken });
  const newToken: string = res.data?.accessToken ?? res.data?.data?.accessToken;
  if (!newToken) throw new Error('No access token in refresh response');

  localStorage.setItem(ACCESS_TOKEN_KEY, newToken);
  return newToken;
};

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }

        const newToken = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return await api(originalRequest);
      } catch {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          localStorage.removeItem('user');
        }
        return Promise.reject({ message: 'Session expired. Please log in again.', status: 401 });
      }
    }

    const data = error.response?.data;
    return Promise.reject({
      message: data?.message || 'Something went wrong!',
      errors: data?.errors || [],
    });
  },
);

export default api;
