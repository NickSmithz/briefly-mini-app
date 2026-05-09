import type { ContentItem, ImportDraft, Project, RoleMapping, Task, TeamMember } from "../types";
import type { AuthTelegramResponse, CurrentTeamResponse } from "./types";

const tokenKey = "briefly-backend-token";

type FetchOptions = RequestInit & { json?: unknown };

export function setBackendToken(token: string) {
  localStorage.setItem(tokenKey, token);
}

export function getBackendToken() {
  return localStorage.getItem(tokenKey);
}

export function clearBackendToken() {
  localStorage.removeItem(tokenKey);
}

function toQuery(params?: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value) search.set(key, value);
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const token = getBackendToken();
  const headers = new Headers(options.headers);
  if (options.json !== undefined) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(path, {
    ...options,
    headers,
    body: options.json !== undefined ? JSON.stringify(options.json) : options.body,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || "Backend request failed");
  return data as T;
}

export const authTelegram = (initData: string) => apiFetch<AuthTelegramResponse>("/api/auth/telegram", { method: "POST", json: { initData } });
export const getCurrentTeam = () => apiFetch<CurrentTeamResponse>("/api/teams/current");
export const getProjects = () => apiFetch<Project[]>("/api/projects");
export const createProject = (data: Pick<Project, "name" | "description" | "color">) => apiFetch<Project>("/api/projects", { method: "POST", json: data });
export const updateProject = (id: string, data: Partial<Project>) => apiFetch<Project>(`/api/projects/${id}`, { method: "PATCH", json: data });
export const getMembers = () => apiFetch<TeamMember[]>("/api/members");
export const createMember = (data: Pick<TeamMember, "name" | "username" | "roleLabel" | "avatarEmoji">) => apiFetch<TeamMember>("/api/members", { method: "POST", json: data });
export const updateMember = (id: string, data: Partial<TeamMember>) => apiFetch<TeamMember>(`/api/members/${id}`, { method: "PATCH", json: data });
export const deleteMember = (id: string) => apiFetch<{ ok: true }>(`/api/members/${id}`, { method: "DELETE" });
export const getRoleMappings = (projectId?: string) => apiFetch<RoleMapping[]>(`/api/role-mappings${toQuery({ projectId })}`);
export const setRoleMapping = (data: Pick<RoleMapping, "projectId" | "role" | "memberId">) => apiFetch<RoleMapping>("/api/role-mappings", { method: "POST", json: data });
export const createImportDraft = (data: Pick<ImportDraft, "projectId" | "source" | "rawText" | "rows">) => apiFetch<ImportDraft>("/api/import-drafts", { method: "POST", json: data });
export const updateImportDraft = (id: string, data: Partial<ImportDraft>) => apiFetch<ImportDraft>(`/api/import-drafts/${id}`, { method: "PATCH", json: data });
export const getContentItems = (params?: { projectId?: string }) => apiFetch<ContentItem[]>(`/api/content-items${toQuery(params)}`);
export const createContentItemsBulk = (data: { projectId: string; importDraftId?: string; items: Partial<ContentItem>[] }) => apiFetch<ContentItem[]>("/api/content-items/bulk", { method: "POST", json: data });
export const updateContentItem = (id: string, data: Partial<ContentItem>) => apiFetch<ContentItem>(`/api/content-items/${id}`, { method: "PATCH", json: data });
export const getTasks = (params?: { projectId?: string; assigneeId?: string; status?: string }) => apiFetch<Task[]>(`/api/tasks${toQuery(params)}`);
export const createTask = (data: Partial<Task>) => apiFetch<Task>("/api/tasks", { method: "POST", json: data });
export const createTasksBulk = (tasks: Partial<Task>[]) => apiFetch<Task[]>("/api/tasks/bulk", { method: "POST", json: { tasks } });
export const updateTask = (id: string, data: Partial<Task>) => apiFetch<Task>(`/api/tasks/${id}`, { method: "PATCH", json: data });
export const deleteTask = (id: string) => apiFetch<{ ok: true }>(`/api/tasks/${id}`, { method: "DELETE" });
export const assignTasksByRoles = (projectId: string, overwrite?: boolean) => apiFetch<{ count: number }>("/api/tasks/assign-by-roles", { method: "POST", json: { projectId, overwrite } });
