import { z } from "zod";
import { prisma } from "../_lib/prisma";
import { allowMethods, error, getQueryString, json, readJson, type ApiRequest, type ApiResponse } from "../_lib/http";
import { requireUser } from "../_lib/auth";

const patchSchema = z.object({ rows: z.unknown().optional(), status: z.enum(["draft", "confirmed", "discarded"]).optional() });

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!allowMethods(req, res, ["PATCH"])) return;
  try {
    const id = getQueryString(req, "id");
    if (!id) return error(res, "Import draft id required", 400);
    const { team } = await requireUser(req);
    const existing = await prisma.importDraft.findFirst({ where: { id, teamId: team.id } });
    if (!existing) return error(res, "Import draft not found", 404);
    json(res, await prisma.importDraft.update({ where: { id }, data: patchSchema.parse(readJson(req)) }));
  } catch (cause) {
    error(res, cause instanceof Error ? cause.message : "Import draft update failed", 400);
  }
}
