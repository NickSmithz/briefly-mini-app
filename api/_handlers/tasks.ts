import { z } from "zod";
import { prisma } from "../_lib/prisma.js";
import { error, getQueryString, json, readJson, type ApiRequest, type ApiResponse } from "../_lib/http.js";
import { requireMember, requireProject, requireUser } from "../_lib/auth.js";
import { dateValue, prioritySchema, roleSchema, taskStatusSchema } from "../_lib/validation.js";

const taskSchema = z.object({
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
const bulkSchema = z.object({ tasks: z.array(taskSchema) });
const patchSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
  role: roleSchema.optional().nullable(),
  dueDate: z.string().optional().nullable(),
  status: taskStatusSchema.optional(),
  priority: prioritySchema.optional(),
  contentItemId: z.string().optional().nullable(),
});
const assignSchema = z.object({ projectId: z.string().min(1), overwrite: z.boolean().optional().default(false) });

export async function listTasks(req: ApiRequest, res: ApiResponse) {
  try {
    const { team } = await requireUser(req);
    const projectId = getQueryString(req, "projectId");
    const assigneeId = getQueryString(req, "assigneeId");
    const status = getQueryString(req, "status");
    json(res, await prisma.task.findMany({ where: { teamId: team.id, ...(projectId ? { projectId } : {}), ...(assigneeId ? { assigneeId } : {}), ...(status ? { status } : {}) }, orderBy: { createdAt: "asc" } }));
  } catch (cause) {
    error(res, cause instanceof Error ? cause.message : "Tasks request failed", 400);
  }
}

export async function createTask(req: ApiRequest, res: ApiResponse) {
  try {
    const { team } = await requireUser(req);
    const body = taskSchema.parse(readJson(req));
    await requireProject(team.id, body.projectId);
    if (body.assigneeId) await requireMember(team.id, body.assigneeId);
    json(res, await prisma.task.create({ data: { ...body, teamId: team.id, dueDate: dateValue(body.dueDate), status: body.status ?? "todo", priority: body.priority ?? "normal" } }), 201);
  } catch (cause) {
    error(res, cause instanceof Error ? cause.message : "Task create failed", 400);
  }
}

export async function createTasksBulk(req: ApiRequest, res: ApiResponse) {
  try {
    const { team } = await requireUser(req);
    const body = bulkSchema.parse(readJson(req));
    const projectIds = [...new Set(body.tasks.map((task) => task.projectId))];
    const owned = await prisma.project.count({ where: { teamId: team.id, id: { in: projectIds } } });
    if (owned !== projectIds.length) return error(res, "Some projects were not found", 400);
    const created = await prisma.$transaction(body.tasks.map((task) => prisma.task.create({
      data: { ...task, teamId: team.id, dueDate: dateValue(task.dueDate), status: task.status ?? "todo", priority: task.priority ?? "normal" },
    })));
    json(res, created, 201);
  } catch (cause) {
    error(res, cause instanceof Error ? cause.message : "Bulk tasks create failed", 400);
  }
}

export async function updateTask(req: ApiRequest, res: ApiResponse, id: string) {
  try {
    const { team } = await requireUser(req);
    const existing = await prisma.task.findFirst({ where: { id, teamId: team.id } });
    if (!existing) return error(res, "Task not found", 404);
    const body = patchSchema.parse(readJson(req));
    json(res, await prisma.task.update({ where: { id }, data: { ...body, dueDate: body.dueDate ? dateValue(body.dueDate) : body.dueDate === null ? null : undefined } }));
  } catch (cause) {
    error(res, cause instanceof Error ? cause.message : "Task update failed", 400);
  }
}

export async function deleteTask(req: ApiRequest, res: ApiResponse, id: string) {
  try {
    const { team } = await requireUser(req);
    const existing = await prisma.task.findFirst({ where: { id, teamId: team.id } });
    if (!existing) return error(res, "Task not found", 404);
    await prisma.task.delete({ where: { id } });
    json(res, { ok: true });
  } catch (cause) {
    error(res, cause instanceof Error ? cause.message : "Task delete failed", 400);
  }
}

export async function assignTasksByRoles(req: ApiRequest, res: ApiResponse) {
  try {
    const { team } = await requireUser(req);
    const body = assignSchema.parse(readJson(req));
    await requireProject(team.id, body.projectId);
    const mappings = await prisma.roleMapping.findMany({ where: { teamId: team.id, projectId: body.projectId } });
    let count = 0;
    for (const mapping of mappings) {
      const result = await prisma.task.updateMany({
        where: { teamId: team.id, projectId: body.projectId, role: mapping.role, ...(body.overwrite ? {} : { assigneeId: null }) },
        data: { assigneeId: mapping.memberId },
      });
      count += result.count;
    }
    json(res, { count });
  } catch (cause) {
    error(res, cause instanceof Error ? cause.message : "Assign by roles failed", 400);
  }
}
