import { useEffect, useMemo, useState } from "react";
import type { RoleKey, Task, TaskStatus } from "../types";
import { useBrieflyData } from "../store/useBrieflyData";
import { createId } from "../utils/ids";
import { formatDateShort } from "../utils/dates";
import { getFormatLabel } from "../utils/status";
import { hapticFeedback } from "../utils/telegram";
import { Button } from "./Button";
import { EmptyState } from "./EmptyState";
import { Input } from "./Input";
import { Select } from "./Select";
import { Textarea } from "./Textarea";

export type TaskCreateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  defaultProjectId?: string;
};

type TaskCreateForm = {
  projectId: string;
  title: string;
  description: string;
  contentItemId: string;
  assigneeId: string;
  role: RoleKey | "";
  dueDate: string;
  status: TaskStatus;
  priority: Task["priority"];
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
  { value: "blocked", label: "Блокер" },
];

const priorityOptions: { value: Task["priority"]; label: string }[] = [
  { value: "low", label: "Низкий" },
  { value: "normal", label: "Обычный" },
  { value: "high", label: "Высокий" },
];

export function TaskCreateModal({ isOpen, onClose, defaultProjectId }: TaskCreateModalProps) {
  const data = useBrieflyData();
  const activeTeamId = data.activeTeamId;
  const projects = data.projects.filter((project) => project.teamId === activeTeamId && !project.archived);
  const fallbackProjectId = defaultProjectId || projects[0]?.id || "";
  const [form, setForm] = useState<TaskCreateForm>({
    projectId: fallbackProjectId,
    title: "",
    description: "",
    contentItemId: "",
    assigneeId: "",
    role: "",
    dueDate: "",
    status: "todo",
    priority: "normal",
  });
  const [errors, setErrors] = useState<{ projectId?: string; title?: string }>({});

  useEffect(() => {
    if (!isOpen) return;
    setForm({
      projectId: fallbackProjectId,
      title: "",
      description: "",
      contentItemId: "",
      assigneeId: "",
      role: "",
      dueDate: "",
      status: "todo",
      priority: "normal",
    });
    setErrors({});
  }, [fallbackProjectId, isOpen]);

  const selectedProject = projects.find((project) => project.id === form.projectId);
  const members = data.members.filter((member) => member.teamId === activeTeamId);
  const contentItems = data.contentItems.filter((item) => item.projectId === form.projectId);

  const mappedMember = useMemo(() => {
    if (!form.role || !form.projectId) return null;
    const mapping = data.roleMappings.find((item) => item.projectId === form.projectId && item.role === form.role);
    return members.find((member) => member.id === mapping?.memberId) ?? null;
  }, [data.roleMappings, form.projectId, form.role, members]);

  if (!isOpen) return null;

  const update = <K extends keyof TaskCreateForm>(key: K, value: TaskCreateForm[K]) => {
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === "projectId" ? { contentItemId: "" } : {}),
    }));
    if (key === "projectId" && String(value)) setErrors((current) => ({ ...current, projectId: undefined }));
    if (key === "title" && String(value).trim()) setErrors((current) => ({ ...current, title: undefined }));
  };

  const handleCreate = () => {
    const nextErrors: { projectId?: string; title?: string } = {};
    if (!form.projectId) nextErrors.projectId = "Выберите проект.";
    if (!form.title.trim()) nextErrors.title = "Название задачи обязательно.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !activeTeamId) return;

    const now = new Date().toISOString();
    const task: Task = {
      id: createId("task"),
      teamId: activeTeamId,
      projectId: form.projectId,
      contentItemId: form.contentItemId || undefined,
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      assigneeId: form.assigneeId || undefined,
      role: form.role || undefined,
      dueDate: form.dueDate || undefined,
      status: form.status,
      priority: form.priority,
      createdAt: now,
      updatedAt: now,
    };
    data.actions.addTask(task);
    data.actions.setSelectedProject(form.projectId);
    hapticFeedback("success");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/85 p-3">
      <div className="max-h-[92vh] w-full max-w-[480px] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-soft">
        <div className="mb-4">
          <h2 className="text-xl font-black">Новая задача</h2>
          <p className="mt-1 text-sm text-slate-400">Создайте задачу вручную без импорта плана.</p>
        </div>

        {!projects.length ? (
          <EmptyState title="Сначала создайте проект." description="Ручные задачи всегда относятся к проекту." action={<Button variant="secondary" onClick={onClose}>Закрыть</Button>} />
        ) : (
          <>
            <div className="space-y-3">
              <label className="block space-y-1 text-sm text-slate-300">
                <span>Проект</span>
                <Select value={form.projectId} onChange={(event) => update("projectId", event.target.value)}>
                  <option value="">Выберите проект</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </Select>
                {errors.projectId && <span className="text-xs text-rose-200">{errors.projectId}</span>}
              </label>

              <label className="block space-y-1 text-sm text-slate-300">
                <span>Название</span>
                <Input value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="Например: согласовать обложку" />
                {errors.title && <span className="text-xs text-rose-200">{errors.title}</span>}
              </label>

              <label className="block space-y-1 text-sm text-slate-300">
                <span>Описание</span>
                <Textarea rows={3} value={form.description} onChange={(event) => update("description", event.target.value)} />
              </label>

              <label className="block space-y-1 text-sm text-slate-300">
                <span>Публикация</span>
                <Select value={form.contentItemId} onChange={(event) => update("contentItemId", event.target.value)}>
                  <option value="">Без привязки к публикации</option>
                  {contentItems.map((item) => (
                    <option key={item.id} value={item.id}>{formatDateShort(item.publishDate)} — {getFormatLabel(item.format)} — {item.title}</option>
                  ))}
                </Select>
                {selectedProject && !contentItems.length && <span className="text-xs text-slate-500">В проекте пока нет публикаций.</span>}
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
                {mappedMember && (
                  <div className="flex items-center justify-between gap-2 rounded-2xl bg-violet-500/10 p-3 text-xs text-violet-100">
                    <span>По этой роли обычно назначен: {mappedMember.name}</span>
                    <Button size="sm" variant="secondary" onClick={() => update("assigneeId", mappedMember.id)}>Назначить</Button>
                  </div>
                )}
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
              <Button fullWidth size="lg" onClick={handleCreate}>Создать задачу</Button>
              <Button fullWidth variant="secondary" onClick={onClose}>Отмена</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
