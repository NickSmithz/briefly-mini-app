import jwt from "jsonwebtoken";
import { prisma } from "./prisma.js";
import type { ApiRequest } from "./http.js";

type TokenPayload = {
  userId: string;
  teamId: string;
};

function getJwtSecret() {
  return process.env.JWT_SECRET || "dev-briefly-secret";
}

export function signToken(payload: TokenPayload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "30d" });
}

export function getBearerToken(req: ApiRequest) {
  const header = req.headers.authorization;
  const value = Array.isArray(header) ? header[0] : header;
  if (!value?.startsWith("Bearer ")) return null;
  return value.slice("Bearer ".length);
}

export function verifyToken(req: ApiRequest): TokenPayload | null {
  const token = getBearerToken(req);
  if (!token) return null;
  try {
    return jwt.verify(token, getJwtSecret()) as TokenPayload;
  } catch {
    return null;
  }
}

export async function requireUser(req: ApiRequest) {
  const payload = verifyToken(req);
  if (!payload) throw new Error("Unauthorized");
  const member = await prisma.teamMember.findFirst({
    where: { teamId: payload.teamId, userId: payload.userId },
    include: { user: true, team: true },
  });
  if (!member) throw new Error("Unauthorized");
  return { user: member.user, team: member.team, member };
}

export async function requireProject(teamId: string, projectId: string) {
  const project = await prisma.project.findFirst({ where: { id: projectId, teamId } });
  if (!project) throw new Error("Project not found");
  return project;
}

export async function requireMember(teamId: string, memberId: string) {
  const member = await prisma.teamMember.findFirst({ where: { id: memberId, teamId } });
  if (!member) throw new Error("Member not found");
  return member;
}
