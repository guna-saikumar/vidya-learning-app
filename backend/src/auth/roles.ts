/** Roles that may use the API. Only students are issued tokens. */
export const USER_ROLE_VALUES = ["STUDENT"] as const;
export type UserRole = (typeof USER_ROLE_VALUES)[number];

type RoleLike = {
  role: UserRole | string;
} & Record<string, unknown>;

/** Returns true if the user has the specified role. */
export const hasRole = (
  user: RoleLike | null | undefined,
  role: UserRole
): boolean => {
  return !!user && user.role === role;
};

/** Returns true if the user is a student. */
export const isStudent = (user: RoleLike | null | undefined): boolean => {
  return hasRole(user, "STUDENT");
};

