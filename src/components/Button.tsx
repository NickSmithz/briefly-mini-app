import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  children: ReactNode;
};

const variants = {
  primary: "bg-violet-500 text-white hover:bg-violet-400 shadow-soft",
  secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700",
  ghost: "bg-transparent text-slate-300 hover:bg-slate-800",
  danger: "bg-rose-500 text-white hover:bg-rose-400",
  success: "bg-emerald-500 text-white hover:bg-emerald-400",
};

const sizes = {
  sm: "min-h-9 px-3 text-sm",
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-12 px-5 text-base",
};

export function Button({ variant = "primary", size = "md", fullWidth, className = "", children, ...props }: Props) {
  return (
    <button
      className={`${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
