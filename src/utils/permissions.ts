import type { Project, RoleMapping, TeamMember, TelegramUser } from "../types";

export function getProjectManagerMemberId(projectId: string, roleMappings: RoleMapping[]): string | undefined {
  return roleMappings.find((mapping) => mapping.projectId === projectId && mapping.role === "project_manager")?.memberId;
}

export function getCurrentMemberForProject(params: {
  project: Project;
  members: TeamMember[];
  roleMappings: RoleMapping[];
  telegramUser?: TelegramUser | null;
  viewerMemberId?: string;
}): TeamMember | null {
  const { project, members, roleMappings, telegramUser, viewerMemberId } = params;
  const teamMembers = members.filter((member) => member.teamId === project.teamId);

  if (viewerMemberId) {
    return teamMembers.find((member) => member.id === viewerMemberId) ?? null;
  }

  const username = telegramUser?.username?.toLowerCase();
  const telegramMatchedMember = username
    ? teamMembers.find((member) => member.username?.toLowerCase() === username)
    : null;
  if (telegramMatchedMember) return telegramMatchedMember;

  const projectManagerId = getProjectManagerMemberId(project.id, roleMappings);
  return teamMembers.find((member) => member.id === projectManagerId) ?? null;
}

export function canEditProjectTasks(params: {
  projectId: string;
  memberId?: string | null;
  roleMappings: RoleMapping[];
}): boolean {
  if (!params.memberId) return false;
  return getProjectManagerMemberId(params.projectId, params.roleMappings) === params.memberId;
}

export function isProjectManagerView(
  selectedMemberId: string | null,
  members: TeamMember[],
  roleMappings: RoleMapping[],
): boolean {
  if (!selectedMemberId || selectedMemberId === "all") return true;

  const member = members.find((item) => item.id === selectedMemberId);
  const roleLabel = member?.roleLabel.toLowerCase() ?? "";
  if (roleLabel.includes("project manager") || roleLabel.includes("руководитель") || roleLabel.includes("project")) {
    return true;
  }

  return roleMappings.some((mapping) => mapping.role === "project_manager" && mapping.memberId === selectedMemberId);
}
