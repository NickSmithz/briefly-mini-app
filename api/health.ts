import type { ApiRequest, ApiResponse } from "./_lib/http";
import { json } from "./_lib/http";

export default function handler(_req: ApiRequest, res: ApiResponse) {
  json(res, { ok: true, time: new Date().toISOString() });
}
