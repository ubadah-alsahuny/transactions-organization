export type InstitutionStatus = 'active' | 'inactive';

export type InstitutionListItem = {
  id: string;
  name: string;
  status: InstitutionStatus;
  sectionsCount: number;
};

export type InstitutionsPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type InstitutionsListResponse = {
  items: InstitutionListItem[];
  pagination: InstitutionsPagination;
};
