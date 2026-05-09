import type { ContentItem, ImportDraft, Project, RoleMapping, Subscription, Task, Team, TeamMember } from "../types";

export type BackendUser = {
  id: string;
  telegramUserId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
};

export type AuthTelegramResponse = {
  token: string;
  user: BackendUser;
  team: Team;
};

export type CurrentTeamResponse = {
  user: BackendUser;
  team: Team;
  members: TeamMember[];
  subscription: Subscription;
};

export type WorkspaceSnapshot = {
  user: BackendUser | null;
  team: Team | null;
  subscription: Subscription | null;
  projects: Project[];
  members: TeamMember[];
  roleMappings: RoleMapping[];
  contentItems: ContentItem[];
  tasks: Task[];
  importDrafts: ImportDraft[];
};
