import { ArrowRight, Settings } from "lucide-react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { StatCard } from "../components/StatCard";
import { SubscriptionCard } from "../components/SubscriptionCard";
import { useAppStore } from "../store/useAppStore";
import { selectors } from "../store/useAppStore";
export const HomeScreen = ({ onOpenSettings }: { onOpenSettings: () => void }) => {
  const s = useAppStore(); const activeSub = selectors.getActiveSubscription(s);
  const teamId = s.activeTeamId ?? ""; const projects = s.projects.filter((p) => p.teamId === teamId && !p.archived);
  const content = s.contentItems.filter((x) => x.teamId === teamId); const open = s.tasks.filter((t) => t.teamId === teamId && t.status !== "done");
  return <div className="space-y-4">
    <div className="flex items-center justify-between"><h1 className="text-xl font-semibold">Привет, {s.telegramUser?.first_name ?? "команда"}!</h1><button onClick={onOpenSettings}><Settings /></button></div>
    <Card className="space-y-1"><div className="font-semibold">Как работает Briefly</div><div className="text-sm text-slate-300">1. Вставь контент-план · 2. Проверь preview · 3. Создай задачи</div></Card>
    {activeSub ? <SubscriptionCard projects={projects.length} members={s.members.filter((m) => m.teamId === teamId).length} contentItems={content.length} limits={activeSub} /> : null}
    <div className="grid grid-cols-2 gap-2"><StatCard label="Проекты" value={projects.length} /><StatCard label="Публикации" value={content.length} /><StatCard label="Открытые задачи" value={open.length} /><StatCard label="Просроченные" value={s.tasks.filter((t) => t.dueDate && t.status !== "done" && t.dueDate < new Date().toISOString().slice(0, 10)).length} /></div>
    <Button fullWidth onClick={() => s.setActiveTab("import")}>Импортировать план <ArrowRight size={16} className="inline" /></Button>
  </div>;
};
