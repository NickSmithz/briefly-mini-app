import { useState } from "react";
import { Pencil } from "lucide-react";
import type { ContentItem, Project, Task, TaskStatus, TeamMember } from "../types";
import { formatDateShort } from "../utils/dates";
import { getFormatLabel, getRoleLabel } from "../utils/status";
import { Button } from "./Button";
import { Card } from "./Card";
import { LinkifiedText } from "./LinkifiedText";
import { StatusBadge } from "./StatusBadge";

export type TaskCardProps = {
  task: Task;
  project?: Project;
  contentItem?: ContentItem;
  assignee?: TeamMember;
  members?: TeamMember[];
  showFullContext?: boolean;
  compact?: boolean;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  onEdit?: (task: Task) => void;
};

function isLongText(text?: string) {
  return Boolean(text && (text.length > 120 || text.split(/\r?\n/).length > 2));
}

export function TaskCard({
  task,
  assignee,
  project,
  contentItem,
  showFullContext = false,
  compact = false,
  onStatusChange,
  onEdit,
}: TaskCardProps) {
  const isDone = task.status === "done";
  const hasContext = Boolean(task.description || contentItem);
  const hasLongContext = isLongText(task.description) || isLongText(contentItem?.notes);
  const [contextOpen, setContextOpen] = useState(showFullContext);
  const shouldShowContextToggle = hasContext && (showFullContext || (!compact && hasLongContext));
  const shouldShowContext = hasContext && (showFullContext ? contextOpen : contextOpen && !compact);
  const publicationLine = contentItem
    ? `${getFormatLabel(contentItem.format)} · ${formatDateShort(contentItem.publishDate)} · ${contentItem.title}`
    : "";

  return (
    <Card className={`max-w-full min-w-0 overflow-hidden space-y-3 p-3 ${isDone ? "opacity-70" : ""}`}>
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="break-words font-semibold">{task.title}</h4>
          <p className="break-words text-xs text-slate-400">
            {project?.name || "Проект"} · {assignee ? `${assignee.avatarEmoji || ""} ${assignee.name}` : task.role ? getRoleLabel(task.role) : "Без исполнителя"}
          </p>
        </div>
        <div className="shrink-0">
          <StatusBadge status={task.status} type="task" />
        </div>
      </div>

      <div className="max-w-full min-w-0 break-words text-xs text-slate-400">
        {task.dueDate ? formatDateShort(task.dueDate) : "Без дедлайна"}
        {contentItem ? ` · ${contentItem.title}` : ""}
      </div>

      {shouldShowContextToggle && (
        <Button size="sm" variant="ghost" fullWidth onClick={() => setContextOpen((value) => !value)}>
          {contextOpen ? "Скрыть контекст" : "Показать контекст"}
        </Button>
      )}

      {shouldShowContext && (
        <div className="max-w-full min-w-0 space-y-3 overflow-hidden rounded-xl bg-slate-950/50 p-3">
          {task.description && (
            <div className="max-w-full min-w-0 space-y-1 overflow-hidden">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Описание</div>
              <LinkifiedText text={task.description} collapsedLines={3} className="text-xs" />
            </div>
          )}

          {contentItem && (
            <div className="max-w-full min-w-0 space-y-1 overflow-hidden">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Публикация</div>
              <p className="max-w-full min-w-0 whitespace-pre-wrap break-words text-xs leading-relaxed text-slate-300">
                {publicationLine}
              </p>
            </div>
          )}

          {contentItem?.topic && contentItem.topic !== contentItem.title && (
            <div className="max-w-full min-w-0 space-y-1 overflow-hidden">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Тема</div>
              <p className="max-w-full min-w-0 whitespace-pre-wrap break-words text-xs leading-relaxed text-slate-300">
                {contentItem.topic}
              </p>
            </div>
          )}

          {contentItem?.expert && (
            <div className="max-w-full min-w-0 space-y-1 overflow-hidden">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Эксперт / в кадре</div>
              <p className="max-w-full min-w-0 whitespace-pre-wrap break-words text-xs leading-relaxed text-slate-300">
                {contentItem.expert}
              </p>
            </div>
          )}

          {contentItem?.notes && (
            <div className="max-w-full min-w-0 space-y-1 overflow-hidden">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Заметки / референсы</div>
              <LinkifiedText text={contentItem.notes} collapsedLines={3} className="text-xs" />
            </div>
          )}
        </div>
      )}

      {onEdit && (
        <Button size="sm" variant="ghost" fullWidth onClick={() => onEdit(task)}>
          <Pencil size={16} />
          Редактировать
        </Button>
      )}

      {onStatusChange && !isDone && (
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant="secondary" onClick={() => onStatusChange(task.id, "in_progress")}>В работу</Button>
          <Button size="sm" variant="secondary" onClick={() => onStatusChange(task.id, "review")}>На проверку</Button>
          <Button size="sm" variant="success" onClick={() => onStatusChange(task.id, "done")}>Готово</Button>
          <Button size="sm" variant="secondary" className="bg-orange-500 text-white hover:bg-orange-400" onClick={() => onStatusChange(task.id, "blocked")}>Отложена</Button>
        </div>
      )}
    </Card>
  );
}
