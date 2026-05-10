import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { SubscriptionCard } from "../components/SubscriptionCard";
import { useAppStore } from "../store/useAppStore";
import { useBackendStore } from "../store/useBackendStore";
import { useBrieflyData } from "../store/useBrieflyData";
import { getTelegramWebApp } from "../utils/telegram";

export function SettingsScreen() {
  const local = useAppStore();
  const backend = useBackendStore();
  const data = useBrieflyData();
  const resetAllData = useAppStore((state) => state.resetAllData);
  const createDemoData = useAppStore((state) => state.createDemoData);
  const resetOnboarding = useAppStore((state) => state.resetOnboarding);
  const localTeam = local.teams.find((item) => item.id === local.activeTeamId);

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-black">Настройки</h2>
          <Badge color={data.mode === "backend" ? "emerald" : "violet"}>{data.mode === "backend" ? "Team sync" : "Demo mode"}</Badge>
        </div>
        <div className="mt-3 space-y-2 text-sm text-slate-300">
          <div>
            Telegram user: {data.telegramUser?.first_name || "Briefly"} {data.telegramUser?.username ? `@${data.telegramUser.username}` : ""}
          </div>
          <div>Режим запуска: {getTelegramWebApp() ? "Telegram" : "Browser mock"}</div>
          <div>Data mode: {data.mode === "backend" ? "Team sync" : "Demo/local"}</div>
          <div>{data.mode === "backend" ? "Рабочие данные сейчас берутся из Supabase." : "Рабочие данные сейчас берутся из localStorage."}</div>
        </div>
      </Card>

      <Card className="space-y-3">
        <div>
          <h3 className="font-bold">Backend team sync status</h3>
          <p className="mt-1 text-sm text-slate-400">
            {backend.isBackendMode
              ? backend.isAuthenticated
                ? "Team sync подключён. Данные синхронизируются через backend."
                : "Team sync включён, но вход через Telegram ещё не выполнен."
              : "Demo mode: данные только на этом устройстве."}
          </p>
        </div>
        {backend.error && <div className="rounded-2xl bg-rose-500/10 p-3 text-sm text-rose-100">{backend.error}</div>}
        <div className="grid gap-2 rounded-2xl bg-slate-950 p-3 text-sm text-slate-300">
          <div>Backend status: {backend.isAuthenticated ? "connected" : "not connected"}</div>
          <div>Backend user: {backend.user ? `${backend.user.firstName || ""} ${backend.user.username ? `@${backend.user.username}` : ""}` : "нет"}</div>
          <div>Backend team: {backend.team?.name || "нет"}</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={backend.isBackendMode ? "success" : "secondary"}
            onClick={() => {
              if (backend.isBackendMode) backend.disableBackendMode();
              else backend.enableBackendMode();
            }}
          >
            {backend.isBackendMode ? "Sync включён" : "Включить sync"}
          </Button>
          <Button variant="secondary" disabled={backend.isLoading} onClick={() => void backend.loginWithTelegram()}>
            {backend.isAuthenticated ? "Обновить вход" : "Войти через Telegram"}
          </Button>
        </div>
        {backend.isAuthenticated && (
          <Button fullWidth variant="ghost" onClick={backend.logoutBackend}>
            Выйти из backend
          </Button>
        )}
      </Card>

      <Card className="space-y-2 text-sm text-slate-300">
        <h3 className="font-bold">Local demo storage status</h3>
        <div>Local demo storage: briefly-storage</div>
        <div>Local demo team: {localTeam?.name || "нет"}</div>
        {backend.isBackendMode && <div className="text-slate-500">briefly-storage сохранён как fallback и не используется рабочими экранами Team sync.</div>}
      </Card>

      <SubscriptionCard subscription={data.subscription} usage={data.usage} />

      <Card>
        <h3 className="font-bold">Готово к будущему расширению</h3>
        <div className="mt-3 grid gap-2 text-sm text-slate-300">
          <div className="rounded-2xl bg-slate-950 p-3">Backend sync: active MVP</div>
          <div className="rounded-2xl bg-slate-950 p-3">AI import: planned</div>
          <div className="rounded-2xl bg-slate-950 p-3 text-slate-500">AI Chat — later</div>
          <div className="rounded-2xl bg-slate-950 p-3">Payments: planned</div>
        </div>
      </Card>

      <div className="space-y-2">
        <Button fullWidth variant="danger" onClick={resetAllData}>
          Сбросить все данные
        </Button>
        <Button fullWidth variant="secondary" onClick={createDemoData}>
          Создать демо-данные заново
        </Button>
        <Button fullWidth variant="ghost" onClick={resetOnboarding}>
          Пройти onboarding заново
        </Button>
      </div>
    </div>
  );
}
