export const categoryLabels: Record<string, string> = {
  All: "ALL",
  Unclassified: "UNCLASSIFIED",
  Protagonist: "ALLIES",
  Antagonist: "RIVALS",
};

// Get main role
export const ROLE_MAP: Record<number, string> = {
  0: "UNCLASSIFIED",
  1: "PROTAGONIST",
  2: "ANTAGONIST",
};

export const getRoleLabel = (roleId: number) => {
  return ROLE_MAP[roleId] || "UNCLASSIFIED";
};

export const SUB_ROLES_MAP: Record<number, string> = {
  0: "UNCLASSIFIED",
  1: "PROTAGONIST",
  2: "ANTAGONIST",
  3: "DEUTERAGONIST",
  4: "SUPPORTING",
  5: "TRITAGONIST",
  6: "MINOR",
};

// Get sub role for profile page
const getSubRoleLabel = (roleId: number): string => {
  return SUB_ROLES_MAP[roleId] || "UNCLASSIFIED";
};

export const STATUS_MAP: Record<number, string> = {
  0: "UNKNOWN",
  1: "ALIVE",
  2: "DECEASED",
  3: "REINCARNATED",
};

export const getStatusLabel = (statusId: number) => {
  return STATUS_MAP[statusId] || "UNKNOWN";
};

// Get gender
export const GENDER_MAP: Record<number, string> = {
  0: "UNSPECIFIED",
  1: "MALE",
  2: "FEMALE",
  3: "NON-BINARY",
  4: "OTHER"
};

