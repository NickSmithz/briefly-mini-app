import type { TelegramUser } from "../types";

export const getTelegramWebApp = () => window.Telegram?.WebApp ?? null;
export const initTelegram = () => {
  const app = getTelegramWebApp();
  if (!app) return;
  app.ready(); app.expand();
  app.setHeaderColor?.("#0f172a"); app.setBackgroundColor?.("#020617");
};
export const getTelegramUser = (): TelegramUser => getTelegramWebApp()?.initDataUnsafe?.user ?? { id: 1, first_name: "Briefly", username: "demo_user" };
export const hapticFeedback = (type: "light" | "medium" | "heavy" = "light") => getTelegramWebApp()?.HapticFeedback?.impactOccurred(type);
export const closeMiniApp = () => getTelegramWebApp()?.close();
export const expandMiniApp = () => getTelegramWebApp()?.expand();
export const setMainButton = (text: string, callback: () => void) => {
  const button = getTelegramWebApp()?.MainButton; if (!button) return;
  button.setText(text); button.show(); button.onClick(callback);
};
export const hideMainButton = () => getTelegramWebApp()?.MainButton?.hide();
