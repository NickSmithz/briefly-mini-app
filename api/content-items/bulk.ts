import { z } from "zod";
import { prisma } from "../_lib/prisma";
import { allowMethods, error, json, readJson, type ApiRequest, type ApiResponse } from "../_lib/http";
import { requireProject, requireUser } from "../_lib/auth";
import { contentStatusSchema, dateValue, formatSchema } from "../_lib/validation";

const itemSchema = z.object({
  title: z.string().trim().min(1),
  format: formatSchema,
  publishDate: z.string().min(1),
  topic: z.string().optional(),
  notes: z.string().optional(),
  expert: z.string().optional(),
  status: contentStatusSchema.optional(),
  importSource: z.string().optional(),
  sourceImportId: z.string().optional(),
  confidence: z.number().optional(),
});
const bodySchema = z.object({ projectId: z.string().min(1), importDraftId: z.string().optional(), items: z.array(itemSchema) });

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!allowMethods(req, res, ["POST"])) return;
  try {
    const { team } = await requireUser(req);
    const body = bodySchema.parse(readJson(req));
    await requireProject(team.id, body.projectId);
    const created = await prisma.$transaction(body.items.map((item) => prisma.contentItem.create({
      data: {
        teamId: team.id,
        projectId: body.projectId,
        title: item.title,
        format: item.format,
        publishDate: dateValue(item.publishDate)!,
        topic: item.topic,
        notes: item.notes,
        expert: item.expert,
        status: item.status ?? "idea",
        importSource: item.importSource ?? "manual",
        sourceImportId: item.sourceImportId ?? body.importDraftId,
        confidence: item.confidence,
      },
    })));
    json(res, created, 201);
  } catch (cause) {
    error(res, cause instanceof Error ? cause.message : "Bulk content create failed", 400);
  }
}
