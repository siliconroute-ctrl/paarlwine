# Notes for AI coding agents

- Stack: TanStack Start + React 19 + Supabase + Claude API. See README.md.
- This project was exported from Lovable and no longer depends on it. Do not re-add `@lovable.dev/*` packages.
- Database changes go in new files under `supabase/migrations/` (never edit one that has already run), and the matching
  types go in `src/integrations/supabase/types.ts`.
- Secrets live in environment variables only. Never commit `.env`. `.env.example` lists every variable.
- Do not force-push or rewrite published git history.
- Run `npx tsc --noEmit` and `npm run build` before committing.
