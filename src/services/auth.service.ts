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
  changePassword: async (
    role: 'manager' | 'co_manager' | 'employee',
    oldPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<void> => {
    const pathMap = {
      manager: '/manager/change-password',
      co_manager: '/co-manager/change-password',
      employee: '/employee/change-password',
    };
    const path = pathMap[role];
    await api.patch(path, { oldPassword, newPassword, confirmPassword });
  },
};
