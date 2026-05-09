# Briefly Backend MVP

## Architecture

- Frontend: Vite, React, TypeScript, Tailwind, Zustand.
- Backend: Vercel Functions in `/api`.
- Database: Supabase Postgres.
- ORM: Prisma.
- Auth: Telegram Mini App `initData` validation on backend, followed by JWT for API calls.
- Demo mode: existing localStorage workflow remains available.

## Data Model

Core backend entities:

- User
- Team
- TeamMember
- Project
- RoleMapping
- ImportDraft
- ContentItem
- Task

The Prisma schema lives in `prisma/schema.prisma`.

## API

The first backend layer includes:

- `POST /api/auth/telegram`
- `GET /api/teams/current`
- `GET/POST /api/projects`
- `PATCH /api/projects/[id]`
- `GET/POST /api/members`
- `PATCH/DELETE /api/members/[id]`
- `GET/POST /api/role-mappings`
- `POST /api/import-drafts`
- `PATCH /api/import-drafts/[id]`
- `GET /api/content-items`
- `POST /api/content-items/bulk`
- `PATCH/DELETE /api/content-items/[id]`
- `GET/POST /api/tasks`
- `POST /api/tasks/bulk`
- `PATCH/DELETE /api/tasks/[id]`
- `POST /api/tasks/assign-by-roles`

## Demo Mode Vs Team Sync Mode

Demo mode uses the existing Zustand persist store and `localStorage`.

Team sync mode uses `src/api/client.ts` and `src/store/useBackendStore.ts`. Settings exposes the first toggle and Telegram/dev mock login. The local mode is intentionally preserved as fallback.

## Current Limitations

- No AI import.
- No AI Chat.
- No payments.
- No Telegram notifications.
- No complex permissions.
- No files or task attachments.
- Task attachments via Supabase Storage are planned later after core backend workflow.

## Future

- Telegram bot notifications and reminders.
- AI import endpoint using the existing ImportDraft preview flow.
- AI Chat as a paid feature after backend auth, payments and limits.
- Team subscriptions through Telegram Stars, Stripe or ЮKassa.
- Supabase Storage attachments for task references and content assets.
