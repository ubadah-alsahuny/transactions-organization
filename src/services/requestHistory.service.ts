import { api } from './api';
import type { ApiResponse } from '../types/api.types';
import type {
  HistoryStatusFilter,
  RequestHistoryDetailsResponse,
  RequestHistoryListResponse,
} from '../types/requestHistory.types';

export const requestHistoryService = {
  listManagerHistory: async (params: {
    status: HistoryStatusFilter;
    page: number;
    limit: number;
    order: 'ASC' | 'DESC';
  }): Promise<ApiResponse<RequestHistoryListResponse>> => {
    const response = await api.get<ApiResponse<RequestHistoryListResponse>>('/manager/requests/history', {
      params,
    });
    return response.data;
  },
  getManagerHistoryDetails: async (
    requestId: string
  ): Promise<ApiResponse<RequestHistoryDetailsResponse>> => {
    const response = await api.get<ApiResponse<RequestHistoryDetailsResponse>>(
      `/manager/requests/history/${requestId}`
    );
    return response.data;
  },
  listCoManagerHistory: async (params: {
    status: HistoryStatusFilter;
    page: number;
    limit: number;
    order: 'ASC' | 'DESC';
  }): Promise<ApiResponse<RequestHistoryListResponse>> => {
    const response = await api.get<ApiResponse<RequestHistoryListResponse>>('/co-manager/requests/history', {
      params,
    });
    return response.data;
  },
  getCoManagerHistoryDetails: async (
    requestId: string
  ): Promise<ApiResponse<RequestHistoryDetailsResponse>> => {
    const response = await api.get<ApiResponse<RequestHistoryDetailsResponse>>(
      `/co-manager/requests/history/${requestId}`
    );
    return response.data;
  },
  getExternalCoManagerHistoryDetails: async (
    requestId: string,
    queryParams: { citizenNationalId?: string; transactionId?: string }
  ): Promise<ApiResponse<RequestHistoryDetailsResponse>> => {
    const response = await api.get<ApiResponse<RequestHistoryDetailsResponse>>(
      `/co-manager/requests/history/external/${requestId}`,
      { params: queryParams }
    );
    return response.data;
  },
  getExternalEmployeeHistoryDetails: async (
    requestId: string,
    queryParams: { citizenNationalId?: string; transactionId?: string }
  ): Promise<ApiResponse<RequestHistoryDetailsResponse>> => {
    const response = await api.get<ApiResponse<RequestHistoryDetailsResponse>>(
      `/employee/requests/history/external/${requestId}`,
      { params: queryParams }
    );
    return response.data;
  },
};

