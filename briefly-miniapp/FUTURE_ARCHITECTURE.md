# Future Architecture

## 1. Backend

- Node.js/Fastify или NestJS.
- PostgreSQL.
- Prisma.
- Telegram Bot API.
- Webhooks.
- Auth через Telegram initData validation.

## 2. AI Import

- Endpoint: `POST /api/import/ai-parse`.
- Принимает `rawText`, `projectId`, `teamId`.
- Возвращает `ImportDraft.rows`.
- Дальше используется текущий flow: `ImportDraft(source="ai") -> ImportPreview -> ContentItems + Tasks`.

## 3. Payments

- Telegram Stars или Stripe/ЮKassa.
- Subscription хранится на уровне Team.
- Backend проверяет limits.
- Frontend только отображает состояние подписки.

## 4. AI Chat

- AI Chat is planned as a paid feature.
- It will use Project Memory, content items, tasks and team context.
- It must be implemented only after backend, auth, payments and limits.
- Do not implement AI Chat in the MVP UI except a disabled “AI Chat — later” note in Settings.

## 5. Migration

Manual task creation is part of the core task layer. In backend version it should map to `POST /api/tasks` and support Telegram bot command `/task`.

`localStorage` state переносится в backend entities:

- Team
- Subscription
- Project
- TeamMember
- RoleMapping
- ImportDraft
- ContentItem
- ProjectMemoryItem
- Task
