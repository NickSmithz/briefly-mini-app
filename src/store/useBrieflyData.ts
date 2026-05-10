import type { ContentItem, Project, RoleKey, Task, TaskGenerationMode, TaskStatus, TeamMember } from "../types";
import { defaultTemplates } from "../data/defaultTemplates";
import { getUsageForActiveTeam, selectActiveSubscription, selectActiveTeam, useAppStore } from "./useAppStore";
import { useBackendStore } from "./useBackendStore";
import { getBackendModeEnabled } from "../utils/authMode";
import { generateTasksForContentItem } from "../utils/taskGenerator";

export type BrieflyDataMode = "local" | "backend";

function getBackendReady(backend: ReturnType<typeof useBackendStore.getState>) {
  return Boolean(backend.isBackendMode && backend.isAuthenticated && backend.team);
}

export function useBrieflyData() {
  const local = useAppStore();
  const backend = useBackendStore();
  const isBackendMode = backend.isBackendMode || getBackendModeEnabled();
  const isBackendReady = getBackendReady(backend);
  const mode: BrieflyDataMode = isBackendMode && isBackendReady ? "backend" : "local";
  const activeTeam = mode === "backend" ? backend.team : selectActiveTeam(local);
  const subscription = mode === "backend" ? backend.subscription : selectActiveSubscription(local);
  const projects = mode === "backend" ? backend.projects : local.projects;
  const members = mode === "backend" ? backend.members : local.members;
  const roleMappings = mode === "backend" ? backend.roleMappings : local.roleMappings;
  const contentItems = mode === "backend" ? backend.contentItems : local.contentItems;
  const tasks = mode === "backend" ? backend.tasks : local.tasks;
  const selectedProjectExists = Boolean(projects.find((project) => project.id === local.selectedProjectId));
  const selectedProjectId = selectedProjectExists ? local.selectedProjectId : projects[0]?.id ?? null;
  const usage = mode === "backend"
    ? { projects: projects.filter((project) => !project.archived).length, members: members.length, contentItems: contentItems.length }
    : getUsageForActiveTeam(local);

  const addProject = (project: Omit<Project, "id" | "teamId" | "createdAt">) => {
    if (mode === "backend") {
      return backend.createProject(project).then((created) => {
        local.setSelectedProject(created.id);
        return created;
      });
    }
    local.addProject(project);
    return Promise.resolve(undefined);
  };

  const updateProject = (projectId: string, patch: Partial<Project>) => {
    if (mode === "backend") void backend.updateProject(projectId, patch);
    else local.updateProject(projectId, patch);
  };

  const archiveProject = (projectId: string) => {
    if (mode === "backend") void backend.updateProject(projectId, { archived: true });
    else local.archiveProject(projectId);
  };

  const addMember = (member: Omit<TeamMember, "id" | "teamId" | "createdAt">) => {
    if (mode === "backend") void backend.createMember(member);
    else local.addMember(member);
  };

  const updateMember = (memberId: string, patch: Partial<TeamMember>) => {
    if (mode === "backend") void backend.updateMember(memberId, patch);
    else local.updateMember(memberId, patch);
  };

  const removeMember = (memberId: string) => {
    if (mode === "backend") void import("../api/client").then((api) => api.deleteMember(memberId).then(() => backend.loadWorkspace()));
    else local.removeMember(memberId);
  };

  const setRoleMapping = (projectId: string, role: RoleKey, memberId: string) => {
    if (mode === "backend") void backend.setRoleMapping({ projectId, role, memberId });
    else local.setRoleMapping(projectId, role, memberId);
  };

  const assignExistingTasksByRole = (projectId: string, options?: { overwrite?: boolean }) => {
    if (mode === "backend") {
      void backend.assignExistingTasksByRole(projectId, options?.overwrite);
      return 0;
    }
    return local.assignExistingTasksByRole(projectId, options);
  };

  const getUnassignedRoleTasksCount = (projectId: string) => {
    const mappedRoles = new Set(roleMappings.filter((mapping) => mapping.projectId === projectId && mapping.memberId).map((mapping) => mapping.role));
    return tasks.filter((task) => task.projectId === projectId && task.role && !task.assigneeId && mappedRoles.has(task.role)).length;
  };

  const addTask = (task: Task) => {
    if (mode === "backend") void backend.createTask(task);
    else local.addTask(task);
  };

  const updateTask = (taskId: string, patch: Partial<Task>) => {
    if (mode === "backend") void backend.updateTask(taskId, patch);
    else local.updateTask(taskId, patch);
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    if (mode === "backend") void backend.updateTaskStatus(taskId, status);
    else local.updateTaskStatus(taskId, status);
  };

  const deleteTask = (taskId: string) => {
    if (mode === "backend") void backend.deleteTask(taskId);
    else local.deleteTask(taskId);
  };

  const updateContentItem = (id: string, patch: Partial<ContentItem>) => {
    if (mode === "backend") void backend.updateContentItem(id, patch);
    else local.updateContentItem(id, patch);
  };

  const deleteContentItem = (id: string) => {
    if (mode === "backend") void import("../api/client").then((api) => api.apiFetch(`/content-items/${id}`, { method: "DELETE" }).then(() => backend.loadWorkspace()));
    else local.deleteContentItem(id);
  };

  const createContentPlanFromDraft = (generationMode: TaskGenerationMode) => {
    if (mode !== "backend") {
      local.createContentPlanFromDraft(generationMode);
      return;
    }

    const draft = local.importDrafts.find((item) => item.id === local.activeImportDraftId && item.status === "draft");
    if (!draft) return;

    void import("../api/client").then(async (api) => {
      const backendDraft = await api.createImportDraft({
        projectId: draft.projectId,
        source: draft.source,
        rawText: draft.rawText,
        rows: draft.rows,
      });
      const createdItems = await api.createContentItemsBulk({
        projectId: draft.projectId,
        importDraftId: backendDraft.id,
        items: draft.rows.map((row) => ({
          projectId: draft.projectId,
          title: row.title.trim(),
          format: row.format,
          publishDate: row.publishDate,
          topic: row.topic?.trim() || undefined,
          notes: row.notes?.trim() || undefined,
          expert: row.expert?.trim() || undefined,
          status: "idea",
          importSource: row.source,
          sourceImportId: backendDraft.id,
          confidence: row.confidence,
        })),
      });
      const generatedTasks = createdItems.flatMap((contentItem) =>
        generateTasksForContentItem({
          contentItem,
          projectId: draft.projectId,
          teamId: contentItem.teamId,
          roleMappings,
          generationMode,
          templates: defaultTemplates,
        }),
      );
      if (generatedTasks.length) await api.createTasksBulk(generatedTasks);
      await api.updateImportDraft(backendDraft.id, { status: "confirmed" });
      local.discardImportDraft(draft.id);
      local.setActiveTab("calendar");
      await backend.loadWorkspace();
      useBackendStore.setState({ lastSuccessMessage: `Создано ${createdItems.length} публикаций и ${generatedTasks.length} задач.` });
    });
  };

  return {
    mode,
    isBackendMode,
    isBackendReady,
    isLoading: backend.isLoading,
    error: backend.error,
    telegramUser: local.telegramUser,
    activeTeam,
    activeTeamId: activeTeam?.id ?? null,
    subscription,
    usage,
    projects,
    members,
    roleMappings,
    contentItems,
    tasks,
    importDrafts: local.importDrafts,
    activeImportDraftId: local.activeImportDraftId,
    selectedProjectId,
    activeTab: local.activeTab,
    lastSuccessMessage: mode === "backend" ? backend.lastSuccessMessage : local.lastSuccessMessage,
    actions: {
      loadWorkspace: backend.loadWorkspace,
      setActiveTab: local.setActiveTab,
      setSelectedProject: local.setSelectedProject,
      addProject,
      updateProject,
      archiveProject,
      addMember,
      updateMember,
      removeMember,
      setRoleMapping,
      assignExistingTasksByRole,
      getUnassignedRoleTasksCount,
      parseImportText: local.parseImportText,
      createImportDraft: local.createImportDraft,
      updateImportDraftRow: local.updateImportDraftRow,
      deleteImportDraftRow: local.deleteImportDraftRow,
      clearImportDraftRows: local.clearImportDraftRows,
      addImportDraftRow: local.addImportDraftRow,
      createContentPlanFromDraft,
      addContentItem: local.addContentItem,
      updateContentItem,
      deleteContentItem,
      addTask,
      updateTask,
      updateTaskStatus,
      deleteTask,
      clearSuccessMessage: mode === "backend" ? backend.clearSuccessMessage : local.clearSuccessMessage,
    },
  };
}

export type BrieflyData = ReturnType<typeof useBrieflyData>;
