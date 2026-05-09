import { prisma } from "../_lib/prisma";
import { error, json, type ApiRequest, type ApiResponse } from "../_lib/http";
import { requireUser } from "../_lib/auth";

export async function getCurrentTeam(req: ApiRequest, res: ApiResponse) {
  try {
    const { user, team } = await requireUser(req);
    const members = await prisma.teamMember.findMany({ where: { teamId: team.id }, orderBy: { createdAt: "asc" } });
    json(res, {
      team,
      user,
      members,
      subscription: {
        id: `sub_${team.id}`,
        teamId: team.id,
        plan: "free",
        status: "trial",
        startedAt: team.createdAt,
        projectsLimit: 3,
        membersLimit: 7,
        contentItemsLimit: 50,
        aiImportsLimit: 0,
        aiImportsUsed: 0,
      },
    });
  } catch (cause) {
    error(res, cause instanceof Error ? cause.message : "Unauthorized", 401);
  }
}
