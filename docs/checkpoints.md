# BuildIt USA — Phase Checkpoints

The lead agent validates these criteria at each checkpoint before authorizing the next phase. All items must pass. If any item fails, the responsible agent fixes it before proceeding.

## Checkpoint 1 — After Step 8 (Phase 1 Complete)

**Goal:** The full Phase 1 flow works end-to-end: splash → camera → photo analysis → email capture → user/project created.

### Acceptance Criteria

**UI / UX:**
- App loads on mobile viewport (375px width) without horizontal scroll
- Splash screen renders with logo, headline, and "Let's Go" CTA
- Camera opens on Chrome desktop/Android OR file input fallback triggers on iOS Safari
- Camera permission denied shows fallback screen with "Upload a Photo Instead" option
- Photo capture → preview → "Use This" / "Retake" both function correctly
- "Not quite right?" correction link present on analysis screen and functional
- "Keep Going" CTA transitions to email capture screen
- Email + zip code input functional
- After email submit: user proceeds immediately to budgetQuestion (no magic link, no waiting — Option B auth)

**Data / Backend:**
- Photo resized client-side (max 1280px, JPEG 75%) before upload — download one uploaded photo from Supabase Storage and verify dimensions ≤ 1280px on longest edge
- Photo uploads to Supabase Storage at `{user_id}/{project_id}/{photo_order}.jpg`
- `/api/analyze` returns streaming response with Claude analysis
- Streaming text renders with visible typing effect (not all-at-once)
- Analysis shows expected multi-line format from Prompt 6A (verify response is specific to the photo and ends with the "A few more details..." line)
- `tool_use` metadata (from `update_understanding`) parsed correctly from response
- User record created in `users` table with email + zip_code (via service_role, no auth)
- Project record created in `projects` table linked to user
- Photo record in `project_photos` linked to project with `ai_analysis` populated
- `projects.status` set to `'analyzing'` during analysis, then updated appropriately
- Non-project photo test: submit a non-project photo → system responds with guidance instead of 4-bullet format

**Security / Infra:**
- Rate limiter returns 429 after exceeding limit on `/api/analyze`
- RLS policies active (test via direct Supabase client call — service_role bypasses as expected)
- Origin header verified on `/api/analyze`
- CORS headers present on API responses
- No console errors in Chrome DevTools during full flow

**Analytics:**
- Events fire: `photo_captured`, `analysis_viewed`, `email_submitted`

### Lead Assessment

1. **Coordination overhead:** Were agents frequently blocked? If minimal blocking, consider adding 3rd agent for Phase 2.
2. **Token burn rate:** Run `/cost`. Is spend tracking to $200 budget? If significantly over pace, simplify remaining steps.
3. **Code quality:** Review both agents' code for consistent error handling, naming conventions, and patterns.
4. **Auth flow verified:** Option B (unverified free tier) working correctly — user record created without magic link, user_id stored for session persistence.

## Checkpoint 2 — After Step 12 (Core Product Loop Complete)

**Goal:** The complete scoping flow works: Phase 1 → budget question → Q&A loop → understanding meter updates → estimate generation. The core product value is deliverable.

### Acceptance Criteria

**Scoping Flow:**
- Budget question screen displays after email capture with two clear options
- Budget selection saved to `projects.budget_approach`
- Understanding meter appears and displays initial score from Phase 1 analysis
- Scoping Q&A sends requests to `/api/scope` with rolling context (verify: NOT full history)
- Claude asks ONE question per response (never stacks questions)
- `tool_use` metadata updates understanding meter with smooth CSS animation
- Delta label displays beneath meter on score changes (e.g., "+12% — now I know…")
- Persistent hint below meter shows next unresolved dimension
- Additional photos can be submitted during scoping via camera interface
- Additional photos analyzed for NEW information (references visible details from photo)
- Cost impact flags render inline when present in Claude's response
- Max 1 cost flag per interaction

**Escape Hatch:**
- After 8+ interactions at 60-80% understanding, system offers "Build My Estimate" / "Keep Refining"
- "Build My Estimate" generates estimate regardless of score threshold

**Estimate Generation:**
- Estimate triggers when understanding ≥ 80% OR user requests via escape hatch
- Claude generates both text narrative AND structured JSON via `generate_estimate` tool call
- `projects.scope_summary` contains a readable text narrative (non-null, non-empty)
- `projects.cost_estimate` contains valid JSON matching the locked `cost_estimate` schema (non-null)
- Both fields populated from the same estimate generation call (text block → `scope_summary`, tool_use → `cost_estimate`)
- ScopeEstimate screen displays formatted scope + cost estimate with line items and ranges
- `projects.status` updated to `'estimate_ready'`

**Infrastructure:**
- All interactions logged to `interactions` table with correct type values (see agent-b.md interaction type mapping)
- Context injection stays under ~4,000 tokens even after 10+ interactions (check server logs — context-manager.js must log token count)
- Back button navigates through app screens (not out of app)
- `projects.interaction_count` incremented correctly

**Analytics:**
- Events fire: `scoping_started`, `estimate_generated`

### Lead Assessment

1. **Add 3rd agent?** Steps 13-16 include upsell UI, Stripe, dashboard, and report. If agents have been efficient, a 3rd could handle dashboard + report display (UI) while Agent B handles payments + report generation (backend).
2. **Token burn rate:** Check cumulative spend against $200 budget. Steps 13-16 are heavier (Stripe + PDF). Ensure budget is sufficient.
3. **Claude response quality:** Review 2-3 scoping sessions. Are responses hitting the right tone? Are cost flags appropriate? Adjust prompts before proceeding if needed.

## Checkpoint 3 — After Step 16 (Full MVP Functional)

**Goal:** All features work end-to-end including monetization, dashboard, and report generation. Ready for polish pass.

### Acceptance Criteria

**Upsell + Payment:**
- Upsell screen displays after first free project estimate
- "How many projects on your list?" question appears and captures response
- Dynamic value anchor calculated and displayed based on project count
- `upsell_shown` event fires with `{ project_count: N }` in metadata
- "Plan My Whole House" CTA → triggers magic link auth (first time user authenticates)
- MagicLinkPending screen shows during payment flow with resend + alternate email options
- On auth confirmation → Stripe Checkout opens
- Stripe payment completes in test mode
- Webhook fires → `property_plans` record created with `plan_type: 'paid'`
- Payment verification fallback works if webhook missed (test: disable webhook, verify via `/api/verify-payment`)
- `/api/verify-payment` validates `auth.uid()` matches session metadata `user_id`
- User redirected to PaymentSuccess → paid features unlocked in context
- "Maybe later" → returns to ScopeEstimate with dismissible upgrade banner
- `upsell_declined` event fires on "Maybe later"
- Free users gated to 1 project (test: "Add New Project" → redirected to upsell)
- Paid users can create unlimited projects
- A/B price selection works via `PRICE_TIER` env var (test both values — requires env var change and redeploy)

**Dashboard (Paid):**
- Project dashboard displays all projects with status, understanding score, cost estimate range
- "Add New Project" button → camera flow
- Project cards tappable: scoping-status projects resume, `estimate_ready` shows estimate
- If 2+ projects at `estimate_ready`: priority sequence displayed from cross-project analysis

**Cross-Project Analysis + Report:**
- Cross-project analysis triggers when dashboard loads with 2+ `estimate_ready` projects
- Analysis returns valid JSON (all `project_id`s verified, `priority_score`s 1-100, `recommended_sequence` values present)
- Priority scores, recommended sequence, and bundle groups saved to project records
- `quick_wins` array contains valid project IDs
- Single-project dashboard skips cross-project analysis (no errors)
- "Generate My Property Report" button visible when eligible (1+ `estimate_ready` + paid)
- HTML report displays in-app with all applicable sections from Prompt 6F
- Single-project report omits priority/bundle sections, shows upgrade prompt instead
- PDF generated via `@react-pdf/renderer` (NOT Puppeteer)
- PDF stored in Supabase Storage (`property-reports` bucket, path: `{user_id}/{plan_id}/report.pdf`)
- PDF downloadable via link
- Report emailed to user via Resend
- `payment_completed` event fires after successful payment

### Polish Assessment (Scoping Step 17)

The lead agent scopes the final polish work:

1. **Known issues list:** Compile all issues noted during build
2. **Mobile responsive audit:** Test every screen at 375px, 414px, 768px widths
3. **Cross-browser check:** Chrome + Safari minimum
4. **Error path review:** What happens on:
   - Network failure mid-streaming?
   - Camera permission denied?
   - Photo upload failure?
   - Stripe checkout error?
   - Claude API timeout or 529?
   - Magic link email not received (during payment flow)?
5. **Budget remaining:** Allocate remaining tokens to highest-impact polish items by severity

## Post-Build Validation

After Step 17, before declaring MVP complete:

- **Full flow test:** splash → camera → analysis → email → budget → scoping (5+ questions) → estimate → upsell → magic link → payment → dashboard → report → PDF download
- **Full flow test on mobile viewport (375px)**
- **Negative tests:** fake email, rate limit exceeded, back button at every screen, non-project photo, interrupted streaming, camera permission denied, photo upload failure
- **Session persistence test:** complete Phase 1, close browser, reopen → user resumes at correct screen
- **Data integrity:** check all DB records created correctly across full flow
- **No console errors or warnings in production build**
