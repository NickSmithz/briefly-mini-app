import { useState } from "react";
import { Database } from "lucide-react";
import { Card } from "../components/Card";
import { ContentItemCard } from "../components/ContentItemCard";
import { EmptyState } from "../components/EmptyState";
import { Select } from "../components/Select";
import { formatOptions } from "../data/formatOptions";
import type { ContentFormat, ContentStatus } from "../types";
import { useBrieflyData } from "../store/useBrieflyData";
import { formatDate, sortByDate } from "../utils/dates";
import { Button } from "../components/Button";

export function ContentCalendarScreen() {
  const data = useBrieflyData();
  const [formatFilter, setFormatFilter] = useState<ContentFormat | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ContentStatus | "all">("all");
  const projects = data.projects.filter((project) => project.teamId === data.activeTeamId && !project.archived);
  const selectedProjectId = data.selectedProjectId ?? projects[0]?.id ?? "";

  if (data.isBackendMode && !data.isBackendReady) {
    return (
      <EmptyState
        icon={<Database />}
        title="Team sync mode не подключён"
        description="Войдите через Telegram в настройках, чтобы видеть общий календарь команды."
        action={<Button onClick={() => data.actions.setActiveTab("settings")}>Открыть настройки</Button>}
      />
    );
  }

  const items = sortByDate(
    data.contentItems.filter(
      (item) =>
        (!selectedProjectId || item.projectId === selectedProjectId) &&
        (formatFilter === "all" || item.format === formatFilter) &&
        (statusFilter === "all" || item.status === statusFilter),
    ),
    "publishDate",
  );
  const groups = items.reduce<Record<string, typeof items>>((acc, item) => {
    acc[item.publishDate] = [...(acc[item.publishDate] ?? []), item];
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <h2 className="text-xl font-black">Контент-календарь</h2>
        <Select value={selectedProjectId} onChange={(event) => data.actions.setSelectedProject(event.target.value)}>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </Select>
        <div className="grid grid-cols-2 gap-2">
          <Select value={formatFilter} onChange={(event) => setFormatFilter(event.target.value as ContentFormat | "all")}>
            <option value="all">Все форматы</option>
            {formatOptions.map((option) => (
              <option value={option.value} key={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as ContentStatus | "all")}>
            <option value="all">Все статусы</option>
            <option value="idea">Идея</option>
            <option value="in_work">В работе</option>
            <option value="review">Проверка</option>
            <option value="ready">Готово</option>
            <option value="published">Опубликовано</option>
          </Select>
        </div>
      </Card>

      {Object.entries(groups).map(([date, group]) => (
        <section key={date} className="space-y-2">
          <h3 className="font-bold">{formatDate(date)}</h3>
          {group.map((item) => (
            <ContentItemCard
              key={item.id}
              item={item}
              tasksCount={data.tasks.filter((task) => task.contentItemId === item.id).length}
              onStatus={(status: ContentStatus) => data.actions.updateContentItem(item.id, { status })}
            />
          ))}
        </section>
      ))}

      {!items.length && (
        <EmptyState
          title="Публикаций пока нет"
          description={
            data.mode === "backend"
              ? "В этой команде пока нет публикаций для выбранного проекта."
              : "Импортируйте первый план, чтобы увидеть календарь."
          }
          action={<Button onClick={() => data.actions.setActiveTab("import")}>Импортировать план</Button>}
        />
      )}
    </div>
  );
}
