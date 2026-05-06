import { formatDateShort } from "../utils/dates";
import type { Task } from "../types";
import { Card } from "./Card";
import { StatusBadge } from "./StatusBadge";
export const TaskCard = ({ task, assignee }: { task: Task; assignee?: string }) => <Card className="space-y-2"><div className="font-medium">{task.title}</div><div className="text-xs text-slate-400">{assignee ?? "Без исполнителя"} {task.dueDate ? `• ${formatDateShort(task.dueDate)}` : ""}</div><StatusBadge status={task.status} /></Card>;
