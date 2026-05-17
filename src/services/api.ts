import axios from 'axios';
import { ENV } from '../env';

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
