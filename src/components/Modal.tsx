import type { PropsWithChildren } from "react";
import { Button } from "./Button";
export const Modal = ({ title, onClose, children }: PropsWithChildren<{ title: string; onClose: () => void }>) => (
  <div className="fixed inset-0 bg-black/60 p-4 z-50"><div className="max-w-[480px] mx-auto bg-slate-900 border border-slate-700 rounded-2xl p-4 space-y-3"><div className="flex justify-between"><div className="font-semibold">{title}</div><Button size="sm" variant="ghost" onClick={onClose}>Закрыть</Button></div>{children}</div></div>
);
