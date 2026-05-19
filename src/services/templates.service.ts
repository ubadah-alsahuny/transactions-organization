import { api } from './api';
import type { ApiResponse } from '../types/api.types';
import type {
  BulkIntialDataPayload,
  DeleteIntialDataKeyResponse,
  IntialDataKey,
  IntialDataKeyPayload,
  TemplateIntialDataResponse,
} from '../types/intialData.types';
import type {
  CreateTransactionTemplatePayload,
  ToggleTemplateResponse,
  TransactionTemplateDetails,
  TransactionTemplateListItem,
} from '../types/template.types';

export const templatesService = {
  createManagerTemplate: async (
    payload: CreateTransactionTemplatePayload
  ): Promise<ApiResponse<TransactionTemplateDetails>> => {
    const response = await api.post<ApiResponse<TransactionTemplateDetails>>(
      '/manager/transaction-templates',
      payload
    );
    return response.data;
  },
  listManagerTemplates: async (): Promise<ApiResponse<TransactionTemplateListItem[]>> => {
    const response = await api.get<ApiResponse<TransactionTemplateListItem[]>>(
      '/manager/transaction-templates'
    );
    return response.data;
  },
  getManagerTemplateById: async (id: string): Promise<ApiResponse<TransactionTemplateDetails>> => {
    const response = await api.get<ApiResponse<TransactionTemplateDetails>>(
      `/manager/transaction-templates/${id}`
    );
    return response.data;
  },
  toggleManagerTemplateActive: async (
    templateId: string
  ): Promise<ApiResponse<ToggleTemplateResponse>> => {
    const response = await api.put<ApiResponse<ToggleTemplateResponse>>(
      '/manager/transaction-templates/toggle-active',
      { templateId }
    );
    return response.data;
  },
  getRequiredIntialData: async (
    templateId: string
  ): Promise<ApiResponse<TemplateIntialDataResponse>> => {
    const response = await api.get<ApiResponse<TemplateIntialDataResponse>>(
      `/manager/transaction-templates/${templateId}/required-intial-data`
    );
    return response.data;
  },
  addIntialDataKey: async (
    templateId: string,
    payload: IntialDataKeyPayload
  ): Promise<ApiResponse<IntialDataKey>> => {
    const response = await api.post<ApiResponse<IntialDataKey>>(
      `/manager/transaction-templates/${templateId}/required-intial-data`,
      payload
    );
    return response.data;
  },
  bulkAddIntialDataKeys: async (
    templateId: string,
    payload: BulkIntialDataPayload
  ): Promise<ApiResponse<IntialDataKey[]>> => {
    const response = await api.post<ApiResponse<IntialDataKey[]>>(
      `/manager/transaction-templates/${templateId}/required-intial-data/bulk`,
      payload
    );
    return response.data;
  },
  updateIntialDataKey: async (
    keyId: string,
    payload: IntialDataKeyPayload
  ): Promise<ApiResponse<IntialDataKey>> => {
    const response = await api.put<ApiResponse<IntialDataKey>>(
      `/manager/transaction-templates/required-intial-data/${keyId}`,
      payload
    );
    return response.data;
  },
  toggleIntialDataKeyRequired: async (keyId: string): Promise<ApiResponse<IntialDataKey>> => {
    const response = await api.put<ApiResponse<IntialDataKey>>(
      `/manager/transaction-templates/required-intial-data/${keyId}/toggle-required`
    );
    return response.data;
  },
  deleteIntialDataKey: async (keyId: string): Promise<ApiResponse<DeleteIntialDataKeyResponse>> => {
    const response = await api.delete<ApiResponse<DeleteIntialDataKeyResponse>>(
      `/manager/transaction-templates/required-intial-data/${keyId}`
    );
    return response.data;
  },
};
