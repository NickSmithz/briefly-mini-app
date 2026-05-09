import { z } from "zod";
import { prisma } from "../_lib/prisma";
import { allowMethods, error, getQueryString, json, readJson, type ApiRequest, type ApiResponse } from "../_lib/http";
import { requireUser } from "../_lib/auth";

const patchSchema = z.object({ name: z.string().trim().min(1).optional(), username: z.string().optional(), roleLabel: z.string().optional(), avatarEmoji: z.string().optional() });

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!allowMethods(req, res, ["PATCH", "DELETE"])) return;
  try {
    const id = getQueryString(req, "id");
    if (!id) return error(res, "Member id required", 400);
    const { team } = await requireUser(req);
    const existing = await prisma.teamMember.findFirst({ where: { id, teamId: team.id } });
    if (!existing) return error(res, "Member not found", 404);
    if (req.method === "DELETE") {
      await prisma.teamMember.delete({ where: { id } });
      return json(res, { ok: true });
    }
    json(res, await prisma.teamMember.update({ where: { id }, data: patchSchema.parse(readJson(req)) }));
  } catch (cause) {
    error(res, cause instanceof Error ? cause.message : "Member update failed", 400);
  }
}
