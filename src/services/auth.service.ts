import { api } from './api';
import type { AuthResponse } from '../types/auth';

export const authService = {
  managerLogin: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/manager/login', { email, password });
    return response.data;
  },
  coManagerLogin: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/co-manager/login', { email, password });
    return response.data;
  },
  employeeLogin: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/employee/login', { email, password });
    return response.data;
  },
};
