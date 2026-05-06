import type { PlanType, RoleKey, Subscription, Team, TeamMember, Project, RoleMapping } from "../types";
import { createId } from "../utils/ids";

export const makeDemoData = () => {
  const now = new Date().toISOString();
  const team: Team = { id: createId("team"), name: "Briefly Demo Team", createdAt: now, plan: "free" as PlanType };
  const project: Project = { id: createId("project"), teamId: team.id, name: "SKIN BURO", description: "Демо-проект контент-команды", color: "violet", createdAt: now };
  const defs: [string, RoleKey, string][] = [["Алина", "project_manager", "🧭"], ["Дима", "designer", "🎨"], ["Лена", "copywriter", "✍️"], ["Игорь", "reels_maker", "🎬"], ["Аня", "stories_maker", "📱"], ["Маша", "publisher", "🚀"]];
  const members: TeamMember[] = defs.map(([name, roleLabel, avatarEmoji]) => ({ id: createId("member"), teamId: team.id, name, roleLabel, avatarEmoji, createdAt: now }));
  const byName = (name: string) => members.find((m) => m.name === name)?.id ?? "";
  const map: [RoleKey, string][] = [["copywriter", "Лена"], ["designer", "Дима"], ["reels_maker", "Игорь"], ["stories_maker", "Аня"], ["publisher", "Маша"], ["reviewer", "Алина"], ["project_manager", "Алина"]];
  const roleMappings: RoleMapping[] = map.map(([role, who]) => ({ id: createId("rm"), teamId: team.id, projectId: project.id, role, memberId: byName(who) }));
  const subscription: Subscription = { id: createId("sub"), teamId: team.id, plan: "free", status: "trial", startedAt: now, aiImportsLimit: 0, aiImportsUsed: 0, projectsLimit: 3, membersLimit: 7, contentItemsLimit: 50 };
  return { team, project, members, roleMappings, subscription };
};
