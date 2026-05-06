import { create } from "zustand";
import { persist } from "zustand/middleware";
import { defaultTemplates } from "../data/defaultTemplates";
import { createDemoDataset } from "../data/demoData";
import type {
  AppTab,
  ContentItem,
  ContentStatus,
  ImportDraft,
  ImportedPlanRow,
  ImportSource,
  ProjectMemoryItem,
  Project,
  RoleKey,
  RoleMapping,
  Subscription,
  Task,
  TaskGenerationMode,
  TaskStatus,
  Team,
  TeamMember,
  TelegramUser,
} from "../types";
import { createId } from "../utils/ids";
import { parsePlanText } from "../utils/importParser";
import { createMemoryItemFromContentItem, findSimilarContentItems } from "../utils/projectMemory";
import { generateTasksForContentItem } from "../utils/taskGenerator";
import { getTelegramUser, hapticFeedback } from "../utils/telegram";
import { getUsage } from "../utils/subscription";

type AppState = {
  telegramUser: TelegramUser | null;
  onboardingCompleted: boolean;
  teams: Team[];
  activeTeamId: string | null;
  subscriptions: Subscription[];
  projects: Project[];
  members: TeamMember[];
  roleMappings: RoleMapping[];
  contentItems: ContentItem[];
  projectMemoryItems: ProjectMemoryItem[];
  tasks: Task[];
  importDrafts: ImportDraft[];
  activeImportDraftId: string | null;
  selectedProjectId: string | null;
  activeTab: AppTab;
  lastSuccessMessage: string | null;
  initializeApp: () => void;
  completeOnboarding: () => void;
  createDemoData: () => void;
  resetAllData: () => void;
  resetOnboarding: () => void;
  setActiveTab: (tab: AppTab) => void;
  setActiveTeam: (teamId: string) => void;
  setSelectedProject: (projectId: string | null) => void;
  addProject: (project: Omit<Project, "id" | "teamId" | "createdAt">) => void;
  updateProject: (projectId: string, patch: Partial<Project>) => void;
  archiveProject: (projectId: string) => void;
  addMember: (member: Omit<TeamMember, "id" | "teamId" | "createdAt">) => void;
  updateMember: (memberId: string, patch: Partial<TeamMember>) => void;
  removeMember: (memberId: string) => void;
  setRoleMapping: (projectId: string, role: RoleKey, memberId: string) => void;
  parseImportText: (projectId: string, text: string) => string;
  createImportDraft: (projectId: string, source: ImportSource, rawText: string, rows: ImportedPlanRow[]) => string;
  setActiveImportDraft: (draftId: string) => void;
  updateImportDraftRow: (rowId: string, patch: Partial<ImportedPlanRow>) => void;
  deleteImportDraftRow: (rowId: string) => void;
  clearImportDraftRows: () => void;
  addImportDraftRow: () => void;
  discardImportDraft: (draftId: string) => void;
  createContentPlanFromDraft: (generationMode: TaskGenerationMode) => { contentCount: number; taskCount: number };
  addContentItem: (contentItem: ContentItem) => void;
  updateContentItem: (id: string, patch: Partial<ContentItem>) => void;
  deleteContentItem: (id: string) => void;
  addTask: (task: Task) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  updateTask: (taskId: string, patch: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  clearSuccessMessage: () => void;
};

const initialData = {
  telegramUser: null,
  onboardingCompleted: false,
  teams: [],
  activeTeamId: null,
  subscriptions: [],
  projects: [],
  members: [],
  roleMappings: [],
  contentItems: [],
  projectMemoryItems: [],
  tasks: [],
  importDrafts: [],
  activeImportDraftId: null,
  selectedProjectId: null,
  activeTab: "home" as AppTab,
  lastSuccessMessage: null,
};

function validateRow(row: ImportedPlanRow, existingContentItems: ContentItem[] = []): ImportedPlanRow {
  const errors: string[] = [];
  const warnings = row.format === "other" ? ["Формат не распознан"] : [];
  if (!row.publishDate) errors.push("Дата не распознана");
  if (!row.title.trim()) errors.push("Название не заполнено");
  const normalizedRow = { ...row, title: row.title.trim(), errors, warnings, isValid: errors.length === 0 };
  return { ...normalizedRow, memoryWarnings: findSimilarContentItems(normalizedRow, existingContentItems) };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialData,
      initializeApp: () => set({ telegramUser: getTelegramUser() }),
      completeOnboarding: () => {
        get().createDemoData();
        set({ onboardingCompleted: true, activeTab: "home" });
      },
      createDemoData: () => {
        const demo = createDemoDataset();
        set({
          teams: [demo.team],
          activeTeamId: demo.team.id,
          subscriptions: [demo.subscription],
          projects: [demo.project],
          selectedProjectId: demo.project.id,
          members: demo.members,
          roleMappings: demo.roleMappings,
          contentItems: [],
          projectMemoryItems: [],
          tasks: [],
          importDrafts: [],
          activeImportDraftId: null,
          lastSuccessMessage: "Демо-команда создана",
        });
      },
      resetAllData: () => set({ ...initialData, telegramUser: getTelegramUser() }),
      resetOnboarding: () => set({ onboardingCompleted: false, activeTab: "home" }),
      setActiveTab: (activeTab) => set({ activeTab }),
      setActiveTeam: (activeTeamId) => set({ activeTeamId }),
      setSelectedProject: (selectedProjectId) => set({ selectedProjectId }),
      addProject: (project) => {
        const teamId = get().activeTeamId;
        if (!teamId) return;
        const newProject: Project = { ...project, id: createId("project"), teamId, createdAt: new Date().toISOString() };
        set((state) => ({ projects: [...state.projects, newProject], selectedProjectId: newProject.id }));
      },
      updateProject: (projectId, patch) => set((state) => ({ projects: state.projects.map((project) => (project.id === projectId ? { ...project, ...patch } : project)) })),
      archiveProject: (projectId) => set((state) => ({ projects: state.projects.map((project) => (project.id === projectId ? { ...project, archived: true } : project)) })),
      addMember: (member) => {
        const teamId = get().activeTeamId;
        if (!teamId) return;
        set((state) => ({ members: [...state.members, { ...member, id: createId("member"), teamId, createdAt: new Date().toISOString() }] }));
      },
      updateMember: (memberId, patch) => set((state) => ({ members: state.members.map((member) => (member.id === memberId ? { ...member, ...patch } : member)) })),
      removeMember: (memberId) => set((state) => ({
        members: state.members.filter((member) => member.id !== memberId),
        roleMappings: state.roleMappings.filter((mapping) => mapping.memberId !== memberId),
        tasks: state.tasks.map((task) => (task.assigneeId === memberId ? { ...task, assigneeId: undefined } : task)),
      })),
      setRoleMapping: (projectId, role, memberId) => {
        const teamId = get().activeTeamId;
        if (!teamId) return;
        set((state) => {
          const exists = state.roleMappings.some((mapping) => mapping.projectId === projectId && mapping.role === role);
          return {
            roleMappings: exists
              ? state.roleMappings.map((mapping) => (mapping.projectId === projectId && mapping.role === role ? { ...mapping, memberId } : mapping))
              : [...state.roleMappings, { id: createId("rolemap"), teamId, projectId, role, memberId }],
          };
        });
      },
      parseImportText: (projectId, text) => {
        const rows = parsePlanText(text, new Date().getFullYear());
        return get().createImportDraft(projectId, "quick_import", text, rows);
      },
      createImportDraft: (projectId, source, rawText, rows) => {
        const teamId = get().activeTeamId;
        if (!teamId) return "";
        const existingContentItems = get().contentItems.filter((item) => item.projectId === projectId);
        const rowsWithMemory = rows.map((row) => validateRow(row, existingContentItems));
        const draft: ImportDraft = { id: createId("import"), teamId, projectId, source, rawText, rows: rowsWithMemory, createdAt: new Date().toISOString(), status: "draft" };
        set((state) => ({ importDrafts: [...state.importDrafts, draft], activeImportDraftId: draft.id, selectedProjectId: projectId }));
        return draft.id;
      },
      setActiveImportDraft: (activeImportDraftId) => set({ activeImportDraftId }),
      updateImportDraftRow: (rowId, patch) => set((state) => ({
        importDrafts: state.importDrafts.map((draft) =>
          draft.id === state.activeImportDraftId
            ? { ...draft, rows: draft.rows.map((row) => (row.id === rowId ? validateRow({ ...row, ...patch }, state.contentItems.filter((item) => item.projectId === draft.projectId)) : row)) }
            : draft,
        ),
      })),
      deleteImportDraftRow: (rowId) => set((state) => {
        const activeDraft = state.importDrafts.find((draft) => draft.id === state.activeImportDraftId);
        const remainingRows = activeDraft?.rows.filter((row) => row.id !== rowId) ?? [];
        const shouldClosePreview = Boolean(activeDraft && remainingRows.length === 0);
        return {
          importDrafts: state.importDrafts.map((draft) =>
            draft.id === state.activeImportDraftId
              ? { ...draft, rows: remainingRows, status: shouldClosePreview ? "discarded" : draft.status }
              : draft,
          ),
          activeImportDraftId: shouldClosePreview ? null : state.activeImportDraftId,
          activeTab: shouldClosePreview ? "import" : state.activeTab,
        };
      }),
      clearImportDraftRows: () => set((state) => ({
        importDrafts: state.importDrafts.map((draft) => (draft.id === state.activeImportDraftId ? { ...draft, rows: [], status: "discarded" } : draft)),
        activeImportDraftId: null,
        activeTab: "import",
      })),
      addImportDraftRow: () => set((state) => ({
        importDrafts: state.importDrafts.map((draft) => draft.id === state.activeImportDraftId
          ? { ...draft, rows: [...draft.rows, validateRow({ id: createId("row"), raw: "", dateRaw: "", publishDate: "", format: "other", title: "", errors: [], isValid: false, source: draft.source, confidence: 0.9 }, state.contentItems.filter((item) => item.projectId === draft.projectId))] }
          : draft),
      })),
      discardImportDraft: (draftId) => set((state) => ({ importDrafts: state.importDrafts.map((draft) => (draft.id === draftId ? { ...draft, status: "discarded" } : draft)), activeImportDraftId: null })),
      createContentPlanFromDraft: (generationMode) => {
        const state = get();
        const draft = state.importDrafts.find((item) => item.id === state.activeImportDraftId);
        if (!draft || draft.rows.some((row) => !row.isValid)) return { contentCount: 0, taskCount: 0 };
        const now = new Date().toISOString();
        const roleMappings = state.roleMappings.filter((mapping) => mapping.projectId === draft.projectId);
        const contentItems = draft.rows.map((row) => ({
          id: createId("content"),
          teamId: draft.teamId,
          projectId: draft.projectId,
          title: row.title,
          format: row.format,
          publishDate: row.publishDate,
          topic: row.topic,
          notes: row.notes,
          expert: row.expert,
          status: "idea" as ContentStatus,
          importSource: row.source,
          sourceImportId: draft.id,
          confidence: row.confidence,
          createdAt: now,
          updatedAt: now,
        }));
        const tasks = contentItems.flatMap((contentItem) => generateTasksForContentItem({ contentItem, projectId: draft.projectId, teamId: draft.teamId, roleMappings, generationMode, templates: defaultTemplates }));
        const projectMemoryItems = contentItems.map(createMemoryItemFromContentItem);
        set((current) => ({
          contentItems: [...current.contentItems, ...contentItems],
          projectMemoryItems: [...current.projectMemoryItems, ...projectMemoryItems],
          tasks: [...current.tasks, ...tasks],
          importDrafts: current.importDrafts.map((item) => (item.id === draft.id ? { ...item, status: "confirmed" } : item)),
          selectedProjectId: draft.projectId,
          activeImportDraftId: null,
          activeTab: "calendar",
          lastSuccessMessage: `Создано ${contentItems.length} публикаций и ${tasks.length} задач.`,
        }));
        hapticFeedback("success");
        return { contentCount: contentItems.length, taskCount: tasks.length };
      },
      addContentItem: (contentItem) => set((state) => ({ contentItems: [...state.contentItems, contentItem], projectMemoryItems: [...state.projectMemoryItems, createMemoryItemFromContentItem(contentItem)] })),
      updateContentItem: (id, patch) => set((state) => ({ contentItems: state.contentItems.map((item) => (item.id === id ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item)) })),
      deleteContentItem: (id) => set((state) => ({ contentItems: state.contentItems.filter((item) => item.id !== id), projectMemoryItems: state.projectMemoryItems.filter((item) => item.contentItemId !== id), tasks: state.tasks.filter((task) => task.contentItemId !== id) })),
      addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
      updateTaskStatus: (taskId, status) => {
        set((state) => ({ tasks: state.tasks.map((task) => (task.id === taskId ? { ...task, status, updatedAt: new Date().toISOString() } : task)) }));
        hapticFeedback("light");
      },
      updateTask: (taskId, patch) => set((state) => ({ tasks: state.tasks.map((task) => (task.id === taskId ? { ...task, ...patch, updatedAt: new Date().toISOString() } : task)) })),
      deleteTask: (taskId) => set((state) => ({ tasks: state.tasks.filter((task) => task.id !== taskId) })),
      clearSuccessMessage: () => set({ lastSuccessMessage: null }),
    }),
    { name: "briefly-storage" },
  ),
);

export const selectActiveTeam = (state: AppState) => state.teams.find((team) => team.id === state.activeTeamId) ?? null;
export const selectActiveSubscription = (state: AppState) => state.subscriptions.find((sub) => sub.teamId === state.activeTeamId) ?? null;
export const getProjectById = (state: AppState, id?: string | null) => state.projects.find((project) => project.id === id) ?? null;
export const getMembersByTeam = (state: AppState, teamId = state.activeTeamId) => state.members.filter((member) => member.teamId === teamId);
export const getMembersForProject = (state: AppState, projectId?: string | null) => {
  const project = getProjectById(state, projectId ?? state.selectedProjectId);
  return project ? getMembersByTeam(state, project.teamId) : [];
};
export const getRoleMappingForProject = (state: AppState, projectId?: string | null) => state.roleMappings.filter((mapping) => mapping.projectId === (projectId ?? state.selectedProjectId));
export const getContentItemsByProject = (state: AppState, projectId?: string | null) => state.contentItems.filter((item) => item.projectId === (projectId ?? state.selectedProjectId));
export const getTasksByProject = (state: AppState, projectId?: string | null) => state.tasks.filter((task) => task.projectId === (projectId ?? state.selectedProjectId));
export const getTasksByMember = (state: AppState, memberId?: string | null) => (memberId ? state.tasks.filter((task) => task.assigneeId === memberId) : state.tasks);
export const getTodayTasks = (state: AppState) => state.tasks.filter((task) => task.dueDate === new Date().toISOString().slice(0, 10) && task.status !== "done");
export const getOverdueTasks = (state: AppState) => state.tasks.filter((task) => Boolean(task.dueDate && task.dueDate < new Date().toISOString().slice(0, 10) && task.status !== "done"));
export const getProjectStats = (state: AppState, projectId?: string | null) => {
  const tasks = getTasksByProject(state, projectId);
  return {
    content: getContentItemsByProject(state, projectId).length,
    todo: tasks.filter((task) => task.status === "todo").length,
    in_progress: tasks.filter((task) => task.status === "in_progress").length,
    review: tasks.filter((task) => task.status === "review").length,
    done: tasks.filter((task) => task.status === "done").length,
    blocked: tasks.filter((task) => task.status === "blocked").length,
  };
};
export const getUsageForActiveTeam = (state: AppState) => state.activeTeamId ? getUsage(state, state.activeTeamId) : { projects: 0, members: 0, contentItems: 0 };
