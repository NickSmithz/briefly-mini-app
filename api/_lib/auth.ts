import jwt from "jsonwebtoken";
import { prisma } from "./prisma.js";
import type { ApiRequest } from "./http.js";

export type TokenPayload = {
  userId: string;
  teamId: string;
};

export class AuthError extends Error {
  status: number;
  code: string;

  constructor(message: string, code = "UNAUTHORIZED", status = 401) {
    super(message);
    this.name = "AuthError";
    this.status = status;
    this.code = code;
  }
}

export function getJwtSecret() {
  return process.env.JWT_SECRET || (process.env.NODE_ENV !== "production" ? "dev-briefly-secret" : "");
}

export function hasJwtSecret() {
  return Boolean(getJwtSecret());
}

export function signToken(payload: TokenPayload) {
  if (!hasJwtSecret()) throw new AuthError("JWT secret is not configured", "JWT_SECRET_MISSING", 500);
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

export function verifyTokenValue(token: string): TokenPayload | null {
  if (!hasJwtSecret()) return null;
  try {
    return jwt.verify(token, getJwtSecret()) as TokenPayload;
  } catch {
    return null;
  }
}

export function verifyToken(req: ApiRequest): TokenPayload | null {
  const token = getBearerToken(req);
  if (!token) return null;
  return verifyTokenValue(token);
}

export async function requireUser(req: ApiRequest) {
  const token = getBearerToken(req);
  if (!token) throw new AuthError("Missing Authorization header", "AUTH_HEADER_MISSING");
  if (!hasJwtSecret()) throw new AuthError("JWT secret is not configured", "JWT_SECRET_MISSING", 500);

  const payload = verifyTokenValue(token);
  if (!payload) throw new AuthError("Invalid backend token", "TOKEN_INVALID");
  if (!payload.userId) throw new AuthError("Token payload does not contain userId", "TOKEN_PAYLOAD_INVALID");

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) throw new AuthError("User not found", "USER_NOT_FOUND");

  const member = await prisma.teamMember.findFirst({
    where: { teamId: payload.teamId, userId: payload.userId },
    include: { user: true, team: true },
  });
  if (!member) throw new AuthError("No team membership found for user", "TEAM_MEMBER_NOT_FOUND");
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
