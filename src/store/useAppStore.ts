import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppTab, ContentItem, ImportDraft, ImportSource, ImportedPlanRow, Project, RoleKey, RoleMapping, Subscription, Task, TaskGenerationMode, Team, TeamMember, TelegramUser } from "../types";
import { getTelegramUser, hapticFeedback } from "../utils/telegram";
import { makeDemoData } from "../data/demoData";
import { parsePlanText } from "../utils/importParser";
import { createId } from "../utils/ids";
import { defaultTemplates } from "../data/defaultTemplates";
import { generateTasksForContentItem } from "../utils/taskGenerator";

type State = {
  telegramUser: TelegramUser | null; onboardingCompleted: boolean; teams: Team[]; activeTeamId: string | null; subscriptions: Subscription[];
  projects: Project[]; members: TeamMember[]; roleMappings: RoleMapping[]; contentItems: ContentItem[]; tasks: Task[]; importDrafts: ImportDraft[];
  activeImportDraftId: string | null; selectedProjectId: string | null; activeTab: AppTab; lastSuccessMessage: string | null;
  initializeApp: () => void; completeOnboarding: () => void; createDemoData: () => void; resetAllData: () => void; resetOnboarding: () => void;
  setActiveTab: (tab: AppTab) => void; setActiveTeam: (teamId: string) => void; setSelectedProject: (projectId: string | null) => void;
  addProject: (project: Project) => void; updateProject: (projectId: string, patch: Partial<Project>) => void; archiveProject: (projectId: string) => void;
  addMember: (member: TeamMember) => void; updateMember: (memberId: string, patch: Partial<TeamMember>) => void; removeMember: (memberId: string) => void;
  setRoleMapping: (projectId: string, role: RoleKey, memberId: string) => void;
  parseImportText: (projectId: string, text: string) => void; createImportDraft: (projectId: string, source: ImportSource, rawText: string, rows: ImportedPlanRow[]) => void;
  setActiveImportDraft: (draftId: string | null) => void; updateImportDraftRow: (rowId: string, patch: Partial<ImportedPlanRow>) => void; deleteImportDraftRow: (rowId: string) => void;
  addImportDraftRow: () => void; discardImportDraft: (draftId: string) => void; createContentPlanFromDraft: (generationMode: TaskGenerationMode) => void;
  addContentItem: (contentItem: ContentItem) => void; updateContentItem: (id: string, patch: Partial<ContentItem>) => void; deleteContentItem: (id: string) => void;
  addTask: (task: Task) => void; updateTaskStatus: (taskId: string, status: Task["status"]) => void; updateTask: (taskId: string, patch: Partial<Task>) => void; deleteTask: (taskId: string) => void;
  clearSuccessMessage: () => void;
};
const now = () => new Date().toISOString();
export const useAppStore = create<State>()(persist((set, get) => ({
  telegramUser: null, onboardingCompleted: false, teams: [], activeTeamId: null, subscriptions: [], projects: [], members: [], roleMappings: [], contentItems: [], tasks: [], importDrafts: [], activeImportDraftId: null, selectedProjectId: null, activeTab: "home", lastSuccessMessage: null,
  initializeApp: () => { if (!get().telegramUser) set({ telegramUser: getTelegramUser() }); },
  createDemoData: () => { const d = makeDemoData(); set((s) => ({ ...s, teams: [d.team], activeTeamId: d.team.id, projects: [d.project], selectedProjectId: d.project.id, subscriptions: [d.subscription], members: d.members, roleMappings: d.roleMappings })); },
  completeOnboarding: () => { if (!get().teams.length) get().createDemoData(); set({ onboardingCompleted: true, activeTab: "home" }); },
  resetAllData: () => set({ onboardingCompleted: false, teams: [], activeTeamId: null, subscriptions: [], projects: [], members: [], roleMappings: [], contentItems: [], tasks: [], importDrafts: [], activeImportDraftId: null, selectedProjectId: null, activeTab: "home", lastSuccessMessage: null }),
  resetOnboarding: () => set({ onboardingCompleted: false }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setActiveTeam: (teamId) => set({ activeTeamId: teamId }),
  setSelectedProject: (projectId) => set({ selectedProjectId: projectId }),
  addProject: (project) => set((s) => ({ projects: [...s.projects, project] })),
  updateProject: (projectId, patch) => set((s) => ({ projects: s.projects.map((p) => p.id === projectId ? { ...p, ...patch } : p) })),
  archiveProject: (projectId) => set((s) => ({ projects: s.projects.map((p) => p.id === projectId ? { ...p, archived: true } : p) })),
  addMember: (member) => set((s) => ({ members: [...s.members, member] })),
  updateMember: (memberId, patch) => set((s) => ({ members: s.members.map((m) => m.id === memberId ? { ...m, ...patch } : m) })),
  removeMember: (memberId) => set((s) => ({ members: s.members.filter((m) => m.id !== memberId), roleMappings: s.roleMappings.filter((r) => r.memberId !== memberId) })),
  setRoleMapping: (projectId, role, memberId) => set((s) => {
    const activeTeamId = s.activeTeamId ?? ""; const found = s.roleMappings.find((x) => x.projectId === projectId && x.role === role);
    if (found) return { roleMappings: s.roleMappings.map((x) => x.id === found.id ? { ...x, memberId } : x) };
    return { roleMappings: [...s.roleMappings, { id: createId("rm"), teamId: activeTeamId, projectId, role, memberId }] };
  }),
  parseImportText: (projectId, text) => { const rows = parsePlanText(text, new Date().getFullYear()); get().createImportDraft(projectId, "quick_import", text, rows); },
  createImportDraft: (projectId, source, rawText, rows) => set((s) => { const draft = { id: createId("draft"), teamId: s.activeTeamId ?? "", projectId, source, rawText, rows, createdAt: now(), status: "draft" as const }; return { importDrafts: [...s.importDrafts, draft], activeImportDraftId: draft.id, activeTab: "import" }; }),
  setActiveImportDraft: (draftId) => set({ activeImportDraftId: draftId }),
  updateImportDraftRow: (rowId, patch) => set((s) => ({ importDrafts: s.importDrafts.map((d) => d.id !== s.activeImportDraftId ? d : { ...d, rows: d.rows.map((r) => r.id === rowId ? { ...r, ...patch } : r) }) })),
  deleteImportDraftRow: (rowId) => set((s) => ({ importDrafts: s.importDrafts.map((d) => d.id !== s.activeImportDraftId ? d : { ...d, rows: d.rows.filter((r) => r.id !== rowId) }) })),
  addImportDraftRow: () => set((s) => ({ importDrafts: s.importDrafts.map((d) => d.id !== s.activeImportDraftId ? d : { ...d, rows: [...d.rows, { id: createId("row"), raw: "", dateRaw: "", publishDate: "", format: "other", title: "", isValid: false, errors: ["Заполните дату и название"], source: "manual", confidence: 1 }] }) })),
  discardImportDraft: (draftId) => set((s) => ({ importDrafts: s.importDrafts.map((d) => d.id === draftId ? { ...d, status: "discarded" } : d), activeImportDraftId: null })),
  createContentPlanFromDraft: (generationMode) => {
    const s = get(); const draft = s.importDrafts.find((d) => d.id === s.activeImportDraftId); if (!draft) return;
    const validRows = draft.rows.filter((r) => r.publishDate && r.title.trim()); const items: ContentItem[] = validRows.map((r) => ({ id: createId("content"), teamId: draft.teamId, projectId: draft.projectId, title: r.title, format: r.format, publishDate: r.publishDate, notes: r.notes, expert: r.expert, status: "idea", importSource: r.source, sourceImportId: draft.id, confidence: r.confidence, createdAt: now(), updatedAt: now() }));
    const tasks = items.flatMap((contentItem) => generateTasksForContentItem({ contentItem, projectId: draft.projectId, teamId: draft.teamId, roleMappings: s.roleMappings, generationMode, templates: defaultTemplates }));
    hapticFeedback("medium");
    set((st) => ({ contentItems: [...st.contentItems, ...items], tasks: [...st.tasks, ...tasks], importDrafts: st.importDrafts.map((d) => d.id === draft.id ? { ...d, status: "confirmed" } : d), activeImportDraftId: null, selectedProjectId: draft.projectId, activeTab: "projects", lastSuccessMessage: `Создано ${items.length} публикаций и ${tasks.length} задач.` }));
  },
  addContentItem: (contentItem) => set((s) => ({ contentItems: [...s.contentItems, contentItem] })),
  updateContentItem: (id, patch) => set((s) => ({ contentItems: s.contentItems.map((x) => x.id === id ? { ...x, ...patch, updatedAt: now() } : x) })),
  deleteContentItem: (id) => set((s) => ({ contentItems: s.contentItems.filter((x) => x.id !== id), tasks: s.tasks.filter((t) => t.contentItemId !== id) })),
  addTask: (task) => set((s) => ({ tasks: [...s.tasks, task] })),
  updateTaskStatus: (taskId, status) => set((s) => ({ tasks: s.tasks.map((t) => t.id === taskId ? { ...t, status, updatedAt: now() } : t) })),
  updateTask: (taskId, patch) => set((s) => ({ tasks: s.tasks.map((t) => t.id === taskId ? { ...t, ...patch, updatedAt: now() } : t) })),
  deleteTask: (taskId) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== taskId) })),
  clearSuccessMessage: () => set({ lastSuccessMessage: null }),
}), { name: "briefly-storage" }));

export const selectors = {
  getActiveTeam: (s: State) => s.teams.find((t) => t.id === s.activeTeamId),
  getActiveSubscription: (s: State) => s.subscriptions.find((sub) => sub.teamId === s.activeTeamId) ?? null,
  getProjectById: (s: State, id?: string | null) => s.projects.find((p) => p.id === id),
};
