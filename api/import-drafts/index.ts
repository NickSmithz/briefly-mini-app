import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../_lib/prisma";
import { allowMethods, error, json, readJson, type ApiRequest, type ApiResponse } from "../_lib/http";
import { requireProject, requireUser } from "../_lib/auth";

const bodySchema = z.object({ projectId: z.string().min(1), source: z.string().min(1), rawText: z.string(), rows: z.unknown() });

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!allowMethods(req, res, ["POST"])) return;
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
