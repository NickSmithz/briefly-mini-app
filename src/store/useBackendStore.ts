import { create } from "zustand";
import type { ContentItem, ImportDraft, Project, RoleMapping, Subscription, Task, Team, TeamMember } from "../types";
import type { BackendUser } from "../api/types";
import * as api from "../api/client";
import { getTelegramWebApp } from "../utils/telegram";
import { getBackendModeEnabled, setBackendModeEnabled } from "../utils/authMode";

type BackendState = {
  isBackendMode: boolean;
  isAuthenticated: boolean;
  token: string | null;
  user: BackendUser | null;
  team: Team | null;
  subscription: Subscription | null;
  projects: Project[];
  members: TeamMember[];
  roleMappings: RoleMapping[];
  contentItems: ContentItem[];
  tasks: Task[];
  importDrafts: ImportDraft[];
  isLoading: boolean;
  error: string | null;
  lastSuccessMessage: string | null;
  enableBackendMode: () => void;
  disableBackendMode: () => void;
  loginWithTelegram: () => Promise<void>;
  logoutBackend: () => void;
  loadWorkspace: () => Promise<void>;
  createProject: (data: Pick<Project, "name" | "description" | "color">) => Promise<Project>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  createMember: (data: Pick<TeamMember, "name" | "username" | "roleLabel" | "avatarEmoji">) => Promise<TeamMember>;
  updateMember: (id: string, data: Partial<TeamMember>) => Promise<void>;
  setRoleMapping: (data: Pick<RoleMapping, "projectId" | "role" | "memberId">) => Promise<void>;
  createImportDraft: (data: Pick<ImportDraft, "projectId" | "source" | "rawText" | "rows">) => Promise<ImportDraft>;
  updateImportDraft: (id: string, data: Partial<ImportDraft>) => Promise<void>;
  createContentItemsAndTasksFromImport: (data: { projectId: string; draft?: ImportDraft; items: Partial<ContentItem>[]; tasks: Partial<Task>[] }) => Promise<void>;
  createTask: (data: Partial<Task>) => Promise<Task>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  updateTaskStatus: (id: string, status: Task["status"]) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  updateContentItem: (id: string, data: Partial<ContentItem>) => Promise<void>;
  assignExistingTasksByRole: (projectId: string, overwrite?: boolean) => Promise<number>;
  clearSuccessMessage: () => void;
};

const initialBackendData = {
  user: null,
  team: null,
  subscription: null,
  projects: [],
  members: [],
  roleMappings: [],
  contentItems: [],
  tasks: [],
  importDrafts: [],
};

async function reloadLists() {
  const [projects, members, roleMappings, contentItems, tasks] = await Promise.all([
    api.getProjects(),
    api.getMembers(),
    api.getRoleMappings(),
    api.getContentItems(),
    api.getTasks(),
  ]);
  return { projects, members, roleMappings, contentItems, tasks };
}

export const useBackendStore = create<BackendState>()((set, get) => ({
  isBackendMode: getBackendModeEnabled(),
  isAuthenticated: Boolean(api.getBackendToken()),
  token: api.getBackendToken(),
  ...initialBackendData,
  isLoading: false,
  error: null,
  lastSuccessMessage: null,
  enableBackendMode: () => {
    setBackendModeEnabled(true);
    set({ isBackendMode: true });
  },
  disableBackendMode: () => {
    setBackendModeEnabled(false);
    set({ isBackendMode: false });
  },
  loginWithTelegram: async () => {
    set({ isLoading: true, error: null, isBackendMode: true });
    setBackendModeEnabled(true);
    try {
      const response = await api.authTelegram(getTelegramWebApp()?.initData ?? "");
      api.setBackendToken(response.token);
      set({ token: response.token, isAuthenticated: true, user: response.user, team: response.team });
      await get().loadWorkspace();
      set({ lastSuccessMessage: "Team sync mode включён" });
    } catch (cause) {
      set({ error: cause instanceof Error ? cause.message : "Backend login failed" });
    } finally {
      set({ isLoading: false });
    }
  },
  logoutBackend: () => {
    api.clearBackendToken();
    set({ token: null, isAuthenticated: false, ...initialBackendData });
  },
  loadWorkspace: async () => {
    if (!api.getBackendToken()) return;
    set({ isLoading: true, error: null });
    try {
      const current = await api.getCurrentTeam();
      const lists = await reloadLists();
      set({ ...lists, user: current.user, team: current.team, subscription: current.subscription, members: current.members.length ? current.members : lists.members, isAuthenticated: true, token: api.getBackendToken() });
    } catch (cause) {
      set({ error: cause instanceof Error ? cause.message : "Backend workspace load failed" });
    } finally {
      set({ isLoading: false });
    }
  },
  createProject: async (data) => {
    const project = await api.createProject(data);
    set((state) => ({ projects: [...state.projects, project], lastSuccessMessage: "Проект создан" }));
    return project;
  },
  updateProject: async (id, data) => {
    const project = await api.updateProject(id, data);
    set((state) => ({ projects: state.projects.map((item) => (item.id === id ? project : item)) }));
  },
  createMember: async (data) => {
    const member = await api.createMember(data);
    set((state) => ({ members: [...state.members, member], lastSuccessMessage: "Участник добавлен" }));
    return member;
  },
  updateMember: async (id, data) => {
    const member = await api.updateMember(id, data);
    set((state) => ({ members: state.members.map((item) => (item.id === id ? member : item)) }));
  },
  setRoleMapping: async (data) => {
    const mapping = await api.setRoleMapping(data);
    set((state) => ({ roleMappings: [...state.roleMappings.filter((item) => !(item.projectId === mapping.projectId && item.role === mapping.role)), mapping] }));
  },
  createImportDraft: async (data) => {
    const draft = await api.createImportDraft(data);
    set((state) => ({ importDrafts: [...state.importDrafts, draft] }));
    return draft;
  },
  updateImportDraft: async (id, data) => {
    const draft = await api.updateImportDraft(id, data);
    set((state) => ({ importDrafts: state.importDrafts.map((item) => (item.id === id ? draft : item)) }));
  },
  createContentItemsAndTasksFromImport: async ({ projectId, draft, items, tasks }) => {
    const contentItems = await api.createContentItemsBulk({ projectId, importDraftId: draft?.id, items });
    const contentByTitle = new Map(contentItems.map((item) => [item.title, item.id]));
    const createdTasks = tasks.length
      ? await api.createTasksBulk(tasks.map((task) => ({ ...task, contentItemId: task.contentItemId ?? contentByTitle.get(String(task.title ?? "")) })))
      : [];
    if (draft) await api.updateImportDraft(draft.id, { status: "confirmed" });
    set((state) => ({ contentItems: [...state.contentItems, ...contentItems], tasks: [...state.tasks, ...createdTasks], lastSuccessMessage: `Создано ${contentItems.length} публикаций и ${createdTasks.length} задач.` }));
  },
  createTask: async (data) => {
    const task = await api.createTask(data);
    set((state) => ({ tasks: [...state.tasks, task], lastSuccessMessage: "Задача создана" }));
    return task;
  },
  updateTask: async (id, data) => {
    const task = await api.updateTask(id, data);
    set((state) => ({ tasks: state.tasks.map((item) => (item.id === id ? task : item)), lastSuccessMessage: "Задача обновлена" }));
  },
  updateTaskStatus: async (id, status) => {
    await get().updateTask(id, { status });
  },
  deleteTask: async (id) => {
    await api.deleteTask(id);
    set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id), lastSuccessMessage: "Задача удалена" }));
  },
  updateContentItem: async (id, data) => {
    const item = await api.updateContentItem(id, data);
    set((state) => ({ contentItems: state.contentItems.map((contentItem) => (contentItem.id === id ? item : contentItem)) }));
  },
  assignExistingTasksByRole: async (projectId, overwrite) => {
    const result = await api.assignTasksByRoles(projectId, overwrite);
    const tasks = await api.getTasks();
    set({ tasks, lastSuccessMessage: `Назначено ${result.count} задач` });
    return result.count;
  },
  clearSuccessMessage: () => set({ lastSuccessMessage: null }),
}));
