export type ApiRequest = {
  method?: string;
  url?: string;
  headers: Record<string, string | string[] | undefined>;
  query?: Record<string, string | string[] | undefined>;
  body?: unknown;
};

export type ApiResponse = {
  status: (code: number) => ApiResponse;
  json: (data: unknown) => void;
  setHeader?: (name: string, value: string) => void;
};

export function serialize(data: unknown): unknown {
  if (data instanceof Date) return data.toISOString();
  if (typeof data === "bigint") return data.toString();
  if (Array.isArray(data)) return data.map(serialize);
  if (data && typeof data === "object") {
    return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, serialize(value)]));
  }
  return data;
}

export function json(res: ApiResponse, data: unknown, status = 200) {
  res.status(status).json(serialize(data));
}

export function error(res: ApiResponse, message: string, status = 400) {
  json(res, { error: message }, status);
}

export function readJson<T = unknown>(req: ApiRequest): T {
  if (typeof req.body === "string") return JSON.parse(req.body) as T;
  return (req.body ?? {}) as T;
}

export function allowMethods(req: ApiRequest, res: ApiResponse, methods: string[]) {
  if (req.method && methods.includes(req.method)) return true;
  if (res.setHeader) res.setHeader("Allow", methods.join(", "));
  error(res, "Method not allowed", 405);
  return false;
}

export function getQueryString(req: ApiRequest, key: string) {
  const value = req.query?.[key];
  return Array.isArray(value) ? value[0] : value;
}
