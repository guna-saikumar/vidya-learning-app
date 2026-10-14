import { type UserRole } from "./types";

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
 * Returns true if the user is an admin.
 */
export const isAdmin = (user: RoleLike | null | undefined): boolean => {
  return hasRole(user, "ADMIN");
};
