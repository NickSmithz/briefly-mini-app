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

## Backend with Supabase

1. Создайте Supabase project.
2. Возьмите pooled connection string для `DATABASE_URL`.
3. Возьмите direct connection string для `DIRECT_URL`.
4. Создайте `.env.local`:

```bash
DATABASE_URL="..."
DIRECT_URL="..."
TELEGRAM_BOT_TOKEN="..."
JWT_SECRET="..."
```

5. Установите зависимости:

```bash
npm.cmd install
```

6. Prisma:

```bash
npm.cmd exec prisma generate
npm.cmd exec prisma migrate dev -- --name init
```

7. Запуск:

```bash
npm.cmd run dev
```

8. Проверка API:

```text
http://localhost:5173/api/health
```

9. Vercel env variables:

```text
DATABASE_URL
DIRECT_URL
TELEGRAM_BOT_TOKEN
JWT_SECRET
```

## Telegram Mini App

1. Создать бота через BotFather.
2. Задеплоить приложение на HTTPS-хостинг, например Vercel.
3. Указать Web App URL в BotFather.
4. Открыть Mini App из Telegram.

## Demo Mode

Если backend sync выключен, приложение продолжает работать как frontend-only MVP через `localStorage`.

## Team Sync Mode

В Settings можно включить Team sync mode и войти через Telegram. В development без `initData` используется mock user. В production backend принимает только валидный Telegram Mini App `initData`.

## Ограничения текущего backend MVP

- local/demo mode сохранён;
- AI import и AI Chat не реализованы;
- платежи не реализованы;
- Telegram bot notifications не реализованы;
- Supabase Storage и вложения к задачам не реализованы;
- сложные права доступа не добавлены.

Подробнее: [BACKEND_MVP.md](./BACKEND_MVP.md).
