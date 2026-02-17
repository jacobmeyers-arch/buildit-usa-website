# Agent A — Full-Stack Features

All architectural decisions, schemas, and shared specs are in CLAUDE.md. Read it first. This document covers only your file ownership, build steps, and implementation-specific details.

## Your Files

You own everything in:
- `src/components/`
- `src/hooks/`
- `src/context/`
- `src/lib/camera.js`
- `src/lib/analytics.js`
- `src/App.jsx`, `src/main.jsx`, `src/index.css`

You do NOT modify files in `api/` or `supabase/`.

**Shared file:** `src/lib/supabase.js` — Agent B creates this. You import it in UpsellScreen.jsx to call `supabase.auth.signInWithOtp()` during the payment flow only. EmailCapture does NOT use magic link auth (see CLAUDE.md Section 5 — Option B).

## Build Steps

| Step | Task | Depends On |
|------|------|-----------|
| 1 | Project scaffolding (Vite + React + Tailwind + Vercel config + full file structure) | Nothing |
| 3 | Splash screen + state-based routing + ProjectContext provider | Step 1 |
| 4 | Camera integration (getUserMedia + iOS Safari fast path + file input fallback + client-side resize) | Step 1 |
| 5 | Photo upload to Supabase Storage (path: `{user_id}/{project_id}/{photo_order}.jpg`) | Agent B Step 2 |
| 7 | StreamingText component + useStreaming hook + tool_use content block parsing + error event handling | Agent B Step 6 |
| 8 | EmailCapture UI (email + zip → server-side user/project creation, no magic link) | Steps 2, 6 |
| 9 | UnderstandingMeter component (animated gauge + delta labels + persistent hint) | Step 7 |
| 11 | CostFlag inline display (parsed from tool_use response) | Step 9 |
| 13 | UpsellScreen UI ("How many projects?" question + magic link trigger + dynamic value anchor + CTA buttons) | After CP2, after Agent B completes gating functions |
| 15 | ProjectDashboard (paid tier multi-project view + "Add New Project" + project cards) | After CP2 |
| 17 | Polish (your components only) | After CP3 |

## Implementation Details

### ProjectContext (Step 3)

```javascript
// src/context/ProjectContext.jsx
// Provides: currentUser, activeProject, planStatus, appScreen, photos[], sessionId
// Plus updater functions for each
// Wraps <App /> in main.jsx
// On mount: generate sessionId (UUID) for temp photo storage before user creation

// On each screen transition:
window.history.pushState({ screen: newScreen }, '');

// Listen for back button:
window.addEventListener('popstate', (e) => {
  if (e.state?.screen) setAppScreen(e.state.screen);
});
```

**Session Resume (useEffect on mount):**

On app load, check for existing user session:
1. For paid users: check Supabase auth via `getSession()`. If authenticated, query projects.
2. For free users: check localStorage for stored `user_id`. If found, query projects server-side via `src/lib/api.js`.
3. Resume based on most recent project status: `scoping` → scoping screen, `estimate_ready` → estimate screen, paid user with 2+ projects → dashboard.
4. If no session found, show splash screen.

Initialize ProjectContext from the query results rather than starting empty.

### Camera (Step 4)

1. Import `isIOSSafari` from `src/lib/camera.js` (see CLAUDE.md for implementation)
2. If iOS Safari → skip getUserMedia, use `<input type="file" accept="image/*" capture="environment">` directly
3. Otherwise → attempt `navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })`
4. Fallback to file input if getUserMedia fails or is denied
5. Client-side resize: max 1280px on longest edge, JPEG 75% via `canvas.toBlob('image/jpeg', 0.75)`
6. If getUserMedia is denied AND file input fails, show camera-denied screen (see CLAUDE.md "Camera Permission Denied" UX spec)

### Photo Upload (Step 5)

**Session-based upload (before user exists):**
- Use `sessionId` from ProjectContext (generated on app start) as the temp storage prefix
- Upload resized photo to `temp/{sessionId}/{photo_order}.jpg` via service_role endpoint
- Photos at this temp path are used for Claude analysis as-is
- After email capture, Agent B's `createUserAndProject()` moves photos to `{user_id}/{project_id}/` — see CLAUDE.md Section 8

**Subsequent photos (during Phase 2 scoping, after user exists):**
- Upload directly to `{user_id}/{project_id}/{photo_order}.jpg`

**On Supabase Storage upload failure:**
- Keep the resized image blob in memory (do not discard)
- Show: "Upload failed" with two options: [Retry] and [Take New Photo]
- [Retry] re-attempts the same upload with the stored blob
- After 3 failed retries: "Upload isn't working right now. Check your connection and try again." with [Try Again] button

### Streaming Text (Step 7)

`useStreaming` hook consumes SSE from `/api/analyze` or `/api/scope`:

- Buffer incoming tokens, flush to DOM every ~50ms via `requestAnimationFrame`
- Parse SSE for event types:
  - `event: token` → `data.text` → render with typing animation
  - `event: metadata` → parsed tool_use data → pass to UnderstandingMeter
  - `event: done` → streaming complete
  - `event: error` → `data.message` + `data.retryable` → show error message, show [Retry] button if retryable
- Show blinking cursor during streaming, remove on completion

### Understanding Meter (Step 9)

- Radial gauge or horizontal progress bar (your design choice)
- Percentage displayed numerically
- Contextual labels:
  - 0-25%: "Just getting started"
  - 25-50%: "Building the picture"
  - 50-75%: "Getting a clear picture"
  - 75-90%: "Almost there"
  - 90-100%: "Ready to build your scope and cost estimate"
- Delta label on update: "+12% — now I know you're keeping the layout"
- Smooth CSS transition on score changes (not instant jumps)
- Persistent hint below meter: "Still need to understand: [value of `next_unresolved` from metadata]"

### AIAnalysis — "Not Your Project?" (Step 7)

After 4-bullet analysis renders:

1. Show subtle text link: "Not quite what you're working on? Tell me more"
2. Tap → reveal text input
3. Submit → call `/api/analyze` with `{ type: 'correction', storagePath, correction: userText }`
4. Re-render analysis with corrected response
5. Update `projects.title` via context

### EmailCapture (Step 8) — Option B: No Magic Link

**Important:** Under Option B auth, EmailCapture does NOT trigger magic link auth. It creates the user and project directly via server-side API call.

EmailCapture:
- Email + zip code input fields
- On submit: call `createUserAndProject(email, zipCode, sessionId, aiAnalysis)` from `src/lib/api.js` (Agent B provides this function). Pass `sessionId` so the server can move photos from `temp/{sessionId}/` to the final user path.
- Store returned `user_id` in localStorage for session persistence
- Store `user_id` and project data in ProjectContext
- After this call completes, photos have been moved to `{user_id}/{project_id}/` by the server
- Transition to `budgetQuestion` screen immediately (no magic link, no waiting)

MagicLinkPending:
- **Only shown during payment flow** (triggered from UpsellScreen, NOT from EmailCapture)
- "Check your email for a magic link" message
- "Resend link" button (visible after 30 seconds)
- "Try a different email" option
- After 2 resend attempts: show support contact
- Listen for auth state change: `supabase.auth.onAuthStateChange()` → on `SIGNED_IN`, proceed to Stripe Checkout

### UpsellScreen (Step 13)

**Note:** Agent B must complete plan gating functions in `src/lib/api.js` before you build this component.

1. Ask: "How many projects are on your list?" — numeric input
2. On answer, calculate and show: "N projects × individual estimates = $[N×75]-$[N×150] in consultant time. Your whole-house plan: $19.99."
3. Fire `upsell_shown` event with `{ project_count: N }` in metadata
4. "Plan My Whole House" CTA:
   a. Trigger `supabase.auth.signInWithOtp({ email })` using stored email from context
   b. Transition to MagicLinkPending screen
   c. On auth confirmation → call `src/lib/stripe.js` to initiate Stripe Checkout
5. "Maybe Later" → fire `upsell_declined` event → return to ScopeEstimate with dismissible upgrade banner

### ProjectDashboard (Step 15)

- Display all projects (where `deleted_at IS NULL`) with: title, status, understanding_score, cost estimate range
- "Add New Project" button: check plan status (see CLAUDE.md "Free User Project Limit"). If free + 1 project exists → redirect to upsell. If paid → go to camera.
- Project cards tappable: if status is `scoping` → resume scoping. If `estimate_ready` or `complete` → show estimate.
- If 2+ projects at `estimate_ready`, show priority sequence (from `projects.priority_score` and `projects.recommended_sequence`)
- Dashboard renders correctly without priority data — show projects without priority ordering until cross-project analysis (Step 16) populates it
- "Generate My Property Report" button: visible when 1+ projects at `estimate_ready` AND `plan_type = 'paid'`

### PaymentSuccess

- On mount: call `/api/verify-payment` with `session_id` from URL params
- If verified: update `planStatus` to `'paid'` in context, show success message, transition to dashboard
- If not verified: show "Verifying your payment…" with retry after 3 seconds (webhook may be delayed)

### Analytics Events (All Steps)

Call `trackEvent(eventType, metadata)` at each key point:

- `photo_captured`, `analysis_viewed`, `email_submitted`, `scoping_started`
- `estimate_generated`, `upsell_shown`, `upsell_clicked`, `payment_completed`, `upsell_declined`

`trackEvent` writes directly to the `events` table via the Supabase client (no serverless endpoint needed — RLS allows user insert). For free tier users without auth, use the service_role approach via `src/lib/api.js`.

## Quality Standards

- Every component includes a loading state (skeleton or spinner) for async operations
- Every component handles error states with user-friendly messages
- All screens verified at 375px width (iPhone SE) — no horizontal scroll
- Tap targets minimum 44x44px on mobile
- No console errors during normal flow
- Build error handling INTO each component as you create it — do not defer to Step 17
