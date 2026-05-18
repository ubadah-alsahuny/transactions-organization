export interface Section {
  id: string;
  institution_id: string;
  name: string;
  description: string;
  is_active: boolean;
}

export interface SectionListItem extends Section {
  employees_count: number;
}
