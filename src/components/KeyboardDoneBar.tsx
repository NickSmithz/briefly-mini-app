type KeyboardDoneBarProps = {
  visible: boolean;
  onDone: () => void;
  hint?: string;
};

export function KeyboardDoneBar({ visible, onDone, hint }: KeyboardDoneBarProps) {
  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70]">
      <div className="mx-auto max-w-[480px] border-t border-slate-800 bg-slate-950/95 px-4 py-2 pb-[calc(env(safe-area-inset-bottom)+8px)] backdrop-blur">
        <div className="flex min-w-0 items-center justify-between gap-3">
          {hint ? <span className="min-w-0 truncate text-xs text-slate-400">{hint}</span> : <span />}
          <button
            type="button"
            className="shrink-0 rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white"
            onMouseDown={(event) => event.preventDefault()}
            onClick={onDone}
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
}
