import { useState } from "react";
import { Database, Upload } from "lucide-react";
import type { Task } from "../types";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { ContentItemCard } from "../components/ContentItemCard";
import { EmptyState } from "../components/EmptyState";
import { ProjectCard } from "../components/ProjectCard";
import { StatCard } from "../components/StatCard";
import { SubscriptionCard } from "../components/SubscriptionCard";
import { TaskCard } from "../components/TaskCard";
import { TaskCreateModal } from "../components/TaskCreateModal";
import { TaskEditModal } from "../components/TaskEditModal";
import { useBrieflyData } from "../store/useBrieflyData";
import { useAppStore } from "../store/useAppStore";
import { isOverdue, isToday, sortByDate } from "../utils/dates";
import { canEditProjectTasks, getCurrentMemberForProject } from "../utils/permissions";

export function HomeScreen() {
  const data = useBrieflyData();
  const createDemoData = useAppStore((state) => state.createDemoData);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [creatingTask, setCreatingTask] = useState(false);

  if (data.isBackendMode && !data.isBackendReady) {
    return (
      <EmptyState
        icon={<Database />}
        title="Team sync mode не подключён"
        description="Войдите через Telegram в настройках, чтобы видеть общие проекты команды."
        action={<Button onClick={() => data.actions.setActiveTab("settings")}>Открыть настройки</Button>}
      />
    );
  }

  const projects = data.projects.filter((project) => !project.archived);
  const project = projects.find((item) => item.id === data.selectedProjectId) ?? projects[0];
  const projectContent = project ? data.contentItems.filter((item) => item.projectId === project.id) : [];
  const projectTasks = project ? data.tasks.filter((task) => task.projectId === project.id) : [];
  const todayTasks = data.tasks.filter((task) => task.status !== "done" && task.dueDate && isToday(task.dueDate)).slice(0, 2);
  const overdueTasks = data.tasks.filter((task) => task.status !== "done" && task.dueDate && isOverdue(task.dueDate));
  const upcoming = sortByDate(data.contentItems, "publishDate").slice(0, 3);

  const canEditTask = (task: Task) => {
    const taskProject = data.projects.find((item) => item.id === task.projectId);
    if (!taskProject) return false;
    if (data.mode === "backend") return true;
    const currentMember = getCurrentMemberForProject({
      project: taskProject,
      members: data.members,
      roleMappings: data.roleMappings,
      telegramUser: data.telegramUser,
    });
    return canEditProjectTasks({ projectId: task.projectId, memberId: currentMember?.id, roleMappings: data.roleMappings });
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-slate-400">Привет, {data.telegramUser?.first_name || "команда"}</div>
          <Badge color={data.mode === "backend" ? "emerald" : "violet"}>{data.mode === "backend" ? "Team sync" : "Demo mode"}</Badge>
        </div>
        <h2 className="mt-1 text-2xl font-black">План из Telegram больше не теряется</h2>
        <Button className="mt-4" fullWidth onClick={() => data.actions.setActiveTab("import")}>
          <Upload size={18} />
          Импортировать план
        </Button>
      </Card>

      <Card>
        <h3 className="font-bold">Как работает Briefly</h3>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs text-slate-300">
          {["Вставь контент-план", "Проверь preview", "Создай задачи"].map((text, index) => (
            <div className="rounded-2xl bg-slate-950 p-3" key={text}>
              <b className="mb-1 block text-violet-200">{index + 1}</b>
              {text}
            </div>
          ))}
        </div>
      </Card>

      <SubscriptionCard subscription={data.subscription} usage={data.usage} />

      <div className="grid grid-cols-4 gap-2">
        <StatCard label="проекты" value={projects.length} />
        <StatCard label="публикации" value={data.contentItems.length} />
        <StatCard label="открыто" value={data.tasks.filter((task) => task.status !== "done").length} />
        <StatCard label="просрочено" value={overdueTasks.length} />
      </div>

      {project ? (
        <ProjectCard
          project={project}
          contentCount={projectContent.length}
          tasks={projectTasks}
          nextDate={projectContent[0]?.publishDate}
          onOpen={() => {
            data.actions.setSelectedProject(project.id);
            data.actions.setActiveTab("projects");
          }}
        />
      ) : (
        <EmptyState
          icon={<Upload />}
          title={data.mode === "backend" ? "В этой команде пока нет проектов" : "Нет проектов"}
          description={
            data.mode === "backend"
              ? "Создайте первый проект или присоединитесь к команде по приглашению."
              : "Создайте демо-проект и попробуйте импорт."
          }
          action={
            data.mode === "backend" ? (
              <Button onClick={() => data.actions.setActiveTab("projects")}>Создать проект</Button>
            ) : (
              <Button onClick={createDemoData}>Создать демо-проект</Button>
            )
          }
        />
      )}

      <section className="space-y-3">
        <h3 className="font-bold">Ближайшие публикации</h3>
        {upcoming.length ? (
          upcoming.map((item) => (
            <ContentItemCard key={item.id} item={item} tasksCount={data.tasks.filter((task) => task.contentItemId === item.id).length} />
          ))
        ) : (
          <p className="text-sm text-slate-500">После импорта здесь появится календарь.</p>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-bold">Задачи на сегодня</h3>
          <Button size="sm" variant="secondary" onClick={() => setCreatingTask(true)}>
            Новая задача
          </Button>
        </div>
        {todayTasks.length ? (
          todayTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              assignee={data.members.find((member) => member.id === task.assigneeId)}
              project={data.projects.find((item) => item.id === task.projectId)}
              contentItem={data.contentItems.find((item) => item.id === task.contentItemId)}
              members={data.members}
              compact
              onEdit={canEditTask(task) ? setEditingTask : undefined}
            />
          ))
        ) : (
          <p className="text-sm text-slate-500">На сегодня пусто.</p>
        )}
      </section>

      <TaskCreateModal isOpen={creatingTask} onClose={() => setCreatingTask(false)} defaultProjectId={project?.id} />
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
