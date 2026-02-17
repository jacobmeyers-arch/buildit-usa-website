# Agent B — AI + Payments + Integration

All architectural decisions, schemas, and shared specs are in CLAUDE.md. Read it first. This document covers only your file ownership, build steps, and implementation-specific details.

## Your Files

You own everything in:
- `api/` (all serverless functions and `lib/`)
- `supabase/` (migrations)
- `src/lib/supabase.js`
- `src/lib/api.js`
- `src/lib/stripe.js`

You do NOT modify files in `src/components/`, `src/hooks/`, or `src/context/`.

## Build Steps

| Step | Task | Depends On |
|------|------|-----------|
| 2 | Supabase setup (all tables from CLAUDE.md migrations, RLS, storage buckets, auth config) | Nothing |
| 6 | Claude API integration (streaming client + tool_use for both `update_understanding` and `generate_estimate` + prompt templates + retry logic) | Step 2 |
| 8 | Server-side user/project creation: build `src/lib/api.js` with `createUserAndProject()`. No magic link auth at this stage (Option B). Agent A's EmailCapture calls this. On submit: create user record, create project, link photo, save AI analysis. | Steps 2, 6 |
| 10 | Phase 2 scoping session (budget question logic + Q&A endpoint + additional photo handling + rolling context manager + escape hatch) | After CP1 |
| 12 | Scope + cost estimate generation (locked JSON schema from CLAUDE.md + `generate_estimate` tool + validation) | Step 10 |
| 13 | Upsell backend: plan gating logic in `src/lib/api.js` (`checkPlanStatus`, `getProjectCount`). Build these BEFORE Agent A starts UpsellScreen UI. | After CP2 |
| 14 | Stripe payment (checkout + webhook + verify-payment + A/B prices) | Step 13 |
| 16 | Cross-project analysis + Property Summary Report (PDF via @react-pdf/renderer + email via Resend) | Steps 14, 15 |
| 17 | Polish (your endpoints only) | After CP3 |

## Implementation Details

### Supabase Schema (Step 2)

Create migration files exactly as defined in CLAUDE.md "Complete Data Model" section. This includes:

- `001_initial_schema.sql`: users, projects, project_photos, interactions, events + all RLS + all indexes
- `002_payment_schema.sql`: property_plans + RLS + priority columns on projects (including `recommended_sequence`)

Storage buckets:
- `project-photos`: public read, authenticated write, path prefix `{user_id}/`
- `property-reports`: authenticated read/write, path prefix `{user_id}/`

### Claude API Client (Step 6)

`api/lib/claude.js` must support:

1. Streaming via `stream: true`
2. **Two tools:**
   - `update_understanding` — used by Prompts 6B, 6C during scoping
   - `generate_estimate` — used by Prompt 6D during estimate generation
   - Both tool definitions are in CLAUDE.md Section 3
3. SSE proxy to frontend:

```
event: token
data: {"text": "partial text chunk"}

event: metadata
data: {"understanding": 62, "dimensions_resolved": {...}, "delta": 12, ...}

event: done
data: {}

event: error
data: {"message": "user-facing error message", "retryable": true|false}
```

4. Retry logic: Exponential backoff, 2 retries on 529/5xx errors. After final failure, send `event: error` to frontend.
5. Content block handling: Text blocks → stream as tokens. `tool_use` blocks → parse and send as single metadata event.
6. Validation: If no `tool_use` block in response, log warning. Send metadata event with previous understanding score preserved.
7. **Estimate generation:** For `/api/scope` with `action='generate'`, Claude uses two output channels:
   - Text content block → narrative scope summary (save to `projects.scope_summary`)
   - `tool_use` block with `name='generate_estimate'` → structured JSON cost estimate (validate via `validateCostEstimate`, save to `projects.cost_estimate`)
   - If no `tool_use` block returned, retry once. On second failure, log error and return the text response with an error flag so the frontend can prompt retry.

### Prompt Templates (Step 6)

`api/lib/prompts.js` — All prompts from CLAUDE.md "Prompt Templates" section.

Key modifications (already noted in CLAUDE.md but repeated for clarity):

- **6B, 6C:** No `---METADATA---` references. `tool_use` instruction in system message: "You MUST call the `update_understanding` tool after every response. This is not optional."
- **6D:** Include `generate_estimate` tool definition. Include locked `cost_estimate` JSON schema. Include zip code for regional context. Instruct Claude to produce narrative as text content and structured estimate via tool call.
- **6A:** Add non-project photo handling rule (see CLAUDE.md prompt modifications).
- **6E:** Include locked `cross_project_analysis` JSON schema (the `sequenced_projects` version from CLAUDE.md).

### User/Project Creation — Option B Auth (Step 8)

Under Option B, free tier users are NOT authenticated via Supabase Auth. Instead:

`src/lib/api.js` exports:

```javascript
// createUserAndProject(email, zipCode, sessionId, aiAnalysis)
// → Uses service_role key server-side to:
//   1. Create user record with gen_random_uuid(), store email + zip_code
//   2. Create project record linked to user
//   3. Move photos from temp/{sessionId}/ to {user_id}/{project_id}/ in Supabase Storage
//      (list files in temp/{sessionId}/, copy each to final path, delete originals, remove temp folder)
//   4. Create project_photos records with final storage_path
//   5. Save initial AI analysis to project_photos.ai_analysis
// → Returns: { user: { id, email }, project: { id, status } }

// checkPlanStatus(userId)
// → Returns: { planType: 'free'|'paid', projectCount: number }

// getProjectCount(userId)
// → Returns: number of projects WHERE deleted_at IS NULL
```

These functions call serverless endpoints that use the `service_role` key. Agent A's components call these functions.

`src/lib/supabase.js` exports:
- `supabase` client (initialized with URL + anon key)
- `signInWithMagicLink(email)` → wraps `supabase.auth.signInWithOtp({ email })` — **called only from UpsellScreen during payment flow**
- `getSession()` → wraps `supabase.auth.getSession()`
- `onAuthChange(callback)` → wraps `supabase.auth.onAuthStateChange()`

### Service Role Key Usage

Use `supabase-admin.js` (service_role) ONLY in:
- User/project creation endpoint (Step 8 — free tier users have no auth)
- Webhook handler (`api/webhook.js`)
- Verify-payment endpoint (`api/verify-payment.js`)
- Analytics event logging for free tier users

All other endpoints should use the user's JWT token forwarded from the frontend when the user is authenticated (paid tier).

### Rolling Context Manager (Step 10)

`api/lib/context-manager.js`:

```javascript
// buildContext(projectId) → returns context string for prompt injection
// Rules (from CLAUDE.md):
// - Always include: all photo analyses (from project_photos.ai_analysis)
// - Always include: last 3 interactions (full user_input + ai_response)
// - Always include: current understanding_dimensions from project record
// - Always include: budget_approach + budget_target
// - Summarize interactions 4+ programmatically:
//   "[Q: user's question] → [A: key decision/info learned]"
//   One line per interaction, ~20-30 tokens each
// - Hard cap: ~4,000 tokens total
// - Log the total token count of the constructed context string to the
//   server console on every /api/scope call (for CP2 verification)
```

### Rate Limiter (Step 6)

`api/lib/rate-limiter.js`:

```javascript
// In-memory Map<ip, { count: number, resetAt: number }>
// Limits from CLAUDE.md: unauth=5/hr, auth=15/hr
// Returns: { allowed: boolean, remaining: number, resetAt: number }
// State resets on cold start — acceptable for MVP
```

Apply to `/api/analyze` and `/api/scope`.

### All Serverless Functions — Required Behaviors

Every endpoint in `api/`:

1. Verify Origin header matches app domain (403 on mismatch)
2. Return proper HTTP status codes (200, 400, 401, 403, 429, 500)
3. `try/catch` with structured JSON error responses: `{ error: string, code: number }`
4. Rate limiter applied to `/api/analyze` and `/api/scope`
5. Return `Access-Control-Allow-Origin` header set to `NEXT_PUBLIC_APP_URL`
6. Handle OPTIONS preflight requests (return 204 with CORS headers)
7. Sanitize all user text input: validate email format, validate zip code format (5 digits), strip HTML/script tags from free-text fields before DB insertion and prompt injection

### /api/analyze Endpoint

Handles 3 request types via `body.type`:

| Type | Input | Behavior |
|------|-------|----------|
| `initial` | photo `storage_path` | Run Phase 1 prompt (6A), return streaming analysis |
| `additional` | photo `storage_path` + `project_id` | Run Phase 2 photo prompt (6C), include project context |
| `correction` | original `storage_path` + correction text | Re-run analysis with original photo + user correction, update project title |

### /api/scope Endpoint

Handles 2 actions via `body.action`:

| Action | Input | Behavior |
|--------|-------|----------|
| `question` | `user_input` + `project_id` | Build rolling context, run Phase 2 prompt (6B), stream response |
| `generate` | `project_id` | Build context, run estimate prompt (6D), validate JSON via `generate_estimate` tool response, save `scope_summary` (text) + `cost_estimate` (tool_use JSON) to project |

**Interaction type mapping for logging:**
- `body.action = 'question'` → log with `type: 'question'`
- `body.action = 'generate'` → log with `type: 'estimate_request'`
- `/api/analyze` with `type: 'initial'` → log with `type: 'photo_analysis'`
- `/api/analyze` with `type: 'additional'` → log with `type: 'additional_photo'`
- `/api/analyze` with `type: 'correction'` → log with `type: 'correction'`

Escape hatch logic: Track `projects.interaction_count`. After 8+ interactions, if understanding is 60-80%, inject into prompt context: "The homeowner has been very engaged. If you feel you have enough to generate a useful estimate (even with some wider ranges), offer to generate it now." Return `suggest_estimate: true` in metadata SSE event.

### Stripe Integration (Step 14)

**Checkout creation (`api/checkout.js`):**

```javascript
// Read PRICE_TIER env var → select STRIPE_PRICE_ID_STANDARD or STRIPE_PRICE_ID_PREMIUM
// Create Stripe Checkout Session:
//   mode: 'payment'
//   line_items: [{ price: selectedPriceId, quantity: 1 }]
//   success_url: `${APP_URL}?screen=paymentSuccess&session_id={CHECKOUT_SESSION_ID}`
//   cancel_url: `${APP_URL}?screen=estimate`
//   metadata: { user_id, plan_id }
```

**Webhook handler (`api/webhook.js`):**

```javascript
// CRITICAL: stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET)
// On 'checkout.session.completed':
//   1. Create property_plans record (plan_type: 'paid', stripe_session_id)
//   2. Check if 2+ projects at estimate_ready → trigger cross-project analysis
//   3. If cross-project analysis ran → generate PDF → upload to storage → email via Resend
```

**Payment verification fallback (`api/verify-payment.js`):**

```javascript
// MUST validate: requesting user's auth.uid() === session.metadata.user_id
// Receives: session_id from query params
// Calls: stripe.checkout.sessions.retrieve(session_id)
// If session.payment_status === 'paid' AND no property_plans record exists:
//   Create the record (same logic as webhook)
// Returns: { verified: boolean, plan_type: string }
```

### JSON Validation (Steps 10, 12, 16)

`api/lib/validators.js`:

- `validateCostEstimate(json)` — check against locked `cost_estimate` schema in CLAUDE.md. Verify all required fields, `total_low`/`total_high` are numbers, `confidence` is one of `low|medium|high`.
- `validateCrossProjectAnalysis(json, validProjectIds)` — verify:
  - `json.sequenced_projects` exists and is an array
  - All `project_id` values exist in `validProjectIds`
  - All `priority_score` values are integers 1-100
  - All `recommended_sequence` values are positive integers
  - `json.bundle_groups`: all `project_ids` reference valid projects, `estimated_savings_percent` is a number 0-100
  - `json.quick_wins`: all entries are valid project_ids
  - `json.total_cost_range` has `low` and `high` as numbers
- `validateUnderstandingUpdate(json)` — score 0-100, required fields present

On validation failure: log the failure, return user-friendly error, retry the Claude call once.

### PDF Generator (Step 16)

`api/lib/pdf-generator.js` using `@react-pdf/renderer`:

Sections (matching Prompt 6F):
1. Property Improvement Overview
2. Project Priority Roadmap (omit if single project)
3. Smart Savings Opportunities (omit if single project)
4. Quick Wins
5. Investment Summary Table
6. What a Contractor Needs From You
7. Next Steps

For single-project reports: replace sections 2-3 with "Add more projects to unlock priority sequencing and savings recommendations."

### Email Delivery (Step 16)

`api/lib/email.js`:

```javascript
// Uses Resend API
// sendReportEmail(to, pdfBuffer, reportSummary)
// PDF as attachment + brief HTML body with report highlights
// From: noreply@builditusa.com (configure in Resend dashboard)
```

## Quality Standards

- Every serverless function returns proper HTTP status codes
- Every serverless function includes try/catch with structured error responses
- Every database write validates input before inserting
- All Stripe operations use test mode keys during development
- All Claude API calls include retry logic
- Rate limiter applied to public-facing endpoints
- CORS headers on all responses
- Input sanitization on all user-provided text
- Build error handling INTO each endpoint as you create it — do not defer to Step 17
