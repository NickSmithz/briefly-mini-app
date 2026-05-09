import { prisma } from "../_lib/prisma";
import { allowMethods, error, getQueryString, json, type ApiRequest, type ApiResponse } from "../_lib/http";
import { requireUser } from "../_lib/auth";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!allowMethods(req, res, ["GET"])) return;
  try {
    const { team } = await requireUser(req);
    const projectId = getQueryString(req, "projectId");
    json(res, await prisma.contentItem.findMany({ where: { teamId: team.id, ...(projectId ? { projectId } : {}) }, orderBy: { publishDate: "asc" } }));
  } catch (cause) {
    error(res, cause instanceof Error ? cause.message : "Content items request failed", 400);
  }
}
