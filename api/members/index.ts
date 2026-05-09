import { z } from "zod";
import { prisma } from "../_lib/prisma";
import { allowMethods, error, json, readJson, type ApiRequest, type ApiResponse } from "../_lib/http";
import { requireUser } from "../_lib/auth";

const memberSchema = z.object({ name: z.string().trim().min(1), username: z.string().optional(), roleLabel: z.string().optional(), avatarEmoji: z.string().optional() });

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!allowMethods(req, res, ["GET", "POST"])) return;
  try {
    const { team } = await requireUser(req);
    if (req.method === "GET") return json(res, await prisma.teamMember.findMany({ where: { teamId: team.id }, orderBy: { createdAt: "asc" } }));
    json(res, await prisma.teamMember.create({ data: { ...memberSchema.parse(readJson(req)), teamId: team.id } }), 201);
  } catch (cause) {
    error(res, cause instanceof Error ? cause.message : "Members request failed", 400);
  }
}
