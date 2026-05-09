import { z } from "zod";
import { prisma } from "../_lib/prisma";
import { allowMethods, error, getQueryString, json, readJson, type ApiRequest, type ApiResponse } from "../_lib/http";
import { requireUser } from "../_lib/auth";
import { contentStatusSchema, dateValue, formatSchema } from "../_lib/validation";

const patchSchema = z.object({
  title: z.string().trim().min(1).optional(),
  format: formatSchema.optional(),
  publishDate: z.string().optional(),
  topic: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  expert: z.string().optional().nullable(),
  status: contentStatusSchema.optional(),
});

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!allowMethods(req, res, ["PATCH", "DELETE"])) return;
  try {
    const id = getQueryString(req, "id");
    if (!id) return error(res, "Content item id required", 400);
    const { team } = await requireUser(req);
    const existing = await prisma.contentItem.findFirst({ where: { id, teamId: team.id } });
    if (!existing) return error(res, "Content item not found", 404);
    if (req.method === "DELETE") {
      await prisma.contentItem.delete({ where: { id } });
      return json(res, { ok: true });
    }
    const body = patchSchema.parse(readJson(req));
    json(res, await prisma.contentItem.update({
      where: { id },
      data: { ...body, publishDate: body.publishDate ? dateValue(body.publishDate) : undefined },
    }));
  } catch (cause) {
    error(res, cause instanceof Error ? cause.message : "Content item update failed", 400);
  }
}
