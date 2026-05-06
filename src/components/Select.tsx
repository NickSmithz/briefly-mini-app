import clsx from "clsx";
import type { SelectHTMLAttributes } from "react";
export const Select = (props: SelectHTMLAttributes<HTMLSelectElement>) => <select {...props} className={clsx("w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 outline-none focus:border-violet-500", props.className)} />;
