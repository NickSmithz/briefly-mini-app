import type { TelegramUser, TelegramWebApp } from "../types";

export function getTelegramWebApp(): TelegramWebApp | null {
  return window.Telegram?.WebApp ?? null;
}

export function initTelegram() {
  const app = getTelegramWebApp();
  if (!app) return;
  app.ready();
  app.expand();
  app.setHeaderColor("#020617");
  app.setBackgroundColor("#020617");
}

export function getTelegramUser(): TelegramUser {
  return getTelegramWebApp()?.initDataUnsafe?.user ?? { id: 1, first_name: "Briefly", username: "demo_user" };
}

export function hapticFeedback(type: "light" | "success" | "warning" | "error" = "light") {
  const feedback = getTelegramWebApp()?.HapticFeedback;
  if (!feedback) return;
  if (type === "light") feedback.impactOccurred("light");
  else feedback.notificationOccurred(type);
}

export function closeMiniApp() { getTelegramWebApp()?.close(); }
export function expandMiniApp() { getTelegramWebApp()?.expand(); }

export function setMainButton(text: string, callback: () => void) {
  const button = getTelegramWebApp()?.MainButton;
  if (!button) return;
  button.setText(text);
  button.onClick(callback);
  button.show();
}

export function hideMainButton() {
  getTelegramWebApp()?.MainButton?.hide();
}
