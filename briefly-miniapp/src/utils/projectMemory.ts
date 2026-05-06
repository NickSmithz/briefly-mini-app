import type { ContentItem, ImportedPlanRow, MemoryWarning, ProjectMemoryItem } from "../types";
import { createId } from "./ids";

const stopWords = new Set([
  "про",
  "для",
  "или",
  "как",
  "что",
  "это",
  "без",
  "при",
  "над",
  "под",
  "после",
  "до",
  "от",
  "из",
  "на",
  "в",
  "и",
  "а",
  "с",
  "по",
  "the",
  "and",
  "for",
  "with",
]);

export function normalizeMemoryText(text: string): string {
  return text
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractKeywords(text: string): string[] {
  const normalized = normalizeMemoryText(text);
  const words = normalized.split(" ").filter((word) => word.length >= 3 && !stopWords.has(word));
  return [...new Set(words)];
}

export function calculateKeywordSimilarity(a: string[] | string, b: string[] | string): number {
  const left = Array.isArray(a) ? a : extractKeywords(a);
  const right = Array.isArray(b) ? b : extractKeywords(b);
  if (!left.length || !right.length) return 0;
  const leftSet = new Set(left);
  const rightSet = new Set(right);
  const intersection = [...leftSet].filter((keyword) => rightSet.has(keyword)).length;
  const union = new Set([...leftSet, ...rightSet]).size;
  return union > 0 ? intersection / union : 0;
}

function contentText(item: Pick<ContentItem, "title" | "topic" | "notes" | "expert">) {
  return [item.title, item.topic, item.notes, item.expert].filter(Boolean).join(" ");
}

function rowText(row: Pick<ImportedPlanRow, "title" | "topic" | "notes" | "expert">) {
  return [row.title, row.topic, row.notes, row.expert].filter(Boolean).join(" ");
}

export function findSimilarContentItems(row: ImportedPlanRow, existingContentItems: ContentItem[]): MemoryWarning[] {
  const rowKeywords = extractKeywords(rowText(row));
  if (!rowKeywords.length) return [];

  return existingContentItems
    .map((item) => ({
      item,
      similarity: calculateKeywordSimilarity(rowKeywords, extractKeywords(contentText(item))),
    }))
    .filter(({ similarity }) => similarity >= 0.34)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3)
    .map(({ item, similarity }) => ({
      id: createId("memory_warning"),
      type: "similar_topic",
      message: `Похоже на уже созданную публикацию: ${item.title}`,
      contentItemId: item.id,
      contentTitle: item.title,
      publishDate: item.publishDate,
      similarity,
    }));
}

export function createMemoryItemFromContentItem(contentItem: ContentItem): ProjectMemoryItem {
  const text = contentText(contentItem);
  return {
    id: createId("memory"),
    teamId: contentItem.teamId,
    projectId: contentItem.projectId,
    contentItemId: contentItem.id,
    title: contentItem.title,
    format: contentItem.format,
    publishDate: contentItem.publishDate,
    normalizedText: normalizeMemoryText(text),
    keywords: extractKeywords(text),
    sourceImportId: contentItem.sourceImportId,
    createdAt: new Date().toISOString(),
  };
}
