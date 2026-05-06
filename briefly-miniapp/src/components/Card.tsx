import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div className={`rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-soft ${className}`} {...props}>
      {children}
    </div>
  );
}
