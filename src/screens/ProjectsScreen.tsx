import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { useAppStore } from "../store/useAppStore";
import { createId } from "../utils/ids";
export const ProjectsScreen = () => {
  const s = useAppStore(); const [name, setName] = useState(""); const [description, setDescription] = useState("");
  const teamId = s.activeTeamId ?? ""; const list = s.projects.filter((p) => p.teamId === teamId && !p.archived);
  return <div className="space-y-3"><h2 className="font-semibold text-lg">Проекты</h2>
    <Card className="space-y-2"><Input placeholder="Название проекта" value={name} onChange={(e) => setName(e.target.value)} /><Input placeholder="Описание" value={description} onChange={(e) => setDescription(e.target.value)} /><Button fullWidth onClick={() => { if (!name.trim()) return; s.addProject({ id: createId("project"), teamId, name, description, color: "violet", createdAt: new Date().toISOString() }); setName(""); setDescription(""); }}><Plus size={16} className="inline" /> Добавить проект</Button></Card>
    {list.map((p) => <Card key={p.id} className="space-y-1" onClick={() => { s.setSelectedProject(p.id); s.setActiveTab("projects"); }}><div className="font-semibold">{p.name}</div><div className="text-sm text-slate-400">{p.description}</div></Card>)}
  </div>;
};
