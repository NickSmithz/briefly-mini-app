import { error, json, type ApiRequest, type ApiResponse } from "./_lib/http";
import { authTelegram } from "./_handlers/auth";
import { getCurrentTeam } from "./_handlers/teams";
import { createProject, listProjects, updateProject } from "./_handlers/projects";
import { createMember, deleteMember, listMembers, updateMember } from "./_handlers/members";
import { listRoleMappings, setRoleMapping } from "./_handlers/roleMappings";
import { createImportDraft, updateImportDraft } from "./_handlers/importDrafts";
import { createContentItemsBulk, deleteContentItem, listContentItems, updateContentItem } from "./_handlers/contentItems";
import { assignTasksByRoles, createTask, createTasksBulk, deleteTask, listTasks, updateTask } from "./_handlers/tasks";

function createRoutedRequest(req: ApiRequest, url: URL): ApiRequest {
  const query: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    query[key] = value;
  });
  return { ...req, query: { ...req.query, ...query } };
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  const host = Array.isArray(req.headers.host) ? req.headers.host[0] : req.headers.host;
  const url = new URL(req.url ?? "/api/health", `https://${host ?? "briefly.local"}`);
  const segments = url.pathname.replace(/^\/api\/?/, "").split("/").filter(Boolean);
  const method = req.method ?? "GET";
  const routedReq = createRoutedRequest(req, url);

  if (method === "GET" && segments[0] === "health" && segments.length === 1) {
    return json(res, { ok: true, time: new Date().toISOString() });
  }
  if (method === "POST" && segments.join("/") === "auth/telegram") return authTelegram(routedReq, res);
  if (method === "GET" && segments.join("/") === "teams/current") return getCurrentTeam(routedReq, res);

  if (segments[0] === "projects") {
    if (segments.length === 1 && method === "GET") return listProjects(routedReq, res);
    if (segments.length === 1 && method === "POST") return createProject(routedReq, res);
    if (segments.length === 2 && method === "PATCH") return updateProject(routedReq, res, segments[1]);
  }

  if (segments[0] === "members") {
    if (segments.length === 1 && method === "GET") return listMembers(routedReq, res);
    if (segments.length === 1 && method === "POST") return createMember(routedReq, res);
    if (segments.length === 2 && method === "PATCH") return updateMember(routedReq, res, segments[1]);
    if (segments.length === 2 && method === "DELETE") return deleteMember(routedReq, res, segments[1]);
  }

  if (segments[0] === "role-mappings") {
    if (segments.length === 1 && method === "GET") return listRoleMappings(routedReq, res);
    if (segments.length === 1 && method === "POST") return setRoleMapping(routedReq, res);
  }

  if (segments[0] === "import-drafts") {
    if (segments.length === 1 && method === "POST") return createImportDraft(routedReq, res);
    if (segments.length === 2 && method === "PATCH") return updateImportDraft(routedReq, res, segments[1]);
  }

  if (segments[0] === "content-items") {
    if (segments.length === 1 && method === "GET") return listContentItems(routedReq, res);
    if (segments[1] === "bulk" && segments.length === 2 && method === "POST") return createContentItemsBulk(routedReq, res);
    if (segments.length === 2 && method === "PATCH") return updateContentItem(routedReq, res, segments[1]);
    if (segments.length === 2 && method === "DELETE") return deleteContentItem(routedReq, res, segments[1]);
  }

  if (segments[0] === "tasks") {
    if (segments.length === 1 && method === "GET") return listTasks(routedReq, res);
    if (segments.length === 1 && method === "POST") return createTask(routedReq, res);
    if (segments[1] === "bulk" && segments.length === 2 && method === "POST") return createTasksBulk(routedReq, res);
    if (segments[1] === "assign-by-roles" && segments.length === 2 && method === "POST") return assignTasksByRoles(routedReq, res);
    if (segments.length === 2 && method === "PATCH") return updateTask(routedReq, res, segments[1]);
    if (segments.length === 2 && method === "DELETE") return deleteTask(routedReq, res, segments[1]);
  }

  return error(res, "API route not found", 404);
}
