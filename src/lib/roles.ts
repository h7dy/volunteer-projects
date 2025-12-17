export const ROLES = {
  ADMIN: "admin",
  LEAD: "lead",
  VOLUNTEER: "volunteer",
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];