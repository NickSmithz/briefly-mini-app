export const planLimits = {
  free: { projectsLimit: 3, membersLimit: 7, contentItemsLimit: 50, aiImportsLimit: 0 },
  pro: { projectsLimit: 20, membersLimit: 20, contentItemsLimit: 1000, aiImportsLimit: 200 },
  agency: { projectsLimit: 100, membersLimit: 100, contentItemsLimit: 10000, aiImportsLimit: 2000 },
} as const;
