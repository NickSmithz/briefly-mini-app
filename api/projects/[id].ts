import { z } from "zod";
import { prisma } from "../_lib/prisma";
import { allowMethods, error, getQueryString, json, readJson, type ApiRequest, type ApiResponse } from "../_lib/http";
import { requireUser } from "../_lib/auth";

const patchSchema = z.object({ name: z.string().trim().min(1).optional(), description: z.string().optional(), color: z.string().optional(), archived: z.boolean().optional() });

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!allowMethods(req, res, ["PATCH"])) return;
  try {
    const id = getQueryString(req, "id");
    if (!id) return error(res, "Project id required", 400);
    const { team } = await requireUser(req);
    const existing = await prisma.project.findFirst({ where: { id, teamId: team.id } });
    if (!existing) return error(res, "Project not found", 404);
    json(res, await prisma.project.update({ where: { id }, data: patchSchema.parse(readJson(req)) }));
  } catch (cause) {
    error(res, cause instanceof Error ? cause.message : "Project update failed", 400);
  }
}
