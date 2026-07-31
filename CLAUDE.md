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

**A 2-page marketing site** for Jacob's AI training + done-for-you services, live at buildit-usa.com. It funnels every page toward one conversion: the free AI intro call (shared ContactSection on every page).

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

## Site Map (7→4 pages 2026-07-05, 4→2 2026-07-31, `/pricing` restored same day)

| Route | Page |
|---|---|
| `/` | Landing — hero + HeroDemo, proof strip, price strip pointing at `/pricing`, about, contact |
| `/pricing` | The payment page — all five offerings, "what you get", Stripe buttons |
| `/projects` | Proof page — delivery-tier explainer, five-project plan, two executed case studies |
| `/services`, `/training`, `/ai-for-your-work`, `/whole-home-planner`, `/property` | Redirect → `/pricing`. **Keep them** — QR codes and existing links depend on them |
| `/about` | Redirect → `/` |

- Marketing code lives in `src/marketing/` (pages, components, `SiteLayout.jsx`, `config.js`).
- **HeroDemo slot** on the landing hero (`src/marketing/components/HeroDemo.jsx`) is the designated estimator drop-in point — launching the demo is a component swap, not a redesign.
- `src/marketing/config.js` is the single source for contact info, Stripe Payment Link URLs, and the `PRICING` table (which replaced the old `TRAINING_TIERS` prose cards).

## Copy Budget (set 2026-07-31)

Cut from a 2,763-word baseline. Measure with `document.body.innerText`, not source
strings. **Prose is the exception, not the default:** offerings and plan-vs-actual
data belong in tables; a paragraph earns its place only by saying something no
table can. Before adding copy, check whether an existing table already carries it.

| Page | Words | Status |
|---|---|---|
| `/` | ~240 | **Budget applies.** Keep it here. |
| `/pricing` | ~270 | **Exempt** (Jacob) — its job is to close a sale |
| `/projects` | ~1,140 | **Exempt** (Jacob) — its job is to explain the estimator |

## Published Numbers Are Sourced, Never Typed

Every price on `/projects` comes from a v3 estimate's embedded `estimate-data`
block in the client folder — not from memory, not from an older version of the
page. Four of five rows silently rotted to pre-v3 values once already (porch ~2x
low, bathroom ~2.5x low, pig barn on v1's broken math) and shipped that way.

- Ranges publish at the **Solo GC** tier (1.25x) so they compare to self-performed actuals.
- **Never publish a raw quote-vs-actual ratio as a tool-accuracy result** — the
  calibration memos say this explicitly. Publish the decomposition.
- Re-verify against the client folder before changing any figure here.

## Branch State

- `main` — the live site. What's on main is what's deployed.
- `v3-pricing-and-demo` — **local only, staged, not pushed.** Holds the photo-identify demo MVP (`HeroDemoLive` + `api/identify.js`, prompt validated 13/13 in the 20260612 photo eval) + v3 pricing/design-build framing. Branched off pre-consolidation main → **needs rebase onto current main before it can deploy.** Deploy is gated on Jacob's BIU-001 review pass (workspace `20260612_pending-rulings.md`).
  - ⚠️ The 2026-07-31 two-page cut rewrote every file this branch touches. A rebase is now a near-total conflict; treat it as **re-implement, not rebase**. Its only unique asset is the `HeroDemoLive` component + `api/identify.js` — port those into the current `HeroDemo` slot and drop the rest. Unresolved: Jacob has not yet ruled on whether to land or abandon it.

## Parked Estimator (do not build on it without explicit instruction)

- Code warm: `src/App.jsx` (state-machine router), `src/components/`, `src/context/ProjectContext.jsx`, all `api/` estimator endpoints + `api/lib/`, `supabase/` migrations.
- Not routed (`src/main.jsx` has no `/app` route) and not deployed (`.vercelignore`).
- Revival plan + conditions: workspace `AI Projects/Build It USA/Planning/` (estimator revival plan). Known revival fix: legacy $19.99/$29.99 prices in parked `api/checkout.js`.
- The full platform build spec (marketplace, contractor network, Stripe Connect, auth, schema, prompts) is archived at `docs/archive/20260707_CLAUDE-platform-build-spec.md` — design reference for later outsourcing, NOT current product.

## Design System (locked)

**Handoff doc: `docs/design/buildit-design-handoff.md`.** ⚠️ **Largely STALE** — it
specs the parked camera-first estimator (beaver mascot, contractor dashboards,
project timeline). Only its **token, typography, and aesthetic** sections still
govern. Do not build the components it describes.

- ALL screens dark themed — `--iron` (#2A2320) backgrounds, `--parchment` (#F0E8DA) text
- Colonial carpentry + Tesla minimalism; no tile grids — fluid asymmetric layouts
- Typography: Architects Daughter (headings/nav/buttons), Libre Baskerville (body), Caveat bold (ALL dollar amounts + stats). **Never** Inter, Roboto, Arial, system-ui, monospace.
  - Architects Daughter swallows colons — `1:1` renders as `11`. Spell it out.
- Primary action color: iron/charcoal (not blue, not red). Tap targets ≥ 44x44px.
- **User-facing language rule: no UI text references AI, Claude, or machine learning.** Customer-facing framing: "Estimating software built by Jacob Meyers."
- No MasterBeaver image in HTML footers.

### Motion Layer (added 2026-07-31, approved as motion-only)

The site reads modern through **behavior and geometry, not color**. The palette
and the three-tier type system are untouched, and the anti-patterns above still
hold — no glow, no neon, no glassmorphism, no color gradients. A cool accent
(`--steel-blue`) was considered and **deliberately not adopted**; adding one is a
palette change and needs Jacob's approval.

- `Reveal` and `CountUp` live in `src/marketing/components/primitives.jsx`
- **`CountUp` must never display a wrong figure.** It initializes to the real
  value, drops to zero only once the observer confirms the element is below the
  fold, and has a 4s failsafe. Reduced motion, a stalled observer, or a crawler
  that never scrolls all still read the true number. Do not "simplify" this to
  `useState(0)`.
- Geometry: `--radius-frame/card/btn` = 6/4/3px. Hairline `Rule` between sections.
- Everything animated is disabled under `prefers-reduced-motion`.

## Environment Variables

`.env.local` — never committed, never read/printed by agents, values never in chat (edit via `nano ~/buildit-usa/.env.local` in a separate terminal). Key names in use: `ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`. (Live site needs only `RESEND_API_KEY`; the rest serve the parked estimator + demo branch.)

## Verification

No type-checker or linter is configured. Before reporting any change complete:
1. `npm run build` must pass clean.
2. For visual changes, screenshot QA via Playwright + Chromium (setup: workspace memory `tool_playwright_screenshots.md`).
