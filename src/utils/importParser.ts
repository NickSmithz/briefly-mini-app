import { parse, isValid, format as fmt } from "date-fns";
import type { ContentFormat, ImportedPlanRow } from "../types";
import { createId } from "./ids";

const normalizeFormat = (raw: string): ContentFormat => {
  const v = raw.trim().toLowerCase();
  if (["reels", "рилс", "reel"].includes(v)) return "reels";
  if (["stories", "story", "сторис"].includes(v)) return "stories";
  if (["post", "пост"].includes(v)) return "post";
  if (["carousel", "карусель", "пост-карусель", "карусель-пост"].includes(v)) return "carousel";
  if (["video", "видео"].includes(v)) return "video";
  if (["article", "статья"].includes(v)) return "article";
  return "other";
};
const parseDate = (raw: string, year: number) => {
  const value = raw.trim();
  const candidates = ["d.MM", "dd.MM", "d.MM.yyyy", "dd.MM.yyyy", "yyyy-MM-dd"]
    .map((f) => parse(value, f, new Date(year, 0, 1)))
    .find((d) => isValid(d));
  if (!candidates) return "";
  const withYear = value.includes(".") && !value.includes(String(year)) && !/\d{4}-\d{2}-\d{2}/.test(value) ? parse(`${value}.${year}`, "d.MM.yyyy", new Date()) : candidates;
  return isValid(withYear) ? fmt(withYear, "yyyy-MM-dd") : "";
};
const expertFromNotes = (notes: string) => notes.match(/\b[А-ЯЁ][а-яё]+\s+[А-ЯЁ][а-яё]+\b/)?.[0];

export const parsePlanText = (text: string, currentYear: number): ImportedPlanRow[] =>
  text.split("\n").map((line) => line.trim()).filter(Boolean).map((raw) => {
    const parts = raw.includes("|") ? raw.split("|").map((x) => x.trim()) : raw.includes(" - ") ? raw.split(" - ").map((x) => x.trim()) : ["" , "other", raw];
    const [dateRaw = "", formatRaw = "other", titleRaw = "", ...rest] = parts;
    const notes = rest.join(" ").trim();
    const format = normalizeFormat(formatRaw);
    const publishDate = parseDate(dateRaw, currentYear);
    const errors: string[] = []; const warnings: string[] = [];
    if (!publishDate) errors.push("Дата не распознана");
    if (!titleRaw.trim()) errors.push("Пустое название");
    if (format === "other") warnings.push("Формат не распознан");
    const parsed = raw.includes("|") || raw.includes(" - ");
    return {
      id: createId("row"), raw, dateRaw, publishDate, format, title: titleRaw.trim(), notes: notes || undefined, expert: notes ? expertFromNotes(notes) : undefined,
      isValid: errors.length === 0, errors, warnings, source: "quick_import", confidence: parsed ? 1 : 0.4,
    };
  });
