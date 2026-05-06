import { getTelegramWebApp } from "../utils/telegram";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { SubscriptionCard } from "../components/SubscriptionCard";
import { getUsageForActiveTeam, selectActiveSubscription, useAppStore } from "../store/useAppStore";

export function SettingsScreen() {
  const state = useAppStore();
  const resetAllData = useAppStore((s) => s.resetAllData);
  const createDemoData = useAppStore((s) => s.createDemoData);
  const resetOnboarding = useAppStore((s) => s.resetOnboarding);
  const team = state.teams.find((item) => item.id === state.activeTeamId);
  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-xl font-black">Настройки</h2>
        <div className="mt-3 space-y-2 text-sm text-slate-300">
          <div>Пользователь: {state.telegramUser?.first_name} {state.telegramUser?.username ? `@${state.telegramUser.username}` : ""}</div>
          <div>Режим: {getTelegramWebApp() ? "Telegram" : "Browser mock"}</div>
          <div>Команда: {team?.name || "нет"}</div>
          <div>localStorage: briefly-storage</div>
        </div>
      </Card>
      <SubscriptionCard subscription={selectActiveSubscription(state)} usage={getUsageForActiveTeam(state)} />
      <Card>
        <h3 className="font-bold">Готово к будущему расширению</h3>
        <div className="mt-3 grid gap-2 text-sm text-slate-300">
          <div className="rounded-2xl bg-slate-950 p-3">Backend sync: planned</div>
          <div className="rounded-2xl bg-slate-950 p-3">AI import: planned</div>
          <div className="rounded-2xl bg-slate-950 p-3 text-slate-500">AI Chat — later</div>
          <div className="rounded-2xl bg-slate-950 p-3">Payments: planned</div>
        </div>
      </Card>
      <div className="space-y-2">
        <Button fullWidth variant="danger" onClick={resetAllData}>Сбросить все данные</Button>
        <Button fullWidth variant="secondary" onClick={createDemoData}>Создать демо-данные заново</Button>
        <Button fullWidth variant="ghost" onClick={resetOnboarding}>Пройти onboarding заново</Button>
      </div>
    </div>
  );
}
