import { useState } from "react";
import { Card } from "../components/Card";
import { ContentItemCard } from "../components/ContentItemCard";
import { Select } from "../components/Select";
import { formatOptions } from "../data/formatOptions";
import type { ContentFormat, ContentStatus } from "../types";
import { useAppStore } from "../store/useAppStore";
import { formatDate, sortByDate } from "../utils/dates";

export function ContentCalendarScreen() {
  const state = useAppStore();
  const setSelectedProject = useAppStore((s) => s.setSelectedProject);
  const updateContentItem = useAppStore((s) => s.updateContentItem);
  const [formatFilter, setFormatFilter] = useState<ContentFormat | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ContentStatus | "all">("all");
  const items = sortByDate(state.contentItems.filter((item) => (!state.selectedProjectId || item.projectId === state.selectedProjectId) && (formatFilter === "all" || item.format === formatFilter) && (statusFilter === "all" || item.status === statusFilter)), "publishDate");
  const groups = items.reduce<Record<string, typeof items>>((acc, item) => {
    acc[item.publishDate] = [...(acc[item.publishDate] ?? []), item];
    return acc;
  }, {});
  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <h2 className="text-xl font-black">Контент-календарь</h2>
        <Select value={state.selectedProjectId ?? ""} onChange={(e) => setSelectedProject(e.target.value)}>
          {state.projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
        </Select>
        <div className="grid grid-cols-2 gap-2">
          <Select value={formatFilter} onChange={(e) => setFormatFilter(e.target.value as ContentFormat | "all")}><option value="all">Все форматы</option>{formatOptions.map((o) => <option value={o.value} key={o.value}>{o.label}</option>)}</Select>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ContentStatus | "all")}><option value="all">Все статусы</option><option value="idea">Идея</option><option value="in_work">В работе</option><option value="review">Проверка</option><option value="ready">Готово</option><option value="published">Опубликовано</option></Select>
        </div>
      </Card>
      {Object.entries(groups).map(([date, group]) => (
        <section key={date} className="space-y-2">
          <h3 className="font-bold">{formatDate(date)}</h3>
          {group.map((item) => <ContentItemCard key={item.id} item={item} tasksCount={state.tasks.filter((task) => task.contentItemId === item.id).length} onStatus={(status: ContentStatus) => updateContentItem(item.id, { status })} />)}
        </section>
      ))}
      {!items.length && <p className="text-sm text-slate-500">Публикаций пока нет. Импортируйте первый план.</p>}
    </div>
  );
}
