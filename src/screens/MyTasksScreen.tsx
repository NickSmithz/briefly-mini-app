import { useState } from "react";
import { Database } from "lucide-react";
import type { Task } from "../types";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { Modal } from "../components/Modal";
import { Select } from "../components/Select";
import { TaskCard } from "../components/TaskCard";
import { TaskCreateModal } from "../components/TaskCreateModal";
import { TaskEditModal } from "../components/TaskEditModal";
import { useBrieflyData } from "../store/useBrieflyData";
import { canEditProjectTasks, getCurrentMemberForProject, isProjectManagerView } from "../utils/permissions";
import { hapticFeedback } from "../utils/telegram";

export function MyTasksScreen() {
  const data = useBrieflyData();
  const [selectedProjectId, setSelectedProjectId] = useState<string | "all">("all");
  const [selectedMemberId, setSelectedMemberId] = useState<string | "all">("all");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [creatingTask, setCreatingTask] = useState(false);
  const [confirmCleanup, setConfirmCleanup] = useState(false);

  if (data.isBackendMode && !data.isBackendReady) {
    return (
      <EmptyState
        icon={<Database />}
        title="Team sync mode не подключён"
        description="Войдите через Telegram в настройках, чтобы видеть общие задачи команды."
        action={<Button onClick={() => data.actions.setActiveTab("settings")}>Открыть настройки</Button>}
      />
    );
  }

  const activeTeamProjects = data.projects.filter((project) => project.teamId === data.activeTeamId && !project.archived);
  const activeTeamProjectIds = new Set(activeTeamProjects.map((project) => project.id));
  const selectedProject = activeTeamProjects.find((project) => project.id === selectedProjectId);
  const selectedMember = data.members.find((member) => member.id === selectedMemberId);
  const teamMembers = data.members.filter((member) => member.teamId === data.activeTeamId);

  const visibleTasks = data.tasks
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

  const managerRoleMappings = data.roleMappings.filter((mapping) =>
    selectedProjectId === "all" ? activeTeamProjectIds.has(mapping.projectId) : mapping.projectId === selectedProjectId,
  );
  const canCleanupDoneTasks = isProjectManagerView(selectedMemberId === "all" ? null : selectedMemberId, teamMembers, managerRoleMappings);

  const getViewerForTask = (task: Task) => {
    const project = data.projects.find((item) => item.id === task.projectId);
    if (!project) return null;
    return getCurrentMemberForProject({
      project,
      members: data.members,
      roleMappings: data.roleMappings,
      telegramUser: data.telegramUser,
      viewerMemberId: selectedMemberId === "all" ? undefined : selectedMemberId,
    });
  };

  const canEditTask = (task: Task) =>
    data.mode === "backend" ||
    canEditProjectTasks({
      projectId: task.projectId,
      memberId: getViewerForTask(task)?.id,
      roleMappings: data.roleMappings,
    });

  const defaultCreateProjectId = selectedProjectId === "all" ? undefined : selectedProjectId;
  const projectSummary = selectedProject?.name ?? "Все проекты";
  const memberSummary = selectedMember?.name ?? "Все участники";

  const renderTask = (task: Task) => (
    <TaskCard
      key={task.id}
      task={task}
      assignee={data.members.find((member) => member.id === task.assigneeId)}
      members={data.members}
      project={data.projects.find((project) => project.id === task.projectId)}
      contentItem={data.contentItems.find((contentItem) => contentItem.id === task.contentItemId)}
      showFullContext
      onStatusChange={data.actions.updateTaskStatus}
      onEdit={canEditTask(task) ? setEditingTask : undefined}
    />
  );

  const cleanupDoneTasks = () => {
    doneTasks.forEach((task) => data.actions.deleteTask(task.id));
    setConfirmCleanup(false);
    hapticFeedback("warning");
  };

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-black">Личные задачи</h2>
          <Button size="sm" variant="secondary" onClick={() => setCreatingTask(true)}>
            Новая задача
          </Button>
        </div>

        <label className="block space-y-1 text-sm text-slate-300">
          <span>Проект</span>
          <Select value={selectedProjectId} onChange={(event) => setSelectedProjectId(event.target.value as string | "all")}>
            <option value="all">Все проекты</option>
            {activeTeamProjects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Select>
        </label>

        <label className="block space-y-1 text-sm text-slate-300">
          <span>Смотреть задачи как</span>
          <Select value={selectedMemberId} onChange={(event) => setSelectedMemberId(event.target.value as string | "all")}>
            <option value="all">Все участники</option>
            {teamMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
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
                  <Button size="sm" variant="danger" onClick={() => setConfirmCleanup(true)}>
                    Удалить готовые
                  </Button>
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
              <Button variant="danger" onClick={cleanupDoneTasks}>
                Удалить
              </Button>
              <Button variant="secondary" onClick={() => setConfirmCleanup(false)}>
                Отмена
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {editingTask && (
        <TaskEditModal
          task={editingTask}
          members={data.members.filter((member) => member.teamId === editingTask.teamId)}
          roleMappings={data.roleMappings.filter((mapping) => mapping.projectId === editingTask.projectId)}
          onCancel={() => setEditingTask(null)}
          onSave={(taskId, patch) => {
            data.actions.updateTask(taskId, patch);
            setEditingTask(null);
          }}
          onDelete={(taskId) => {
            data.actions.deleteTask(taskId);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
}
