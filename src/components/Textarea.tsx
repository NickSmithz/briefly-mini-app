import type { TextareaHTMLAttributes } from "react";

export function Textarea({ className = "", enterKeyHint = "done", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`min-h-[44px] w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-[16px] leading-normal text-slate-100 outline-none focus:border-violet-400 ${className}`}
      enterKeyHint={enterKeyHint}
      {...props}
    />
  );
}
