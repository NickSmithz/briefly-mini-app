import { z } from "zod";

export const taskStatusSchema = z.enum(["todo", "in_progress", "review", "done", "blocked"]);
export const contentStatusSchema = z.enum(["idea", "in_work", "review", "ready", "published"]);
export const prioritySchema = z.enum(["low", "normal", "high"]);
export const roleSchema = z.enum(["copywriter", "designer", "reels_maker", "stories_maker", "publisher", "reviewer", "project_manager", "other"]);
export const formatSchema = z.enum(["reels", "stories", "post", "carousel", "video", "article", "other"]);

export function dateValue(value?: string | null) {
  return value ? new Date(`${value}T00:00:00.000Z`) : undefined;
}

export function dateOnly(value: Date | string | null | undefined) {
  if (!value) return undefined;
  return new Date(value).toISOString().slice(0, 10);
}
