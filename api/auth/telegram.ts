import { z } from "zod";
import { prisma } from "../_lib/prisma";
import { allowMethods, error, json, readJson, type ApiRequest, type ApiResponse } from "../_lib/http";
import { signToken } from "../_lib/auth";
import { parseTelegramUser, verifyTelegramInitData } from "../_lib/telegram";

const bodySchema = z.object({ initData: z.string().optional().default("") });

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!allowMethods(req, res, ["POST"])) return;
  try {
    const { initData } = bodySchema.parse(readJson(req));
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const allowMock = process.env.NODE_ENV !== "production";
    const verified = Boolean(initData && botToken && verifyTelegramInitData(initData, botToken));
    if (!verified && !allowMock) return error(res, "Invalid Telegram initData", 401);
    const tgUser = verified ? parseTelegramUser(initData) : { id: 1, first_name: "Briefly", username: "demo_user" };
    if (!tgUser?.id) return error(res, "Telegram user not found", 401);

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

    json(res, { token: signToken({ userId: user.id, teamId: member.teamId }), user, team: member.team });
  } catch (cause) {
    error(res, cause instanceof Error ? cause.message : "Auth failed", 400);
  }
}
