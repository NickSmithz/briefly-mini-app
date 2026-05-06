import { useState } from "react";
import type { Task } from "../types";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Modal } from "../components/Modal";
import { Select } from "../components/Select";
import { TaskCard } from "../components/TaskCard";
import { TaskCreateModal } from "../components/TaskCreateModal";
import { TaskEditModal } from "../components/TaskEditModal";
import { useAppStore } from "../store/useAppStore";
import { canEditProjectTasks, getCurrentMemberForProject, isProjectManagerView } from "../utils/permissions";
import { hapticFeedback } from "../utils/telegram";

export function MyTasksScreen() {
  const state = useAppStore();
  const updateTaskStatus = useAppStore((s) => s.updateTaskStatus);
  const updateTask = useAppStore((s) => s.updateTask);
  const deleteTask = useAppStore((s) => s.deleteTask);
  const [selected, setSelected] = useState("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [creatingTask, setCreatingTask] = useState(false);
  const [confirmCleanup, setConfirmCleanup] = useState(false);
  const activeTeamProjectIds = new Set(state.projects.filter((project) => project.teamId === state.activeTeamId).map((project) => project.id));
  const visibleTasks = state.tasks.filter((task) => activeTeamProjectIds.has(task.projectId) && (!selected || task.assigneeId === selected));
  const doneTasks = visibleTasks.filter((task) => task.status === "done");
  const activeTasks = visibleTasks.filter((task) => task.status !== "done");
  const today = new Date().toISOString().slice(0, 10);
  const groups = [
    { title: "Просроченные", items: activeTasks.filter((task) => task.dueDate && task.dueDate < today) },
    { title: "Сегодня", items: activeTasks.filter((task) => task.dueDate === today) },
    { title: "Ближайшие", items: activeTasks.filter((task) => task.dueDate && task.dueDate > today) },
    { title: "Без дедлайна", items: activeTasks.filter((task) => !task.dueDate) },
  ];
  const canCleanupDoneTasks = isProjectManagerView(
    selected || null,
    state.members.filter((member) => member.teamId === state.activeTeamId),
    state.roleMappings.filter((mapping) => activeTeamProjectIds.has(mapping.projectId)),
  );
  const getViewerForTask = (task: Task) => {
    const project = state.projects.find((item) => item.id === task.projectId);
    if (!project) return null;
    return getCurrentMemberForProject({
      project,
      members: state.members,
      roleMappings: state.roleMappings,
      telegramUser: state.telegramUser,
      viewerMemberId: selected || undefined,
    });
  };

  const canEditTask = (task: Task) => canEditProjectTasks({
    projectId: task.projectId,
    memberId: getViewerForTask(task)?.id,
    roleMappings: state.roleMappings,
  });

  const renderTask = (task: Task) => (
    <TaskCard
      key={task.id}
      task={task}
      assignee={state.members.find((m) => m.id === task.assigneeId)}
      members={state.members}
      project={state.projects.find((p) => p.id === task.projectId)}
      contentItem={state.contentItems.find((c) => c.id === task.contentItemId)}
      onStatusChange={updateTaskStatus}
      onEdit={canEditTask(task) ? setEditingTask : undefined}
    />
  );

  const cleanupDoneTasks = () => {
    doneTasks.forEach((task) => deleteTask(task.id));
    setConfirmCleanup(false);
    useAppStore.setState({ lastSuccessMessage: "Готовые задачи удалены" });
    hapticFeedback("warning");
  };

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-black">Личные задачи</h2>
          <Button size="sm" variant="secondary" onClick={() => setCreatingTask(true)}>Новая задача</Button>
        </div>
        <Select value={selected} onChange={(e) => setSelected(e.target.value)}>
          <option value="">Все участники</option>
          {state.members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
        </Select>
      </Card>
      {groups.map((group) => (
        <section key={group.title} className="space-y-2">
          <h3 className="font-bold">{group.title}</h3>
          {group.items.map(renderTask)}
          {!group.items.length && <p className="text-xs text-slate-500">Пусто</p>}
        </section>
      ))}
      {doneTasks.length > 0 && (
        <section className="space-y-2 border-t border-slate-800 pt-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-bold">Готовые · {doneTasks.length}</h3>
              <p className="mt-1 text-xs text-slate-500">Завершённые задачи хранятся здесь, пока руководитель их не удалит.</p>
            </div>
            {canCleanupDoneTasks && (
              <Button size="sm" variant="danger" onClick={() => setConfirmCleanup(true)}>Удалить готовые</Button>
            )}
          </div>
          {doneTasks.map(renderTask)}
        </section>
      )}
      <TaskCreateModal isOpen={creatingTask} onClose={() => setCreatingTask(false)} defaultProjectId={state.selectedProjectId ?? undefined} />
      {confirmCleanup && (
        <Modal title="Удалить готовые задачи?" onClose={() => setConfirmCleanup(false)}>
          <div className="space-y-4">
            <p className="text-sm text-slate-300">Будут удалены все готовые задачи в текущем отображении. Это действие нельзя отменить.</p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="danger" onClick={cleanupDoneTasks}>Удалить</Button>
              <Button variant="secondary" onClick={() => setConfirmCleanup(false)}>Отмена</Button>
            </div>
          </div>
        </Modal>
      )}
      {editingTask && (
        <TaskEditModal
          task={editingTask}
          members={state.members.filter((member) => member.teamId === editingTask.teamId)}
          roleMappings={state.roleMappings.filter((mapping) => mapping.projectId === editingTask.projectId)}
          onCancel={() => setEditingTask(null)}
          onSave={(taskId, patch) => {
            updateTask(taskId, patch);
            setEditingTask(null);
            useAppStore.setState({ lastSuccessMessage: "Задача обновлена" });
          }}
          onDelete={(taskId) => {
            deleteTask(taskId);
            setEditingTask(null);
            useAppStore.setState({ lastSuccessMessage: "Задача удалена" });
          }}
        />
      )}
    </div>
  );
}
