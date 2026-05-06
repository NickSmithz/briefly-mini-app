import type { Subscription } from "../types";
import { Button } from "./Button";
import { Card } from "./Card";
import { ProgressBar } from "./ProgressBar";

export function SubscriptionCard({ subscription, usage }: { subscription?: Subscription | null; usage: { projects: number; members: number; contentItems: number } }) {
  if (!subscription) return null;
  const rows = [
    ["Проекты", usage.projects, subscription.projectsLimit],
    ["Участники", usage.members, subscription.membersLimit],
    ["Публикации", usage.contentItems, subscription.contentItemsLimit],
  ] as const;
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-violet-200">Free trial</div>
          <h3 className="text-lg font-bold">Тариф Briefly Free</h3>
        </div>
        <div className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">trial</div>
      </div>
      <div className="mt-4 space-y-3">
        {rows.map(([label, used, limit]) => (
          <div key={label}>
            <div className="mb-1 flex justify-between text-xs text-slate-300">
              <span>{label}</span>
              <span>{used}/{limit}</span>
            </div>
            <ProgressBar value={used} max={limit} />
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-2xl bg-slate-950 p-3 text-sm text-slate-300">AI-импорт: скоро. На Free сейчас {subscription.aiImportsUsed}/{subscription.aiImportsLimit}.</div>
      <Button className="mt-3" fullWidth disabled variant="secondary">Обновить тариф</Button>
      <p className="mt-2 text-center text-xs text-slate-500">Платежи будут добавлены позже</p>
    </Card>
  );
}
