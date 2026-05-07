import type { InputHTMLAttributes, KeyboardEvent } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  blurOnEnter?: boolean;
};

const textLikeInputTypes = new Set(["text", "search", "email", "url", "tel", "password"]);

export function Input({ className = "", blurOnEnter = true, type = "text", onKeyDown, enterKeyHint, inputMode, autoComplete, ...props }: InputProps) {
  const isTextLike = textLikeInputTypes.has(type);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (!event.defaultPrevented && blurOnEnter && event.key === "Enter") {
      event.currentTarget.blur();
    }
  };

  return (
    <input
      type={type}
      className={`min-h-[44px] w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-[16px] leading-normal text-slate-100 outline-none focus:border-violet-400 ${className}`}
      enterKeyHint={enterKeyHint ?? (isTextLike ? "done" : undefined)}
      inputMode={inputMode ?? (isTextLike ? "text" : undefined)}
      autoComplete={autoComplete ?? (isTextLike ? "off" : undefined)}
      onKeyDown={handleKeyDown}
      {...props}
    />
  );
}
