import { z } from "zod";
import { prisma } from "../_lib/prisma";
import { error, json, readJson, type ApiRequest, type ApiResponse } from "../_lib/http";
import { requireUser } from "../_lib/auth";

const memberSchema = z.object({ name: z.string().trim().min(1), username: z.string().optional(), roleLabel: z.string().optional(), avatarEmoji: z.string().optional() });
const patchSchema = memberSchema.partial();

export async function listMembers(req: ApiRequest, res: ApiResponse) {
  try {
    const { team } = await requireUser(req);
    json(res, await prisma.teamMember.findMany({ where: { teamId: team.id }, orderBy: { createdAt: "asc" } }));
  } catch (cause) {
    error(res, cause instanceof Error ? cause.message : "Members request failed", 400);
  }
}

export async function createMember(req: ApiRequest, res: ApiResponse) {
  try {
    const { team } = await requireUser(req);
    json(res, await prisma.teamMember.create({ data: { ...memberSchema.parse(readJson(req)), teamId: team.id } }), 201);
  } catch (cause) {
    error(res, cause instanceof Error ? cause.message : "Member create failed", 400);
  }
}

export async function updateMember(req: ApiRequest, res: ApiResponse, id: string) {
  try {
    const { team } = await requireUser(req);
    const existing = await prisma.teamMember.findFirst({ where: { id, teamId: team.id } });
    if (!existing) return error(res, "Member not found", 404);
    json(res, await prisma.teamMember.update({ where: { id }, data: patchSchema.parse(readJson(req)) }));
  } catch (cause) {
    error(res, cause instanceof Error ? cause.message : "Member update failed", 400);
  }
}

export async function deleteMember(req: ApiRequest, res: ApiResponse, id: string) {
  try {
    const { team } = await requireUser(req);
    const existing = await prisma.teamMember.findFirst({ where: { id, teamId: team.id } });
    if (!existing) return error(res, "Member not found", 404);
    await prisma.teamMember.delete({ where: { id } });
    json(res, { ok: true });
  } catch (cause) {
    error(res, cause instanceof Error ? cause.message : "Member delete failed", 400);
  }
}
