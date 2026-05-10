import type { ContentItem, ImportDraft, Project, RoleMapping, Task, TeamMember } from "../types";
import type { AuthTelegramResponse, CurrentTeamResponse } from "./types";

const BACKEND_TOKEN_KEY = "briefly-backend-token";

type FetchOptions = RequestInit & { json?: unknown };

export type DebugAuthResponse = {
  ok: boolean;
  hasAuthorizationHeader: boolean;
  userId?: string;
  teamCount?: number;
  error?: string;
};

export function setBackendToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(BACKEND_TOKEN_KEY, token);
}

export function getBackendToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(BACKEND_TOKEN_KEY);
}

export function clearBackendToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(BACKEND_TOKEN_KEY);
}

function toQuery(params?: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value) search.set(key, value);
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

function toApiPath(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return normalized.startsWith("/api/") || normalized === "/api" ? normalized : `/api${normalized}`;
}

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const token = getBackendToken();
  const headers = new Headers(options.headers);
  const body = options.json !== undefined ? JSON.stringify(options.json) : options.body;

  if (!headers.has("Content-Type") && (options.json !== undefined || body)) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(toApiPath(path), {
    ...options,
    headers,
    body,
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Сессия Team sync истекла. Войдите через Telegram ещё раз.");
    }

    throw new Error(data?.error || data?.message || "Backend request failed");
  }

  return data as T;
}

export function debugAuth() {
  return apiFetch<DebugAuthResponse>("/debug-auth", { method: "GET" });
}

export const authTelegram = (initData: string) => apiFetch<AuthTelegramResponse>("/auth/telegram", { method: "POST", json: { initData } });
export const getCurrentTeam = () => apiFetch<CurrentTeamResponse>("/teams/current");
export const getProjects = () => apiFetch<Project[]>("/projects");
export const createProject = (data: Pick<Project, "name" | "description" | "color">) => apiFetch<Project>("/projects", { method: "POST", json: data });
export const updateProject = (id: string, data: Partial<Project>) => apiFetch<Project>(`/projects/${id}`, { method: "PATCH", json: data });
export const getMembers = () => apiFetch<TeamMember[]>("/members");
export const createMember = (data: Pick<TeamMember, "name" | "username" | "roleLabel" | "avatarEmoji">) => apiFetch<TeamMember>("/members", { method: "POST", json: data });
export const updateMember = (id: string, data: Partial<TeamMember>) => apiFetch<TeamMember>(`/members/${id}`, { method: "PATCH", json: data });
export const deleteMember = (id: string) => apiFetch<{ ok: true }>(`/members/${id}`, { method: "DELETE" });
export const getRoleMappings = (projectId?: string) => apiFetch<RoleMapping[]>(`/role-mappings${toQuery({ projectId })}`);
export const setRoleMapping = (data: Pick<RoleMapping, "projectId" | "role" | "memberId">) => apiFetch<RoleMapping>("/role-mappings", { method: "POST", json: data });
export const createImportDraft = (data: Pick<ImportDraft, "projectId" | "source" | "rawText" | "rows">) => apiFetch<ImportDraft>("/import-drafts", { method: "POST", json: data });
export const updateImportDraft = (id: string, data: Partial<ImportDraft>) => apiFetch<ImportDraft>(`/import-drafts/${id}`, { method: "PATCH", json: data });
export const getContentItems = (params?: { projectId?: string }) => apiFetch<ContentItem[]>(`/content-items${toQuery(params)}`);
export const createContentItemsBulk = (data: { projectId: string; importDraftId?: string; items: Partial<ContentItem>[] }) => apiFetch<ContentItem[]>("/content-items/bulk", { method: "POST", json: data });
export const updateContentItem = (id: string, data: Partial<ContentItem>) => apiFetch<ContentItem>(`/content-items/${id}`, { method: "PATCH", json: data });
export const getTasks = (params?: { projectId?: string; assigneeId?: string; status?: string }) => apiFetch<Task[]>(`/tasks${toQuery(params)}`);
export const createTask = (data: Partial<Task>) => apiFetch<Task>("/tasks", { method: "POST", json: data });
export const createTasksBulk = (tasks: Partial<Task>[]) => apiFetch<Task[]>("/tasks/bulk", { method: "POST", json: { tasks } });
export const updateTask = (id: string, data: Partial<Task>) => apiFetch<Task>(`/tasks/${id}`, { method: "PATCH", json: data });
export const deleteTask = (id: string) => apiFetch<{ ok: true }>(`/tasks/${id}`, { method: "DELETE" });
export const assignTasksByRoles = (projectId: string, overwrite?: boolean) => apiFetch<{ count: number }>("/tasks/assign-by-roles", { method: "POST", json: { projectId, overwrite } });
