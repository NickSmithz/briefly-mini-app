import type { ContentFormat } from "../types";

export const formatOptions: { value: ContentFormat; label: string }[] = [
  { value: "reels", label: "Reels" },
  { value: "stories", label: "Stories" },
  { value: "post", label: "Пост" },
  { value: "carousel", label: "Карусель" },
  { value: "video", label: "Видео" },
  { value: "article", label: "Статья" },
  { value: "other", label: "Другое" },
];
