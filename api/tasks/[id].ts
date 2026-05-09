import { z } from "zod";
import { prisma } from "../_lib/prisma";
import { allowMethods, error, getQueryString, json, readJson, type ApiRequest, type ApiResponse } from "../_lib/http";
import { requireUser } from "../_lib/auth";
import { dateValue, prioritySchema, roleSchema, taskStatusSchema } from "../_lib/validation";

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

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!allowMethods(req, res, ["PATCH", "DELETE"])) return;
  try {
    const id = getQueryString(req, "id");
    if (!id) return error(res, "Task id required", 400);
    const { team } = await requireUser(req);
    const existing = await prisma.task.findFirst({ where: { id, teamId: team.id } });
    if (!existing) return error(res, "Task not found", 404);
    if (req.method === "DELETE") {
      await prisma.task.delete({ where: { id } });
      return json(res, { ok: true });
    }
    const body = patchSchema.parse(readJson(req));
    json(res, await prisma.task.update({ where: { id }, data: { ...body, dueDate: body.dueDate ? dateValue(body.dueDate) : body.dueDate === null ? null : undefined } }));
  } catch (cause) {
    error(res, cause instanceof Error ? cause.message : "Task update failed", 400);
  }
}
