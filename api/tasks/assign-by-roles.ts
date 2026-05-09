import { z } from "zod";
import { prisma } from "../_lib/prisma";
import { allowMethods, error, json, readJson, type ApiRequest, type ApiResponse } from "../_lib/http";
import { requireProject, requireUser } from "../_lib/auth";

const bodySchema = z.object({ projectId: z.string().min(1), overwrite: z.boolean().optional().default(false) });

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!allowMethods(req, res, ["POST"])) return;
  try {
    const { team } = await requireUser(req);
    const body = bodySchema.parse(readJson(req));
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
