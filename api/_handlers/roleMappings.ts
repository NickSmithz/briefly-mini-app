import { z } from "zod";
import { prisma } from "../_lib/prisma";
import { error, getQueryString, json, readJson, type ApiRequest, type ApiResponse } from "../_lib/http";
import { requireMember, requireProject, requireUser } from "../_lib/auth";
import { roleSchema } from "../_lib/validation";

const bodySchema = z.object({ projectId: z.string().min(1), role: roleSchema, memberId: z.string().min(1) });

export async function listRoleMappings(req: ApiRequest, res: ApiResponse) {
  try {
    const { team } = await requireUser(req);
    const projectId = getQueryString(req, "projectId");
    json(res, await prisma.roleMapping.findMany({ where: { teamId: team.id, ...(projectId ? { projectId } : {}) } }));
  } catch (cause) {
    error(res, cause instanceof Error ? cause.message : "Role mappings request failed", 400);
  }
}

export async function setRoleMapping(req: ApiRequest, res: ApiResponse) {
  try {
    const { team } = await requireUser(req);
    const body = bodySchema.parse(readJson(req));
    await requireProject(team.id, body.projectId);
    await requireMember(team.id, body.memberId);
    json(res, await prisma.roleMapping.upsert({
      where: { projectId_role: { projectId: body.projectId, role: body.role } },
      update: { memberId: body.memberId },
      create: { teamId: team.id, projectId: body.projectId, role: body.role, memberId: body.memberId },
    }));
  } catch (cause) {
    error(res, cause instanceof Error ? cause.message : "Role mapping failed", 400);
  }
}
