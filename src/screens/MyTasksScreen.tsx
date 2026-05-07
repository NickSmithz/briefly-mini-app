import { useState } from "react";
import type { Task } from "../types";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
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
  const [selectedProjectId, setSelectedProjectId] = useState<string | "all">("all");
  const [selectedMemberId, setSelectedMemberId] = useState<string | "all">("all");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [creatingTask, setCreatingTask] = useState(false);
  const [confirmCleanup, setConfirmCleanup] = useState(false);

  const activeTeamProjects = state.projects.filter((project) => project.teamId === state.activeTeamId && !project.archived);
  const activeTeamProjectIds = new Set(activeTeamProjects.map((project) => project.id));
  const selectedProject = activeTeamProjects.find((project) => project.id === selectedProjectId);
  const selectedMember = state.members.find((member) => member.id === selectedMemberId);

  const visibleTasks = state.tasks
    .filter((task) => activeTeamProjectIds.has(task.projectId))
    .filter((task) => selectedProjectId === "all" || task.projectId === selectedProjectId)
    .filter((task) => selectedMemberId === "all" || task.assigneeId === selectedMemberId);

  const doneTasks = visibleTasks.filter((task) => task.status === "done");
  const activeTasks = visibleTasks.filter((task) => task.status !== "done");
  const today = new Date().toISOString().slice(0, 10);
  const groups = [
    { title: "Просроченные", items: activeTasks.filter((task) => task.dueDate && task.dueDate < today) },
    { title: "Сегодня", items: activeTasks.filter((task) => task.dueDate === today) },
    { title: "Ближайшие", items: activeTasks.filter((task) => task.dueDate && task.dueDate > today) },
    { title: "Без дедлайна", items: activeTasks.filter((task) => !task.dueDate) },
  ];

  const managerRoleMappings = state.roleMappings.filter((mapping) =>
    selectedProjectId === "all" ? activeTeamProjectIds.has(mapping.projectId) : mapping.projectId === selectedProjectId,
  );
  const canCleanupDoneTasks = isProjectManagerView(
    selectedMemberId === "all" ? null : selectedMemberId,
    state.members.filter((member) => member.teamId === state.activeTeamId),
    managerRoleMappings,
  );

  const getViewerForTask = (task: Task) => {
    const project = state.projects.find((item) => item.id === task.projectId);
    if (!project) return null;
    return getCurrentMemberForProject({
      project,
      members: state.members,
      roleMappings: state.roleMappings,
      telegramUser: state.telegramUser,
      viewerMemberId: selectedMemberId === "all" ? undefined : selectedMemberId,
    });
  };

  const canEditTask = (task: Task) => canEditProjectTasks({
    projectId: task.projectId,
    memberId: getViewerForTask(task)?.id,
    roleMappings: state.roleMappings,
  });

  const defaultCreateProjectId = selectedProjectId === "all" ? undefined : selectedProjectId;
  const projectSummary = selectedProject?.name ?? "Все проекты";
  const memberSummary = selectedMember?.name ?? "Все участники";

  const renderTask = (task: Task) => (
    <TaskCard
      key={task.id}
      task={task}
      assignee={state.members.find((member) => member.id === task.assigneeId)}
      members={state.members}
      project={state.projects.find((project) => project.id === task.projectId)}
      contentItem={state.contentItems.find((contentItem) => contentItem.id === task.contentItemId)}
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

        <label className="block space-y-1 text-sm text-slate-300">
          <span>Проект</span>
          <Select value={selectedProjectId} onChange={(event) => setSelectedProjectId(event.target.value as string | "all")}>
            <option value="all">Все проекты</option>
            {activeTeamProjects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </Select>
        </label>

        <label className="block space-y-1 text-sm text-slate-300">
          <span>Смотреть задачи как</span>
          <Select value={selectedMemberId} onChange={(event) => setSelectedMemberId(event.target.value as string | "all")}>
            <option value="all">Все участники</option>
            {state.members.filter((member) => member.teamId === state.activeTeamId).map((member) => (
              <option key={member.id} value={member.id}>{member.name}</option>
            ))}
          </Select>
        </label>

        <p className="text-xs text-slate-500">
          Показано: {visibleTasks.length} задач · {projectSummary} · {memberSummary}
        </p>
      </Card>

      {visibleTasks.length === 0 ? (
        <EmptyState
          title="Задач нет"
          description="В этом проекте пока нет задач для выбранного фильтра."
          action={<Button onClick={() => setCreatingTask(true)}>Создать задачу</Button>}
        />
      ) : (
        <>
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
        </>
      )}

      <TaskCreateModal isOpen={creatingTask} onClose={() => setCreatingTask(false)} defaultProjectId={defaultCreateProjectId} />

      {confirmCleanup && (
        <Modal title="Удалить готовые задачи?" onClose={() => setConfirmCleanup(false)}>
          <div className="space-y-4">
            <p className="text-sm text-slate-300">Будут удалены готовые задачи в текущем фильтре. Это действие нельзя отменить.</p>
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
