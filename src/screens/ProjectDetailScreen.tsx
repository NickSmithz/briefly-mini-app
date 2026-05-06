import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { TaskCard } from "../components/TaskCard";
import { useAppStore } from "../store/useAppStore";
export const ProjectDetailScreen = () => {
  const s = useAppStore(); const p = s.projects.find((x) => x.id === s.selectedProjectId);
  if (!p) return null;
  const tasks = s.tasks.filter((t) => t.projectId === p.id);
  const by = (st: string) => tasks.filter((t) => t.status === st);
  return <div className="space-y-3"><h2 className="text-lg font-semibold">{p.name}</h2><Card className="text-sm text-slate-400">{p.description}</Card>
    <div className="flex gap-2"><Button size="sm" onClick={() => s.setActiveTab("import")}>Импорт плана</Button><Button size="sm" variant="secondary" onClick={() => s.setActiveTab("calendar")}>Календарь</Button><Button size="sm" variant="secondary" onClick={() => s.setActiveTab("team")}>Команда</Button></div>
    {(["todo","in_progress","review","done","blocked"] as const).map((st) => <div key={st} className="space-y-2"><div className="text-sm font-semibold uppercase">{st} ({by(st).length})</div>{by(st).map((t) => <div key={t.id} className="space-y-1"><TaskCard task={t} assignee={s.members.find((m) => m.id === t.assigneeId)?.name} /><div className="flex gap-1"><Button size="sm" variant="ghost" onClick={() => s.updateTaskStatus(t.id, "in_progress")}>В работу</Button><Button size="sm" variant="ghost" onClick={() => s.updateTaskStatus(t.id, "review")}>На проверку</Button><Button size="sm" variant="success" onClick={() => s.updateTaskStatus(t.id, "done")}>Готово</Button><Button size="sm" variant="danger" onClick={() => s.updateTaskStatus(t.id, "blocked")}>Заблокировано</Button></div></div>)}</div>)}
  </div>;
};
