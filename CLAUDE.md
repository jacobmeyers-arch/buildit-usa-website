# BuildIt USA — MVP Build Instructions

Read this file completely before writing any code. This is the single source of truth. Do not reference other docs in the `docs/archive/` folder during build — they are historical context only. Files in `docs/archive/` contain OUTDATED specifications that contradict this document. Do not read them.

## Project Overview

BuildIt USA is a camera-first web app where homeowners photograph home projects, receive instant expert analysis, and build complete scope + cost estimates through guided Q&A. Free tier: 1 project. Paid tier ($19.99): unlimited projects, priority sequencing, Property Summary Report PDF.

**User-facing language rule:** No UI text references AI, Claude, machine learning, or similar terms. The technology is invisible.

**Project directory:** `~/buildit-usa/` (`/home/jacobmeyers/buildit-usa/`). Must be in Linux home dir, NOT under `/mnt/chromeos/` — ChromeOS shared filesystem does not support symlinks, which npm requires for `node_modules/.bin/`.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Tailwind CSS |
| Hosting | Vercel (static + serverless functions) |
| Backend | Vercel Serverless Functions (Node.js) |
| Database | Supabase (Postgres + Auth + Storage) |
| AI | Anthropic Claude API (Vision + Text, streaming) |
| Payments | Stripe Checkout (one-time payment) |
| PDF | @react-pdf/renderer (NOT Puppeteer) |
| Email | Resend (report delivery) |

## Critical Architectural Decisions

These are locked. Do not deviate without explicit instruction.

### 1. Routing: State-Based (No React Router)

Use a single AppState enum managed in React Context:

```
splash | camera | preview | analyzing | analysis | email | magicLinkPending |
budgetQuestion | scoping | estimate | upsell | paymentSuccess | dashboard | report
```

No React Router dependency. Add `window.history.pushState()` on each screen transition and listen for `popstate` events for browser back button support.

### 2. State Management: ProjectContext Provider

Create `src/context/ProjectContext.jsx` — a React Context provider wrapping the app. It holds:

- `currentUser` (id, email, zip_code)
- `activeProject` (full project record)
- `planStatus` (free | paid)
- `appScreen` (current AppState value)
- `photos` (array of photo records for active project)
- State updater functions

No external state management libraries. All components consume context directly.

### 3. Claude API Metadata: tool_use (NOT ---METADATA---)

Do NOT use the `---METADATA---` delimiter approach. Define Claude tools for structured metadata:

**Understanding Update Tool** (used by Prompts 6B, 6C):

```json
{
  "name": "update_understanding",
  "description": "You MUST call this tool after every response to report your updated assessment.",
  "input_schema": {
    "type": "object",
    "properties": {
      "understanding": { "type": "integer", "minimum": 0, "maximum": 100 },
      "dimensions_resolved": {
        "type": "object",
        "properties": {
          "project_type": { "type": "boolean" },
          "scope_direction": { "type": "boolean" },
          "space_dimensions": { "type": "boolean" },
          "condition": { "type": "boolean" },
          "materials_preference": { "type": "boolean" },
          "budget_framing": { "type": "boolean" },
          "timeline": { "type": "boolean" },
          "constraints": { "type": "boolean" }
        }
      },
      "delta": { "type": "integer" },
      "delta_reason": { "type": "string" },
      "cost_flag": { "type": ["string", "null"] },
      "next_unresolved": { "type": "string", "description": "The most impactful unresolved dimension to ask about next" }
    },
    "required": ["understanding", "dimensions_resolved", "delta", "delta_reason", "next_unresolved"]
  }
}
```

Claude returns a text content block (visible to user) and a tool_use content block (parsed for meter/flags). The serverless function separates both block types and returns them via SSE to the frontend.

**Validation rule:** If Claude's response contains no tool_use block, log a warning and preserve the current understanding score. Do not crash.

**Estimate Generation Tool** (used by Prompt 6D):

```json
{
  "name": "generate_estimate",
  "description": "You MUST call this tool with the structured cost estimate after generating the narrative scope document.",
  "input_schema": {
    "type": "object",
    "properties": {
      "line_items": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "item": { "type": "string", "description": "work item description" },
            "category": { "type": "string", "description": "e.g. cabinetry, plumbing, electrical, structural" },
            "low": { "type": "number", "description": "low estimate in dollars" },
            "high": { "type": "number", "description": "high estimate in dollars" },
            "assumed": { "type": "boolean", "description": "true if not explicitly confirmed by user" },
            "notes": { "type": "string", "description": "additional context" }
          },
          "required": ["item", "category", "low", "high", "assumed"]
        }
      },
      "total_low": { "type": "number" },
      "total_high": { "type": "number" },
      "confidence": { "type": "string", "enum": ["low", "medium", "high"] },
      "unresolved_areas": { "type": "array", "items": { "type": "string" } },
      "regional_note": { "type": "string" }
    },
    "required": ["line_items", "total_low", "total_high", "confidence", "unresolved_areas", "regional_note"]
  }
}
```

Claude generates the narrative scope document as the text content block (stored in `projects.scope_summary`). Claude MUST also call the `generate_estimate` tool with the structured cost estimate JSON (stored in `projects.cost_estimate`). The serverless function separates both block types: text → `scope_summary`, tool_use → `cost_estimate`.

**SSE Event Types:**

The serverless function sends these SSE events to the frontend:

```
event: token
data: {"text": "partial text chunk"}

event: metadata
data: {"understanding": 62, "dimensions_resolved": {...}, "delta": 12, ...}

event: done
data: {}

event: error
data: {"message": "string — user-facing error message", "retryable": boolean}
```

The `error` event is sent when the Claude API call fails after exhausting retries (2 attempts on 529/5xx). Frontend renders the error message and shows a [Retry] button if `retryable` is `true`. Also sent on: request timeout, malformed response, or unexpected server error.

### 4. Serverless Function Consolidation (5 Endpoints)

| Endpoint | Handles | Differentiator |
|---|---|---|
| `/api/analyze` | Initial photo + additional photos + corrections | `body.type`: 'initial' \| 'additional' \| 'correction' |
| `/api/scope` | Scoping Q&A + estimate generation | `body.action`: 'question' \| 'generate' |
| `/api/checkout` | Stripe Checkout session creation | — |
| `/api/webhook` | Stripe webhook + triggers report/cross-project analysis | `event.type` from Stripe |
| `/api/verify-payment` | Fallback payment verification | — |

Internal logic stays modular — handler functions in `api/lib/` called by the route files.

All endpoints must:
- Verify `Origin` header matches the app domain (return 403 on mismatch)
- Return proper HTTP status codes (200, 400, 401, 403, 429, 500)
- Include try/catch with structured error responses
- Return `Access-Control-Allow-Origin` header set to `NEXT_PUBLIC_APP_URL` value
- Handle OPTIONS preflight requests (return 204 with appropriate CORS headers)

### 5. Authentication: Supabase Auth — Option B (Confirmed)

**Decision:** Unverified email for free tier. Magic link verification at payment only.

**Free tier flow:**
- User enters email + zip code at email capture screen
- Create a user record directly with `gen_random_uuid()` as the ID
- Store email and zip_code in the users table
- Create project record linked to user
- No magic link, no auth email, no verification step
- User proceeds immediately to Phase 2

**How RLS works without auth:** Free tier API calls use the `service_role` key server-side to create and manage records. The user's UUID is tracked in the session/context and passed to the serverless functions. RLS policies still apply for any direct client-side Supabase calls, but the primary data access pattern for free users is server-side.

**Payment flow (magic link required):**
- When user clicks "Plan My Whole House" on upsell screen
- Trigger `supabase.auth.signInWithOtp({ email })` with their stored email
- Show MagicLinkPending screen
- On auth confirmation (SIGNED_IN event): proceed to Stripe Checkout
- Stripe session metadata includes the authenticated user_id
- This ensures: verified email before payment, `auth.uid()` available for RLS on paid features

**Why this approach:**
- Removes 60-90 seconds of friction from the free funnel
- Avoids Supabase free tier 4 emails/hr auth limit during free usage
- Fake email risk is ~$1.50/user, negligible at MVP scale
- Every paying user is verified

**Agent implementation notes:**
- Agent B: `src/lib/supabase.js` still exports `signInWithMagicLink(email)` but it is only called from the upsell/payment flow, NOT from EmailCapture
- Agent A: EmailCapture calls `createUserAndProject(email, zipCode, sessionId, aiAnalysis)` via `src/lib/api.js` — server moves photos from temp path to final user path, then advances to `budgetQuestion`
- Agent A: MagicLinkPending is only shown during the payment flow (between upsell CTA and Stripe checkout), not after email capture

### 6. PDF Generation: @react-pdf/renderer

NOT Puppeteer (130MB binary exceeds Vercel's 50MB function size limit, cold start takes 5-8s of 10s timeout). `@react-pdf/renderer` is ~2MB, starts instantly, generates text-heavy PDFs in 1-2 seconds. Build PDF-specific React components in `api/lib/pdf-generator.js`.

### 7. Photo Processing: 1280px / 75% JPEG

Client-side resize to max 1280px on longest edge (not 1920px). JPEG quality 75% (not 85%). This halves file size with no impact on Claude vision analysis. Doubles Supabase storage runway (~500 projects vs ~250).

### 8. Photo Storage Before User Creation (Session-Based Upload)

**Problem:** The user flow is Camera → Photo → Analysis → Email Capture → User Creation. But the photo storage path uses `{user_id}/{project_id}/`, which don't exist yet at photo capture time.

**Solution:** Session-based upload with retroactive linking.

1. **On app start:** Generate a `sessionId` (UUID) client-side. Store in ProjectContext.
2. **Photo upload (before user exists):** Upload to `temp/{sessionId}/{photo_order}.jpg` in Supabase Storage. The `project-photos` bucket allows unauthenticated writes to the `temp/` prefix via service_role.
3. **Claude analysis:** Runs against the photo at the temp path. Works identically — the photo content is the same regardless of path.
4. **At email capture (user/project creation):** Agent B's `createUserAndProject()` endpoint:
   - Creates user record (gets `user_id`)
   - Creates project record (gets `project_id`)
   - Moves photos from `temp/{sessionId}/` to `{user_id}/{project_id}/` (copy + delete in Supabase Storage)
   - Creates `project_photos` records with the final `storage_path`
   - Saves AI analysis to `project_photos.ai_analysis`
   - Deletes the `temp/{sessionId}/` folder
5. **All subsequent photos** (during Phase 2 scoping) upload directly to `{user_id}/{project_id}/` since the user now exists.

**Agent responsibilities:**
- Agent A: Generate `sessionId` in ProjectContext, upload to temp path in CameraView/PhotoPreview, pass `sessionId` to `createUserAndProject()` call
- Agent B: Implement photo move logic in the `createUserAndProject()` serverless endpoint

### 9. Email Delivery: Resend

Resend API (free tier: 100 emails/day) for sending the Property Summary Report PDF. One API call in the report generation function. Requires `RESEND_API_KEY` environment variable.

## Complete Data Model

### Enum Values

```sql
-- project.status values:
'created' | 'analyzing' | 'scoping' | 'estimate_ready' | 'complete'

-- interaction.type values:
'question' | 'photo_analysis' | 'additional_photo' | 'correction' | 'estimate_request'

-- property_plans.plan_type values:
'free' | 'paid'

-- events.event_type values:
'photo_captured' | 'analysis_viewed' | 'email_submitted' | 'scoping_started' |
'estimate_generated' | 'upsell_shown' | 'upsell_clicked' | 'payment_completed' |
'upsell_declined'
```

### Migration 001: Initial Schema

```sql
-- ============================================
-- 001_initial_schema.sql
-- ============================================

-- Users (profile table — auth.users created automatically by Supabase Auth for paid users)
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  zip_code text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Projects
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  title text,
  status text NOT NULL DEFAULT 'created',
  understanding_score integer DEFAULT 0,
  understanding_dimensions jsonb DEFAULT '{
    "project_type": false,
    "scope_direction": false,
    "space_dimensions": false,
    "condition": false,
    "materials_preference": false,
    "budget_framing": false,
    "timeline": false,
    "constraints": false
  }'::jsonb,
  scope_summary text,
  cost_estimate jsonb,
  budget_approach text,
  budget_target text,
  ready_to_hire boolean,
  interaction_count integer DEFAULT 0,
  deleted_at timestamp,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Project Photos
CREATE TABLE project_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) NOT NULL,
  photo_order integer NOT NULL DEFAULT 1,
  storage_path text NOT NULL,
  ai_analysis text,
  created_at timestamp DEFAULT now()
);

-- Interactions
CREATE TABLE interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) NOT NULL,
  type text NOT NULL,
  user_input text,
  ai_response text,
  metadata jsonb DEFAULT '{}',
  created_at timestamp DEFAULT now()
);

-- Analytics Events
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  event_type text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamp DEFAULT now()
);

-- Indexes
CREATE INDEX idx_interactions_project_created ON interactions(project_id, created_at);
CREATE INDEX idx_projects_user_status ON projects(user_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_events_user_type ON events(user_id, event_type);
CREATE INDEX idx_project_photos_project ON project_photos(project_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own record" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users create own record" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own record" ON users FOR UPDATE USING (auth.uid() = id);

-- projects (all queries MUST include WHERE deleted_at IS NULL)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own projects" ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);

-- project_photos
ALTER TABLE project_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own photos" ON project_photos FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));
CREATE POLICY "Users create own photos" ON project_photos FOR INSERT
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- interactions
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own interactions" ON interactions FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));
CREATE POLICY "Users create own interactions" ON interactions FOR INSERT
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- events (users can write own events; only service_role can read all)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users create own events" ON events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users read own events" ON events FOR SELECT USING (auth.uid() = user_id);

-- Note: Analytics dashboards query via service_role key (bypasses RLS)
-- Note: Free tier users are managed server-side via service_role key.
-- RLS policies apply to authenticated (paid) users making direct client calls.
```

### Migration 002: Payment Schema

```sql
-- ============================================
-- 002_payment_schema.sql
-- ============================================

CREATE TABLE property_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) UNIQUE NOT NULL,
  plan_type text NOT NULL DEFAULT 'free',
  stripe_session_id text,
  report_storage_path text,
  report_generated_at timestamp,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- RLS
ALTER TABLE property_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own plans" ON property_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own plans" ON property_plans FOR UPDATE USING (auth.uid() = user_id);

-- Note: INSERT handled server-side via service_role key (webhook + verify-payment).
-- No client INSERT policy needed.

-- Add priority fields to projects (used by cross-project analysis)
ALTER TABLE projects ADD COLUMN priority_score integer;
ALTER TABLE projects ADD COLUMN priority_reason text;
ALTER TABLE projects ADD COLUMN bundle_group text;
ALTER TABLE projects ADD COLUMN recommended_sequence integer;
```

### Storage Buckets

| Bucket | Read | Write | Path Policy |
|---|---|---|---|
| project-photos | Public (all) | Service role (server-side) | `temp/{sessionId}/` before user creation, `{user_id}/{project_id}/` after |
| property-reports | Authenticated | Authenticated | Read/write restricted to `{user_id}/` prefix |

Photo storage path (before user exists): `temp/{sessionId}/{photo_order}.jpg`
Photo storage path (after user created): `{user_id}/{project_id}/{photo_order}.jpg`
Report storage path format: `{user_id}/{plan_id}/report.pdf`

## Locked JSON Schemas

### cost_estimate (projects.cost_estimate)

```json
{
  "line_items": [
    {
      "item": "string — work item description",
      "category": "string — e.g. cabinetry, plumbing, electrical, structural",
      "low": "number — low estimate in dollars",
      "high": "number — high estimate in dollars",
      "assumed": "boolean — true if not explicitly confirmed by user",
      "notes": "string — additional context"
    }
  ],
  "total_low": "number",
  "total_high": "number",
  "confidence": "low | medium | high",
  "unresolved_areas": ["string — dimensions that weren't fully resolved"],
  "regional_note": "string — regional pricing context based on zip code"
}
```

### cross_project_analysis (response from Prompt 6E)

```json
{
  "sequenced_projects": [
    {
      "project_id": "uuid",
      "priority_score": "integer 1-100 (higher = do first)",
      "recommended_sequence": "integer — build order",
      "reasoning": "string — one sentence: why this position"
    }
  ],
  "bundle_groups": [
    {
      "bundle_name": "string",
      "project_ids": ["uuid"],
      "estimated_savings_percent": "number — conservative % savings vs. doing separately",
      "reasoning": "string"
    }
  ],
  "quick_wins": ["uuid — projects under $2,000 that can start immediately"],
  "total_cost_range": {
    "low": "number",
    "high": "number"
  },
  "optimization_summary": "string — 1-2 sentence overview of sequencing and savings strategy"
}
```

**Validation rule:** Before writing to database, verify all `project_id` values exist and belong to the user, all `priority_score` values are 1-100, all `recommended_sequence` values are positive integers, all `bundle_group` project_ids reference valid projects, and `estimated_savings_percent` values are 0-100.

## Rolling Context Strategy

For Phase 2 scoping API calls, do NOT send the full interaction history. Manage context server-side via `api/lib/context-manager.js`:

**Always include:**
- All photo analyses (full `ai_analysis` from `project_photos`)
- Last 3 interactions (full `user_input` + `ai_response`)
- Current `understanding_dimensions` object from project record
- `budget_approach` + `budget_target`

**Summarize older interactions:** Condense interactions 4+ into compact text. Programmatic summarization (not AI-generated):

`"[Q: user's question/input] → [A: key decision/info learned]"`

One line per interaction, ~20-30 tokens each.

**Hard cap:** ~4,000 tokens total for injected context per request.

## Rate Limiting

Per-IP rate limiting on `/api/analyze` and `/api/scope`:

| User Type | Limit |
|---|---|
| Unauthenticated | 5 requests per hour |
| Authenticated | 15 requests per hour |

Return HTTP 429 with message: "You've reached the limit for now. Try again in a few minutes."

Use in-memory store with TTL (`Map<ip, { count, resetAt }>`). State resets on cold start — acceptable for MVP.

## UX Specifications

### "Not Your Project?" Correction Path

After the initial 4-bullet analysis on the Analysis screen, show a subtle text link: "Not quite what you're working on? [Tell me more]". If tapped:

1. Reveal text input field
2. User types correction
3. Send to `/api/analyze` with `type: 'correction'`, original photo `storage_path`, and user's correction text
4. Re-render analysis with corrected response
5. Update `projects.title`

### Understanding Score Escape Hatch

After 8+ interactions, if understanding score is between 60-80%:

System offers: "I have a solid picture — enough for a good estimate with some wider ranges on [list unresolved dimensions]. Want me to build your scope and estimate now, or keep refining?"

Two buttons: "Build My Estimate" / "Keep Refining"

"Build My Estimate" triggers estimate generation regardless of score threshold.

### Understanding Meter Display

Below the meter, persistent hint text: "Still need to understand: [value of `next_unresolved` from tool_use response]"

Contextual labels:
- 0-25%: "Just getting started"
- 25-50%: "Building the picture"
- 50-75%: "Getting a clear picture"
- 75-90%: "Almost there"
- 90-100%: "Ready to build your scope and cost estimate"

### "How Many Projects?" (Upsell Screen)

On the upsell screen, before showing the price, ask: "How many projects are on your list?"

Capture the number regardless of conversion (store in `events` with `event_type` `upsell_shown` and `metadata { project_count: N }`).

If user enters a number, calculate and show: "N projects × individual estimates = $[N×75]-$[N×150] in consultant time. Your whole-house plan: $19.99."

This makes the value anchor personal, not generic.

### Free User Project Limit

On "Add New Project" action, check `property_plans.plan_type`:
- If no record exists OR `plan_type = 'free'`: check project count
  - If ≥ 1 project exists (with `deleted_at IS NULL`): redirect to upsell screen
- If `plan_type = 'paid'`: allow unlimited projects

### "Maybe Later" Flow

After declining upsell: show the ScopeEstimate screen for their completed project with a dismissible banner: "Your project scope is saved. Upgrade anytime for unlimited projects and a full property report."

Fire analytics event: `upsell_declined`

### Magic Link Email Failure Path (Payment Flow Only)

On the MagicLinkPending screen (shown only during payment flow, NOT after email capture):
- Show "Resend link" button after 30 seconds
- Show "Try a different email" option
- After 2 resend attempts, show: "Having trouble? Email support@builditusa.com"

### Streaming Failure Recovery

On streaming failure (connection dropped mid-response):
- Frontend shows: "Connection interrupted. [Retry]" button
- Retry sends the same request to the server
- Server does not cache partial responses for MVP

### Cross-Project Analysis Trigger

Runs when the ProjectDashboard loads AND 2+ projects have status `estimate_ready`.

If only 1 project exists, skip analysis — show single-project dashboard.

"Generate My Property Report" button visible when 1+ projects are at `estimate_ready` and user has `plan_type: 'paid'`.

### Single-Project Report

Report still generates with 1 project. Cross-project analysis sections (Priority Roadmap, Smart Savings, Bundle Groups) are replaced with: "Add more projects to unlock priority sequencing and savings recommendations."

### Two-Layer Payment Verification

1. **Primary:** Stripe webhook → creates `property_plans` record
2. **Fallback:** PaymentSuccess page calls `/api/verify-payment` which checks Stripe API directly. If session is paid but no `property_plans` record exists, creates it.

`/api/verify-payment` MUST validate that the requesting user's `auth.uid()` matches the `user_id` in the Stripe session metadata.

### A/B Price Testing

Create 2 Stripe price IDs:
- `STRIPE_PRICE_ID_STANDARD` ($19.99)
- `STRIPE_PRICE_ID_PREMIUM` ($29.99)

Environment variable `PRICE_TIER=standard|premium` selects which to use. Default: `standard`.

### iOS Safari Camera Fast Path

Detect iOS Safari via user agent. If detected, skip `getUserMedia` entirely and use `<input type="file" accept="image/*" capture="environment">` directly. This reliably opens the camera on iOS.

```javascript
export const isIOSSafari = () => {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isWebKit = /WebKit/.test(ua);
  const isChrome = /CriOS/.test(ua);
  return isIOS && isWebKit && !isChrome;
};
```

### Camera Permission Denied

If `getUserMedia` is denied or unavailable, show:

Message: "Camera access is needed to photograph your project."

Two options: [Allow Camera Access] (re-prompts browser permission) and [Upload a Photo Instead] (triggers file input fallback).

If file input fallback is also unavailable (rare), show: "This browser doesn't support camera access. Try opening BuildIt USA in Chrome or Safari."

### Session Persistence / App Resume

On app load, check for an existing Supabase auth session via `getSession()`. If authenticated (paid user returning), query the user's projects (`WHERE deleted_at IS NULL, ORDER BY updated_at DESC`).

Resume logic based on most recent project status:
- No projects → splash screen
- `created` or `analyzing` → camera/analysis screen
- `scoping` → scoping session (resume Q&A)
- `estimate_ready` → scope estimate screen
- Paid user with 2+ projects → project dashboard

For free tier users (no auth session): check `localStorage` for the stored `user_id`. If found, query projects server-side and resume accordingly. If not found, show splash screen.

ProjectContext should initialize from this query on app load rather than starting empty. Agent A implements this in the `useEffect` of `ProjectContext.jsx`.

## Prompt Templates

All prompts below are final — modifications from the QA review have been applied. Agents should use these as-is in `api/lib/prompts.js`.

### Prompt 6A: Initial Photo Analysis (Phase 1 — The Hook)

```
You are BuildIt USA's project analyst. A homeowner just photographed
a project. Give a sharp, specific first read in EXACTLY 4 lines.

1. PROJECT: Name the specific project. Reference one visible detail
   that proves you're looking at their photo. One sentence.
2. BIG DECISION: One choice they'll face — frame as a short question.
3. CONFIRM INTENT: "Are you looking to [A] or [B]?"
4. IF/THEN: "If [best guess], then [what that means for them]."

End with exactly:
"A few more details and I can build you a scope and cost estimate."

RULES:
- Each line: ONE sentence max.
- Knowledgeable friend tone. No jargon. No filler. No hedging.
- If the photo is unclear, say so and ask for a better angle.
- Never fabricate details not in the photo.
- If the photo does not appear to show a home improvement project
  (e.g., a pet, landscape, selfie, or unrelated object), respond:
  "I'm not sure I can see a home project here. Try photographing
  the area you want to work on — kitchens, bathrooms, walls, floors,
  roofing, or outdoor spaces all work great." Do NOT generate the
  4-bullet format for non-project photos.
```

### Prompt 6B: Phase 2 — Scoping Q&A (System Prompt)

```
You are BuildIt USA's project analyst continuing a scoping session
with a homeowner. You've already done an initial analysis and now
you're building out the full scope and cost estimate.

You MUST call the update_understanding tool after every response to
report your updated assessment. This is not optional.

CONTEXT (injected per request):
- Project type: {project_title}
- Budget approach: {budget_approach} (target_budget | dream_version)
- Budget target: {budget_target} (if applicable)
- Understanding score: {understanding_score}%
- Dimensions resolved: {dimensions_resolved}
- Interaction history: {interaction_log}

YOUR JOB:
1. Ask ONE question at a time targeting an unresolved dimension.
2. If the user provides a photo, analyze it for new information and
   state specifically what you learned from it.
3. After processing their input, call the update_understanding tool
   with your updated assessment, then provide your visible response.

COST IMPACT FLAGS:
When a user's answer or decision carries significant cost impact:
- Flag it inline in your response
- State which direction costs more/less and roughly by how much
  (relative terms: "largest cost swing," "can save 30-50%")
- Show the optimization angle — what's the cheaper path and
  what's the tradeoff
- Never give dollar amounts during scoping — relative only
- Only flag when genuinely high-impact, not every question

BUDGET-AWARE BEHAVIOR:
- If budget_approach = "target_budget": work backward from their
  number. Prioritize decisions that keep scope within budget.
  Flag when a choice would push over.
- If budget_approach = "dream_version": build the full scope,
  then show where costs concentrate so they can make tradeoffs.

RULES:
- ONE question per response. Never stack questions.
- Knowledgeable friend tone. No jargon without context.
- Keep responses to 1-3 sentences plus your question.
- If a photo is provided, reference specific visible details.
- Never fabricate details.
```

### Prompt 6C: Additional Photo Analysis (During Phase 2)

```
You are analyzing an additional photo for an ongoing project scope.

You MUST call the update_understanding tool after every response to
report your updated assessment. This is not optional.

CONTEXT:
- Project: {project_title}
- Current understanding: {understanding_score}%
- What we know so far: {resolved_dimensions_summary}
- What we still need: {unresolved_dimensions}

Analyze this photo and state:
1. What NEW information this photo provides (be specific about
   visible details)
2. How this changes or confirms the scope
3. One follow-up question based on what you now see

Then call the update_understanding tool with your updated score
and dimensions.

RULES:
- Only credit information genuinely visible in this photo.
- If the photo doesn't add much, say so honestly and suggest
  what angle/area would help more.
- If you see something concerning (structural damage, code
  violations, safety issues), flag it clearly.
```

### Prompt 6D: Scope + Cost Estimate Generation

```
You are generating the final scope and cost estimate for a
BuildIt USA project.

Generate your response in two parts:
1. Your narrative scope document as your text response — this is
   what the homeowner sees.
2. Call the generate_estimate tool with the structured cost estimate
   JSON conforming to the schema below. Both are required.

CONTEXT:
- Project: {project_title}
- Budget approach: {budget_approach}
- Budget target: {budget_target} (if applicable)
- Full interaction history: {interaction_log}
- All photo analyses: {photo_analyses}
- Understanding score: {understanding_score}%
- Resolved dimensions: {dimensions_resolved}
- User zip code: {zip_code}

NARRATIVE SCOPE DOCUMENT (your text response):
Generate a comprehensive scope document with:

1. PROJECT SUMMARY (2-3 sentences)

2. SCOPE OF WORK
   - List each major work item
   - Note materials/finishes as discussed
   - Flag any items that were assumed (not explicitly confirmed)

3. COST ESTIMATE OVERVIEW
   - Summarize the cost range and key drivers
   - If budget_approach = target_budget: flag items at risk of
     going over and suggest alternatives
   - If budget_approach = dream_version: show where money
     concentrates and identify tradeoff opportunities

4. WHAT'S NOT INCLUDED
   - Common items homeowners forget that are related to this scope
   - Permits, if applicable
   - Potential hidden costs (e.g., "if we open the wall and find...")

5. RECOMMENDED NEXT STEPS
   - What a contractor would need to provide a firm bid
   - Any inspections or assessments recommended first

STRUCTURED COST ESTIMATE (via generate_estimate tool call):
You MUST call the generate_estimate tool with a JSON object
conforming exactly to this schema. Do not add or omit fields.

{
  "line_items": [
    {
      "item": "string — work item description",
      "category": "string — e.g. cabinetry, plumbing, electrical",
      "low": number,
      "high": number,
      "assumed": boolean,
      "notes": "string — additional context"
    }
  ],
  "total_low": number,
  "total_high": number,
  "confidence": "low" | "medium" | "high",
  "unresolved_areas": ["string — dimensions not fully resolved"],
  "regional_note": "string — regional pricing context"
}

RULES:
- Cost ranges should be realistic. Adjust directionally based on
  the user's zip code (coastal metros run higher, rural areas lower).
  Note your regional adjustment in the regional_note field.
- Your cost estimates are directional, not quotes. Ranges should be
  wide enough to be honest (±25-40% for most items).
- Use plain language. No contractor jargon without explanation.
- Flag assumptions clearly — label them as "ASSUMED" inline.
- Be honest about confidence level. If understanding was <80%,
  note which areas have wider cost uncertainty.
```

### Prompt 6E: Cross-Project Analysis (Paid Tier)

```
You are analyzing a homeowner's complete set of scoped projects to
generate priority sequencing and cross-project optimization.

CONTEXT:
- User zip code: {zip_code}
- Number of projects: {project_count}
- Projects (each includes project_id, title, scope_summary,
  cost_estimate, understanding_score): {all_projects}

GENERATE:

1. PRIORITY SEQUENCING
   For each project, assign:
   - priority_score (1-100, higher = do first)
   - recommended_sequence (integer order)
   - reasoning (one sentence: why this order)

   Priority factors (in order of weight):
   - Safety/structural urgency (highest)
   - Dependency chains (e.g., electrical before kitchen finish)
   - Seasonal timing advantage
   - Cost efficiency of sequencing
   - Homeowner's stated timeline preferences

2. BUNDLE GROUPS
   Identify projects that should be done together:
   - Shared contractor trades (same plumber, same electrician)
   - Overlapping permits
   - Shared mobilization costs
   - Material bulk ordering opportunities

   For each bundle, estimate % savings vs. doing separately.

3. QUICK WINS
   Flag any projects under $2,000 estimated cost that could be
   started immediately with minimal contractor coordination.

RESPONSE FORMAT:
Return as JSON conforming exactly to this schema. Use actual
project_id values from the provided project data.

{
  "sequenced_projects": [
    {
      "project_id": "uuid",
      "priority_score": 85,
      "recommended_sequence": 1,
      "reasoning": "Roof leak is structural — delays increase damage cost"
    }
  ],
  "bundle_groups": [
    {
      "bundle_name": "Plumbing bundle",
      "project_ids": ["uuid1", "uuid2"],
      "estimated_savings_percent": 15,
      "reasoning": "Same plumber, one mobilization, shared permit"
    }
  ],
  "quick_wins": ["uuid3"],
  "total_cost_range": { "low": 45000, "high": 62000 },
  "optimization_summary": "Doing the roof and gutters together saves ~$1,200 in mobilization..."
}

RULES:
- Be specific about WHY the sequence matters, not just what it is.
- Savings estimates should be conservative and realistic.
- Regionally adjust based on zip code.
- If understanding_score < 70% on any project, flag it as
  "needs more detail before firm sequencing."
- All project_id values must match actual IDs from the input data.
```

### Prompt 6F: Property Summary Report Generation

```
You are generating a comprehensive Property Summary Report for a
BuildIt USA Whole-House Plan customer. This is a premium deliverable
— it should read like a professional consultant's report, not a
chat response.

CONTEXT:
- User email: {email}
- User zip code: {zip_code}
- Plan type: paid
- Number of projects: {project_count}
- All projects with full scope + cost data: {all_projects}
- Cross-project analysis: {cross_project_analysis}
- Bundle groups: {bundle_groups}

GENERATE THE FOLLOWING SECTIONS:

1. PROPERTY IMPROVEMENT OVERVIEW
   - 2-3 sentence executive summary of the full property plan
   - Total number of projects identified
   - Total investment range (low-high across all projects)
   - Overall property improvement theme (if one exists, e.g.,
     "modernizing a 1990s colonial" or "addressing deferred
     maintenance + one major upgrade")

2. PROJECT PRIORITY ROADMAP
   For each project in recommended sequence order:
   - Project title
   - Scope summary (3-4 sentences)
   - Cost estimate range
   - Understanding confidence score
   - Why it's in this position (one sentence)
   - Seasonal timing recommendation if applicable
   - Items flagged as ASSUMED

3. SMART SAVINGS OPPORTUNITIES
   - Bundle groups with estimated savings
   - Cross-project material ordering opportunities
   - Shared permit opportunities
   - Contractor trade overlap (one contractor covers multiple projects)
   - Total estimated savings from optimization

4. QUICK WINS
   - Projects under $2,000 that can start immediately
   - Weekend DIY candidates (if any scope items are DIY-appropriate)
   - High-impact / low-cost improvements

5. INVESTMENT SUMMARY TABLE
   - Each project: title, cost range, priority, sequence number
   - Subtotals by bundle group
   - Grand total range
   - Potential savings from bundling
   - Net estimated range after optimization

6. WHAT A CONTRACTOR NEEDS FROM YOU
   - Per-project: what additional information or access is needed
     for a contractor to provide a firm bid
   - Recommended inspections before starting
   - Permits likely required (by project)

7. NEXT STEPS
   - Recommended first action
   - Suggested timeline for getting contractor bids
   - What to look for in a contractor for these project types

FORMATTING RULES:
- Professional but approachable tone — same knowledgeable friend voice
- Use clear section headers
- Cost figures in dollars (ranges)
- Flag all assumptions as "ESTIMATED" or "ASSUMED"
- Include confidence notes where understanding < 80%
- This will be converted to PDF — structure for clean page breaks
  between major sections
- No markdown code blocks — use plain structured text
```

## Agent Team Structure

Start with 2 agents + 1 lead (Opus, non-coding coordinator).

| Agent | Scope |
|---|---|
| Lead | Coordinates, reviews, validates checkpoints. Does not write code. |
| Agent A (Full-Stack Features) | Scaffolding, UI components, camera, streaming display, context provider, dashboard, report display |
| Agent B (AI + Payments + Integration) | Supabase setup, Claude API integration, prompts, Stripe, Supabase wiring, report generation, email delivery |

Reassess at each checkpoint (see `docs/checkpoints.md`). The lead evaluates whether to add a 3rd agent.

Token budget: $200. Lead checks cumulative spend at every checkpoint against these pacing targets:

| Checkpoint | Cumulative Target | Hard Ceiling (trigger simplification) |
|---|---|---|
| CP1 (after Step 8) | $50–70 | $85 |
| CP2 (after Step 12) | $90–120 | $140 |
| CP3 (after Step 16) | $150–180 | $190 |
| Launch (after Step 17) | ≤$200 | $200 |

If significantly over pace at any checkpoint, the lead must recommend one or more of: switching Agent A to Sonnet for remaining steps, simplifying remaining UI work, or deferring low-priority polish items.

### Agent Execution Protocol

<!-- AMENDMENT 1: Inserted per claude-md-amendments-v2 -->

1. **Plan-before-execute:** Before beginning each build step, state your implementation plan (key files to create/modify, approach, dependencies you're consuming) and wait for explicit approval. Do not write code until the plan is approved.

2. **Checkpoint summaries:** At each checkpoint (CP1, CP2, CP3), the lead must produce a written summary containing:
   - What was built (list of files created/modified per agent)
   - What was skipped or deferred (and why)
   - Assumptions made that were not explicitly covered by this spec
   - Any deviations from the file structure or locked schemas (with justification)
   - Cumulative token spend vs. $200 budget and checkpoint pacing target

3. **Ambiguity protocol:** If you encounter a requirement that is ambiguous, contradictory, or not addressed in this document, STOP and ask. Do not assume. State:
   - What you found ambiguous
   - What options you see
   - Which you'd recommend and why

4. **No silent dependency installs:** Before running `npm install <package>`, state the package name, why it's needed, and confirm it's not covered by an existing dependency or prohibited by a locked decision. Wait for approval.

### Intelligence Allocation

The lead assigns agent models per step to optimize cost vs. quality. Default allocation:

| Role | Default Model | Override Steps | Rationale |
|---|---|---|---|
| Lead | Opus (always) | None — never downgrade | Judgment, coordination, checkpoint evaluation |
| Agent A | Sonnet | **Opus for Steps 7, 8, 13** | UI work is well-specified; Opus needed for streaming/tool_use parsing (7), cross-agent auth coordination (8), and upsell + magic link state management (13) |
| Agent B | Opus | **Sonnet for Step 2** | API integration, payment, and analysis work requires high fidelity; Step 2 is copy-from-spec with exact SQL provided |

**CP1 cost overrun rule:** If cumulative spend exceeds $85 at CP1, switch Agent A to Sonnet for all remaining steps (including 7, 8, 13) and accept additional iteration cycles over model upgrades.

## Coordination Rules

1. Agent B must complete Supabase schema (Step 2) before Agent A starts storage integration (Step 5)
2. Agent B must complete Claude API client (Step 6) before Agent A starts streaming display (Step 7)
3. Phase 1 checkpoint must pass before Phase 2 work begins
4. Both agents build error handling and loading states into each component as they go — not deferred to Step 17
5. Agent A builds all UI components. Agent B provides backend logic via `src/lib/` files that Agent A's components call.
6. Before beginning any build step, the assigned agent must state their implementation plan in the team chat. The lead will relay to Jacob for approval. Do not write code until approved.
7. Neither agent may run `npm install` without stating the package and receiving approval. This prevents introduction of prohibited dependencies (React Router, external state management, Puppeteer, etc.).
8. If an agent encounters a situation not covered by this document, they must stop and surface it to the lead rather than making assumptions. The lead will escalate to Jacob.

<!-- Rules 6-8 added per AMENDMENT 2 from claude-md-amendments-v2 -->

## File Ownership Boundaries

**Agent A owns:** `src/components/`, `src/hooks/`, `src/context/`, `src/lib/camera.js`, `src/lib/analytics.js`, `src/App.jsx`, `src/main.jsx`, `src/index.css`

**Agent B owns:** `api/` (all serverless functions and lib/), `supabase/`, `src/lib/supabase.js`, `src/lib/api.js`, `src/lib/stripe.js`

**Shared (both read, primary owner noted):** `src/lib/supabase.js` (Agent B creates, Agent A reads for auth calls in payment flow)

**Ownership enforcement:** If an agent needs to modify a file owned by the other agent, they must request the change through the lead via team messaging. The owning agent makes the modification. Direct cross-ownership edits are prohibited.

<!-- Ownership enforcement added per AMENDMENT 3 from claude-md-amendments-v2 -->

## Build Sequence

| Step | Description | Agent | Depends On |
|---|---|---|---|
| 1 | Project scaffolding (Vite + React + Tailwind + Vercel config) | A | Nothing |
| 2 | Supabase setup (all tables, RLS, storage, auth config) | B | Nothing |
| 3 | Splash screen + state-based routing + ProjectContext | A | Step 1 |
| 4 | Camera integration (browser API + iOS fast path + fallback) | A | Step 1 |
| 5 | Photo upload to Supabase Storage | A | Step 2 |
| 6 | Claude API integration (streaming + tool_use + prompts) | B | Step 2 |
| 7 | Streaming text display + tool_use parsing | A | Step 6 |
| 8 | Email capture + user/project creation (Option B: no magic link) | A (UI) + B (server logic) | Steps 2, 6 |
| **CP1** | **Phase 1 Checkpoint** | **Lead** | |
| 9 | Understanding meter component | A | Step 7 |
| 10 | Phase 2 scoping (budget Q + Q&A + additional photos + rolling context) | B | CP1 |
| 11 | Cost impact flags (parsed from tool_use) | A | Step 9 |
| 12 | Scope + cost estimate generation (locked schema + generate_estimate tool) | B | Step 10 |
| **CP2** | **Checkpoint 2 — core product loop complete** | **Lead** | |
| 13 | Upsell screen + plan gating + magic link auth for payment | A (UI) + B (logic) | CP2 |
| 14 | Stripe payment (checkout + webhook + verify-payment + A/B) | B | Step 13 |
| 15 | Project dashboard (paid tier) | A | Step 14 |
| 16 | Cross-project analysis + Property Summary Report (PDF + email) | B | Steps 14, 15 |
| **CP3** | **Checkpoint 3 — full MVP functional** | **Lead** | |
| 17 | Polish (each agent: their own components/endpoints) | Both | CP3 |

### Observer Checkpoints (Human Review Gates)

<!-- AMENDMENT 4: Inserted per claude-md-amendments-v2, with truncated table completed from Observer Protocol -->

The following points require explicit human approval before proceeding:

| Gate | Trigger | What Jacob Reviews |
|---|---|---|
| Pre-Flight | Before Step 1 | All env vars set, Supabase + Vercel projects created, Resend domain verified |
| CP1 | After Step 8 | Phase 1 completeness, no prohibited patterns, Option B auth correct, both tools present, SSE event types correct |
| CP2 | After Step 12 | Core product loop, rolling context with ~4,000 token cap, both tool schemas (update_understanding + generate_estimate), understanding meter with contextual labels |
| Stripe Ready | Before Step 14 | Stripe test account created, price IDs + webhook secret set in .env.local |
| CP3 | After Step 16 | Full MVP flow end-to-end, PDF generation via @react-pdf/renderer, email delivery via Resend, cross-project analysis writes all 4 columns |
| Launch Ready | After Step 17 | Polish complete, manual QA pass, budget check against $200 ceiling |

At each gate, the lead produces a checkpoint summary (see Agent Execution Protocol above). Work on subsequent steps does not begin until Jacob approves.

## Manual Steps Required (Jacob)

These cannot be done by agents. Complete before or during the build as noted:

| When | Action | Output |
|---|---|---|
| Before build | Confirm auth approach — **CONFIRMED: Option B** | Decision for agents |
| Before build | Insert Prompts 6A-6F into the Prompt Templates section above | Completed CLAUDE.md |
| Before build | Set token budget ceiling — **CONFIRMED: $200** | Budget number |
| Before build | Create Supabase project + get URL, anon key, service role key | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| Before build | Create Vercel project + link Git repo + configure env vars in dashboard | Deployment URL for testing |
| Before build | Create Resend account + verify domain (START EARLY — DNS propagation takes 24-48 hours) | `RESEND_API_KEY` |
| Before build | Configure support email forwarding (or use Resend-verified domain address as support contact) | Working support email address |
| Before Step 14 | Create Stripe test mode account + product + prices | `STRIPE_PRICE_ID_STANDARD`, `STRIPE_PRICE_ID_PREMIUM` |
| During Step 14 | Register webhook endpoint in Stripe dashboard | `STRIPE_WEBHOOK_SECRET` |

## Environment Variables

```bash
# .env.local (never committed to git)
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...    # server-side only
STRIPE_SECRET_KEY=sk_test_...             # server-side only
STRIPE_PUBLISHABLE_KEY=pk_test_...        # safe for frontend
STRIPE_WEBHOOK_SECRET=whsec_...           # server-side only
STRIPE_PRICE_ID_STANDARD=price_...        # $19.99
STRIPE_PRICE_ID_PREMIUM=price_...         # $29.99
PRICE_TIER=standard                       # standard | premium
RESEND_API_KEY=re_...                     # server-side only
NEXT_PUBLIC_APP_URL=https://builditusa.com
```

## File Structure

```
buildit-usa/
├── CLAUDE.md                    # THIS FILE — single source of truth
├── package.json
├── vite.config.js
├── vercel.json
├── .env.local
├── public/
│   └── logo.svg
├── docs/
│   ├── checkpoints.md           # Lead reads — checkpoint criteria
│   ├── agent-a.md               # Agent A build instructions
│   ├── agent-b.md               # Agent B build instructions
│   └── archive/                 # Historical — DO NOT load during build
│       ├── original-spec-v2.md
│       ├── 10x-review.md
│       └── spec-amendments.md
│   ├── design/                  # Visual spec — Agent A MUST read before UI work
│   │   ├── buildit-design-handoff.md   # Complete design system + decisions
│   │   └── buildit-design-v5.html      # Visual reference (open in browser)
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── context/
│   │   └── ProjectContext.jsx
│   ├── components/
│   │   ├── SplashScreen.jsx
│   │   ├── CameraView.jsx
│   │   ├── PhotoPreview.jsx
│   │   ├── AIAnalysis.jsx           # Includes "Not Your Project?" link
│   │   ├── EmailCapture.jsx         # Captures email + zip, creates user/project (no auth)
│   │   ├── MagicLinkPending.jsx     # Payment flow only — "Check your email" + resend
│   │   ├── BudgetQuestion.jsx
│   │   ├── ScopingSession.jsx
│   │   ├── UnderstandingMeter.jsx
│   │   ├── CostFlag.jsx
│   │   ├── ScopeEstimate.jsx
│   │   ├── UpsellScreen.jsx         # "How many projects?" + magic link trigger for payment
│   │   ├── PaymentSuccess.jsx       # Calls /api/verify-payment
│   │   ├── ProjectDashboard.jsx
│   │   ├── PropertyReport.jsx
│   │   └── StreamingText.jsx
│   ├── lib/
│   │   ├── supabase.js              # Agent B creates, used in payment flow
│   │   ├── api.js                   # Frontend API call helpers
│   │   ├── camera.js                # iOS Safari fast path
│   │   ├── stripe.js                # Stripe redirect helpers
│   │   └── analytics.js             # trackEvent() → writes to events table via Supabase client
│   └── hooks/
│       ├── useCamera.js             # iOS detection + fallback
│       ├── useStreaming.js          # SSE + 50ms token batching + error event handling
│       ├── useProject.js
│       └── usePlan.js
├── api/
│   ├── analyze.js                   # Consolidated: initial + additional + correction
│   ├── scope.js                     # Consolidated: Q&A + estimate generation
│   ├── checkout.js                  # Stripe Checkout session
│   ├── webhook.js                   # Stripe webhook + report trigger
│   ├── verify-payment.js            # Fallback payment verification
│   └── lib/
│       ├── claude.js                # Claude API client (streaming + tool_use + retry)
│       ├── prompts.js               # All prompt templates
│       ├── context-manager.js       # Rolling context strategy
│       ├── supabase-admin.js        # Service role client
│       ├── stripe.js
│       ├── rate-limiter.js          # Per-IP rate limiting
│       ├── pdf-generator.js         # @react-pdf/renderer
│       ├── email.js                 # Resend integration
│       └── validators.js            # JSON schema validation
└── supabase/
    └── migrations/
        ├── 001_initial_schema.sql
        └── 002_payment_schema.sql
```

## Design Guidelines

**A complete design system exists. Agent A MUST read `docs/design/buildit-design-handoff.md` before building any UI component.** Open `docs/design/buildit-design-v5.html` in a browser for the visual reference.

### Locked Visual Constraints (do NOT deviate)
- **ALL screens dark themed** — `--iron` (#2A2320) backgrounds, `--parchment` (#F0E8DA) text. No white/light background screens.
- **Colonial carpentry + Tesla minimalism** — warm workshop textures balanced with whitespace and restraint
- **Three-tier typography:**
  - Architects Daughter — headings, nav brand, button labels, section titles
  - Libre Baskerville — body text, descriptions, meta text
  - Caveat (bold) — ALL dollar amounts, statistics, annotations, beaver personality lines
- **Never use** Inter, Roboto, Arial, system-ui, or monospace fonts for visible text
- **Primary action color:** iron/charcoal (NOT blue, NOT red) — red and blue are accent only
- **No tile grids** — fluid asymmetric layouts (1.3fr / 0.7fr), photo-forward
- **Beaver mascot** — pencil sketch style, appears in empty states, loading, errors, onboarding
- **Tap targets:** minimum 44x44px on mobile
- **No unnecessary chrome** — every element earns its space

### Tone
Knowledgeable friend. Not salesperson, not contractor. Beaver personality language: "our beaver's on it", "beaver will get right on it."

### Google Fonts
```
https://fonts.googleapis.com/css2?family=Architects+Daughter&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Caveat:wght@400;500;600;700&family=DM+Sans:wght@400;500;600&display=swap
```

See `docs/design/buildit-design-handoff.md` for full color palette CSS custom properties, texture implementations, component patterns, and anti-patterns.

## Soft Delete Rule

All queries reading from `projects` table MUST include `WHERE deleted_at IS NULL`. Never hard delete project records. Use `UPDATE projects SET deleted_at = now()` instead.
