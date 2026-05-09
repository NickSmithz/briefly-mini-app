import { z } from "zod";
import { prisma } from "../_lib/prisma";
import { allowMethods, error, json, readJson, type ApiRequest, type ApiResponse } from "../_lib/http";
import { requireUser } from "../_lib/auth";

const createSchema = z.object({ name: z.string().trim().min(1), description: z.string().optional(), color: z.string().optional() });

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!allowMethods(req, res, ["GET", "POST"])) return;
  try {
    const { team } = await requireUser(req);
    if (req.method === "GET") {
      return json(res, await prisma.project.findMany({ where: { teamId: team.id }, orderBy: { createdAt: "asc" } }));
    }
    const body = createSchema.parse(readJson(req));
    json(res, await prisma.project.create({ data: { ...body, teamId: team.id } }), 201);
  } catch (cause) {
    error(res, cause instanceof Error ? cause.message : "Projects request failed", 400);
  }
}
