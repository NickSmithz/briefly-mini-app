## Future Architecture

1. Backend:
- Node.js/Fastify или NestJS
- PostgreSQL
- Prisma
- Telegram Bot API
- Webhooks
- Auth через Telegram initData validation

2. AI Import:
- endpoint `POST /api/import/ai-parse`
- принимает raw text, projectId, teamId
- возвращает ImportDraft rows
- дальше используется текущий ImportPreview flow

3. Payments:
- Telegram Stars или Stripe/ЮKassa
- subscription на уровне Team
- backend проверяет limits
- frontend только отображает состояние подписки

4. Migration:
- localStorage state → backend entities:
  Team, Subscription, Project, TeamMember, RoleMapping, ImportDraft, ContentItem, Task
