import type { ContentItem, ImportDraft, Project, RoleMapping, Task, TeamMember } from "../types";
import type { AuthTelegramResponse, CurrentTeamResponse } from "./types";

const BACKEND_TOKEN_KEY = "briefly-backend-token";

type FetchOptions = RequestInit & { json?: unknown };
type ApiFetchConfig = { skipAuth?: boolean };

export type BackendErrorPayload = {
  error?: string;
  message?: string;
  code?: string;
  reason?: string;
  ok?: boolean;
  hasAuthorizationHeader?: boolean;
  userId?: string;
  teamCount?: number;
};

export class BackendApiError extends Error {
  status: number;
  code?: string;
  payload: BackendErrorPayload | null;
  path: string;

  constructor(message: string, params: { status: number; payload: BackendErrorPayload | null; path: string }) {
    super(message);
    this.name = "BackendApiError";
    this.status = params.status;
    this.code = params.payload?.code;
    this.payload = params.payload;
    this.path = params.path;
  }
}

export type DebugAuthResponse = {
  ok: boolean;
  hasAuthorizationHeader: boolean;
  userId?: string;
  telegramUserId?: string;
  teamCount?: number;
  error?: string;
  code?: string;
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

function getErrorMessage(path: string, status: number, payload: BackendErrorPayload | null) {
  const serverMessage = payload?.error || payload?.message || payload?.reason || `Backend request failed with ${status}`;
  if (status === 401 && path.includes("/auth/telegram")) return `Не удалось войти через Telegram: ${serverMessage}`;
  if (status === 401) return `Backend отказал в доступе: ${serverMessage}`;
  return serverMessage;
}

export async function apiFetch<T>(path: string, options: FetchOptions = {}, config: ApiFetchConfig = {}): Promise<T> {
  const token = getBackendToken();
  const headers = new Headers(options.headers);
  const body = options.json !== undefined ? JSON.stringify(options.json) : options.body;

  if (!headers.has("Content-Type") && (options.json !== undefined || body)) {
    headers.set("Content-Type", "application/json");
  }

  if (!config.skipAuth && token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const normalizedPath = toApiPath(path);
  const response = await fetch(normalizedPath, {
    ...options,
    headers,
    body,
  });
  const data = await response.json().catch(() => null) as BackendErrorPayload | null;

  if (!response.ok) {
    throw new BackendApiError(getErrorMessage(normalizedPath, response.status, data), {
      status: response.status,
      payload: data,
      path: normalizedPath,
    });
  }

  return data as T;
}

export function debugAuth() {
  return apiFetch<DebugAuthResponse>("/debug-auth", { method: "GET" });
}

export const authTelegram = (initData: string) => apiFetch<AuthTelegramResponse>("/auth/telegram", { method: "POST", json: { initData } }, { skipAuth: true });
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
