import type { LucideIcon } from "lucide-react";
import { Card } from "./Card";
import { Button } from "./Button";
export const EmptyState = ({ icon: Icon, title, description, actionText, onAction }: { icon: LucideIcon; title: string; description: string; actionText?: string; onAction?: () => void }) => (
  <Card className="text-center space-y-3 py-8">
    <Icon className="mx-auto text-slate-400" />
    <div className="font-semibold">{title}</div><div className="text-sm text-slate-400">{description}</div>
    {actionText && onAction ? <Button onClick={onAction}>{actionText}</Button> : null}
  </Card>
);
