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
};
