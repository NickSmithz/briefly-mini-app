import { useState } from "react";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { SubscriptionCard } from "../components/SubscriptionCard";
import {
  BackendApiError,
  authTelegram,
  clearBackendToken,
  debugAuth,
  getBackendToken,
  setBackendToken,
  type DebugAuthResponse,
} from "../api/client";
import { useAppStore } from "../store/useAppStore";
import { useBackendStore } from "../store/useBackendStore";
import { useBrieflyData } from "../store/useBrieflyData";
import { getTelegramWebApp } from "../utils/telegram";

type LastRequestInfo = {
  status?: number;
  code?: string;
  error?: string;
};

function yesNo(value: boolean) {
  return value ? "есть" : "нет";
}

function getAuthStatus(params: { hasToken: boolean; hasInitData: boolean; hasBackendIdentity: boolean }) {
  if (!params.hasToken) return "token missing";
  if (!params.hasInitData) return "telegram initData missing";
  if (params.hasBackendIdentity) return "connected";
  return "unknown";
}

function getBackendUserLabel(user: ReturnType<typeof useBackendStore.getState>["user"]) {
  if (!user) return "не загружен";
  return `${user.firstName || ""}${user.username ? ` @${user.username}` : ""}`.trim() || "загружен";
}

function debugResultFromError(cause: unknown): DebugAuthResponse | null {
  if (!(cause instanceof BackendApiError) || !cause.payload || cause.payload.hasAuthorizationHeader === undefined) return null;
  return {
    ok: Boolean(cause.payload.ok),
    hasAuthorizationHeader: Boolean(cause.payload.hasAuthorizationHeader),
    userId: cause.payload.userId,
    teamCount: cause.payload.teamCount,
    error: cause.payload.error || cause.payload.message,
    code: cause.payload.code,
  };
}

function lastRequestFromError(cause: unknown, fallback: string): LastRequestInfo {
  if (cause instanceof BackendApiError) {
    return {
      status: cause.status,
      code: cause.code,
      error: cause.message,
    };
  }
  return { error: cause instanceof Error ? cause.message : fallback };
}

export function SettingsScreen() {
  const local = useAppStore();
  const backend = useBackendStore();
  const data = useBrieflyData();
  const resetAllData = useAppStore((state) => state.resetAllData);
  const createDemoData = useAppStore((state) => state.createDemoData);
  const resetOnboarding = useAppStore((state) => state.resetOnboarding);
  const localTeam = local.teams.find((item) => item.id === local.activeTeamId);
  const [debugResult, setDebugResult] = useState<DebugAuthResponse | null>(null);
  const [diagnosticMessage, setDiagnosticMessage] = useState<string | null>(null);
  const [diagnosticError, setDiagnosticError] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<LastRequestInfo | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(false);
  const [isRefreshingLogin, setIsRefreshingLogin] = useState(false);

  const telegramInitData = getTelegramWebApp()?.initData ?? "";
  const backendToken = getBackendToken();
  const hasBackendToken = Boolean(backendToken);
  const hasTelegramInitData = Boolean(telegramInitData);
  const hasBackendIdentity = Boolean(backend.user && backend.team);
  const authStatus = getAuthStatus({ hasToken: hasBackendToken, hasInitData: hasTelegramInitData, hasBackendIdentity });
  const backendUserLabel = getBackendUserLabel(backend.user);

  const checkBackendSession = async () => {
    setIsCheckingSession(true);
    setDiagnosticMessage(null);
    setDiagnosticError(null);
    try {
      const result = await debugAuth();
      setDebugResult(result);
      setLastRequest({ status: 200, code: result.code, error: result.error });
      if (!result.ok) setDiagnosticError(result.error || "Backend session check failed");
    } catch (cause) {
      setDebugResult(debugResultFromError(cause));
      const nextLastRequest = lastRequestFromError(cause, "Backend session check failed");
      setLastRequest(nextLastRequest);
      setDiagnosticError(nextLastRequest.error || "Backend session check failed");
    } finally {
      setIsCheckingSession(false);
    }
  };

  const refreshTelegramLogin = async () => {
    setIsRefreshingLogin(true);
    setDiagnosticMessage(null);
    setDiagnosticError(null);
    setDebugResult(null);
    try {
      const initData = getTelegramWebApp()?.initData ?? "";
      if (!initData) {
        const message = "Telegram initData не найден. Откройте приложение внутри Telegram.";
        setDiagnosticError(message);
        setLastRequest({ code: "TELEGRAM_INIT_DATA_MISSING", error: message });
        return;
      }

      backend.enableBackendMode();
      clearBackendToken();
      useBackendStore.setState({ token: null, isAuthenticated: false, error: null });

      const response = await authTelegram(initData);
      setBackendToken(response.token);
      useBackendStore.setState({
        token: response.token,
        isAuthenticated: true,
        isBackendMode: true,
        user: response.user,
        team: response.team,
        error: null,
      });
      await useBackendStore.getState().loadWorkspace();
      setDiagnosticMessage("Вход обновлён");
      setLastRequest({ status: 200 });
    } catch (cause) {
      const nextLastRequest = lastRequestFromError(cause, "Не удалось обновить вход через Telegram.");
      setLastRequest(nextLastRequest);
      setDiagnosticError(nextLastRequest.error || "Не удалось обновить вход через Telegram.");
      useBackendStore.setState({ error: nextLastRequest.error || "Не удалось обновить вход через Telegram." });
    } finally {
      setIsRefreshingLogin(false);
    }
  };

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
          <div>Backend user: {backendUserLabel}</div>
          <div>Backend team: {backend.team?.name || "не загружена"}</div>
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

      {backend.isBackendMode && (
        <Card className="space-y-3">
          <div>
            <h3 className="font-bold">Диагностика Team sync</h3>
            <p className="mt-1 text-sm text-slate-400">Проверка авторизации без DevTools. Токен полностью не показывается.</p>
          </div>
          <div className="grid gap-2 rounded-2xl bg-slate-950 p-3 text-sm text-slate-300">
            <div>Backend token: {yesNo(hasBackendToken)}</div>
            <div>Telegram initData: {yesNo(hasTelegramInitData)}</div>
            <div>Backend user: {backendUserLabel}</div>
            <div>Backend team: {backend.team?.name || "не загружена"}</div>
            <div>Auth status: {authStatus}</div>
            <div>Last request status: {lastRequest?.status ?? "n/a"}</div>
            <div>Last request code: {lastRequest?.code ?? "n/a"}</div>
            <div>Last request error: {lastRequest?.error ?? "n/a"}</div>
            {backend.error && <div className="text-rose-200">Last backend error: {backend.error}</div>}
          </div>

          {debugResult && (
            <div className={`rounded-2xl p-3 text-sm ${debugResult.ok ? "bg-emerald-500/10 text-emerald-100" : "bg-rose-500/10 text-rose-100"}`}>
              <div>Debug auth: {debugResult.ok ? "ok" : "error"}</div>
              <div>Debug auth code: {debugResult.code || "n/a"}</div>
              <div>Debug auth hasAuthorizationHeader: {String(debugResult.hasAuthorizationHeader)}</div>
              {debugResult.userId && <div>userId: {debugResult.userId}</div>}
              {debugResult.teamCount !== undefined && <div>teamCount: {debugResult.teamCount}</div>}
              {debugResult.error && <div>error: {debugResult.error}</div>}
            </div>
          )}

          {diagnosticMessage && <div className="rounded-2xl bg-emerald-500/10 p-3 text-sm text-emerald-100">{diagnosticMessage}</div>}
          {diagnosticError && <div className="rounded-2xl bg-rose-500/10 p-3 text-sm text-rose-100">{diagnosticError}</div>}

          <div className="grid gap-2">
            <Button fullWidth variant="secondary" disabled={isCheckingSession} onClick={() => void checkBackendSession()}>
              Проверить backend-сессию
            </Button>
            <Button fullWidth disabled={isRefreshingLogin} onClick={() => void refreshTelegramLogin()}>
              Обновить вход через Telegram
            </Button>
          </div>
        </Card>
      )}

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
