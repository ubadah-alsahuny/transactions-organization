export type TransactionStep = {
  stepOrder: number;
  sectionId: string;
  sectionName: string;
  institutionName: string;
};

export type TransactionTemplateListItem = {
  id: string;
  institution_id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
};

export type TransactionTemplateDetails = {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  transactionSteps: TransactionStep[];
};

export type CreateTransactionTemplatePayload = {
  name: string;
  description: string;
  steps: string[];
};

export type ToggleTemplateResponse = {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
};
