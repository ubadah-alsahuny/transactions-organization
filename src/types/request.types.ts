export type RequestStatus = 'in_progress' | 'completed' | 'rejected' | 'cancelled';
export type StepStatus = 'waiting' | 'in_progress' | 'completed' | 'rejected' | 'approved';

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

// Employee Request Types
export type EmployeePendingRequestItem = {
  id: string;
  transaction_id: string;
  citizen_id: string;
  request_status: RequestStatus;
  current_step: number;
  created_at: string;
  updated_at: string;
  template_name: string;
  section_id: string;
  section_name: string;
  citizen_name: string;
  national_id: string;
};

export type EmployeePendingRequestsResponse = {
  items: EmployeePendingRequestItem[];
  pagination: RequestsPagination;
};

export type RequestStepData = Record<string, any>;

export type EmployeeRequestDetailsResponse = {
  request: {
    id: string;
    transactionId: string;
    transactionName: string;
    status: RequestStatus;
    currentStep: number;
    createdAt: string;
    citizen: {
      id: string;
      nationalId: string;
      name: string;
    };
    intialData: RequestStepData;
  };
  currentStep: {
    stepOrder: number;
    sectionId: string;
    sectionName: string;
  };
  previousSteps: {
    id: string;
    stepOrder: number;
    sectionId: string;
    sectionName: string;
    status: StepStatus;
    employeeId: string;
    employeeName: string;
    data: RequestStepData;
    processedAt: string;
  }[];
  requestStep: {
    id: string;
    status: StepStatus;
    data: RequestStepData | null;
    processedAt: string | null;
  };
};

export type ProcessRequestPayload = {
  status: 'approved' | 'rejected';
  data?: Record<string, any>;
};
