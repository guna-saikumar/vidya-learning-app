export type UserRole = 'STUDENT' | 'ADMIN';

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
}

export const hasRole = (user: AuthUser | null | undefined, role: UserRole): boolean =>
  !!user && user.role === role;
