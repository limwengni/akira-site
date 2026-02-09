export const SUB_ROLES = {
  UNCLASSIFIED: 0,
  PROTAGONIST: 1,
  ANTAGONIST: 2,
  DEUTERAGONIST: 3,
  SUPPORTING: 4,
  TRITAGONIST: 5,
  MINOR: 6,
} as const;

// Get main role 
export const getRoleLabel = (roleId: number) => {
  const roles: Record<number, string> = {
    0: "UNCLASSIFIED",
    1: "PROTAGONIST",
    2: "ANTAGONIST",
  };

  return roles[roleId] || "UNCLASSIFIED";
};

// Get sub role for profile page
const getSubRoleLabel = (roleId: number): string => {
  const roles: Record<number, string> = {
    [SUB_ROLES.UNCLASSIFIED]: "Unclassified",
    [SUB_ROLES.PROTAGONIST]: "Protagonist",
    [SUB_ROLES.ANTAGONIST]: "Antagonist",
    [SUB_ROLES.DEUTERAGONIST]: "Deuteragonist",
    [SUB_ROLES.SUPPORTING]: "Supporting",
    [SUB_ROLES.TRITAGONIST]: "Tritagonist",
    [SUB_ROLES.MINOR]: "Minor Character",
  };

  return roles[roleId] || "Unclassified";
};

export const getStatusLabel = (statusId: number) => {
  const roles: Record<number, string> = {
    0: "UNKNOWN",
    1: "ALIVE",
    2: "DECEASED",
  };

  return roles[statusId] || "UNKNOWN";
};
