export type UserRole = 'ADMIN' | 'SUPER_ADMIN';

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: string;
  avatarUrl?: string;
  department?: string;
  lastLogin?: string;
}

export interface AdminSession {
  user: AdminUser;
  token: string;
  expiresAt: number;
}

