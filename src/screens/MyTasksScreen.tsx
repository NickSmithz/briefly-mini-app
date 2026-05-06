import { useMemo, useState } from "react";
import { Select } from "../components/Select";
import { TaskCard } from "../components/TaskCard";
import { useAppStore } from "../store/useAppStore";
export const MyTasksScreen = () => {
  const s = useAppStore(); const [member, setMember] = useState("all");
  const tasks = useMemo(() => s.tasks.filter((t) => member === "all" || t.assigneeId === member), [s.tasks, member]);
  return <div className="space-y-3"><h2 className="text-lg font-semibold">Личные задачи</h2><Select value={member} onChange={(e) => setMember(e.target.value)}><option value="all">Все участники</option>{s.members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</Select>{tasks.map((t) => <TaskCard key={t.id} task={t} assignee={s.members.find((m) => m.id === t.assigneeId)?.name} />)}</div>;
};
