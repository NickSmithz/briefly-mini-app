import { Pencil } from "lucide-react";
import type { ContentItem, Project, Task, TaskStatus, TeamMember } from "../types";
import { formatDateShort } from "../utils/dates";
import { getRoleLabel } from "../utils/status";
import { Button } from "./Button";
import { Card } from "./Card";
import { StatusBadge } from "./StatusBadge";

export type TaskCardProps = {
  task: Task;
  project?: Project;
  contentItem?: ContentItem;
  assignee?: TeamMember;
  members?: TeamMember[];
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  onEdit?: (task: Task) => void;
};

export function TaskCard({ task, assignee, project, contentItem, onStatusChange, onEdit }: TaskCardProps) {
  return (
    <Card className="space-y-3 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold">{task.title}</h4>
          <p className="text-xs text-slate-400">
            {project?.name || "Проект"} · {assignee ? `${assignee.avatarEmoji || ""} ${assignee.name}` : task.role ? getRoleLabel(task.role) : "Без исполнителя"}
          </p>
        </div>
        <StatusBadge status={task.status} type="task" />
      </div>
      <div className="text-xs text-slate-400">{task.dueDate ? formatDateShort(task.dueDate) : "Без дедлайна"}{contentItem ? ` · ${contentItem.title}` : ""}</div>
      {onEdit && (
        <Button size="sm" variant="ghost" fullWidth onClick={() => onEdit(task)}>
          <Pencil size={16} />
          Редактировать
        </Button>
      )}
      {onStatusChange && (
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
