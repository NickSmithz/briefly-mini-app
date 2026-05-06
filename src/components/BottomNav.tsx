import { CalendarDays, CheckSquare, FolderKanban, Home, Upload, Users } from "lucide-react";
import type { AppTab } from "../types";
import { useAppStore } from "../store/useAppStore";

const tabs: { id: AppTab; label: string; Icon: typeof Home }[] = [
  { id: "home", label: "Главная", Icon: Home },
  { id: "projects", label: "Проекты", Icon: FolderKanban },
  { id: "import", label: "Импорт", Icon: Upload },
  { id: "calendar", label: "Календарь", Icon: CalendarDays },
  { id: "tasks", label: "Задачи", Icon: CheckSquare },
  { id: "team", label: "Команда", Icon: Users },
];

export function BottomNav() {
  const activeTab = useAppStore((state) => state.activeTab);
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[480px] border-t border-slate-800 bg-slate-950/95 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur">
      <div className="grid grid-cols-6 gap-1">
        {tabs.map(({ id, label, Icon }) => {
          const active = activeTab === id;
          return (
            <button key={id} onClick={() => setActiveTab(id)} className={`flex min-h-14 flex-col items-center justify-center rounded-2xl text-[10px] font-medium ${active ? "bg-violet-500 text-white" : "text-slate-400"}`}>
              <Icon size={19} />
              <span className="mt-1">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
