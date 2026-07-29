<!--
  File: CLAUDE.md — technical spec for the buildit-usa repo
  Purpose: What this codebase IS today, what deploys, and the locked constraints.
  Re-baselined: 2026-07-07. The site pivoted from marketplace platform to marketing
  site (2026-06-11 strategy re-baseline); the old full platform build spec is
  archived at docs/archive/20260707_CLAUDE-platform-build-spec.md and in git history.
-->

# Build It USA — Repo Spec

Read this file before writing any code here.

**Business strategy, products, and pricing are governed by:**
`/mnt/chromeos/MyFiles/ClaudeCode/AI Projects/Build It USA/SOURCE_OF_TRUTH.md`
When this file conflicts with SOURCE_OF_TRUTH.md on business logic, SOURCE_OF_TRUTH.md wins. This file governs technical implementation only.

**Project directory:** `~/buildit-usa/` (`/home/jacobmeyers/buildit-usa/`). Must stay in the Linux home dir, NOT under `/mnt/chromeos/` — the ChromeOS shared filesystem does not support symlinks, which npm needs for `node_modules/.bin/`.

---

## What This Repo Is Now

**A 4-page marketing site** for Jacob's AI training + done-for-you services, live at buildit-usa.com. It funnels every page toward one conversion: the free AI intro call (shared ContactSection on every page).

The old two-sided estimator platform is **PARKED** — its code stays warm in the repo but is not routed and not deployed (see Parked Estimator below).

## What Deploys (and What Doesn't)

- **Vercel Hobby plan = 12 serverless function limit.** `.vercelignore` ships ONLY `api/contact.js` + `api/lib/email.js`; every other `api/` file is estimator code, excluded from deploy. Editing `.vercelignore` changes what ships — treat it as a deploy gate. History: 97 days of silent deploy failures before this fix (2026-05-31).
- **Deploy path:** push to `main` on GitHub → Vercel auto-deploys. `vercel.json` holds security headers + SPA rewrites.
- **DNS:** GoDaddy. **MX records = Google Workspace — NEVER touch.** Full infra facts: workspace memory `project_buildit_deploy_infra.md`.

## Tech Stack (actual, current)

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, Tailwind CSS |
| Routing | **react-router-dom** (marketing site) — the "state-based, no router" rule belonged to the parked estimator app, which keeps its own state machine in `src/App.jsx` |
| Hosting | Vercel (static + 1 serverless function) |
| Contact form | `api/contact.js` → Resend |
| Payments | **Stripe Payment Links** (no checkout code in the live path) — URLs live in `src/marketing/config.js` |
| Parked estimator deps | @anthropic-ai/sdk, Supabase, @react-pdf/renderer, stripe — in package.json but unused by the live site |

## Site Map (consolidated 7→4 pages, 2026-07-05)

| Route | Page |
|---|---|
| `/` | Landing — hero, PigBarnCase proof, intro-call CTA |
| `/services` | All offerings: training tiers, Whole-Home Planner ($500), property services |
| `/projects` | Proof page — five-project plan + two executed plan-vs-actual case studies (pig barn, garage) |
| `/about` | About Jacob |
| `/training`, `/ai-for-your-work`, `/whole-home-planner`, `/property` | Redirects into `/services` sections — keep them; existing links and QR codes depend on them |

- Marketing code lives in `src/marketing/` (pages, components, `SiteLayout.jsx`, `config.js`).
- **HeroDemo slot** on the landing hero (`src/marketing/components/HeroDemo.jsx`) is the designated estimator drop-in point — launching the demo is a component swap, not a redesign.
- `src/marketing/config.js` is the single source for contact info, Stripe Payment Link URLs, and training tier data.

## Branch State

- `main` — the live site. What's on main is what's deployed.
- `v3-pricing-and-demo` — **local only, staged, not pushed.** Holds the photo-identify demo MVP (`HeroDemoLive` + `api/identify.js`, prompt validated 13/13 in the 20260612 photo eval) + v3 pricing/design-build framing. Branched off pre-consolidation main → **needs rebase onto current main before it can deploy.** Deploy is gated on Jacob's BIU-001 review pass (workspace `20260612_pending-rulings.md`).

## Parked Estimator (do not build on it without explicit instruction)

- Code warm: `src/App.jsx` (state-machine router), `src/components/`, `src/context/ProjectContext.jsx`, all `api/` estimator endpoints + `api/lib/`, `supabase/` migrations.
- Not routed (`src/main.jsx` has no `/app` route) and not deployed (`.vercelignore`).
- Revival plan + conditions: workspace `AI Projects/Build It USA/Planning/` (estimator revival plan). Known revival fix: legacy $19.99/$29.99 prices in parked `api/checkout.js`.
- The full platform build spec (marketplace, contractor network, Stripe Connect, auth, schema, prompts) is archived at `docs/archive/20260707_CLAUDE-platform-build-spec.md` — design reference for later outsourcing, NOT current product.

## Design System (locked)

**Full handoff doc: `docs/design/buildit-design-handoff.md` — read before building any UI.**

- ALL screens dark themed — `--iron` (#2A2320) backgrounds, `--parchment` (#F0E8DA) text
- Colonial carpentry + Tesla minimalism; no tile grids — fluid asymmetric layouts
- Typography: Architects Daughter (headings/nav/buttons), Libre Baskerville (body), Caveat bold (ALL dollar amounts + stats). **Never** Inter, Roboto, Arial, system-ui, monospace.
- Primary action color: iron/charcoal (not blue, not red). Tap targets ≥ 44x44px.
- **User-facing language rule: no UI text references AI, Claude, or machine learning.** Customer-facing framing: "Estimating software built by Jacob Meyers."
- No MasterBeaver image in HTML footers.

## Environment Variables

`.env.local` — never committed, never read/printed by agents, values never in chat (edit via `nano ~/buildit-usa/.env.local` in a separate terminal). Key names in use: `ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`. (Live site needs only `RESEND_API_KEY`; the rest serve the parked estimator + demo branch.)

## Verification

No type-checker or linter is configured. Before reporting any change complete:
1. `npm run build` must pass clean.
2. For visual changes, screenshot QA via Playwright + Chromium (setup: workspace memory `tool_playwright_screenshots.md`).
