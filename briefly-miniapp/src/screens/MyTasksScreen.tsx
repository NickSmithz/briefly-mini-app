import { useState } from "react";
import type { Task } from "../types";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Select } from "../components/Select";
import { TaskCard } from "../components/TaskCard";
import { TaskCreateModal } from "../components/TaskCreateModal";
import { TaskEditModal } from "../components/TaskEditModal";
import { useAppStore } from "../store/useAppStore";
import { canEditProjectTasks, getCurrentMemberForProject } from "../utils/permissions";

export function MyTasksScreen() {
  const state = useAppStore();
  const updateTaskStatus = useAppStore((s) => s.updateTaskStatus);
  const updateTask = useAppStore((s) => s.updateTask);
  const deleteTask = useAppStore((s) => s.deleteTask);
  const [selected, setSelected] = useState("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [creatingTask, setCreatingTask] = useState(false);
  const tasks = state.tasks.filter((task) => !selected || task.assigneeId === selected);
  const today = new Date().toISOString().slice(0, 10);
  const groups = [
    { title: "Просроченные", items: tasks.filter((task) => task.dueDate && task.dueDate < today && task.status !== "done") },
    { title: "Сегодня", items: tasks.filter((task) => task.dueDate === today && task.status !== "done") },
    { title: "Ближайшие", items: tasks.filter((task) => task.dueDate && task.dueDate > today && task.status !== "done") },
    { title: "Без дедлайна", items: tasks.filter((task) => !task.dueDate) },
  ];
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
          {group.items.map((task) => (
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
          ))}
          {!group.items.length && <p className="text-xs text-slate-500">Пусто</p>}
        </section>
      ))}
      <TaskCreateModal isOpen={creatingTask} onClose={() => setCreatingTask(false)} defaultProjectId={state.selectedProjectId ?? undefined} />
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
