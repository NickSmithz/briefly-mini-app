import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 p-4">
      <div className="w-full max-w-[480px] rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Закрыть">
            <X size={18} />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
