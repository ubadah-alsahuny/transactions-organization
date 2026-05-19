export type RequestStatus = 'in_progress' | 'completed' | 'rejected' | 'cancelled';
export type StepStatus = 'waiting' | 'in_progress' | 'completed' | 'rejected';

export type RunningRequestCitizen = {
  id: string;
  name: string;
};

export type RunningRequestLastProgress = {
  stepOrder: number;
  sectionId: string;
  sectionName: string;
  lastStepStatus: StepStatus;
  lastStepProcessedAt: string | null;
};

export type RunningRequestItem = {
  requestId: string;
  transactionName: string;
  citizen: RunningRequestCitizen;
  requestStatus: RequestStatus;
  lastProgress: RunningRequestLastProgress;
  createdAt: string;
  updatedAt: string;
};

export type RequestsPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  order: 'ASC' | 'DESC';
};

export type RunningRequestsResponse = {
  items: RunningRequestItem[];
  pagination: RequestsPagination;
};
