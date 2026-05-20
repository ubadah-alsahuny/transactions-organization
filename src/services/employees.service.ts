import { api } from './api';
import type { ApiResponse } from '../types/api.types';
import type {
  EmployeeCreatePayload,
  EmployeeHireToSectionPayload,
  EmployeeListAllResponse,
  EmployeeRecord,
  FireEmployeeResponse,
  TransitionEmployeeResponse,
  EmployeeProfile,
} from '../types/employee.types';

export const employeesService = {
  addEmployee: async (payload: EmployeeCreatePayload): Promise<ApiResponse<EmployeeRecord>> => {
    const response = await api.post<ApiResponse<EmployeeRecord>>('/manager/employees', payload);
    return response.data;
  },
  hireToSection: async (payload: EmployeeHireToSectionPayload): Promise<ApiResponse<EmployeeRecord>> => {
    const response = await api.post<ApiResponse<EmployeeRecord>>('/manager/employees/hire-to-section', payload);
    return response.data;
  },
  assignToSection: async (payload: { sectionId: string; employeeId: string }): Promise<ApiResponse<EmployeeRecord>> => {
    const response = await api.post<ApiResponse<EmployeeRecord>>('/manager/employees/assign-to-section', payload);
    return response.data;
  },
  listAllEmployees: async (params: { page: number; limit: number }): Promise<ApiResponse<EmployeeListAllResponse>> => {
    const response = await api.get<ApiResponse<EmployeeListAllResponse>>('/manager/employees/all', { params });
    return response.data;
  },
  transitionToSection: async (payload: { employeeId: string; sectionId: string }): Promise<ApiResponse<TransitionEmployeeResponse>> => {
    const response = await api.put<ApiResponse<TransitionEmployeeResponse>>('/manager/employees/transition-to-section', payload);
    return response.data;
  },
  fireFromSection: async (payload: { employeeId: string }): Promise<ApiResponse<FireEmployeeResponse>> => {
    const response = await api.delete<ApiResponse<FireEmployeeResponse>>('/manager/employees/fire-from-section', { data: payload });
    return response.data;
  },
  getEmployeeProfile: async (): Promise<ApiResponse<EmployeeProfile>> => {
    const response = await api.get<ApiResponse<EmployeeProfile>>('/employee/me');
    return response.data;
  },
};
