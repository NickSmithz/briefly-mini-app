import type { ReactNode } from "react";
import { Settings } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { Button } from "./Button";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: ReactNode }) {
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const lastSuccessMessage = useAppStore((state) => state.lastSuccessMessage);
  const clearSuccessMessage = useAppStore((state) => state.clearSuccessMessage);
  return (
    <div className="min-h-screen bg-slate-950">
      <main className="safe-top safe-bottom mx-auto min-h-screen w-full max-w-[480px] px-4">
        <header className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase text-violet-300">Briefly</div>
            <h1 className="text-xl font-black">Контент-команда</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setActiveTab("settings")} aria-label="Настройки">
            <Settings size={19} />
          </Button>
        </header>
        {lastSuccessMessage && (
          <button onClick={clearSuccessMessage} className="mb-4 w-full rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-left text-sm text-emerald-100">
            {lastSuccessMessage}
          </button>
        )}
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
