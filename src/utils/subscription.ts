import { planLimits } from "../data/planLimits";
import type { PlanType, Subscription } from "../types";

export const getPlanLimits = (plan: PlanType) => planLimits[plan];
export const isNearLimit = (used: number, limit: number) => (limit > 0 ? used / limit >= 0.8 : false);
export const canUseAiImport = (subscription?: Subscription | null) => Boolean(subscription && subscription.aiImportsLimit > subscription.aiImportsUsed);
export const getUpgradeMessage = (feature: string) => `${feature} будет доступен после подключения оплаты.`;
export const getUsage = (state: { projects: { teamId: string }[]; members: { teamId: string }[]; contentItems: { teamId: string }[] }, teamId: string) => ({
  projects: state.projects.filter((x) => x.teamId === teamId).length,
  members: state.members.filter((x) => x.teamId === teamId).length,
  contentItems: state.contentItems.filter((x) => x.teamId === teamId).length,
});
