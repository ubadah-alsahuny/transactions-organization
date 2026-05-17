import { api } from './api';
import type { ApiResponse, Section, SectionListItem } from '../types/section.types';

export const sectionsService = {
  listManagerSections: async (params?: {
    include_inactive?: boolean;
    institution_id?: string;
  }): Promise<ApiResponse<SectionListItem[]>> => {
    const response = await api.get<ApiResponse<SectionListItem[]>>('/manager/sections', { params });
    return response.data;
  },
  getManagerSectionById: async (id: string): Promise<ApiResponse<Section>> => {
    const response = await api.get<ApiResponse<Section>>(`/manager/sections/${id}`);
    return response.data;
  },
  createManagerSection: async (payload: {
    name: string;
    description: string;
  }): Promise<ApiResponse<Section>> => {
    const response = await api.post<ApiResponse<Section>>('/manager/sections', payload);
    return response.data;
  },
  updateManagerSection: async (
    id: string,
    payload: { name?: string; description?: string; is_active?: true }
  ): Promise<ApiResponse<Section>> => {
    const response = await api.put<ApiResponse<Section>>(`/manager/sections/${id}`, payload);
    return response.data;
  },
  deactivateManagerSection: async (id: string): Promise<ApiResponse<Section>> => {
    const response = await api.delete<ApiResponse<Section>>(`/manager/sections/${id}`);
    return response.data;
  },
};
