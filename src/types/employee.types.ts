export type EmployeesPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type EmployeeListItem = {
  user_id: string;
  institution_id: string;
  email: string;
  full_name: string;
  hired_at: string;
  is_active: boolean;
  section_id: string | null;
  section_name: string | null;
};

export type EmployeeListAllResponse = {
  items: EmployeeListItem[];
  pagination: EmployeesPagination;
};

export type EmployeeRecord = {
  userId: string;
  institutionId: string;
  sectionId?: string;
  fullName: string;
  email: string;
  hiredAt: string;
  assignedAt?: string;
  isActive: boolean;
};

export type EmployeeCreatePayload = {
  institutionId: string;
  fullName: string;
  email: string;
  password: string;
};

export type EmployeeHireToSectionPayload = {
  institutionId: string;
  sectionId: string;
  fullName: string;
  email: string;
  password: string;
};

export type TransitionEmployeeResponse = {
  employee: { id: string; name: string };
  section: { id: string; name: string };
  message: string;
};

export type FireEmployeeResponse = {
  employee: { id: string; name: string };
  previousSection: { id: string; name: string };
  message: string;
};
