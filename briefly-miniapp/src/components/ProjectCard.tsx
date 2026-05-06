import type { Project, Task } from "../types";
import { formatDateShort } from "../utils/dates";
import { Button } from "./Button";
import { Card } from "./Card";

export function ProjectCard({ project, contentCount, tasks, nextDate, onOpen }: { project: Project; contentCount: number; tasks: Task[]; nextDate?: string; onOpen: () => void }) {
  const openTasks = tasks.filter((task) => task.status !== "done").length;
  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold">{project.name}</h3>
          <p className="text-sm text-slate-400">{project.description || "Без описания"}</p>
        </div>
        <span className="h-4 w-4 rounded-full bg-violet-400" />
      </div>
      <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-400">
        <div className="rounded-2xl bg-slate-950 p-2"><b className="block text-base text-white">{contentCount}</b>публикаций</div>
        <div className="rounded-2xl bg-slate-950 p-2"><b className="block text-base text-white">{openTasks}</b>задач</div>
        <div className="rounded-2xl bg-slate-950 p-2"><b className="block text-sm text-white">{nextDate ? formatDateShort(nextDate) : "нет"}</b>ближайшая</div>
      </div>
      <Button fullWidth variant="secondary" onClick={onOpen}>Открыть проект</Button>
    </Card>
  );
}
