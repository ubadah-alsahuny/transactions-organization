import { api } from './api';
import type { ApiResponse } from '../types/api.types';
import type { RunningRequestsResponse } from '../types/request.types';

export const requestsService = {
  listManagerRunningRequests: async (params: {
    page: number;
    limit: number;
    order: 'ASC' | 'DESC';
  }): Promise<ApiResponse<RunningRequestsResponse>> => {
    const response = await api.get<ApiResponse<RunningRequestsResponse>>('/manager/requests/running', {
      params,
    });
    return response.data;
  },
  listCoManagerRunningRequests: async (params: {
    page: number;
    limit: number;
    order: 'ASC' | 'DESC';
  }): Promise<ApiResponse<RunningRequestsResponse>> => {
    const response = await api.get<ApiResponse<RunningRequestsResponse>>('/co-manager/requests/running', {
      params,
    });
    return response.data;
  },

  listEmployeePendingRequests: async (params: {
    page?: number;
    limit?: number;
    order?: 'ASC' | 'DESC';
  }): Promise<ApiResponse<import('../types/request.types').EmployeePendingRequestsResponse>> => {
    const response = await api.get('/employee/requests/pending', { params });
    return response.data;
  },

  getEmployeeRequestDetails: async (
    requestId: string
  ): Promise<ApiResponse<import('../types/request.types').EmployeeRequestDetailsResponse>> => {
    const response = await api.get(`/employee/requests/${requestId}`);
    return response.data;
  },

  processEmployeeRequest: async (
    requestId: string,
    payload: import('../types/request.types').ProcessRequestPayload
  ): Promise<ApiResponse<any>> => {
    const response = await api.post(`/employee/requests/${requestId}/process`, payload);
    return response.data;
  },
};
