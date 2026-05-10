import { useState } from "react";
import type { Task, TaskStatus } from "../types";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { StatCard } from "../components/StatCard";
import { TaskCard } from "../components/TaskCard";
import { TaskCreateModal } from "../components/TaskCreateModal";
import { TaskEditModal } from "../components/TaskEditModal";
import { useBrieflyData } from "../store/useBrieflyData";
import { canEditProjectTasks, getCurrentMemberForProject } from "../utils/permissions";
import { taskStatusLabels } from "../utils/status";
import { hapticFeedback } from "../utils/telegram";

const columns: TaskStatus[] = ["todo", "in_progress", "review", "done", "blocked"];

export function ProjectDetailScreen({ onBack }: { onBack?: () => void }) {
  const data = useBrieflyData();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [creatingTask, setCreatingTask] = useState(false);
  const project = data.projects.find((item) => item.id === data.selectedProjectId);

  if (!project) {
    return (
      <EmptyState
        title="Проект не найден"
        description={data.isBackendMode ? "В Team sync mode локальные demo-проекты не показываются." : "Выберите проект из списка."}
        action={<Button onClick={() => data.actions.setActiveTab("projects")}>К проектам</Button>}
      />
    );
  }

  const currentMember = getCurrentMemberForProject({
    project,
    members: data.members,
    roleMappings: data.roleMappings,
    telegramUser: data.telegramUser,
  });
  const canEditTasks =
    data.mode === "backend" ||
    canEditProjectTasks({
      projectId: project.id,
      memberId: currentMember?.id,
      roleMappings: data.roleMappings,
    });
  const tasks = data.tasks.filter((task) => task.projectId === project.id);
  const stats = {
    content: data.contentItems.filter((item) => item.projectId === project.id).length,
    todo: tasks.filter((task) => task.status === "todo").length,
    in_progress: tasks.filter((task) => task.status === "in_progress").length,
    review: tasks.filter((task) => task.status === "review").length,
    done: tasks.filter((task) => task.status === "done").length,
  };
  const unassignedRoleTasksCount = data.actions.getUnassignedRoleTasksCount(project.id);
  const assignUnassignedTasks = () => {
    const count = data.actions.assignExistingTasksByRole(project.id);
    hapticFeedback("success");
    if (count > 0) {
      // Local mode receives the exact count synchronously; backend mode updates after reload.
      // Success text for backend is handled by useBackendStore.
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="break-words text-2xl font-black">{project.name}</h2>
        <p className="break-words text-sm text-slate-400">{project.description}</p>
        <p className="mt-2 text-xs text-slate-500">
          Редактирование задач: {canEditTasks ? `доступно${currentMember ? ` для ${currentMember.name}` : ""}` : "только project-manager"}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={() => data.actions.setActiveTab("import")}>
            Импорт
          </Button>
          <Button variant="secondary" onClick={() => setCreatingTask(true)}>
            Новая задача
          </Button>
          <Button variant="secondary" onClick={() => data.actions.setActiveTab("calendar")}>
            Календарь
          </Button>
          <Button variant="secondary" onClick={() => data.actions.setActiveTab("team")}>
            Команда
          </Button>
        </div>
        <Button
          className="mt-2"
          fullWidth
          variant="ghost"
          onClick={() => {
            data.actions.setSelectedProject(null);
            onBack?.();
          }}
        >
          Все проекты
        </Button>
      </Card>

      <div className="grid grid-cols-5 gap-2">
        <StatCard label="публ." value={stats.content} />
        <StatCard label="todo" value={stats.todo} />
        <StatCard label="work" value={stats.in_progress} />
        <StatCard label="review" value={stats.review} />
        <StatCard label="done" value={stats.done} />
      </div>

      {unassignedRoleTasksCount > 0 && (
        <Card className="space-y-2 border-amber-500/30 bg-amber-500/10 text-amber-100">
          <div className="text-sm font-bold">Есть задачи без исполнителей</div>
          <p className="text-xs text-amber-100/80">Можно назначить {unassignedRoleTasksCount} задач по ролям проекта.</p>
          <Button size="sm" variant="secondary" onClick={assignUnassignedTasks}>
            Назначить
          </Button>
        </Card>
      )}

      {columns.map((status) => (
        <section key={status} className="space-y-2">
          <h3 className="font-bold">{taskStatusLabels[status]}</h3>
          {tasks
            .filter((task) => task.status === status)
            .map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                assignee={data.members.find((member) => member.id === task.assigneeId)}
                members={data.members}
                contentItem={data.contentItems.find((item) => item.id === task.contentItemId)}
                project={project}
                showFullContext
                onStatusChange={data.actions.updateTaskStatus}
                onEdit={canEditTasks ? setEditingTask : undefined}
              />
            ))}
        </section>
      ))}

      <TaskCreateModal isOpen={creatingTask} onClose={() => setCreatingTask(false)} defaultProjectId={project.id} />
      {editingTask && (
        <TaskEditModal
          task={editingTask}
          members={data.members.filter((member) => member.teamId === project.teamId)}
          roleMappings={data.roleMappings.filter((mapping) => mapping.projectId === project.id)}
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
