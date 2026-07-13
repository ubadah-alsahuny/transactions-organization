export type VerificationCheck = {
  key: string;
  label: string;
  passed: boolean;
  severity: 'critical' | 'info';
  value: string | null;
};

export type VerificationIssue = {
  code: string;
  message: string;
  severity: 'critical' | 'info';
};

export type VerificationResult = {
  request: {
    id: string;
    transactionName: string;
    citizenName: string;
    institutionName: string;
    status: string;
  };
  chain: {
    isValid: boolean;
    proofEventsCount: number;
  };
  verification: {
    status: 'verified' | 'failed';
    checks: VerificationCheck[];
    issues: VerificationIssue[];
    allChecksPassed: boolean;
  };
};

export type VerificationResponse = {
  success: true;
  data: VerificationResult;
};
