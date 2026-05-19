export type IntialDataKey = {
  id: string;
  templateId?: string;
  keyName: string;
  keyType: string;
  isRequired: boolean;
  createdAt: string;
};

export type TemplateIntialDataResponse = {
  templateId: string;
  templateName: string;
  keys: IntialDataKey[];
};

export type IntialKeyType = 'string' | 'number' | 'boolean' | 'date' | 'email' | 'phone';

export type IntialDataKeyPayload = {
  keyName: string;
  keyType: IntialKeyType;
  isRequired: boolean;
};

export type BulkIntialDataPayload = {
  items: IntialDataKeyPayload[];
};

export type DeleteIntialDataKeyResponse = {
  success: true;
  message: string;
};
