import type { ReactNode } from "react";
import { Card } from "./Card";

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description: string; action?: ReactNode }) {
  return (
    <Card className="text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-violet-200">{icon}</div>
      <h3 className="text-base font-bold">{title}</h3>
      <p className="mt-1 text-sm text-slate-400">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </Card>
  );
}
