import { planLimits } from "../data/planLimits";
import type { PlanType, Subscription } from "../types";

export function getPlanLimits(plan: PlanType) {
  return planLimits[plan];
}

export function getUsage(state: { projects: unknown[]; members: unknown[]; contentItems: unknown[] }, teamId: string) {
  const byTeam = (item: any) => item.teamId === teamId && !item.archived;
  return {
    projects: state.projects.filter(byTeam).length,
    members: state.members.filter(byTeam).length,
    contentItems: state.contentItems.filter(byTeam).length,
  };
}

export function isNearLimit(used: number, limit: number) {
  return limit > 0 && used >= limit * 0.8;
}

export function canUseAiImport(subscription?: Subscription | null) {
  return Boolean(subscription && subscription.aiImportsLimit > subscription.aiImportsUsed && subscription.plan !== "free");
}

export function getUpgradeMessage(feature: string) {
  return `${feature} появится после подключения оплаты и backend-лимитов.`;
}
