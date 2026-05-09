import { z } from "zod";
import { prisma } from "../_lib/prisma";
import { error, json, readJson, type ApiRequest, type ApiResponse } from "../_lib/http";
import { requireUser } from "../_lib/auth";

const createSchema = z.object({ name: z.string().trim().min(1), description: z.string().optional(), color: z.string().optional() });
const patchSchema = z.object({ name: z.string().trim().min(1).optional(), description: z.string().optional(), color: z.string().optional(), archived: z.boolean().optional() });

export async function listProjects(req: ApiRequest, res: ApiResponse) {
  try {
    const { team } = await requireUser(req);
    json(res, await prisma.project.findMany({ where: { teamId: team.id }, orderBy: { createdAt: "asc" } }));
  } catch (cause) {
    error(res, cause instanceof Error ? cause.message : "Projects request failed", 400);
  }
}

export async function createProject(req: ApiRequest, res: ApiResponse) {
  try {
    const { team } = await requireUser(req);
    const body = createSchema.parse(readJson(req));
    json(res, await prisma.project.create({ data: { ...body, teamId: team.id } }), 201);
  } catch (cause) {
    error(res, cause instanceof Error ? cause.message : "Project create failed", 400);
  }
}

export async function updateProject(req: ApiRequest, res: ApiResponse, id: string) {
  try {
    const { team } = await requireUser(req);
    const existing = await prisma.project.findFirst({ where: { id, teamId: team.id } });
    if (!existing) return error(res, "Project not found", 404);
    json(res, await prisma.project.update({ where: { id }, data: patchSchema.parse(readJson(req)) }));
  } catch (cause) {
    error(res, cause instanceof Error ? cause.message : "Project update failed", 400);
  }
}
