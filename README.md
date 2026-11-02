# Mindshift

ტვინის გადაპროგრამების საიტი გამოწერის მოდელით · A subscription site for rewiring mental habits.

Guided meditations and self-hypnosis, structured courses, a daily practice tracker, an AI coach and
AI-written personal sessions, in Georgian and English.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000. With no environment variables the app runs in **demo mode**:

- any email/password signs you in; data is kept in a browser cookie
- checkout activates the plan without payment
- the AI coach and the session generator return sample text

## Configuration

Copy `.env.example` to `.env.local` and fill in what you need.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Real accounts and database. Run `supabase/schema.sql` in the Supabase SQL editor first. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only. Changes a user's plan (checkout / payment webhooks). |
| `ANTHROPIC_API_KEY` | Enables the AI coach and personal sessions (Claude). |
| `ANTHROPIC_MODEL` | Model for both AI features, default `claude-opus-5-5`. |
| `PAYMENTS_MODE` | `demo` (default). Any other value disables the demo checkout until a real provider is connected. |

## Plans

Defined in `src/lib/plans.ts` (single source of truth for prices, features and AI limits):

| | Basic | Pro | VIP |
| --- | --- | --- | --- |
| Monthly / yearly (₾) | 15 / 144 | 35 / 336 | 90 / 864 |
| Library + daily practice | ✓ | ✓ | ✓ |
| Courses, community | | ✓ | ✓ |
| AI coach messages / month | | 60 | 600 (fair use) |
| Personal AI sessions / month | | 10 | 100 (fair use) |

## Project layout

```
src/
  app/[locale]/(site)/   public pages: landing, pricing, login, signup, checkout
  app/[locale]/app/      members area: today, library, courses, create, coach, community, account
  app/api/               coach + meditation streaming endpoints (Claude)
  lib/plans.ts           plans, entitlements, limits
  lib/backend/           storage: demo (cookie) and Supabase, same interface
  lib/ai/                prompts, safety checks, Claude client, demo replies
  lib/content/           library sessions, courses, daily exercises (ka + en)
  lib/i18n/              UI strings (ka.ts must match en.ts; checked by tests)
  proxy.ts               locale redirect + Supabase session refresh
supabase/schema.sql      tables + Row Level Security
tests/                   unit tests (vitest)
```

## Safety

- Every page shows that Mindshift is not therapy or medical care.
- The coach and session prompts forbid diagnosis/medical advice and redirect crisis situations to 112 / findahelpline.com.
- A keyword check (`src/lib/ai/safety.ts`) prepends crisis resources before the model's reply.
- Users cannot change their own plan or AI usage counters (enforced by RLS in `schema.sql`).

## Not done yet

- **Real payments.** Connect TBC Pay / BOG iPay / Lemon Squeezy; its webhook should call `setPlan` with the service role.
- **Studio audio** for library sessions (`audioUrl` in `src/lib/content/library.ts`). Until then the browser's voice reads the script; many devices have no Georgian voice, in which case the text is shown to read along.
- Saving generated sessions and coach history, community moderation, password reset, email notifications.

## Scripts

```bash
npm run dev        # development server
npm run build      # production build
npm test           # unit tests
npm run typecheck  # TypeScript (run `npx next typegen` first on a fresh clone)
```
