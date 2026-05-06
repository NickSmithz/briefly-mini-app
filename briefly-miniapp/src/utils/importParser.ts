import type { ContentFormat, ImportedPlanRow } from "../types";
import { createId } from "./ids";

const formatMap: Record<string, ContentFormat> = {
  reels: "reels",
  reel: "reels",
  рилс: "reels",
  stories: "stories",
  story: "stories",
  сторис: "stories",
  post: "post",
  пост: "post",
  carousel: "carousel",
  карусель: "carousel",
  "пост-карусель": "carousel",
  "карусель-пост": "carousel",
  video: "video",
  видео: "video",
  article: "article",
  статья: "article",
};

function normalizeFormat(value: string): ContentFormat {
  return formatMap[value.trim().toLowerCase()] ?? "other";
}

function parseDateToISO(raw: string, currentYear: number): string {
  const value = raw.trim();
  if (!value) return "";
  const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return value;
  const ru = value.match(/^(\d{1,2})\.(\d{1,2})(?:\.(\d{4}))?$/);
  if (!ru) return "";
  const day = Number(ru[1]);
  const month = Number(ru[2]);
  const year = Number(ru[3] ?? currentYear);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return "";
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function extractExpert(notes?: string): string | undefined {
  return notes?.match(/\b[А-ЯЁ][а-яё]+ [А-ЯЁ][а-яё]+\b/u)?.[0];
}

export function parsePlanText(text: string, currentYear: number): ImportedPlanRow[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((raw) => {
      const hasPipe = raw.includes("|");
      const hasDash = raw.includes(" - ");
      const parts = hasPipe ? raw.split("|") : hasDash ? raw.split(" - ") : [raw];
      const parsed = hasPipe || hasDash;
      const dateRaw = parsed ? (parts[0] ?? "").trim() : "";
      const formatRaw = parsed ? (parts[1] ?? "").trim() : "";
      const title = parsed ? (parts[2] ?? "").trim() : raw;
      const notes = parsed ? parts.slice(3).join(" ").trim() || undefined : undefined;
      const format = normalizeFormat(formatRaw);
      const publishDate = parsed ? parseDateToISO(dateRaw, currentYear) : "";
      const errors: string[] = [];
      const warnings: string[] = [];
      if (!publishDate) errors.push("Дата не распознана");
      if (!title) errors.push("Название не заполнено");
      if (format === "other") warnings.push("Формат не распознан");
      return {
        id: createId("row"),
        raw,
        dateRaw,
        publishDate,
        format,
        title,
        notes,
        expert: extractExpert(notes),
        isValid: Boolean(publishDate && title),
        errors,
        warnings,
        source: "quick_import",
        confidence: parsed ? 1 : 0.4,
      };
    });
}
