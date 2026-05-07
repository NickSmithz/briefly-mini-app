import { useEffect, useRef, useState } from "react";

const textInputTypes = new Set(["text", "search", "email", "url", "tel", "password"]);

function isKeyboardTextField(element: EventTarget | null): element is HTMLInputElement | HTMLTextAreaElement {
  if (!(element instanceof HTMLInputElement) && !(element instanceof HTMLTextAreaElement)) return false;
  if (element.disabled || element.readOnly) return false;
  if (element instanceof HTMLTextAreaElement) return true;
  return textInputTypes.has(element.type || "text");
}

export function useKeyboardDoneBar() {
  const focusedElementRef = useRef<HTMLElement | null>(null);
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isKeyboardBarVisible, setKeyboardBarVisible] = useState(false);
  const [hint, setHint] = useState<string | undefined>();

  useEffect(() => {
    const handleFocusIn = (event: FocusEvent) => {
      if (!isKeyboardTextField(event.target)) return;
      if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
      focusedElementRef.current = event.target;
      setHint(event.target.dataset.keyboardDoneHint || undefined);
      setKeyboardBarVisible(true);
    };

    const handleFocusOut = () => {
      blurTimerRef.current = setTimeout(() => {
        setKeyboardBarVisible(false);
        setHint(undefined);
        focusedElementRef.current = null;
      }, 150);
    };

    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);

    return () => {
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
      if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
    };
  }, []);

  const hideKeyboard = () => {
    if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
    const activeElement = focusedElementRef.current ?? document.activeElement;
    if (activeElement instanceof HTMLElement) activeElement.blur();
    setKeyboardBarVisible(false);
    setHint(undefined);
    focusedElementRef.current = null;
  };

  return {
    isKeyboardBarVisible,
    keyboardHint: hint,
    hideKeyboard,
  };
}
