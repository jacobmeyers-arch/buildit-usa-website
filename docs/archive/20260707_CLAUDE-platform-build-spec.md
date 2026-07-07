# Build It USA — Build Spec

Read this file completely before writing any code. This is the technical source of truth for the codebase.

**Business strategy, product decisions, and pricing are governed by:**
`/mnt/chromeos/MyFiles/ClaudeCode/AI Projects/Build It USA/SOURCE_OF_TRUTH.md`

When this file conflicts with SOURCE_OF_TRUTH.md on business logic, pricing, or product decisions, SOURCE_OF_TRUTH.md wins. This file governs technical implementation only.

**Project directory:** `~/buildit-usa/` (`/home/jacobmeyers/buildit-usa/`). Must be in Linux home dir, NOT under `/mnt/chromeos/` — ChromeOS shared filesystem does not support symlinks, which npm requires for `node_modules/.bin/`.

---

## Project Overview

Build It USA is a **contractor network with AI-powered estimation.** Two-sided platform:

- **Homeowners** photograph projects, receive AI-generated cost estimates, build a prioritized renovation plan, and release estimates to matched contractors.
- **Contractors** receive pre-qualified leads (released estimates), manage closes, and pay 3% via auto-charge.

**User-facing language rule:** No UI text references AI, Claude, machine learning, or similar terms. The technology is invisible. Customer-facing: "Estimating software built by Jacob Meyers."

### Homeowner Product

| Tier | Price | What They Get |
|---|---|---|
| Free | $0 (3 estimates per account) | Individual project estimates. Private by default (estimate bank). Can release to contractor network. |
| Whole Home Planner | $100/house | Unlimited estimates + prioritization engine + budget optimizer + wish list + produced Whole Home Report. |
| Consulting | $200/hr | On-site with Jacob. Not a platform feature — booked externally. |

**1 account = 1 email + 1 property address.** Auth required before first estimate.

### Contractor Product

| Feature | Cost |
|---|---|
| AI estimation tool | Free |
| Receive released estimates (leads) | Free |
| Referral income (pass leads, earn 1%) | Free |
| Fee on closed contracts | 3% auto-charged via Stripe Connect |

Auth required at onboarding. Stripe Connect pre-authorization required.

### Core Mechanics

**Estimate Bank:** All estimates are private by default. Homeowner chooses which to release to the contractor network. Contractor matching triggers on RELEASE, not on creation.

**Dual-Party Close Confirmation:** Both homeowner AND contractor must confirm a close. Fee auto-charges via Stripe Connect when both confirm.

**Estimate Lifecycle:**
```
draft → complete → released → matched → closed
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Tailwind CSS |
| Hosting | Vercel (static + serverless functions) |
| Backend | Vercel Serverless Functions (Node.js) |
| Database | Supabase (Postgres + Auth + Storage) |
| AI | Anthropic Claude API (Vision + Text, streaming) |
| Payments (homeowner) | Stripe Checkout ($100 Whole Home Planner) |
| Payments (contractor) | Stripe Connect (auto-charge on close confirmation) |
| Auth | Supabase Auth (both sides — homeowner + contractor) |
| PDF | @react-pdf/renderer (NOT Puppeteer) |
| Email | Resend (report delivery, notifications) |

---

## Critical Architectural Decisions

These are locked. Do not deviate without explicit instruction.

### 1. Routing: State-Based (No React Router)

Use a single AppState enum managed in React Context. No React Router dependency. Add `window.history.pushState()` on each screen transition and listen for `popstate` events for browser back button support.

**Homeowner states:**
```
splash | signUp | camera | preview | analyzing | analysis |
budgetQuestion | scoping | estimate | estimateBank |
wholePlanUpsell | wholePlanPayment | wholePlanDashboard |
releaseEstimate | matchStatus | closeConfirm
```

**Contractor states:**
```
contractorSignUp | contractorOnboarding | stripeConnect |
contractorDashboard | availableEstimates | closeConfirm |
referralDashboard | feeHistory
```

### 2. State Management: AppContext Provider

`src/context/AppContext.jsx` — React Context provider wrapping the app:

- `currentUser` (id, email, user_type: 'homeowner' | 'contractor', property_address)
- `activeEstimate` (current estimate being worked on)
- `estimateBank` (array of all user estimates with status)
- `appScreen` (current AppState value)
- `photos` (array of photo records for active estimate)
- State updater functions

No external state management libraries.

### 3. Authentication: Supabase Auth (Both Sides)

**Auth is required for ALL users before any platform interaction.**

**Homeowner flow:**
1. User enters email + property address on sign-up screen
2. Supabase Auth creates account (magic link or email/password — TBD during build)
3. User record created in `users` table with `user_type: 'homeowner'`
4. Property record created in `properties` table linked to user
5. User proceeds to camera/estimate flow

**Contractor flow:**
1. Contractor lands on `/training` page
2. Enters business info + email
3. Supabase Auth creates account
4. User record created with `user_type: 'contractor'`
5. Contractor record created in `contractors` table
6. Insurance upload + Stripe Connect onboarding
7. Contractor Network Agreement acceptance (clickthrough)
8. Dashboard access granted

**RLS enforcement:** All tables use Row Level Security. No `service_role` key on client side. Server-side endpoints validate `auth.uid()` — never trust client-supplied userId.

### 4. Claude API: tool_use for Structured Metadata

Same approach as original — Claude returns text content block (visible to user) + tool_use block (parsed for structured data).

**Understanding Update Tool** (used during scoping Q&A):

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
      "next_unresolved": { "type": "string" }
    },
    "required": ["understanding", "dimensions_resolved", "delta", "delta_reason", "next_unresolved"]
  }
}
```

**Estimate Generation Tool** (used for final estimate):

```json
{
  "name": "generate_estimate",
  "description": "Call this tool with the structured cost estimate after generating the narrative scope document.",
  "input_schema": {
    "type": "object",
    "properties": {
      "line_items": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "item": { "type": "string" },
            "category": { "type": "string" },
            "low": { "type": "number" },
            "high": { "type": "number" },
            "assumed": { "type": "boolean" },
            "notes": { "type": "string" }
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

**SSE Event Types:**
```
event: token        → {"text": "partial text chunk"}
event: metadata     → {"understanding": 62, "dimensions_resolved": {...}, ...}
event: done         → {}
event: error        → {"message": "string", "retryable": boolean}
```

### 5. Stripe Connect for Contractor Fees

Contractors must complete Stripe Connect onboarding during account setup. This pre-authorizes the platform to charge fees.

**Onboarding flow:**
1. Contractor creates account → redirected to Stripe Connect Express onboarding
2. Stripe creates a Connected Account
3. `contractors.stripe_connect_id` stores the account ID
4. Platform can now create charges against this account

**Fee collection flow:**
1. Both homeowner and contractor confirm close (dual-party)
2. Server calculates fee: 3% of direct costs (from estimate `total_low`/`total_high` midpoint, or contractor-reported contract value)
3. Stripe creates a charge on the contractor's Connected Account
4. Fee recorded in `closes` table with `stripe_charge_id`

**Stripe Connect endpoints needed:**
- `POST /api/stripe-connect/onboard` — creates Connected Account, returns onboarding URL
- `GET /api/stripe-connect/status` — checks if onboarding is complete
- `POST /api/stripe-connect/charge` — charges fee on confirmed close

### 6. PDF Generation: @react-pdf/renderer

NOT Puppeteer (130MB binary exceeds Vercel's 50MB limit). `@react-pdf/renderer` is ~2MB, generates text-heavy PDFs in 1-2 seconds.

### 7. Photo Processing: 1280px / 75% JPEG

Client-side resize to max 1280px on longest edge, JPEG quality 75%. Doubles storage runway.

### 8. Photo Storage: Session-Based Upload

Photos upload to `temp/{sessionId}/` before estimate record exists, then move to `{user_id}/{estimate_id}/` when estimate is created. Same approach as original — see implementation in `api/lib/` photo handling.

### 9. Email Delivery: Resend

Resend API for Whole Home Report PDF delivery and notifications (estimate released, contractor matched, close confirmation requests).

---

## Data Model

### New Tables (additions to existing schema)

```sql
-- ============================================
-- Migration: Contractor + Estimate Bank Schema
-- ============================================

-- Properties (1 account = 1 property)
CREATE TABLE properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  address_line1 text NOT NULL,
  city text,
  state text,
  zip_code text NOT NULL,
  created_at timestamp DEFAULT now()
);

-- Contractors
CREATE TABLE contractors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) UNIQUE NOT NULL,
  business_name text NOT NULL,
  contact_name text NOT NULL,
  phone text,
  ein text,
  service_area text[],
  trade_specialties text[],
  insurance_policy_number text,
  insurance_expiry date,
  insurance_verified_at timestamp,
  workers_comp_verified boolean DEFAULT false,
  stripe_connect_id text,
  stripe_onboarding_complete boolean DEFAULT false,
  agreement_accepted_at timestamp,
  active boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Estimates (replaces projects table for new estimates)
-- Existing projects table remains for backward compatibility during migration
CREATE TABLE estimates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  property_id uuid REFERENCES properties(id) NOT NULL,
  title text,
  status text NOT NULL DEFAULT 'draft',
  -- status: draft | complete | released | matched | closed
  understanding_score integer DEFAULT 0,
  understanding_dimensions jsonb DEFAULT '{
    "project_type": false, "scope_direction": false,
    "space_dimensions": false, "condition": false,
    "materials_preference": false, "budget_framing": false,
    "timeline": false, "constraints": false
  }'::jsonb,
  scope_summary text,
  cost_estimate jsonb,
  budget_approach text,
  budget_target text,
  interaction_count integer DEFAULT 0,
  released_at timestamp,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Estimate Photos
CREATE TABLE estimate_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id uuid REFERENCES estimates(id) NOT NULL,
  photo_order integer NOT NULL DEFAULT 1,
  storage_path text NOT NULL,
  ai_analysis text,
  created_at timestamp DEFAULT now()
);

-- Matches (estimate ↔ contractor)
CREATE TABLE matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id uuid REFERENCES estimates(id) NOT NULL,
  contractor_id uuid REFERENCES contractors(id) NOT NULL,
  lead_source text NOT NULL DEFAULT 'platform',
  -- lead_source: platform | self_generated | contractor_passed | sales_rep
  referred_by_contractor_id uuid REFERENCES contractors(id),
  status text NOT NULL DEFAULT 'pending',
  -- status: pending | accepted | declined | closed
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Closes (dual-party confirmation + fee)
CREATE TABLE closes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES matches(id) NOT NULL,
  contract_value numeric,
  direct_costs numeric,
  fee_percentage numeric DEFAULT 0.03,
  fee_amount numeric,
  homeowner_confirmed boolean DEFAULT false,
  homeowner_confirmed_at timestamp,
  contractor_confirmed boolean DEFAULT false,
  contractor_confirmed_at timestamp,
  stripe_charge_id text,
  fee_collected boolean DEFAULT false,
  fee_collected_at timestamp,
  created_at timestamp DEFAULT now()
);

-- Whole Home Plans ($100 purchase)
CREATE TABLE whole_home_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  property_id uuid REFERENCES properties(id) NOT NULL,
  stripe_session_id text,
  report_data jsonb,
  report_storage_path text,
  report_generated_at timestamp,
  created_at timestamp DEFAULT now()
);

-- Add user_type to users table
ALTER TABLE users ADD COLUMN user_type text NOT NULL DEFAULT 'homeowner';
-- user_type: homeowner | contractor

-- Indexes
CREATE INDEX idx_estimates_user_status ON estimates(user_id, status);
CREATE INDEX idx_estimates_property ON estimates(property_id);
CREATE INDEX idx_estimates_released ON estimates(status) WHERE status = 'released';
CREATE INDEX idx_matches_estimate ON matches(estimate_id);
CREATE INDEX idx_matches_contractor ON matches(contractor_id);
CREATE INDEX idx_closes_match ON closes(match_id);
CREATE INDEX idx_contractors_active ON contractors(active) WHERE active = true;
CREATE INDEX idx_properties_user ON properties(user_id);
```

### Existing Tables (retain, update as needed)

The existing `projects`, `project_photos`, `interactions`, `events`, `property_plans` tables remain for backward compatibility with already-built features. New estimate flow uses the `estimates` table. Migration path: existing project data can be migrated to estimates table when ready.

### RLS Policies (new tables)

```sql
-- estimates
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own estimates" ON estimates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own estimates" ON estimates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own estimates" ON estimates FOR UPDATE USING (auth.uid() = user_id);

-- contractors can read released estimates in their service area (server-side filtered)
-- Contractor read access to released estimates handled via server-side API, not direct RLS

-- matches
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
-- Both homeowner (via estimate) and contractor can read their matches
CREATE POLICY "Homeowners read own matches" ON matches FOR SELECT
  USING (estimate_id IN (SELECT id FROM estimates WHERE user_id = auth.uid()));
CREATE POLICY "Contractors read own matches" ON matches FOR SELECT
  USING (contractor_id IN (SELECT id FROM contractors WHERE user_id = auth.uid()));

-- closes
ALTER TABLE closes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Match participants read closes" ON closes FOR SELECT
  USING (match_id IN (
    SELECT m.id FROM matches m
    JOIN estimates e ON m.estimate_id = e.id
    WHERE e.user_id = auth.uid()
    UNION
    SELECT m.id FROM matches m
    JOIN contractors c ON m.contractor_id = c.id
    WHERE c.user_id = auth.uid()
  ));

-- contractors
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Contractors read own record" ON contractors FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Contractors update own record" ON contractors FOR UPDATE USING (user_id = auth.uid());

-- properties
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own properties" ON properties FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own properties" ON properties FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Locked JSON Schemas

**cost_estimate** (estimates.cost_estimate) — unchanged from original:
```json
{
  "line_items": [
    { "item": "string", "category": "string", "low": "number", "high": "number", "assumed": "boolean", "notes": "string" }
  ],
  "total_low": "number",
  "total_high": "number",
  "confidence": "low | medium | high",
  "unresolved_areas": ["string"],
  "regional_note": "string"
}
```

**cross_project_analysis** (used by Whole Home Planner) — unchanged from original:
```json
{
  "sequenced_projects": [
    { "project_id": "uuid", "priority_score": "1-100", "recommended_sequence": "integer", "reasoning": "string" }
  ],
  "bundle_groups": [
    { "bundle_name": "string", "project_ids": ["uuid"], "estimated_savings_percent": "number", "reasoning": "string" }
  ],
  "quick_wins": ["uuid"],
  "total_cost_range": { "low": "number", "high": "number" },
  "optimization_summary": "string"
}
```

---

## API Endpoints

### Homeowner Endpoints (existing + updated)

| Endpoint | Handles |
|---|---|
| `POST /api/analyze` | Photo analysis (initial, additional, correction) |
| `POST /api/scope` | Scoping Q&A + estimate generation |
| `POST /api/checkout` | Stripe Checkout for $100 Whole Home Planner |
| `POST /api/webhook` | Stripe webhooks (homeowner payment + contractor charges) |
| `GET /api/verify-payment` | Fallback payment verification |
| `GET /api/estimates` | List user's estimate bank |
| `POST /api/estimates/:id/release` | Release estimate to contractor network |
| `POST /api/closes/:id/confirm` | Homeowner confirms close |

### Contractor Endpoints (new)

| Endpoint | Handles |
|---|---|
| `POST /api/contractor/register` | Create contractor account + start onboarding |
| `POST /api/stripe-connect/onboard` | Create Stripe Connected Account, return onboarding URL |
| `GET /api/stripe-connect/status` | Check onboarding completion |
| `GET /api/contractor/estimates` | List released estimates in contractor's service area/trade |
| `POST /api/contractor/estimates/:id/accept` | Accept a released estimate (creates match) |
| `POST /api/contractor/estimates/:id/pass` | Pass estimate to network (creates referral record) |
| `POST /api/closes/:id/confirm` | Contractor confirms close |
| `GET /api/contractor/dashboard` | Dashboard data (matches, closes, fees, referrals) |
| `POST /api/contractor/insurance` | Upload/update insurance documentation |

### All endpoints must:
- Validate Supabase Auth JWT from `Authorization: Bearer` header (return 401 if missing/invalid)
- Verify user owns the resource being accessed (return 403 on mismatch)
- Verify `Origin` header matches app domain (return 403 on mismatch)
- Return proper HTTP status codes (200, 400, 401, 403, 429, 500)
- Include try/catch with structured error responses
- Handle OPTIONS preflight requests

---

## Rolling Context Strategy

For scoping API calls, manage context server-side via `api/lib/context-manager.js`:

**Always include:**
- All photo analyses (full `ai_analysis` from `estimate_photos`)
- Last 3 interactions (full `user_input` + `ai_response`)
- Current `understanding_dimensions` from estimate record
- `budget_approach` + `budget_target`

**Summarize older interactions:** `"[Q: user input] → [A: key info learned]"` — one line per interaction, ~20-30 tokens each.

**Hard cap:** ~4,000 tokens total for injected context per request.

---

## Rate Limiting

Per-IP + per-user rate limiting on AI endpoints:

| User Type | Limit |
|---|---|
| Unauthenticated | Blocked (auth required for all) |
| Homeowner (free tier) | 10 requests per hour |
| Homeowner (paid tier) | 30 requests per hour |
| Contractor | 30 requests per hour |

Return HTTP 429: "You've reached the limit for now. Try again in a few minutes."

Use persistent store (Redis/Upstash) in production. In-memory acceptable for dev only.

---

## Homeowner UX Flow

### Sign Up
1. Landing page → "Get a Free Estimate" CTA
2. Enter email + property address
3. Supabase Auth account creation
4. Proceed to camera

### Estimate Creation (up to 3 free)
1. Camera → photo capture
2. AI analysis (4-bullet initial read — Prompt 6A)
3. "Not quite right?" correction path
4. Budget question (target budget vs. dream version)
5. Scoping Q&A with understanding meter (Prompts 6B/6C)
6. Estimate generation (Prompt 6D)
7. Estimate saved to bank (status: complete)
8. **Disclaimer displayed:** "AI-generated estimate for planning purposes only. Not a professional appraisal. Actual costs will vary. Obtain quotes from contractors before making financial commitments."

### Estimate Bank
- Shows all estimates with status badges (complete / released / matched / closed)
- Each estimate shows: title, cost range, confidence, date
- "Release to Contractors" button on complete estimates
- Release prompts: "Are you ready for contractors to see this estimate and reach out?"
- After 3 estimates: upsell prompt for Whole Home Planner

### Whole Home Planner Upsell
- Triggered after 3rd free estimate completes
- Shows preview of what the Whole Home Report looks like
- "How many more projects do you have in mind?" (captures wish list size)
- "Do you know what's most important? What gives you the best bang for your buck?"
- $100 payment via Stripe Checkout
- On payment: unlock unlimited estimates + prioritization + Whole Home Report

### Whole Home Planner Dashboard (paid)
- All estimates at this property in one view
- Prioritization engine (Prompt 6E cross-project analysis)
- Budget input: "I have $X — what should I do first?"
- Wish list builder: capture project ideas even without full estimates
- Comparison view: all projects ranked by priority score
- "Generate My Whole Home Report" → PDF (Prompt 6F)
- Release selected estimates from this view

### Close Confirmation (homeowner side)
- When contractor reports a close, homeowner receives notification
- "Did you hire [Contractor Name] for [Project Title]?" → Yes / No
- Yes → homeowner side confirmed. Fee charges when contractor also confirms.

### Understanding Meter Display
Below the meter, hint text: "Still need to understand: [next_unresolved]"

Labels:
- 0-25%: "Just getting started"
- 25-50%: "Building the picture"
- 50-75%: "Getting a clear picture"
- 75-90%: "Almost there"
- 90-100%: "Ready to build your scope and cost estimate"

### Understanding Score Escape Hatch
After 8+ interactions, if score is 60-80%: offer to generate estimate with wider ranges on unresolved dimensions. Two buttons: "Build My Estimate" / "Keep Refining"

---

## Contractor UX Flow

### Sign Up + Onboarding
1. Land on `/training` page (from QR code or direct link)
2. Read network explanation (what you get, what it costs, how referrals work)
3. "Join the Network" → enter business info, email, trade specialties, service area
4. Supabase Auth account creation
5. Insurance + workers comp document upload
6. Stripe Connect Express onboarding (pre-authorize platform charges)
7. Contractor Network Agreement acceptance (clickthrough)
8. Dashboard access

### Contractor Dashboard
- **Available Estimates:** Released estimates matching contractor's geography + trade
  - Accept → creates match, contractor pursues the job
  - Pass → estimate goes back to network, contractor tagged as referrer (earns 1% if it closes)
- **My Estimates:** Estimates contractor created for their own clients using the tool
- **My Closes:** Pending close confirmations + confirmed closes with fee history
- **Referral Income:** Leads passed that others closed, 1% earned
- **Fee History:** All charges, amounts, dates, Stripe receipts
- **Insurance Status:** Current policy, expiration date, upload new

### Close Confirmation (contractor side)
- Contractor reports: "I closed this job" → enters contract value
- Platform sends notification to homeowner for confirmation
- When both confirm → fee auto-charged via Stripe Connect
- Fee = 3% of direct costs (contract value / 1.20 if using default 20% markup, or contractor-reported direct costs)

---

## Prompt Templates

All prompts are final. Use as-is in `api/lib/prompts.js`.

### Prompt 6A: Initial Photo Analysis

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
- If the photo does not appear to show a home improvement project,
  respond: "I'm not sure I can see a home project here. Try
  photographing the area you want to work on — kitchens, bathrooms,
  walls, floors, roofing, or outdoor spaces all work great."
  Do NOT generate the 4-bullet format for non-project photos.
```

### Prompt 6B: Phase 2 — Scoping Q&A

```
You are BuildIt USA's project analyst continuing a scoping session
with a homeowner. You've already done an initial analysis and now
you're building out the full scope and cost estimate.

You MUST call the update_understanding tool after every response.

CONTEXT (injected per request):
- Project type: {project_title}
- Budget approach: {budget_approach} (target_budget | dream_version)
- Budget target: {budget_target} (if applicable)
- Understanding score: {understanding_score}%
- Dimensions resolved: {dimensions_resolved}
- Interaction history: {interaction_log}

YOUR JOB:
1. Ask ONE question at a time targeting an unresolved dimension.
2. If the user provides a photo, analyze it for new information.
3. After processing input, call update_understanding tool, then
   provide your visible response.

COST IMPACT FLAGS:
When an answer carries significant cost impact:
- Flag it inline
- State which direction costs more/less and roughly by how much
- Show the optimization angle
- Never give dollar amounts during scoping — relative only
- Only flag when genuinely high-impact

BUDGET-AWARE BEHAVIOR:
- target_budget: work backward from their number. Flag when a
  choice would push over.
- dream_version: build full scope, show where costs concentrate.

RULES:
- ONE question per response. Never stack questions.
- Knowledgeable friend tone. No jargon without context.
- Keep responses to 1-3 sentences plus your question.
- Never fabricate details.
```

### Prompt 6C: Additional Photo Analysis

```
You are analyzing an additional photo for an ongoing project scope.
You MUST call the update_understanding tool after every response.

CONTEXT:
- Project: {project_title}
- Current understanding: {understanding_score}%
- What we know: {resolved_dimensions_summary}
- What we still need: {unresolved_dimensions}

Analyze this photo and state:
1. What NEW information this photo provides
2. How this changes or confirms the scope
3. One follow-up question based on what you now see

RULES:
- Only credit information genuinely visible in this photo.
- If it doesn't add much, say so and suggest what would help.
- Flag safety/structural concerns clearly.
```

### Prompt 6D: Scope + Cost Estimate Generation

```
You are generating the final scope and cost estimate.

Generate in two parts:
1. Narrative scope document as text response (homeowner sees this)
2. Call generate_estimate tool with structured JSON

CONTEXT:
- Project: {project_title}
- Budget approach: {budget_approach}
- Budget target: {budget_target}
- Full interaction history: {interaction_log}
- All photo analyses: {photo_analyses}
- Understanding score: {understanding_score}%
- Resolved dimensions: {dimensions_resolved}
- User zip code: {zip_code}

NARRATIVE SCOPE DOCUMENT:
1. PROJECT SUMMARY (2-3 sentences)
2. SCOPE OF WORK (each major item, materials, flag ASSUMED items)
3. COST ESTIMATE OVERVIEW (range, key drivers, budget-aware advice)
4. WHAT'S NOT INCLUDED (common forgotten items, permits, hidden costs)
5. RECOMMENDED NEXT STEPS (what contractor needs for firm bid)

RULES:
- Adjust regionally based on zip code.
- Ranges: ±25-40% for most items.
- Plain language. No jargon without explanation.
- Flag assumptions as "ASSUMED" inline.
- Be honest about confidence level.
```

### Prompt 6E: Cross-Project Analysis (Whole Home Planner)

```
You are analyzing a homeowner's complete set of scoped projects for
the Whole Home Planner.

CONTEXT:
- User zip code: {zip_code}
- Number of projects: {project_count}
- All projects with estimates: {all_estimates}

GENERATE:
1. PRIORITY SEQUENCING (priority_score 1-100, recommended_sequence,
   reasoning for each. Weight: safety > dependencies > seasonal >
   cost efficiency > timeline preferences)
2. BUNDLE GROUPS (shared trades, overlapping permits, bulk materials.
   Estimate % savings per bundle.)
3. QUICK WINS (under $2,000, can start immediately)

Return as JSON matching the cross_project_analysis schema.

RULES:
- Be specific about WHY sequence matters.
- Conservative savings estimates.
- Regional adjustment by zip code.
- Flag projects with understanding < 70%.
```

### Prompt 6F: Whole Home Report (PDF)

```
You are generating a Whole Home Report for a paid customer.
This is a premium deliverable — professional consultant quality.

CONTEXT:
- User zip code: {zip_code}
- Number of projects: {project_count}
- All projects with scope + cost data: {all_estimates}
- Cross-project analysis: {cross_project_analysis}

SECTIONS:
1. PROPERTY IMPROVEMENT OVERVIEW (executive summary, total range)
2. PROJECT PRIORITY ROADMAP (each project in sequence order)
3. SMART SAVINGS OPPORTUNITIES (bundles, bulk ordering, trade overlap)
4. QUICK WINS (under $2,000, DIY candidates)
5. INVESTMENT SUMMARY TABLE (all projects, subtotals, savings, net)
6. WHAT A CONTRACTOR NEEDS FROM YOU (per-project requirements)
7. NEXT STEPS (first action, timeline, what to look for)

RULES:
- Professional but approachable tone.
- Flag assumptions as "ESTIMATED" or "ASSUMED."
- Structure for clean PDF page breaks.
- No markdown code blocks.
```

---

## Design Guidelines

**A complete design system exists at `docs/design/buildit-design-handoff.md`.** Read it before building any UI component.

### Locked Visual Constraints
- **ALL screens dark themed** — `--iron` (#2A2320) backgrounds, `--parchment` (#F0E8DA) text
- **Colonial carpentry + Tesla minimalism**
- **Three-tier typography:**
  - Architects Daughter — headings, nav, button labels
  - Libre Baskerville — body text, descriptions
  - Caveat (bold) — ALL dollar amounts, statistics, annotations
- **Never use** Inter, Roboto, Arial, system-ui, or monospace
- **Primary action:** iron/charcoal (NOT blue, NOT red)
- **No tile grids** — fluid asymmetric layouts
- **Beaver mascot** — pencil sketch style, empty states/loading/errors/onboarding
- **Tap targets:** minimum 44x44px on mobile

### Google Fonts
```
https://fonts.googleapis.com/css2?family=Architects+Daughter&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Caveat:wght@400;500;600;700&family=DM+Sans:wght@400;500;600&display=swap
```

---

## Pages

| URL Path | Purpose | Auth Required |
|---|---|---|
| `/` | Landing page + "Get a Free Estimate" CTA | No |
| `/estimate` | Homeowner estimate flow (camera → analysis → scoping → estimate) | Yes (homeowner) |
| `/bank` | Homeowner estimate bank (all estimates, release controls) | Yes (homeowner) |
| `/plan` | Whole Home Planner dashboard ($100 paid feature) | Yes (homeowner, paid) |
| `/training` | Contractor landing page (QR destination, join network form) | No |
| `/contractor` | Contractor dashboard (estimates, closes, fees, referrals) | Yes (contractor) |

---

## Environment Variables

```bash
# .env.local (never committed to git)
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...        # server-side only
STRIPE_SECRET_KEY=sk_test_...                 # server-side only (homeowner payments)
STRIPE_PUBLISHABLE_KEY=pk_test_...            # safe for frontend
STRIPE_WEBHOOK_SECRET=whsec_...               # server-side only
STRIPE_PRICE_WHOLE_HOME=price_...             # $100 Whole Home Planner
STRIPE_CONNECT_CLIENT_ID=ca_...               # Stripe Connect platform ID
RESEND_API_KEY=re_...                         # server-side only
NEXT_PUBLIC_APP_URL=https://builditusa.com
```

---

## File Structure

```
buildit-usa/
├── CLAUDE.md                        # THIS FILE — technical build spec
├── package.json
├── vite.config.js
├── vercel.json
├── .env.local
├── public/
│   └── logo.svg
├── docs/
│   ├── design/
│   │   ├── buildit-design-handoff.md
│   │   └── buildit-design-v5.html
│   └── archive/                     # Historical — DO NOT reference
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── context/
│   │   └── AppContext.jsx           # Central state (user, estimates, screen)
│   ├── components/
│   │   ├── common/
│   │   │   ├── StreamingText.jsx
│   │   │   ├── UnderstandingMeter.jsx
│   │   │   ├── CostFlag.jsx
│   │   │   └── EstimateDisclaimer.jsx  # Legal disclaimer component
│   │   ├── landing/
│   │   │   └── LandingPage.jsx
│   │   ├── auth/
│   │   │   ├── HomeownerSignUp.jsx
│   │   │   └── ContractorSignUp.jsx
│   │   ├── estimate/
│   │   │   ├── CameraView.jsx
│   │   │   ├── PhotoPreview.jsx
│   │   │   ├── AIAnalysis.jsx
│   │   │   ├── BudgetQuestion.jsx
│   │   │   ├── ScopingSession.jsx
│   │   │   └── EstimateResult.jsx
│   │   ├── bank/
│   │   │   ├── EstimateBank.jsx
│   │   │   ├── EstimateCard.jsx
│   │   │   └── ReleaseConfirm.jsx
│   │   ├── plan/
│   │   │   ├── WholePlanUpsell.jsx
│   │   │   ├── WholePlanDashboard.jsx
│   │   │   ├── PriorityView.jsx
│   │   │   ├── BudgetOptimizer.jsx
│   │   │   └── WishList.jsx
│   │   ├── contractor/
│   │   │   ├── TrainingLanding.jsx     # /training page
│   │   │   ├── ContractorOnboarding.jsx
│   │   │   ├── ContractorDashboard.jsx
│   │   │   ├── AvailableEstimates.jsx
│   │   │   ├── CloseConfirm.jsx
│   │   │   ├── ReferralDashboard.jsx
│   │   │   └── FeeHistory.jsx
│   │   └── shared/
│   │       └── CloseConfirmHomeowner.jsx
│   ├── lib/
│   │   ├── supabase.js
│   │   ├── api.js
│   │   ├── camera.js
│   │   ├── stripe.js
│   │   └── analytics.js
│   └── hooks/
│       ├── useCamera.js
│       ├── useStreaming.js
│       ├── useEstimateBank.js
│       └── useAuth.js
├── api/
│   ├── analyze.js
│   ├── scope.js
│   ├── checkout.js
│   ├── webhook.js
│   ├── verify-payment.js
│   ├── estimates.js                 # GET estimate bank, POST release
│   ├── closes.js                    # POST confirm (both sides)
│   ├── contractor/
│   │   ├── register.js
│   │   ├── estimates.js             # GET available released estimates
│   │   ├── dashboard.js
│   │   └── insurance.js
│   ├── stripe-connect/
│   │   ├── onboard.js
│   │   ├── status.js
│   │   └── charge.js
│   └── lib/
│       ├── claude.js
│       ├── prompts.js
│       ├── context-manager.js
│       ├── supabase-admin.js
│       ├── stripe.js
│       ├── rate-limiter.js
│       ├── pdf-generator.js
│       ├── email.js
│       └── validators.js
└── supabase/
    └── migrations/
        ├── 001_initial_schema.sql
        ├── 002_payment_schema.sql
        └── 003_contractor_estimate_bank.sql
```

---

## Soft Delete Rule

All queries reading from `estimates` table MUST include appropriate status filters. Never hard delete estimate records.

---

## Security Requirements

These MUST be addressed. See action-items.md Security Audit sections for full details.

- Auth middleware on ALL endpoints (validate Supabase JWT)
- No client-supplied userId trust — always derive from auth session
- Wrap user inputs in XML delimiter tags before sending to Claude (prompt injection protection)
- Input length limits (2000 chars input, 500 corrections)
- Security headers in vercel.json (HSTS, CSP, X-Frame-Options)
- File upload validation (5MB limit, JPEG magic bytes)
- Persistent rate limiter (Redis/Upstash, not in-memory)
