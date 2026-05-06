import type { ContentFormat, ContentStatus, ImportSource, RoleKey, TaskStatus } from "../types";

const map: Record<string, string> = {
  idea: "идея", in_work: "в работе", review: "проверка", ready: "готово", published: "опубликовано",
  todo: "к работе", in_progress: "в работе", done: "готово", blocked: "блокер",
};
export const getTaskStatusLabel = (status: TaskStatus) => map[status];
export const getContentStatusLabel = (status: ContentStatus) => map[status];
export const getStatusColor = (status: ContentStatus | TaskStatus) =>
  ({ todo: "bg-slate-700", in_progress: "bg-indigo-600", review: "bg-amber-600", done: "bg-emerald-600", blocked: "bg-rose-600", idea: "bg-slate-700", in_work: "bg-indigo-600", ready: "bg-emerald-600", published: "bg-violet-600" } as Record<string, string>)[status];
export const getFormatLabel = (format: ContentFormat) =>
  ({ reels: "Reels", stories: "Stories", post: "Пост", carousel: "Карусель", video: "Видео", article: "Статья", other: "Другое" } as Record<ContentFormat, string>)[format];
export const getRoleLabel = (role: RoleKey) =>
  ({ copywriter: "Копирайтер", designer: "Дизайнер", reels_maker: "Reels-мейкер", stories_maker: "Stories-мейкер", publisher: "Публикатор", reviewer: "Проверяющий", project_manager: "Проджект", other: "Другое" } as Record<RoleKey, string>)[role];
export const getImportSourceLabel = (source: ImportSource) => ({ quick_import: "Быстрый импорт", manual: "Вручную", ai: "AI" }[source]);
