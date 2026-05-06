import clsx from "clsx";
import type { PropsWithChildren } from "react";
export const Card = ({ children, className }: PropsWithChildren<{ className?: string }>) => <div className={clsx("rounded-2xl bg-slate-900 border border-slate-800 p-4 shadow-sm", className)}>{children}</div>;
