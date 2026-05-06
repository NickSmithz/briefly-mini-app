import type { ContentFormat, ContentStatus, ImportSource, RoleKey, TaskStatus } from "../types";

export const taskStatusLabels: Record<TaskStatus, string> = {
  todo: "к работе",
  in_progress: "в работе",
  review: "проверка",
  done: "готово",
  blocked: "отложена",
};

export const contentStatusLabels: Record<ContentStatus, string> = {
  idea: "идея",
  in_work: "в работе",
  review: "проверка",
  ready: "готово",
  published: "опубликовано",
};

export const roleLabels: Record<RoleKey, string> = {
  copywriter: "Копирайтер",
  designer: "Дизайнер",
  reels_maker: "Reels maker",
  stories_maker: "Stories maker",
  publisher: "Публикатор",
  reviewer: "Проверяющий",
  project_manager: "Руководитель",
  other: "Другое",
};

export const formatLabels: Record<ContentFormat, string> = {
  reels: "Reels",
  stories: "Stories",
  post: "Пост",
  carousel: "Карусель",
  video: "Видео",
  article: "Статья",
  other: "Другое",
};

export function getTaskStatusLabel(status: TaskStatus) { return taskStatusLabels[status]; }
export function getContentStatusLabel(status: ContentStatus) { return contentStatusLabels[status]; }
export function getFormatLabel(format: ContentFormat) { return formatLabels[format]; }
export function getRoleLabel(role: RoleKey) { return roleLabels[role]; }

export function getImportSourceLabel(source: ImportSource): string {
  return source === "quick_import" ? "Быстрый импорт" : source === "manual" ? "Вручную" : "AI";
}

export function getStatusColor(status: ContentStatus | TaskStatus): string {
  const map: Record<string, string> = {
    idea: "slate",
    todo: "slate",
    in_work: "indigo",
    in_progress: "indigo",
    review: "amber",
    ready: "emerald",
    done: "emerald",
    published: "emerald",
    blocked: "orange",
  };
  return map[status] ?? "slate";
}
