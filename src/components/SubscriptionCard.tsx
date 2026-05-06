import { Card } from "./Card";
import { Button } from "./Button";
export const SubscriptionCard = ({ projects, members, contentItems, limits }: { projects: number; members: number; contentItems: number; limits: { projectsLimit: number; membersLimit: number; contentItemsLimit: number } }) => (
  <Card className="space-y-2">
    <div className="font-semibold">Free trial</div>
    <div className="text-sm text-slate-300">Проекты: {projects}/{limits.projectsLimit}</div>
    <div className="text-sm text-slate-300">Участники: {members}/{limits.membersLimit}</div>
    <div className="text-sm text-slate-300">Публикации: {contentItems}/{limits.contentItemsLimit}</div>
    <div className="text-sm text-slate-400">AI-импорт: скоро</div>
    <Button variant="secondary" disabled fullWidth>Обновить тариф</Button>
    <div className="text-xs text-slate-500">Платежи будут добавлены позже</div>
  </Card>
);
