import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../_lib/prisma";
import { error, json, readJson, type ApiRequest, type ApiResponse } from "../_lib/http";
import { requireProject, requireUser } from "../_lib/auth";

const bodySchema = z.object({ projectId: z.string().min(1), source: z.string().min(1), rawText: z.string(), rows: z.unknown() });
const patchSchema = z.object({ rows: z.unknown().optional(), status: z.enum(["draft", "confirmed", "discarded"]).optional() });

export async function createImportDraft(req: ApiRequest, res: ApiResponse) {
  try {
    const { team } = await requireUser(req);
    const body = bodySchema.parse(readJson(req));
    await requireProject(team.id, body.projectId);
    const data: Prisma.ImportDraftUncheckedCreateInput = {
      teamId: team.id,
      projectId: body.projectId,
      source: body.source,
      rawText: body.rawText,
      rows: body.rows as Prisma.InputJsonValue,
    };
    json(res, await prisma.importDraft.create({ data }), 201);
  } catch (cause) {
    error(res, cause instanceof Error ? cause.message : "Import draft failed", 400);
  }
}

export async function updateImportDraft(req: ApiRequest, res: ApiResponse, id: string) {
  try {
    const { team } = await requireUser(req);
    const existing = await prisma.importDraft.findFirst({ where: { id, teamId: team.id } });
    if (!existing) return error(res, "Import draft not found", 404);
    const patch = patchSchema.parse(readJson(req));
    const data: Prisma.ImportDraftUpdateInput = {};
    if (patch.rows !== undefined) data.rows = patch.rows as Prisma.InputJsonValue;
    if (patch.status !== undefined) data.status = patch.status;
    json(res, await prisma.importDraft.update({ where: { id }, data }));
  } catch (cause) {
    error(res, cause instanceof Error ? cause.message : "Import draft update failed", 400);
  }
}
