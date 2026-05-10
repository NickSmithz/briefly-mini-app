import { z } from "zod";
import { prisma } from "../_lib/prisma.js";
import { error, json, readJson, type ApiRequest, type ApiResponse } from "../_lib/http.js";
import { getBearerToken, hasJwtSecret, signToken, verifyTokenValue } from "../_lib/auth.js";
import { parseTelegramUser, verifyTelegramInitData } from "../_lib/telegram.js";

const bodySchema = z.object({ initData: z.string().optional().default("") });

function codedError(res: ApiResponse, status: number, message: string, code: string) {
  return json(res, { error: message, code }, status);
}

export async function authTelegram(req: ApiRequest, res: ApiResponse) {
  try {
    const { initData } = bodySchema.parse(readJson(req));
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const allowMock = process.env.NODE_ENV !== "production";

    if (!hasJwtSecret()) {
      return codedError(res, 500, "JWT secret is not configured", "JWT_SECRET_MISSING");
    }

    if (!initData && !allowMock) {
      return codedError(res, 400, "Telegram initData is required", "TELEGRAM_INIT_DATA_REQUIRED");
    }

    if (!botToken && !allowMock) {
      return codedError(res, 500, "Telegram bot token is not configured", "TELEGRAM_BOT_TOKEN_MISSING");
    }

    const verified = Boolean(initData && botToken && verifyTelegramInitData(initData, botToken));
    if (!verified && !allowMock) {
      return codedError(res, 401, "Telegram initData verification failed", "TELEGRAM_INIT_DATA_INVALID");
    }

    const tgUser = verified ? parseTelegramUser(initData) : { id: 1, first_name: "Briefly", username: "demo_user" };
    if (!tgUser?.id) return codedError(res, 401, "Telegram user not found", "TELEGRAM_USER_NOT_FOUND");

    try {
      const user = await prisma.user.upsert({
        where: { telegramUserId: BigInt(tgUser.id) },
        update: {
          username: tgUser.username,
          firstName: tgUser.first_name,
          lastName: tgUser.last_name,
          photoUrl: "photo_url" in tgUser ? tgUser.photo_url : undefined,
        },
        create: {
          telegramUserId: BigInt(tgUser.id),
          username: tgUser.username,
          firstName: tgUser.first_name,
          lastName: tgUser.last_name,
          photoUrl: "photo_url" in tgUser ? tgUser.photo_url : undefined,
        },
      });

      let member = await prisma.teamMember.findFirst({ where: { userId: user.id }, include: { team: true } });
      if (!member) {
        const team = await prisma.team.create({ data: { name: "Briefly Team", plan: "free" } });
        member = await prisma.teamMember.create({
          data: {
            teamId: team.id,
            userId: user.id,
            name: user.firstName || user.username || "Briefly user",
            username: user.username,
            roleLabel: "project manager",
            avatarEmoji: "🧭",
          },
          include: { team: true },
        });
      }

      return json(res, { token: signToken({ userId: user.id, teamId: member.teamId }), user, team: member.team });
    } catch (cause) {
      console.error("Auth database operation failed", cause instanceof Error ? cause.message : cause);
      return codedError(res, 500, "Auth database operation failed", "AUTH_DB_ERROR");
    }
  } catch (cause) {
    return codedError(res, 400, cause instanceof Error ? cause.message : "Auth failed", "AUTH_REQUEST_INVALID");
  }
}

export async function debugAuth(req: ApiRequest, res: ApiResponse) {
  const token = getBearerToken(req);
  const hasAuthorizationHeader = Boolean(token);

  if (!hasAuthorizationHeader) {
    return json(res, {
      ok: false,
      hasAuthorizationHeader: false,
      error: "Missing Authorization header",
      code: "AUTH_HEADER_MISSING",
    }, 401);
  }

  if (!hasJwtSecret()) {
    return json(res, {
      ok: false,
      hasAuthorizationHeader: true,
      error: "JWT secret is not configured",
      code: "JWT_SECRET_MISSING",
    }, 500);
  }

  const payload = token ? verifyTokenValue(token) : null;
  if (!payload) {
    return json(res, {
      ok: false,
      hasAuthorizationHeader: true,
      error: "Invalid backend token",
      code: "TOKEN_INVALID",
    }, 401);
  }

  if (!payload.userId) {
    return json(res, {
      ok: false,
      hasAuthorizationHeader: true,
      error: "Token payload does not contain userId",
      code: "TOKEN_PAYLOAD_INVALID",
    }, 401);
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) {
    return json(res, {
      ok: false,
      hasAuthorizationHeader: true,
      error: "User not found",
      code: "USER_NOT_FOUND",
      userId: payload.userId,
    }, 401);
  }

  const teamCount = await prisma.teamMember.count({ where: { userId: payload.userId } });
  if (teamCount === 0) {
    return json(res, {
      ok: false,
      hasAuthorizationHeader: true,
      error: "No team membership found for user",
      code: "TEAM_MEMBER_NOT_FOUND",
      userId: payload.userId,
      teamCount,
    }, 401);
  }

  return json(res, {
    ok: true,
    hasAuthorizationHeader: true,
    code: "OK",
    userId: payload.userId,
    telegramUserId: user.telegramUserId,
    teamCount,
  });
}
