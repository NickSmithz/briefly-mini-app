import type { PlanType } from "../types";

export const planLimits: Record<PlanType, { projectsLimit: number; membersLimit: number; contentItemsLimit: number; aiImportsLimit: number }> = {
  free: { projectsLimit: 3, membersLimit: 7, contentItemsLimit: 50, aiImportsLimit: 0 },
  pro: { projectsLimit: 20, membersLimit: 20, contentItemsLimit: 1000, aiImportsLimit: 200 },
  agency: { projectsLimit: 100, membersLimit: 100, contentItemsLimit: 10000, aiImportsLimit: 2000 },
};
