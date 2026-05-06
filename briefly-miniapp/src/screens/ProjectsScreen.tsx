import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Modal } from "../components/Modal";
import { PlanLimitBanner } from "../components/PlanLimitBanner";
import { ProjectCard } from "../components/ProjectCard";
import { useAppStore, getUsageForActiveTeam, selectActiveSubscription } from "../store/useAppStore";
import { ProjectDetailScreen } from "./ProjectDetailScreen";

export function ProjectsScreen() {
  const state = useAppStore();
  const addProject = useAppStore((s) => s.addProject);
  const setSelectedProject = useAppStore((s) => s.setSelectedProject);
  const [detailOpen, setDetailOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const projects = state.projects.filter((project) => !project.archived);
  const sub = selectActiveSubscription(state);
  const usage = getUsageForActiveTeam(state);
  if (detailOpen && state.selectedProjectId) {
    return <ProjectDetailScreen onBack={() => setDetailOpen(false)} />;
  }
  return (
    <div className="space-y-4">
      <Button fullWidth onClick={() => setOpen(true)}><Plus size={18} />Добавить проект</Button>
      {sub && <PlanLimitBanner label="Проекты" used={usage.projects} limit={sub.projectsLimit} />}
      {projects.map((project) => {
        const content = state.contentItems.filter((item) => item.projectId === project.id);
        return <ProjectCard key={project.id} project={project} contentCount={content.length} tasks={state.tasks.filter((task) => task.projectId === project.id)} nextDate={content[0]?.publishDate} onOpen={() => { setSelectedProject(project.id); setDetailOpen(true); }} />;
      })}
      {open && (
        <Modal title="Новый проект" onClose={() => setOpen(false)}>
          <div className="space-y-3">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Название" />
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Описание" />
            <Button fullWidth disabled={!name.trim()} onClick={() => { addProject({ name, description, color: "indigo" }); setName(""); setDescription(""); setOpen(false); }}>Создать</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
