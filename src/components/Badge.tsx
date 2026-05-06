import type { ReactNode } from "react";

const colors = {
  slate: "bg-slate-800 text-slate-200",
  violet: "bg-violet-500/15 text-violet-200",
  indigo: "bg-indigo-500/15 text-indigo-200",
  emerald: "bg-emerald-500/15 text-emerald-200",
  amber: "bg-amber-500/15 text-amber-200",
  orange: "bg-orange-500/20 text-orange-200",
  rose: "bg-rose-500/15 text-rose-200",
};

export function Badge({ children, color = "slate" }: { children: ReactNode; color?: keyof typeof colors }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${colors[color]}`}>{children}</span>;
}
