import clsx from "clsx";
import type { TextareaHTMLAttributes } from "react";
export const Textarea = (props: TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...props} className={clsx("w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 min-h-40 outline-none focus:border-violet-500", props.className)} />;
