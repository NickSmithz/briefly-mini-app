import { CalendarDays, CheckSquare, FolderKanban, Home, Upload, Users } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import type { AppTab } from "../types";
const items: { tab: AppTab; label: string; icon: any }[] = [
  { tab: "home", label: "Главная", icon: Home }, { tab: "projects", label: "Проекты", icon: FolderKanban }, { tab: "import", label: "Импорт", icon: Upload },
  { tab: "calendar", label: "Календарь", icon: CalendarDays }, { tab: "tasks", label: "Задачи", icon: CheckSquare }, { tab: "team", label: "Команда", icon: Users },
];
export const BottomNav = () => {
  const { activeTab, setActiveTab, setSelectedProject, setActiveImportDraft } = useAppStore();
  return <nav className="fixed bottom-0 left-0 right-0 safe-pb bg-slate-950/95 border-t border-slate-800"><div className="max-w-[480px] mx-auto grid grid-cols-6">{items.map(({ tab, label, icon: Icon }) => (
    <button key={tab} onClick={() => { setSelectedProject(null); setActiveImportDraft(null); setActiveTab(tab); }} className={`py-3 text-xs ${activeTab === tab ? "text-violet-400" : "text-slate-400"}`}><Icon size={18} className="mx-auto mb-1" />{label}</button>
  ))}</div></nav>;
};
