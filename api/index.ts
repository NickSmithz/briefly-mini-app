import type { ApiRequest, ApiResponse } from "./_lib/http.js";

function normalizePath(req: ApiRequest) {
  const host = Array.isArray(req.headers.host) ? req.headers.host[0] : req.headers.host;
  const url = new URL(req.url ?? "", `https://${host ?? "localhost"}`);
  const queryPath = url.searchParams.get("path");

  if (queryPath) {
    return `/${queryPath.replace(/^\/+/, "").replace(/\/+$/, "")}`;
  }

  return url.pathname
    .replace(/^\/api\/index\/?/, "/")
    .replace(/^\/api\/?/, "/")
    .replace(/\/+$/, "") || "/";
}

function createRoutedRequest(req: ApiRequest): ApiRequest {
  const host = Array.isArray(req.headers.host) ? req.headers.host[0] : req.headers.host;
  const url = new URL(req.url ?? "", `https://${host ?? "localhost"}`);
  const query: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    if (key !== "path") query[key] = value;
  });
  return { ...req, query: { ...req.query, ...query } };
}

function methodNotAllowed(res: ApiResponse, methods: string[]) {
  res.setHeader?.("Allow", methods.join(", "));
  return res.status(405).json({ error: "Method not allowed", allowedMethods: methods });
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    const pathname = normalizePath(req);
    const segments = pathname.split("/").filter(Boolean);
    const method = req.method ?? "GET";
    const routedReq = createRoutedRequest(req);

    if (method === "GET" && pathname === "/health") {
      return res.status(200).json({ ok: true, time: new Date().toISOString(), runtime: "vercel-function" });
    }

    if (method === "GET" && pathname === "/debug-env") {
      return res.status(200).json({
        ok: true,
        env: {
          hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
          hasDirectUrl: Boolean(process.env.DIRECT_URL),
          hasTelegramBotToken: Boolean(process.env.TELEGRAM_BOT_TOKEN),
          hasJwtSecret: Boolean(process.env.JWT_SECRET),
          jwtSecretLength: process.env.JWT_SECRET?.length ?? 0,
          nodeEnv: process.env.NODE_ENV,
        },
      });
    }

    if (pathname === "/debug-auth") {
      if (method !== "GET") return methodNotAllowed(res, ["GET"]);
      const { debugAuth } = await import("./_handlers/auth.js");
      return debugAuth(routedReq, res);
    }

    if (pathname === "/auth/telegram") {
      if (method !== "POST") return methodNotAllowed(res, ["POST"]);
      const { authTelegram } = await import("./_handlers/auth.js");
      return authTelegram(routedReq, res);
    }

    if (pathname === "/teams/current") {
      if (method !== "GET") return methodNotAllowed(res, ["GET"]);
      const { getCurrentTeam } = await import("./_handlers/teams.js");
      return getCurrentTeam(routedReq, res);
    }

    if (segments[0] === "projects") {
      const { createProject, listProjects, updateProject } = await import("./_handlers/projects.js");
      if (segments.length === 1 && method === "GET") return listProjects(routedReq, res);
      if (segments.length === 1 && method === "POST") return createProject(routedReq, res);
      if (segments.length === 2 && method === "PATCH") return updateProject(routedReq, res, segments[1]);
      return methodNotAllowed(res, segments.length === 1 ? ["GET", "POST"] : ["PATCH"]);
    }

    if (segments[0] === "members") {
      const { createMember, deleteMember, listMembers, updateMember } = await import("./_handlers/members.js");
      if (segments.length === 1 && method === "GET") return listMembers(routedReq, res);
      if (segments.length === 1 && method === "POST") return createMember(routedReq, res);
      if (segments.length === 2 && method === "PATCH") return updateMember(routedReq, res, segments[1]);
      if (segments.length === 2 && method === "DELETE") return deleteMember(routedReq, res, segments[1]);
      return methodNotAllowed(res, segments.length === 1 ? ["GET", "POST"] : ["PATCH", "DELETE"]);
    }

    if (segments[0] === "role-mappings") {
      const { listRoleMappings, setRoleMapping } = await import("./_handlers/roleMappings.js");
      if (segments.length === 1 && method === "GET") return listRoleMappings(routedReq, res);
      if (segments.length === 1 && method === "POST") return setRoleMapping(routedReq, res);
      return methodNotAllowed(res, ["GET", "POST"]);
    }

    if (segments[0] === "import-drafts") {
      const { createImportDraft, updateImportDraft } = await import("./_handlers/importDrafts.js");
      if (segments.length === 1 && method === "POST") return createImportDraft(routedReq, res);
      if (segments.length === 2 && method === "PATCH") return updateImportDraft(routedReq, res, segments[1]);
      return methodNotAllowed(res, segments.length === 1 ? ["POST"] : ["PATCH"]);
    }

    if (segments[0] === "content-items") {
      const { createContentItemsBulk, deleteContentItem, listContentItems, updateContentItem } = await import("./_handlers/contentItems.js");
      if (segments.length === 1 && method === "GET") return listContentItems(routedReq, res);
      if (segments[1] === "bulk" && segments.length === 2 && method === "POST") return createContentItemsBulk(routedReq, res);
      if (segments.length === 2 && method === "PATCH") return updateContentItem(routedReq, res, segments[1]);
      if (segments.length === 2 && method === "DELETE") return deleteContentItem(routedReq, res, segments[1]);
      return methodNotAllowed(res, segments.length === 1 ? ["GET"] : ["POST", "PATCH", "DELETE"]);
    }

    if (segments[0] === "tasks") {
      const { assignTasksByRoles, createTask, createTasksBulk, deleteTask, listTasks, updateTask } = await import("./_handlers/tasks.js");
      if (segments.length === 1 && method === "GET") return listTasks(routedReq, res);
      if (segments.length === 1 && method === "POST") return createTask(routedReq, res);
      if (segments[1] === "bulk" && segments.length === 2 && method === "POST") return createTasksBulk(routedReq, res);
      if (segments[1] === "assign-by-roles" && segments.length === 2 && method === "POST") return assignTasksByRoles(routedReq, res);
      if (segments.length === 2 && method === "PATCH") return updateTask(routedReq, res, segments[1]);
      if (segments.length === 2 && method === "DELETE") return deleteTask(routedReq, res, segments[1]);
      return methodNotAllowed(res, segments.length === 1 ? ["GET", "POST"] : ["POST", "PATCH", "DELETE"]);
    }

    return res.status(404).json({ error: "API route not found", method, pathname, url: req.url });
  } catch (cause) {
    console.error("API fatal error", cause);
    return res.status(500).json({
      error: "Internal server error",
      message: cause instanceof Error ? cause.message : "Unknown error",
    });
  }
}
