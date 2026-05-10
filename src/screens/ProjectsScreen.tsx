import { useState } from "react";
import { Database, Plus } from "lucide-react";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { Input } from "../components/Input";
import { Modal } from "../components/Modal";
import { PlanLimitBanner } from "../components/PlanLimitBanner";
import { ProjectCard } from "../components/ProjectCard";
import { useBrieflyData } from "../store/useBrieflyData";
import { ProjectDetailScreen } from "./ProjectDetailScreen";

export function ProjectsScreen() {
  const data = useBrieflyData();
  const [detailOpen, setDetailOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const projects = data.projects.filter((project) => !project.archived);

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

  if (detailOpen && data.selectedProjectId) {
    return <ProjectDetailScreen onBack={() => setDetailOpen(false)} />;
  }

  const createProject = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    setFormError(null);
    try {
      await data.actions.addProject({ name: trimmedName, description: description.trim(), color: "indigo" });
      setName("");
      setDescription("");
      setOpen(false);
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : "Не удалось создать проект.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Badge color={data.mode === "backend" ? "emerald" : "violet"}>{data.mode === "backend" ? "Team sync" : "Demo mode"}</Badge>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus size={18} />
          Добавить проект
        </Button>
      </div>

      {data.subscription && <PlanLimitBanner label="Проекты" used={data.usage.projects} limit={data.subscription.projectsLimit} />}

      {projects.length ? (
        projects.map((project) => {
          const content = data.contentItems.filter((item) => item.projectId === project.id);
          return (
            <ProjectCard
              key={project.id}
              project={project}
              contentCount={content.length}
              tasks={data.tasks.filter((task) => task.projectId === project.id)}
              nextDate={content[0]?.publishDate}
              onOpen={() => {
                data.actions.setSelectedProject(project.id);
                setDetailOpen(true);
              }}
            />
          );
        })
      ) : (
        <EmptyState
          icon={<Plus />}
          title={data.mode === "backend" ? "В этой команде пока нет проектов" : "Нет проектов"}
          description={
            data.mode === "backend"
              ? "Создайте первый проект или присоединитесь к команде по приглашению."
              : "Добавьте проект, чтобы импортировать контент-план."
          }
          action={<Button onClick={() => setOpen(true)}>Создать проект</Button>}
        />
      )}

      {open && (
        <Modal title="Новый проект" onClose={() => { setFormError(null); setOpen(false); }}>
          <div className="space-y-3">
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Название" />
            <Input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Описание" />
            {formError && <div className="rounded-2xl bg-rose-500/10 p-3 text-sm text-rose-100">{formError}</div>}
            <Button fullWidth disabled={!name.trim()} onClick={createProject}>
              Создать
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
