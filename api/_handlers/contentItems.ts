import { z } from "zod";
import { prisma } from "../_lib/prisma.js";
import { error, getQueryString, json, readJson, type ApiRequest, type ApiResponse } from "../_lib/http.js";
import { requireProject, requireUser } from "../_lib/auth.js";
import { contentStatusSchema, dateValue, formatSchema } from "../_lib/validation.js";

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
const bulkSchema = z.object({ projectId: z.string().min(1), importDraftId: z.string().optional(), items: z.array(itemSchema) });
const patchSchema = z.object({
  title: z.string().trim().min(1).optional(),
  format: formatSchema.optional(),
  publishDate: z.string().optional(),
  topic: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  expert: z.string().optional().nullable(),
  status: contentStatusSchema.optional(),
});

export async function listContentItems(req: ApiRequest, res: ApiResponse) {
  try {
    const { team } = await requireUser(req);
    const projectId = getQueryString(req, "projectId");
    json(res, await prisma.contentItem.findMany({ where: { teamId: team.id, ...(projectId ? { projectId } : {}) }, orderBy: { publishDate: "asc" } }));
  } catch (cause) {
    error(res, cause instanceof Error ? cause.message : "Content items request failed", 400);
  }
}

export async function createContentItemsBulk(req: ApiRequest, res: ApiResponse) {
  try {
    const { team } = await requireUser(req);
    const body = bulkSchema.parse(readJson(req));
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

export async function updateContentItem(req: ApiRequest, res: ApiResponse, id: string) {
  try {
    const { team } = await requireUser(req);
    const existing = await prisma.contentItem.findFirst({ where: { id, teamId: team.id } });
    if (!existing) return error(res, "Content item not found", 404);
    const body = patchSchema.parse(readJson(req));
    json(res, await prisma.contentItem.update({ where: { id }, data: { ...body, publishDate: body.publishDate ? dateValue(body.publishDate) : undefined } }));
  } catch (cause) {
    error(res, cause instanceof Error ? cause.message : "Content item update failed", 400);
  }
}

export async function deleteContentItem(req: ApiRequest, res: ApiResponse, id: string) {
  try {
    const { team } = await requireUser(req);
    const existing = await prisma.contentItem.findFirst({ where: { id, teamId: team.id } });
    if (!existing) return error(res, "Content item not found", 404);
    await prisma.contentItem.delete({ where: { id } });
    json(res, { ok: true });
  } catch (cause) {
    error(res, cause instanceof Error ? cause.message : "Content item delete failed", 400);
  }
}
