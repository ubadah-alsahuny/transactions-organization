import { api } from './api';
import type { ApiResponse } from '../types/api.types';
import type { InstitutionsListResponse } from '../types/institution.types';

export const institutionService = {
  listManagerInstitutions: async (params: {
    page: number;
    limit: number;
  }): Promise<ApiResponse<InstitutionsListResponse>> => {
    const response = await api.get<ApiResponse<InstitutionsListResponse>>('/manager/institutions', {
      params,
    });
    return response.data;
  },
};
