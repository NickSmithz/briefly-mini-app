export async function parsePlanWithAi(): Promise<never> {
  throw new Error("AI import будет подключен на backend-этапе. В MVP используется быстрый импорт без внешних API.");
}

export async function createCheckoutSession(): Promise<never> {
  throw new Error("Оплата будет подключена на backend-этапе через Telegram Stars, Stripe или ЮKassa.");
}

export async function syncWithBackend(): Promise<never> {
  throw new Error("Backend sync будет добавлен позже. Сейчас данные хранятся в localStorage.");
}
