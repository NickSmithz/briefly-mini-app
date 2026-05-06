import { useState } from "react";
import { Upload } from "lucide-react";
import type { Task } from "../types";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { ProjectCard } from "../components/ProjectCard";
import { StatCard } from "../components/StatCard";
import { SubscriptionCard } from "../components/SubscriptionCard";
import { TaskCard } from "../components/TaskCard";
import { TaskCreateModal } from "../components/TaskCreateModal";
import { TaskEditModal } from "../components/TaskEditModal";
import { ContentItemCard } from "../components/ContentItemCard";
import { getOverdueTasks, getTodayTasks, getUsageForActiveTeam, selectActiveSubscription, useAppStore } from "../store/useAppStore";
import { sortByDate } from "../utils/dates";
import { canEditProjectTasks, getCurrentMemberForProject } from "../utils/permissions";

export function HomeScreen() {
  const state = useAppStore();
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const setSelectedProject = useAppStore((s) => s.setSelectedProject);
  const createDemoData = useAppStore((s) => s.createDemoData);
  const updateTask = useAppStore((s) => s.updateTask);
  const deleteTask = useAppStore((s) => s.deleteTask);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [creatingTask, setCreatingTask] = useState(false);
  const project = state.projects.find((item) => item.id === state.selectedProjectId) ?? state.projects[0];
  const projectContent = project ? state.contentItems.filter((item) => item.projectId === project.id) : [];
  const projectTasks = project ? state.tasks.filter((task) => task.projectId === project.id) : [];
  const todayTasks = getTodayTasks(state).slice(0, 2);
  const upcoming = sortByDate(state.contentItems, "publishDate").slice(0, 3);
  const canEditTask = (task: Task) => {
    const taskProject = state.projects.find((item) => item.id === task.projectId);
    if (!taskProject) return false;
    const currentMember = getCurrentMemberForProject({
      project: taskProject,
      members: state.members,
      roleMappings: state.roleMappings,
      telegramUser: state.telegramUser,
    });
    return canEditProjectTasks({ projectId: task.projectId, memberId: currentMember?.id, roleMappings: state.roleMappings });
  };
  return (
    <div className="space-y-4">
      <Card>
        <div className="text-sm text-slate-400">Привет, {state.telegramUser?.first_name || "команда"}</div>
        <h2 className="mt-1 text-2xl font-black">План из Telegram больше не теряется</h2>
        <Button className="mt-4" fullWidth onClick={() => setActiveTab("import")}><Upload size={18} />Импортировать план</Button>
      </Card>
      <Card>
        <h3 className="font-bold">Как работает Briefly</h3>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs text-slate-300">
          {["Вставь контент-план", "Проверь preview", "Создай задачи"].map((text, index) => <div className="rounded-2xl bg-slate-950 p-3" key={text}><b className="mb-1 block text-violet-200">{index + 1}</b>{text}</div>)}
        </div>
      </Card>
      <SubscriptionCard subscription={selectActiveSubscription(state)} usage={getUsageForActiveTeam(state)} />
      <div className="grid grid-cols-4 gap-2">
        <StatCard label="проекты" value={state.projects.filter((p) => !p.archived).length} />
        <StatCard label="публикации" value={state.contentItems.length} />
        <StatCard label="открыто" value={state.tasks.filter((t) => t.status !== "done").length} />
        <StatCard label="просрочено" value={getOverdueTasks(state).length} />
      </div>
      {project ? (
        <ProjectCard project={project} contentCount={projectContent.length} tasks={projectTasks} nextDate={projectContent[0]?.publishDate} onOpen={() => { setSelectedProject(project.id); setActiveTab("projects"); }} />
      ) : (
        <EmptyState icon={<Upload />} title="Нет проектов" description="Создайте демо-проект и попробуйте импорт." action={<Button onClick={createDemoData}>Создать демо-проект</Button>} />
      )}
      <section className="space-y-3">
        <h3 className="font-bold">Ближайшие публикации</h3>
        {upcoming.length ? upcoming.map((item) => <ContentItemCard key={item.id} item={item} tasksCount={state.tasks.filter((task) => task.contentItemId === item.id).length} />) : <p className="text-sm text-slate-500">После импорта здесь появится календарь.</p>}
      </section>
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-bold">Задачи на сегодня</h3>
          <Button size="sm" variant="secondary" onClick={() => setCreatingTask(true)}>Новая задача</Button>
        </div>
        {todayTasks.length ? todayTasks.map((task) => <TaskCard key={task.id} task={task} assignee={state.members.find((m) => m.id === task.assigneeId)} project={state.projects.find((p) => p.id === task.projectId)} members={state.members} onEdit={canEditTask(task) ? setEditingTask : undefined} />) : <p className="text-sm text-slate-500">На сегодня пусто.</p>}
      </section>
      <TaskCreateModal isOpen={creatingTask} onClose={() => setCreatingTask(false)} defaultProjectId={project?.id} />
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
