export type Role = 'manager' | 'co_manager' | 'employee';

export interface User {
  id: string;
  email: string;
  role: Role;
  token: string;
  institution?: { id: string; name: string };
  section?: { id: string; name: string };
}

export interface AuthResponse {
  success: boolean;
  data: User;
}
