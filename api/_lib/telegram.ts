import crypto from "node:crypto";

type ParsedTelegramUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
};

function timingSafeHexEqual(a: string, b: string) {
  const left = Buffer.from(a, "hex");
  const right = Buffer.from(b, "hex");
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export function verifyTelegramInitData(initData: string, botToken: string) {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return false;
  params.delete("hash");
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  const secret = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const calculated = crypto.createHmac("sha256", secret).update(dataCheckString).digest("hex");
  return timingSafeHexEqual(calculated, hash);
}

export function parseTelegramUser(initData: string): ParsedTelegramUser | null {
  const raw = new URLSearchParams(initData).get("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ParsedTelegramUser;
  } catch {
    return null;
  }
}
