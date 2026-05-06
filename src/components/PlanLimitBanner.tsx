import { AlertTriangle } from "lucide-react";
import { Card } from "./Card";
export const PlanLimitBanner = ({ used, limit, title }: { used: number; limit: number; title: string }) => {
  if (limit === 0) return <Card className="border-amber-500/30 text-amber-300">{title}: скоро</Card>;
  if (used / limit < 0.8) return null;
  return <Card className="flex items-center gap-2 border-amber-500/30 text-amber-300"><AlertTriangle size={16} />{title}: использовано {used}/{limit}</Card>;
};
