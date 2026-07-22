import axios from 'axios';
import { ENV } from '../env';
import { useAuthStore } from '../stores/authStore';

export const api = axios.create({
  baseURL: ENV.BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(ENV.TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isAuthRedirecting = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const path = window.location?.pathname ?? '';
    const isLoginRoute = path.startsWith('/login');

    if (status === 401 && !isLoginRoute && !isAuthRedirecting) {
      isAuthRedirecting = true;
      try {
        useAuthStore.getState().logout();
      } finally {
        window.location.replace('/login/employee');
      }
    }

    return Promise.reject(error);
  }
);
