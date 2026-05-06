import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { useAppStore } from "../store/useAppStore";
import { getTelegramWebApp } from "../utils/telegram";
export const SettingsScreen = ({ onClose }: { onClose: () => void }) => {
  const s = useAppStore();
  return <div className="space-y-3"><div className="flex justify-between"><h2 className="text-lg font-semibold">Настройки</h2><Button size="sm" variant="ghost" onClick={onClose}>Закрыть</Button></div>
    <Card className="space-y-1"><div>User: {s.telegramUser?.first_name}</div><div>Режим: {getTelegramWebApp() ? "Telegram" : "Browser mock"}</div><div>active team: {s.teams.find((t) => t.id === s.activeTeamId)?.name}</div></Card>
    <Card className="space-y-1 text-sm text-slate-400"><div>Backend sync: planned</div><div>AI import: planned</div><div>Payments: planned</div></Card>
    <Button variant="danger" fullWidth onClick={() => s.resetAllData()}>Сбросить все данные</Button>
    <Button variant="secondary" fullWidth onClick={() => s.createDemoData()}>Создать демо-данные заново</Button>
    <Button variant="ghost" fullWidth onClick={() => s.resetOnboarding()}>Пройти onboarding заново</Button>
  </div>;
};
