import jwt from "jsonwebtoken";
import { prisma } from "./prisma.js";
import type { ApiRequest } from "./http.js";

type TokenPayload = {
  userId: string;
  teamId: string;
};

function getJwtSecret() {
  return process.env.JWT_SECRET || (process.env.NODE_ENV !== "production" ? "dev-briefly-secret" : "");
}

export function hasJwtSecret() {
  return Boolean(getJwtSecret());
}

export function signToken(payload: TokenPayload) {
  if (!hasJwtSecret()) throw new Error("JWT_SECRET_MISSING");
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "30d" });
}

export function getHeader(req: ApiRequest | { headers?: unknown } | null | undefined, name: string): string | undefined {
  const lower = name.toLowerCase();
  const headers = req && typeof req === "object" ? req.headers : undefined;
  if (!headers) return undefined;

  if (typeof (headers as { get?: unknown }).get === "function") {
    const value = (headers as { get: (key: string) => string | null }).get(name) ?? (headers as { get: (key: string) => string | null }).get(lower);
    return value ?? undefined;
  }

  const record = headers as Record<string, string | string[] | undefined>;
  const value = record[name] ?? record[lower];
  if (Array.isArray(value)) return value[0];
  return typeof value === "string" ? value : undefined;
}

export function getBearerToken(req: ApiRequest | { headers?: unknown } | null | undefined): string | null {
  const authorization = getHeader(req, "authorization");
  if (!authorization) return null;

  const [scheme, token] = authorization.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

export function verifyToken(req: ApiRequest): TokenPayload | null {
  const token = getBearerToken(req);
  if (!token) return null;
  if (!hasJwtSecret()) return null;
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
