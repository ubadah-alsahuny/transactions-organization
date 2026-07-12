import type { RequestStatus, StepStatus } from './request.types';

export type HistoryStatusFilter = Extract<RequestStatus, 'completed' | 'rejected'>;

export type RequestHistoryListItem = {
  requestId: string;
  transaction: {
    name: string;
  };
  citizen: {
    name: string;
  };
  requestStatus: HistoryStatusFilter;
  lastProgress: {
    stepOrder: number;
    sectionName: string;
    lastStepProcessedAt: string | null;
  };
  createdAt: string;
  updatedAt: string;
};

export type RequestHistoryPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  order: 'ASC' | 'DESC';
  statuses: HistoryStatusFilter[];
};

export type RequestHistoryListResponse = {
  items: RequestHistoryListItem[];
  pagination: RequestHistoryPagination;
};

export type RequestHistoryProcessorRole = 'employee' | 'co_manager' | 'manager';

export type RequestHistoryStep = {
  id: string;
  sectionId?: string;
  stepOrder: number;
  sectionName: string;
  institutionName: string;
  status: StepStatus;
  processedAt: string | null;
  processor: {
    name: string;
    email: string;
    role: RequestHistoryProcessorRole;
  };
  data: Record<string, any>;
};

export type RequestHistoryDetailsResponse = {
  request: {
    id: string;
    status: HistoryStatusFilter;
    currentStep: number;
    createdAt: string;
    updatedAt: string;
  };
  transaction: {
    name: string;
  };
  citizen: {
    name: string;
    nationalId: string;
  };
  steps: RequestHistoryStep[];
  cumulativeData: Record<string, any>;
  transactionHashes?: {
    initialDataHash: string;
    initialDataHashMatchesDatabase: boolean;
    lastBlockHash: string;
    previousBlockHash: string;
  };
};

