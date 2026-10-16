import { ADMIN_ROLE_VALUES, type AdminRole, type UserRole } from "./admin-schemas";

type RoleLike = {
  role: UserRole | string;
} & Record<string, unknown>;

/**
 * Returns true if the user has the specified role.
 */
export const hasRole = (
  user: RoleLike | null | undefined,
  role: UserRole
): boolean => {
  return !!user && user.role === role;
};

/**
 * Returns true if the user is a student.
 */
export const isStudent = (user: RoleLike | null | undefined): boolean => {
  return hasRole(user, "STUDENT");
};

/**
 * Returns true if the user is an admin (`ADMIN` or `SUPER_ADMIN`).
 */
export const isAdmin = (user: RoleLike | null | undefined): boolean => {
  return !!user && ADMIN_ROLE_VALUES.includes(user.role as AdminRole);
};

/**
 * Returns true if the user is a super admin.
 */
export const isSuperAdmin = (user: RoleLike | null | undefined): boolean => {
  return hasRole(user, "SUPER_ADMIN");
};
