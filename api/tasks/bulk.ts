import { z } from "zod";
import { prisma } from "../_lib/prisma";
import { allowMethods, error, json, readJson, type ApiRequest, type ApiResponse } from "../_lib/http";
import { requireUser } from "../_lib/auth";
import { dateValue, prioritySchema, roleSchema, taskStatusSchema } from "../_lib/validation";

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
const bodySchema = z.object({ tasks: z.array(taskSchema) });

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!allowMethods(req, res, ["POST"])) return;
  try {
    const { team } = await requireUser(req);
    const body = bodySchema.parse(readJson(req));
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
