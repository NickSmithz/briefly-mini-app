import clsx from "clsx";
import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
type Props = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" | "success"; size?: "sm" | "md" | "lg"; fullWidth?: boolean }>;
export const Button = ({ children, variant = "primary", size = "md", fullWidth, className, ...props }: Props) => (
  <button className={clsx("rounded-2xl font-medium transition disabled:opacity-50", fullWidth && "w-full", size === "sm" && "px-3 py-2 text-sm", size === "md" && "px-4 py-2.5", size === "lg" && "px-5 py-3 text-lg", variant === "primary" && "bg-violet-600 hover:bg-violet-500", variant === "secondary" && "bg-slate-800 border border-slate-700", variant === "ghost" && "bg-transparent border border-slate-700", variant === "danger" && "bg-rose-600", variant === "success" && "bg-emerald-600", className)} {...props}>{children}</button>
);
