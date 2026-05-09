import { z } from "zod";
import { prisma } from "../_lib/prisma";
import { allowMethods, error, getQueryString, json, readJson, type ApiRequest, type ApiResponse } from "../_lib/http";
import { requireMember, requireProject, requireUser } from "../_lib/auth";
import { dateValue, prioritySchema, roleSchema, taskStatusSchema } from "../_lib/validation";

const createSchema = z.object({
  projectId: z.string().min(1),
  contentItemId: z.string().optional(),
  title: z.string().trim().min(1),
  description: z.string().optional(),
  assigneeId: z.string().optional(),
  role: roleSchema.optional(),
  dueDate: z.string().optional(),
  status: taskStatusSchema.optional(),
  priority: prioritySchema.optional(),
});

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!allowMethods(req, res, ["GET", "POST"])) return;
  try {
    const { team } = await requireUser(req);
    if (req.method === "GET") {
      const projectId = getQueryString(req, "projectId");
      const assigneeId = getQueryString(req, "assigneeId");
      const status = getQueryString(req, "status");
      return json(res, await prisma.task.findMany({ where: { teamId: team.id, ...(projectId ? { projectId } : {}), ...(assigneeId ? { assigneeId } : {}), ...(status ? { status } : {}) }, orderBy: { createdAt: "asc" } }));
    }
    const body = createSchema.parse(readJson(req));
    await requireProject(team.id, body.projectId);
    if (body.assigneeId) await requireMember(team.id, body.assigneeId);
    json(res, await prisma.task.create({ data: { ...body, teamId: team.id, dueDate: dateValue(body.dueDate), status: body.status ?? "todo", priority: body.priority ?? "normal" } }), 201);
  } catch (cause) {
    error(res, cause instanceof Error ? cause.message : "Tasks request failed", 400);
  }
}
