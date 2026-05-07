import { useState } from "react";
import type { Task, TaskStatus } from "../types";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { StatCard } from "../components/StatCard";
import { TaskCard } from "../components/TaskCard";
import { TaskCreateModal } from "../components/TaskCreateModal";
import { TaskEditModal } from "../components/TaskEditModal";
import { getProjectStats, useAppStore } from "../store/useAppStore";
import { canEditProjectTasks, getCurrentMemberForProject } from "../utils/permissions";
import { taskStatusLabels } from "../utils/status";

const columns: TaskStatus[] = ["todo", "in_progress", "review", "done", "blocked"];

export function ProjectDetailScreen({ onBack }: { onBack?: () => void }) {
  const state = useAppStore();
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const setSelectedProject = useAppStore((s) => s.setSelectedProject);
  const updateTaskStatus = useAppStore((s) => s.updateTaskStatus);
  const updateTask = useAppStore((s) => s.updateTask);
  const deleteTask = useAppStore((s) => s.deleteTask);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [creatingTask, setCreatingTask] = useState(false);
  const project = state.projects.find((item) => item.id === state.selectedProjectId);
  if (!project) return null;
  const currentMember = getCurrentMemberForProject({
    project,
    members: state.members,
    roleMappings: state.roleMappings,
    telegramUser: state.telegramUser,
  });
  const canEditTasks = canEditProjectTasks({
    projectId: project.id,
    memberId: currentMember?.id,
    roleMappings: state.roleMappings,
  });
  const stats = getProjectStats(state, project.id);
  const tasks = state.tasks.filter((task) => task.projectId === project.id);
  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-2xl font-black">{project.name}</h2>
        <p className="text-sm text-slate-400">{project.description}</p>
        <p className="mt-2 text-xs text-slate-500">
          Редактирование задач: {canEditTasks ? `доступно для ${currentMember?.name}` : "только project-manager"}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={() => setActiveTab("import")}>Импорт</Button>
          <Button variant="secondary" onClick={() => setCreatingTask(true)}>Новая задача</Button>
          <Button variant="secondary" onClick={() => setActiveTab("calendar")}>Календарь</Button>
          <Button variant="secondary" onClick={() => setActiveTab("team")}>Команда</Button>
        </div>
        <Button className="mt-2" fullWidth variant="ghost" onClick={() => { setSelectedProject(null); onBack?.(); }}>Все проекты</Button>
      </Card>
      <div className="grid grid-cols-5 gap-2">
        <StatCard label="публ." value={stats.content} />
        <StatCard label="todo" value={stats.todo} />
        <StatCard label="work" value={stats.in_progress} />
        <StatCard label="review" value={stats.review} />
        <StatCard label="done" value={stats.done} />
      </div>
      {columns.map((status) => (
        <section key={status} className="space-y-2">
          <h3 className="font-bold">{taskStatusLabels[status]}</h3>
          {tasks.filter((task) => task.status === status).map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              assignee={state.members.find((m) => m.id === task.assigneeId)}
              members={state.members}
              contentItem={state.contentItems.find((item) => item.id === task.contentItemId)}
              project={project}
              showFullContext
              onStatusChange={updateTaskStatus}
              onEdit={canEditTasks ? setEditingTask : undefined}
            />
          ))}
        </section>
      ))}
      <TaskCreateModal isOpen={creatingTask} onClose={() => setCreatingTask(false)} defaultProjectId={project.id} />
      {editingTask && (
        <TaskEditModal
          task={editingTask}
          members={state.members.filter((member) => member.teamId === project.teamId)}
          roleMappings={state.roleMappings.filter((mapping) => mapping.projectId === project.id)}
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
