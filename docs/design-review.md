# BuildIt USA — UI/UX Design Review

**Reviewer:** Design Review Agent  
**Date:** 2026-02-17  
**Scope:** All 19 components in `src/components/`, `index.css`, `tailwind.config.js`  
**Status:** READ-ONLY review (no files edited)

---

## CRITICAL: Tailwind Config Mismatches (Broken Styling)

These issues cause entire categories of styling to silently fail. Tailwind purges unresolvable classes, so the affected elements render with no styling for that property.

### 1. `font-pencil-hand` is not defined — affects nearly every component

**Tailwind config defines:** `font-pencil` (maps to Architects Daughter)  
**Components use:** `font-pencil-hand` (does not exist)

**Affected files (every one of these has broken heading/button fonts):**
- SplashScreen.jsx (lines 27, 47, 64)
- AddressInput.jsx (line 145)
- ProfileLoading.jsx (line 95)
- PropertyProfileCard.jsx (lines 65, 119, 137, 163)
- ProjectRecommendationCard.jsx (lines 52, 63)
- PropertyReport.jsx (lines 44, 56, 69, 75, 119, 145)
- AIAnalysis.jsx (lines 62, 87, 120, 127)
- AnalyzingScreen.jsx (line 27)
- BudgetQuestion.jsx (lines 52, 70, 82, 111, 124)
- CameraView.jsx (lines 141, 151, 158, 183, 193, 238)
- EmailCapture.jsx (lines 80, 148)
- MagicLinkPending.jsx (line 68)
- PaymentSuccess.jsx (lines 92, 115, 130, 150)
- PhotoPreview.jsx (lines 92, 109, 123, 141, 148, 201, 209)
- ProjectDashboard.jsx (lines 115, 127, 134, 162)
- ScopeEstimate.jsx (lines 44, 56, 69, 83, 102, 139, 159, 175)
- ScopingSession.jsx (lines 166, 238, 259)
- UnderstandingMeter.jsx (lines 50, 54)
- UpsellScreen.jsx (lines 79, 111, 128)

**Impact:** On heading elements (h1-h6), the CSS base layer fallback in `index.css` applies Architects Daughter. But on **buttons, spans, and p elements**, `font-pencil-hand` resolves to nothing — they fall back to the body font (Libre Baskerville). This means most button labels render in serif body text, not the intended pencil-hand style.

**Fix:** Either rename the Tailwind key from `pencil` to `pencil-hand`, or update all components to use `font-pencil`.

### 2. `bg-wood` has no DEFAULT color — affects every component with wood buttons

**Tailwind config defines:** `wood: { pale, light, mid, rich, dark, deep }` — no `DEFAULT` key  
**Components use:** `bg-wood`, `hover:bg-wood/90`, `border-wood`, `text-wood`, etc.

Without a `DEFAULT`, Tailwind cannot resolve the bare `bg-wood` class. Every wood-colored button, border, and text element is broken.

**Impact:** All primary action buttons (the brown "Let's Go", "Continue", "Use This Photo", etc.) have **no background color**. This is the single most visually destructive bug.

**Fix:** Add `DEFAULT: '#8B7D6B'` (or whichever wood tone is intended as the primary) to the wood config object.

### 3. `muted-red` is not defined — affects all error states

**Tailwind config defines:** `brick`, `dusty-red`, `warm-red`, `faded-red`, `rose`, `blush`  
**Components use:** `bg-muted-red/20`, `border-muted-red/40`, `text-muted-red`

**Affected files:**
- AddressInput.jsx (line 177)
- ProfileLoading.jsx (line 106)
- AIAnalysis.jsx (line 80)
- PaymentSuccess.jsx (line 113)
- ScopingSession.jsx (line 216)
- UpsellScreen.jsx (line 119)

**Impact:** Error message containers have no background color, no border color. Errors are nearly invisible.

**Fix:** Add `'muted-red': '#9E4040'` (or alias to `dusty-red`) in the Tailwind config.

### 4. `font-hand-accent` is not defined — affects UpsellScreen

**Tailwind config defines:** `font-hand` (maps to Caveat)  
**Components use:** `font-hand-accent` in UpsellScreen.jsx (lines 98, 108)

**Fix:** Change to `font-hand` or add `hand-accent` as an alias.

---

## Design System Compliance

### Typography Tier Violations

The design handoff specifies a three-tier system:
| Tier | Font | Use |
|------|------|-----|
| Pencil-hand | Architects Daughter | Headings, buttons, section titles |
| Warm serif | Libre Baskerville | Body text, descriptions |
| Hand-drawn numbers | Caveat | ALL dollar amounts, costs, statistics |

**Violation: Dollar amounts use wrong font tier.**  
Most components render cost figures with `font-pencil-hand` (Architects Daughter) instead of `font-hand` (Caveat). The design spec is explicit: "ALL dollar amounts, cost estimates, statistics, percentages, counts" must use Caveat.

Affected locations:
- PropertyReport.jsx line 75 (total estimate) — uses `font-pencil-hand`
- ScopeEstimate.jsx line 56 (total cost) — uses `font-pencil-hand`
- ScopeEstimate.jsx line 102 (line item costs) — uses `font-pencil-hand`
- ProjectRecommendationCard.jsx line 63 (cost range) — uses `font-pencil-hand`
- UnderstandingMeter.jsx line 54 (percentage) — uses `font-pencil-hand`

**Fix:** Change cost/number elements to `font-hand` (Caveat).

### Border Radius Inconsistency

Design spec: buttons = 8px (`rounded-lg` in Tailwind). Components mix `rounded-md` (6px), `rounded-lg` (8px), `rounded-xl` (12px), and `rounded-full`.

- Most buttons use `rounded-md` — should be `rounded-lg` per spec
- CameraView capture button uses `rounded-full` — intentional (circular capture button), acceptable
- UpsellScreen CTA uses `rounded-xl` — should be `rounded-lg`

### DM Sans Never Used

The design spec designates DM Sans for "tiny UI chrome (timestamps, badge labels under 10px)." No component uses `font-sans` (mapped to DM Sans). Status badges, timestamps, and small labels all use `font-serif` instead.

### Colonial/Carpentry Elements Completely Absent

The design handoff documents 10 specific colonial-craftsmanship elements (aged paper texture, wood-grain dividers, brass hardware accents, blueprint corners, workbench surface, wax seal badges, sketch underlines, measuring tape timeline, etc.). **None of these appear in any new component.** The current UI is functionally a clean dark theme with no artisanal character.

This is the largest gap between the design vision and implementation.

### Beaver Mascot Absent

The design handoff states the beaver should appear in: empty states, onboarding, loading screens, error states, and processing indicators. The beaver is completely absent from all components. Loading screens show generic spinners. Error states show plain text. Empty states have no illustration.

---

## Component-by-Component Review

### SplashScreen.jsx (modified)
- **Dual CTA layout:** Well-balanced. Primary (filled) vs secondary (outlined border) creates clear hierarchy.
- **"or" divider:** Clean — horizontal rules with centered text at 40% opacity. Clear and unobtrusive.
- **Secondary button visibility:** Distinct enough via border-only treatment. The opacity difference (parchment vs parchment/80) reinforces hierarchy.
- **Missing:** No logo/branding image. The design handoff specifies text-only "BUILD IT" + "est. in America" treatment for in-app nav, but even that isn't present.
- **Missing:** No beaver illustration on the landing page.

### AddressInput.jsx
- **Loading state:** Good — spinner inside the input field (right side) with "Loading..." placeholder text. Clear to user.
- **Error messaging:** Container exists but uses broken `muted-red` classes. When fixed, the error placement (below input) is good.
- **Back button:** Proper 44x44px tap target. Uses "←" Unicode character — should be an SVG for consistent cross-platform rendering.
- **Missing:** No visual indication that this is a Google-powered autocomplete (no attribution, which Google TOS may require).

### ProfileLoading.jsx
- **Animation timing:** Steps at 0s, 1.5s, 3s, 5s feel natural and progressive. Good pacing.
- **Step indicators:** Completed=brass checkmark, active=spinning, future=empty circle — clear state differentiation.
- **Error state:** Retry button goes back to address input (indirect retry). Discoverable but could be more direct — a "Try Again" that re-runs the API call in place would be smoother.
- **Missing:** This is a prime location for the beaver mascot ("our beaver's on it").

### PropertyProfileCard.jsx
- **Information hierarchy:** Address (prominent) > Street View > completeness > details > recommendations > CTA. Logical flow.
- **Street View:** h-48 (192px) is adequate. Placeholder for unavailable Street View is minimal but functional.
- **Data completeness bar:** Brass on dark background is readable. The percentage label provides context. However, the bar may be meaningless to users who don't know what "100% complete" would look like or what data is missing.
- **Property details grid:** 2-column grid at 375px width gives ~160px per cell with px-6 padding. Tight but workable for short labels. Longer values (e.g., "Forced Hot Water" for heating) may wrap awkwardly.
- **Recommendations section:** Clear separation via brass "Recommended Projects" heading. Each card (ProjectRecommendationCard) is visually distinct.
- **Sticky CTA:** Uses `fixed` positioning with `bg-iron/95` — subtle transparency. Does not obscure scrollable content thanks to `pb-24` on the scroll container. The "$20" price is embedded in button text "Get Full Report — $20" — visible but could be more prominent (e.g., larger font for price, or Caveat font).

### ProjectRecommendationCard.jsx
- **Urgency badges:** "Priority" uses muted-red (broken), "Soon" uses brass, "Routine" uses parchment. When the red is fixed, the three levels are visually distinguishable via color AND label text.
- **Cost range typography:** Uses `font-pencil-hand text-brass text-lg` — should use `font-hand` (Caveat) per spec.
- **Card density:** Appropriate — category, title, reasoning, cost, and tags without feeling overcrowded. The spacing (space-y-3) keeps it breathable.

### PropertyReport.jsx
- **Report layout:** Reads well as a document — clear sections with brass headings.
- **Cost breakdown:** Individual cards per line item with item name, category, notes, and range. Scannable. The assumed items are flagged with italic "ASSUMED" badge in brass — good.
- **Total cost display:** Centered in a bordered container with brass text — prominent.
- **Navigation:** Back button to dashboard in header — standard and adequate.
- **Missing:** No print-friendly styling or "Share/Download" option.

### UpsellScreen.jsx
- **Design system deviations:** Uses `bg-parchment` for CTA button (should be iron or wood per the primary action color spec). Uses `rounded-xl` instead of `rounded-lg`. Uses `font-hand-accent` (undefined).
- **Value anchor:** Dynamic "X projects = $Y-$Z in consultant time" is compelling. Appears on input change.
- **Price display:** "$19.99" shown alongside consultant cost comparison — good anchoring.
- **Number input styling:** Uses `bg-iron-light` (valid) but the overall input styling doesn't match other form inputs in the app.

### ScopingSession.jsx
- **Chat interface:** User messages right-aligned (wood/30 bg), AI messages left-aligned (parchment/10 bg), system messages centered (brass/20 bg) — clear differentiation.
- **Understanding meter integration:** In header, visible throughout conversation — good.
- **Generate Estimate button:** Appears at 60% understanding — discoverable but threshold reasoning isn't communicated to user.
- **Photo upload button:** 📷 emoji — functional but inconsistent with design aesthetic. Should be an SVG icon.
- **Missing:** No typing indicator when AI is preparing a response (only shows once text starts streaming).

### Other Components (existing, not new):
- **CameraView:** Well-structured with fallback for iOS Safari. Uses `bg-black` for camera view (not bg-iron) — intentional and appropriate.
- **PhotoPreview:** Clean state machine (idle, uploading, error, max-retries). Good progressive error handling.
- **EmailCapture:** Form inputs have proper labels and autocomplete attributes. Pre-fills zip from address flow.
- **MagicLinkPending:** Uses 📧 emoji as visual — should be an illustration/SVG. Resend logic is sound.
- **PaymentSuccess:** Uses ✓ and ⚠️ characters — adequate but could be more polished SVG icons.
- **ProjectDashboard:** Simple vertical card list — the design spec calls for "fluid asymmetric layout" with featured project getting more visual weight. Current implementation is a flat list.

---

## Mobile Responsiveness (375px minimum)

**Overall assessment: Adequate with minor concerns.**

- All content containers use `max-w-md` (448px) or `max-w-2xl` (672px) with `px-6` (24px) side padding — content fits within 375px viewport.
- No horizontal overflow risks detected. No fixed-width elements exceed viewport.
- PropertyProfileCard's 2-column grid is the tightest layout — at ~160px per column, longer property values may require wrapping.
- Chat bubbles in ScopingSession at `max-w-[80%]` = ~300px on 375px viewport — adequate.
- The sticky CTA in PropertyProfileCard uses `fixed bottom-0 left-0 right-0` — works on mobile but may conflict with mobile browser navigation bars (especially Safari's bottom bar). Adding `safe-area-inset-bottom` padding would be safer.

**Missing mobile-specific considerations:**
- No `env(safe-area-inset-bottom)` for sticky/fixed bottom elements (iPhone notch/home indicator)
- No viewport meta tag check (presumably in index.html)
- No touch-action optimizations
- The ScopingSession input area could benefit from sticky positioning that accounts for virtual keyboard

---

## Accessibility Review

### Passing
- **Tap targets:** Most interactive elements specify `min-h-[44px]` and/or `min-w-[44px]` — meets the 44x44px recommendation.
- **Color contrast (primary):** Parchment (#F0E8DA) on iron (#2A2320) yields approximately 10.8:1 — passes WCAG AAA.
- **Color contrast (accent):** Brass (#B8975A) on iron (#2A2320) yields approximately 4.7:1 — passes WCAG AA for normal text.
- **Form labels:** EmailCapture uses proper `<label htmlFor>` associations.
- **aria-labels:** Present on back buttons and the address input.

### Failing
- **Focus states on buttons:** NO visible focus indicators on any button in the entire app. All inputs have `focus:outline-none` which removes the default browser focus ring, and the replacement (`focus:border-wood`) doesn't render because `wood` has no DEFAULT. **Keyboard users cannot navigate the app.**
- **Focus states on inputs:** `focus:outline-none focus:border-wood` — the border change is invisible because `wood` doesn't resolve.
- **Reduced opacity text:** Several elements use `text-parchment/40` or `text-parchment/50` for secondary text. At these opacities on iron, contrast drops to approximately 4.3:1 and 5.4:1 respectively. The /40 values may fail WCAG AA for small text (12-14px).
- **Missing aria-labels:** Most buttons lack aria-labels (e.g., "Send" button in ScopingSession, "+" add project button, urgency badges).
- **No skip-to-content link.**
- **No ARIA landmarks** beyond native HTML semantics.
- **Emoji as icons:** 📧, ⚠️, ✓, 📷 used as functional icons. Screen readers announce emoji names which is acceptable but inconsistent with the design aesthetic.
- **Motion:** No `prefers-reduced-motion` media query respect for the various `animate-spin`, `animate-pulse`, and scale transform animations.

---

## Top 5 High-Impact Improvement Suggestions

### 1. Fix the Tailwind Config (URGENT — blocks all visual correctness)

Add missing mappings to `tailwind.config.js`:
```js
fontFamily: {
  'pencil-hand': ['"Architects Daughter"', 'cursive'],  // or rename all usages to 'pencil'
  'hand': ['"Caveat"', 'cursive'],
  'serif': ['"Libre Baskerville"', 'serif'],
  'sans': ['"DM Sans"', 'sans-serif'],
},
colors: {
  wood: {
    DEFAULT: '#8B7D6B',  // Add a default wood tone
    pale: '#C4B098',
    // ... rest
  },
  'muted-red': '#9E4040',  // Add missing error color
}
```
**Rationale:** Until this is fixed, the app has no button backgrounds, no pencil fonts on non-heading elements, and invisible error states. This is not a design improvement — it is a prerequisite for the design to render at all.

### 2. Add Focus Styles to All Interactive Elements

Every button and input needs a visible focus ring for keyboard navigation. Suggested pattern:
```
focus:outline-none focus:ring-2 focus:ring-brass focus:ring-offset-2 focus:ring-offset-iron
```
**Rationale:** Keyboard accessibility is currently zero. This is both an accessibility requirement (WCAG 2.4.7) and a legal exposure risk.

### 3. Introduce the Beaver Mascot to Loading, Error, and Empty States

The beaver is the brand's personality layer and is completely absent. Priority placements:
- **ProfileLoading:** Replace or supplement the step indicators with a beaver illustration ("Our beaver's pulling your records...")
- **Empty ProjectDashboard:** Beaver with hard hat saying "Nothing to chew on yet — add your first project!"
- **Error states:** Beaver looking concerned with tools
- **SplashScreen:** Beaver sketch as the visual anchor above the brand name

**Rationale:** The design handoff describes the beaver as central to the brand identity. Without it, the app feels like a generic dark-themed tool, not the industrious-helper brand intended.

### 4. Add Colonial/Carpentry Texture Elements

The current implementation is a flat dark theme. To match the "Colonial Carpentry + Tesla Minimalism" vision:
- Add SVG noise texture overlay to card backgrounds (feTurbulence at low opacity)
- Use wood-grain SVG dividers between major sections
- Add brass radial-gradient "nail head" accents on card corners
- Apply the wood-frame box-shadow to primary containers

Start with just one or two elements (e.g., noise texture on cards + brass nail heads on the sticky CTA) to establish the aesthetic without overwhelming.

**Rationale:** The colonial/carpentry texture is what differentiates BuildIt USA from every other dark-themed web app. The design handoff has 10 specific texture elements — even 2-3 of them would transform the feel.

### 5. Add Page Transition Animations

Currently, screen changes are instant cuts. Adding subtle transitions would improve perceived quality:
- Slide-in from right for forward navigation
- Slide-in from left for back navigation
- Fade for modal-like screens (payment verification, loading)

Can be implemented with Framer Motion's `AnimatePresence` or CSS `@keyframes` with a simple state machine.

**Rationale:** Transitions communicate spatial relationships between screens and make the app feel polished. The design handoff's "mechanical workshop" animation direction suggests slide/swing transitions rather than fades.

---

## Summary

| Category | Grade | Notes |
|----------|-------|-------|
| Tailwind Config Correctness | **F** | 4 class categories broken (fonts, wood color, muted-red, hand-accent) |
| Design System Typography | **C** | Serif/heading split is correct, but dollar amounts use wrong tier |
| Design System Colors | **B+** | Iron/parchment/brass usage is consistent where classes resolve |
| Colonial/Carpentry Aesthetic | **F** | Zero texture elements, zero beaver, zero artisanal detail |
| Mobile Responsiveness | **B+** | Layouts work at 375px, missing safe-area-inset |
| Accessibility | **D** | Tap targets pass, contrast mostly passes, focus states completely broken |
| Component UX Patterns | **B+** | Good state machines, clear hierarchy, sensible flows |
| Micro-interactions | **C-** | Some hover/active states, no transitions, no skeleton states |

**Priority order for fixes:**
1. Tailwind config (unblocks everything)
2. Focus states (accessibility requirement)
3. Dollar amounts → Caveat font
4. Error state color (muted-red)
5. Beaver mascot integration
6. Colonial texture elements
7. Page transitions
8. Safe-area-inset for mobile
