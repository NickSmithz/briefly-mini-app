import type { ReactNode } from "react";
import { Settings } from "lucide-react";
import { useKeyboardDoneBar } from "../hooks/useKeyboardDoneBar";
import { useBrieflyData } from "../store/useBrieflyData";
import { Button } from "./Button";
import { BottomNav } from "./BottomNav";
import { KeyboardDoneBar } from "./KeyboardDoneBar";

export function AppShell({ children }: { children: ReactNode }) {
  const { lastSuccessMessage, actions } = useBrieflyData();
  const { isKeyboardBarVisible, keyboardHint, hideKeyboard } = useKeyboardDoneBar();

  return (
    <div className="min-h-screen bg-slate-950">
      <main className="safe-top safe-bottom mx-auto min-h-screen w-full max-w-[480px] px-4">
        <header className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase text-violet-300">Briefly</div>
            <h1 className="text-xl font-black">Контент-команда</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={() => actions.setActiveTab("settings")} aria-label="Настройки">
            <Settings size={19} />
          </Button>
        </header>

        {lastSuccessMessage && (
          <button
            onClick={actions.clearSuccessMessage}
            className="mb-4 w-full rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-left text-sm text-emerald-100"
          >
            {lastSuccessMessage}
          </button>
        )}

        {children}
      </main>
      <BottomNav />
      <KeyboardDoneBar visible={isKeyboardBarVisible} hint={keyboardHint} onDone={hideKeyboard} />
    </div>
  );
}
