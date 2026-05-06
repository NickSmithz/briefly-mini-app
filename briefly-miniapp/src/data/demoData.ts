import type { Project, RoleKey, RoleMapping, Subscription, Team, TeamMember } from "../types";
import { createId } from "../utils/ids";

export function createDemoDataset() {
  const now = new Date().toISOString();
  const teamId = createId("team");
  const projectId = createId("project");
  const team: Team = { id: teamId, name: "Briefly Demo Team", createdAt: now, plan: "free" };
  const project: Project = { id: projectId, teamId, name: "SKIN BURO", description: "Демо-проект контент-команды", color: "violet", createdAt: now };
  const memberSeed: Array<[string, string, string, string]> = [
    ["Алина", "project manager", "🧭", "alina_pm"],
    ["Дима", "designer", "🎨", "dima_design"],
    ["Лена", "copywriter", "✍️", "lena_text"],
    ["Игорь", "reels maker", "🎬", "igor_reels"],
    ["Аня", "stories maker", "📱", "anya_stories"],
    ["Маша", "publisher", "🚀", "masha_pub"],
  ];
  const members: TeamMember[] = memberSeed.map(([name, roleLabel, avatarEmoji, username]) => ({
    id: createId("member"),
    teamId,
    name,
    username,
    roleLabel,
    avatarEmoji,
    createdAt: now,
  }));
  const find = (name: string) => members.find((member) => member.name === name)?.id ?? members[0].id;
  const roleMap: Record<RoleKey, string> = {
    copywriter: find("Лена"),
    designer: find("Дима"),
    reels_maker: find("Игорь"),
    stories_maker: find("Аня"),
    publisher: find("Маша"),
    reviewer: find("Алина"),
    project_manager: find("Алина"),
    other: find("Алина"),
  };
  const roleMappings: RoleMapping[] = Object.entries(roleMap).map(([role, memberId]) => ({
    id: createId("rolemap"),
    teamId,
    projectId,
    role: role as RoleKey,
    memberId,
  }));
  const subscription: Subscription = {
    id: createId("sub"),
    teamId,
    plan: "free",
    status: "trial",
    startedAt: now,
    aiImportsLimit: 0,
    aiImportsUsed: 0,
    projectsLimit: 3,
    membersLimit: 7,
    contentItemsLimit: 50,
  };
  return { team, project, members, roleMappings, subscription };
}
