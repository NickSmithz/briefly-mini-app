# Briefly Mini App

Telegram Mini App для маленьких контент-команд. Briefly превращает контент-план из сообщения в публикации, задачи, дедлайны и личные планы исполнителей.

## Запуск локально

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Lint

```bash
npm run lint
```

## Как подключить к Telegram Mini App

1. Создать бота через BotFather.
2. Задеплоить приложение на HTTPS-хостинг, например Vercel.
3. Указать Web App URL в BotFather.
4. Открыть Mini App из Telegram.

## Mock mode

Если открыть приложение в браузере, используется mock Telegram user:

```ts
{ id: 1, first_name: "Briefly", username: "demo_user" }
```

## Ограничения MVP

- нет backend;
- данные хранятся в localStorage;
- нет реального совместного доступа;
- нет AI;
- нет bot reminders;
- нет реальной оплаты.

## Будущая архитектура

MVP уже содержит Team, Subscription, ImportDraft, ImportSource, ContentItem и Task, чтобы позже добавить backend, AI import и оплату без переписывания основного flow.
