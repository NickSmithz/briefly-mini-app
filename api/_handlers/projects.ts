import { z } from "zod";
import { prisma } from "../_lib/prisma.js";
import { error, json, readJson, type ApiRequest, type ApiResponse } from "../_lib/http.js";
import { AuthError, requireUser } from "../_lib/auth.js";

const createSchema = z.object({ name: z.string().trim().min(1), description: z.string().optional(), color: z.string().optional() });
const patchSchema = z.object({ name: z.string().trim().min(1).optional(), description: z.string().optional(), color: z.string().optional(), archived: z.boolean().optional() });

function handleProjectError(res: ApiResponse, cause: unknown, fallback: string) {
  if (cause instanceof AuthError) return json(res, { error: cause.message, code: cause.code }, cause.status);
  return error(res, cause instanceof Error ? cause.message : fallback, 400);
}

export async function listProjects(req: ApiRequest, res: ApiResponse) {
  try {
    const { team } = await requireUser(req);
    json(res, await prisma.project.findMany({ where: { teamId: team.id }, orderBy: { createdAt: "asc" } }));
  } catch (cause) {
    handleProjectError(res, cause, "Projects request failed");
  }
}

export async function createProject(req: ApiRequest, res: ApiResponse) {
  try {
    const { team } = await requireUser(req);
    if (!team?.id) return error(res, "No team found for current user", 400);
    const body = createSchema.parse(readJson(req));
    json(res, await prisma.project.create({ data: { ...body, teamId: team.id } }), 201);
  } catch (cause) {
    handleProjectError(res, cause, "Project create failed");
  }
}

export async function updateProject(req: ApiRequest, res: ApiResponse, id: string) {
  try {
    const { team } = await requireUser(req);
    const existing = await prisma.project.findFirst({ where: { id, teamId: team.id } });
    if (!existing) return error(res, "Project not found", 404);
    json(res, await prisma.project.update({ where: { id }, data: patchSchema.parse(readJson(req)) }));
  } catch (cause) {
    handleProjectError(res, cause, "Project update failed");
  }
}
