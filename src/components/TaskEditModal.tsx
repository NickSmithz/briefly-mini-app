import { useMemo, useState } from "react";
import type { RoleKey, RoleMapping, Task, TaskStatus, TeamMember } from "../types";
import { hapticFeedback } from "../utils/telegram";
import { Button } from "./Button";
import { Input } from "./Input";
import { Select } from "./Select";
import { Textarea } from "./Textarea";

type TaskForm = {
  title: string;
  description: string;
  assigneeId: string;
  role: RoleKey | "";
  dueDate: string;
  status: TaskStatus;
  priority: Task["priority"];
};

type TaskEditModalProps = {
  task: Task;
  members: TeamMember[];
  roleMappings?: RoleMapping[];
  onSave: (taskId: string, patch: Partial<Task>) => void;
  onCancel: () => void;
  onDelete: (taskId: string) => void;
};

const roleOptions: { value: RoleKey; label: string }[] = [
  { value: "copywriter", label: "Тексты" },
  { value: "designer", label: "Дизайн" },
  { value: "reels_maker", label: "Reels" },
  { value: "stories_maker", label: "Stories" },
  { value: "publisher", label: "Публикация" },
  { value: "reviewer", label: "Проверка" },
  { value: "project_manager", label: "Руководитель" },
  { value: "other", label: "Другое" },
];

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "К работе" },
  { value: "in_progress", label: "В работе" },
  { value: "review", label: "На проверке" },
  { value: "done", label: "Готово" },
  { value: "blocked", label: "Отложена" },
];

const priorityOptions: { value: Task["priority"]; label: string }[] = [
  { value: "low", label: "Низкий" },
  { value: "normal", label: "Обычный" },
  { value: "high", label: "Высокий" },
];

export function TaskEditModal({ task, members, roleMappings = [], onSave, onCancel, onDelete }: TaskEditModalProps) {
  const [form, setForm] = useState<TaskForm>({
    title: task.title,
    description: task.description ?? "",
    assigneeId: task.assigneeId ?? "",
    role: task.role ?? "",
    dueDate: task.dueDate ?? "",
    status: task.status,
    priority: task.priority,
  });
  const [error, setError] = useState("");

  const mappedMember = useMemo(() => {
    if (!form.role) return null;
    const mapping = roleMappings.find((item) => item.projectId === task.projectId && item.role === form.role);
    return members.find((member) => member.id === mapping?.memberId) ?? null;
  }, [form.role, members, roleMappings, task.projectId]);

  const update = <K extends keyof TaskForm>(key: K, value: TaskForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (key === "title" && String(value).trim()) setError("");
  };

  const handleSave = () => {
    const title = form.title.trim();
    if (!title) {
      setError("Название задачи обязательно.");
      return;
    }
    onSave(task.id, {
      title,
      description: form.description.trim() || undefined,
      assigneeId: form.assigneeId || undefined,
      role: form.role || undefined,
      dueDate: form.dueDate || undefined,
      status: form.status,
      priority: form.priority,
    });
    hapticFeedback("success");
  };

  const handleDelete = () => {
    if (!window.confirm("Удалить задачу? Это действие нельзя отменить.")) return;
    onDelete(task.id);
    hapticFeedback("warning");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/85 p-3">
      <div className="max-h-[92vh] w-full max-w-[480px] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-soft">
        <div className="mb-4">
          <h2 className="text-xl font-black">Редактировать задачу</h2>
          <p className="mt-1 text-sm text-slate-400">Изменения сохраняются в localStorage.</p>
        </div>

        <div className="space-y-3">
          <label className="block space-y-1 text-sm text-slate-300">
            <span>Название</span>
            <Input value={form.title} onChange={(event) => update("title", event.target.value)} />
            {error && <span className="text-xs text-rose-200">{error}</span>}
          </label>

          <label className="block space-y-1 text-sm text-slate-300">
            <span>Описание</span>
            <Textarea rows={3} value={form.description} onChange={(event) => update("description", event.target.value)} />
          </label>

          <label className="block space-y-1 text-sm text-slate-300">
            <span>Исполнитель</span>
            <Select value={form.assigneeId} onChange={(event) => update("assigneeId", event.target.value)}>
              <option value="">Без исполнителя</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </Select>
          </label>

          <label className="block space-y-1 text-sm text-slate-300">
            <span>Роль</span>
            <Select value={form.role} onChange={(event) => update("role", event.target.value as RoleKey | "")}>
              <option value="">Без роли</option>
              {roleOptions.map((role) => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </Select>
            {mappedMember && <span className="text-xs text-violet-200">По этой роли обычно назначен: {mappedMember.name}</span>}
          </label>

          <div className="grid grid-cols-2 gap-2">
            <label className="block space-y-1 text-sm text-slate-300">
              <span>Дедлайн</span>
              <Input type="date" value={form.dueDate} onChange={(event) => update("dueDate", event.target.value)} />
            </label>
            <label className="block space-y-1 text-sm text-slate-300">
              <span>Приоритет</span>
              <Select value={form.priority} onChange={(event) => update("priority", event.target.value as Task["priority"])}>
                {priorityOptions.map((priority) => (
                  <option key={priority.value} value={priority.value}>{priority.label}</option>
                ))}
              </Select>
            </label>
          </div>

          <label className="block space-y-1 text-sm text-slate-300">
            <span>Статус</span>
            <Select value={form.status} onChange={(event) => update("status", event.target.value as TaskStatus)}>
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </Select>
          </label>
        </div>

        <div className="sticky bottom-0 mt-5 space-y-2 bg-slate-900 pt-3">
          <Button fullWidth size="lg" onClick={handleSave}>Сохранить</Button>
          <Button fullWidth variant="secondary" onClick={onCancel}>Отмена</Button>
          <Button fullWidth variant="danger" onClick={handleDelete}>Удалить задачу</Button>
        </div>
      </div>
    </div>
  );
}
