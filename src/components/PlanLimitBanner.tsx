import { AlertTriangle } from "lucide-react";
import { isNearLimit } from "../utils/subscription";
import { Card } from "./Card";

export function PlanLimitBanner({ label, used, limit }: { label: string; used: number; limit: number }) {
  if (limit === 0) {
    return (
      <Card className="flex items-start gap-3 border-amber-500/20 bg-amber-500/10">
        <AlertTriangle className="mt-0.5 text-amber-300" size={18} />
        <div>
          <div className="text-sm font-semibold text-amber-100">{label}: скоро</div>
          <p className="text-xs text-amber-200/80">Функция будет доступна после backend-этапа.</p>
        </div>
      </Card>
    );
  }
  if (!isNearLimit(used, limit)) return null;
  return (
    <Card className="flex items-start gap-3 border-amber-500/20 bg-amber-500/10">
      <AlertTriangle className="mt-0.5 text-amber-300" size={18} />
      <div>
        <div className="text-sm font-semibold text-amber-100">{label}: {used}/{limit}</div>
        <p className="text-xs text-amber-200/80">Лимит почти заполнен. В MVP действие не блокируется.</p>
      </div>
    </Card>
  );
}
