import clsx from "clsx";
export const Badge = ({ text, color = "slate" }: { text: string; color?: "slate" | "violet" | "emerald" | "amber" | "rose" }) => (
  <span className={clsx("px-2 py-1 text-xs rounded-xl border", color === "slate" && "bg-slate-800 border-slate-700", color === "violet" && "bg-violet-600/20 border-violet-500/40", color === "emerald" && "bg-emerald-600/20 border-emerald-500/40", color === "amber" && "bg-amber-600/20 border-amber-500/40", color === "rose" && "bg-rose-600/20 border-rose-500/40")}>{text}</span>
);
