# BuildIt USA — Design System Agent Handoff Brief

## Project Context

BuildIt USA is a camera-first home improvement web application. Homeowners photograph projects and receive AI-powered analysis, cost estimates, and contractor connections. The app is being built on React/Vercel/Supabase.

This document captures all design decisions made through 5 iterations of UI exploration between Jacob (founder) and Claude. The agent team's job is to research improvements, identify gaps, and produce a production-ready design system skill that Claude Code agents can follow when building frontend components.

---

## Brand Identity — Locked Decisions

These are final. Do not revisit unless Jacob explicitly requests it.

### Mascot & Personality
- **Beaver mascot** — industrious helper theme permeates the entire app
- Beaver appears in: empty states, onboarding, loading screens, error states, processing indicators
- Beaver personality language: "our beaver's on it", "our beaver's got nothing to chew on", "beaver will get right on it"
- Beaver should be illustrated in **pencil sketch style** (line art, not filled/colored)
- Beaver wears a hard hat, may hold tools (saw, clipboard, magnifying glass) contextually
- The beaver is a *carpenter helping the homeowner*, not a cute mascot — industrious, competent, friendly

### Logo
- Existing logo: beaver silhouette over American flag with "BUILD IT" text (see uploaded image in conversation history)
- Tagline in app: "est. in America" — rendered in italic serif beneath the brand name

### Logo Usage

| Variant | File | Use |
|---------|------|-----|
| Color (flag) | `20251013_BuildIt_Logo USA.png` | Marketing, splash page, social media, print |
| B&W (silhouette) | `20251013_BuildIt_Logo B_W.png` | App favicon source, monochrome contexts |

**In-app navigation:** Uses text-only treatment — "BUILD IT" in Architects Daughter + "est. in America" in Libre Baskerville italic (the warm serif tier). Not the full logo image. See v5 HTML nav component.

**Dark surface treatment:** The B&W logo has a white background. For dark UI contexts, the beaver silhouette needs a transparent PNG version or SVG extraction. Logo PNGs are NOT used in the app UI — they're for marketing/external use only.

**Beaver (in-app) vs. Beaver (logo):** The logo beaver is a bold line-art silhouette. The in-app beaver illustrations should be pencil sketch style (lighter line weight, hand-drawn feel). These are separate visual treatments — don't use the logo beaver as the in-app mascot.

### Color Palette — Muted Red/White/Blue (Option B, dusty/refined variant)

**PRIMARY ACTION COLOR: Neutral dark (iron/charcoal) — NOT blue, NOT red.**
Red and blue are accent colors only.

```
/* Wrought Iron & Hardware */
--iron: #2A2320;          /* Primary buttons, text, UI chrome */
--iron-hover: #1A1714;
--iron-warm: #3B3530;     /* Secondary surfaces */
--iron-mid: #4D4540;      /* Borders on dark */
--iron-light: #5C5550;
--iron-faint: #6B6358;

/* Aged Paper & Parchment */
--parchment: #F0E8DA;     /* Light text on dark, light button fills */
--parchment-light: #F5EEDE;
--parchment-dark: #E4D9C8;
--old-linen: #D8CCBA;
--warm-sand: #C4B5A0;
--aged-cream: #EDE3D0;

/* Wood Tones */
--wood-pale: #C4B098;
--wood-light: #A8956E;
--wood-mid: #8B7D6B;
--wood-rich: #6B5B45;
--wood-dark: #4A3D2E;
--wood-deep: #3A2F22;

/* Muted Red (accent only) */
--brick: #7A2E2E;
--dusty-red: #9E4040;
--warm-red: #C25555;       /* Primary red accent */
--faded-red: #B85050;
--rose: #D4A0A0;
--blush: #E8D0D0;

/* Muted Blue (accent only) */
--slate-navy: #2B3E5C;
--dusty-blue: #3B5068;
--steel-blue: #5B7A9A;
--soft-blue: #A8BFD4;
--ice-blue: #D0DCE8;

/* Brass / Hardware Accent */
--brass: #B8975A;
--brass-light: #D4B878;
--brass-dark: #8A6E3A;
```

**CRITICAL DIRECTION: ALL SCREENS SHOULD BE DARK THEMED.**
The v5 iteration showed both light (parchment) and dark (workshop) screens. Jacob's final direction is to keep everything black/dark themed. No parchment-background screens. Parchment color is used for text-on-dark and light button fills only.

### Typography — Three-Tier System

| Tier | Font | Use Case |
|------|------|----------|
| **Pencil-hand** | Architects Daughter | Headings, nav brand, button labels, project names, personality copy, section titles |
| **Warm serif** | Libre Baskerville | Body text, explanatory copy, line item names, meta text, descriptions. Use italic for secondary/muted info |
| **Hand-drawn numbers** | Caveat (bold/600-700) | ALL dollar amounts, cost estimates, statistics, percentages, counts. Also used for annotations, beaver personality lines, sketch-note callouts |

**Additional:** DM Sans used only for tiny UI chrome (timestamps, badge labels under 10px).

**Anti-pattern:** Never use Inter, Roboto, Arial, system-ui, or any monospace font (including JetBrains Mono) for visible text. JetBrains Mono was explicitly rejected — cost figures must feel hand-drawn, not military/terminal.

### Google Fonts Load String
```
https://fonts.googleapis.com/css2?family=Architects+Daughter&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Caveat:wght@400;500;600;700&family=DM+Sans:wght@400;500;600&display=swap
```

### Spacing & Layout Tokens

Extracted from v5 implementation. Use these as the baseline for Tailwind config extension.

| Token | Value | Usage |
|-------|-------|-------|
| Base unit | 4px | All spacing is multiples of 4 |
| Section padding | 28px | Content area padding (`padding: 28px`) |
| Card padding | 18–20px | Inner padding on cards and panels |
| Component gap | 16px | Gap between project cards, list items |
| Large gap | 28px | Gap between major sections |
| Container max-width | 1300px | Outer page wrapper |

**Border Radius:**
| Element | Radius |
|---------|--------|
| Page frames / upload zones | 14px |
| Cards, panels, sidebars | 12px |
| Buttons, inputs | 8px |
| Small badges, tags | 4px |
| Avatars, dots | 50% (circular) |

**Shadows (on dark backgrounds):**
```css
/* Resting card */
box-shadow: 0 2px 8px rgb(42 35 32 / 0.08), inset 0 0 0 1px rgb(139 125 107 / 0.12);

/* Hover / elevated */
box-shadow: 0 8px 24px rgb(42 35 32 / 0.12), inset 0 0 0 1px rgb(139 125 107 / 0.2);

/* Iron button */
box-shadow: 0 2px 6px rgb(42 35 32 / 0.25), inset 0 1px 0 rgb(255 255 255 / 0.04);

/* Wood-frame container */
box-shadow: 0 2px 0 0 var(--wood-rich), 0 4px 0 0 var(--wood-dark),
            0 8px 24px rgb(0 0 0 / 0.3), inset 0 0 0 1px rgb(139 125 107 / 0.15);
```

**Photo Overlay Gradient Scrim:**
```css
background: linear-gradient(
  180deg,
  rgb(30 25 20 / 0.6) 0%,
  rgb(30 25 20 / 0.08) 28%,
  transparent 45%,
  transparent 55%,
  rgb(30 25 20 / 0.15) 72%,
  rgb(30 25 20 / 0.68) 100%
);
```

**Responsive Breakpoint:**
- Single breakpoint: `860px` — below this, all grids collapse to single column
- Mobile-first: design for phone viewport, enhance for desktop

---

## Aesthetic Direction — Colonial Carpentry + Tesla Minimalism

### The Core Tension (this IS the brand)
**Colonial/carpentry craftsmanship** (warm, hand-made, workshop) balanced against **Tesla-level minimalism** (whitespace, restraint, precision). The design should feel like an architect's workshop — not a tech startup, not Cracker Barrel.

### Colonial/Carpentry Elements (currently at "medium-heavy" weight)

| Element | Implementation | Status |
|---------|---------------|--------|
| Aged paper texture | SVG noise filter on backgrounds (feTurbulence, baseFrequency 0.65-0.9) | ✅ Working |
| Wood-grain dividers | Multi-line SVG paths mimicking planed wood grain | ✅ Working |
| Wrought-iron buttons | --iron color with warm brown undertone, inner highlight (inset box-shadow) | ✅ Working |
| Brass hardware accents | Radial gradient circles (nail heads, rivets, tacks, timeline dots) | ✅ Working |
| Blueprint corner marks | L-shaped borders at top-left/bottom-right of photo containers | ✅ Working |
| Workbench surface texture | Horizontal grain lines via repeating-linear-gradient + noise | ✅ Working |
| Wax seal badges | "Recommended" badge styled as red seal with shadow | ✅ Working |
| Stamped avatar circles | Contractor initials in iron circles with embossed wood border | ✅ Working |
| Sketch-style underlines | SVG wavy paths under key phrases (red accent) | ✅ Working |
| Measuring tape timeline | Timeline track with ruler tick marks via repeating gradient | ✅ Working |

### What's NOT Part of the Aesthetic
- Gradients on backgrounds or buttons (flat surfaces only, texture via noise/grain)
- Purple, indigo, or any "tech startup" colors
- Glow effects, neon accents, glassmorphism (backdrop-filter: blur is OK for status pills only)
- Generic card grids / tile layouts (see Layout section)
- Decorative icons scattered everywhere (icons only where functional)
- Rounded-full on rectangular elements (rounded corners yes, pill-shaped cards no)

---

## Layout Decisions

### NO TILE GRIDS
Jacob explicitly rejected equal-card grid layouts ("feels like a dog adoption website"). Projects must be displayed in a **fluid asymmetric layout**:
- Featured/primary project gets more visual weight (larger, spans more grid area)
- Grid ratio: approximately 1.2fr / 0.8fr, not 1fr / 1fr
- Layout should feel editorial/magazine, not database-table

### Photo-Forward Design
- Photos are the primary canvas — all project info is overlaid ON the photo, not in a card body below it
- Project name: top-left of photo overlay
- Status badge: top-right, frosted glass pill
- Cost estimate: bottom-left, large Caveat hand-numbers — the most prominent element
- Meta info (photo count, date): bottom-right
- Gradient scrim: heavy enough for legibility (0.6 opacity at edges, transparent in center)
- No white/light photo placeholders — all placeholder backgrounds use warm dark gradients themed to project type

### Photo Placeholder Backgrounds (when no real photo exists)
```css
.photo-kitchen  { background: linear-gradient(145deg, #3D3530 0%, #5C4F45 40%, #7A6B5E 100%); }
.photo-deck     { background: linear-gradient(145deg, #4A3E30 0%, #6B5940 40%, #8A7458 100%); }
.photo-bathroom { background: linear-gradient(145deg, #35404A 0%, #4A5A68 40%, #657888 100%); }
.photo-roof     { background: linear-gradient(145deg, #2B3E5C 0%, #3D5570 40%, #5B7A9A 100%); }
```
All get a paper grain overlay (feTurbulence noise at ~0.06 opacity).

---

## Component Inventory (Built in v5)

### Fully Designed
1. **Project Dashboard** — stats bar, fluid project layout, nav
2. **Photo Upload Flow** — upload zone with brass tacks, thumbnail row, dark workbench surface
3. **Estimate Breakdown** — split view (photo + cost panel), line items with wood-grain separators, confidence bar
4. **Contractor Quotes** — quote cards with stamped avatars, wax seal "recommended" badge, pricing in Caveat
5. **Project Timeline** — measuring tape track, brass/red dots for status, sidebar summary

### Not Yet Designed (Gaps)
- Onboarding / first-run experience (beaver should feature heavily)
- Settings / account page
- Notification system
- Mobile navigation (hamburger menu behavior)
- Error states (beyond empty state)
- Loading/skeleton states (beaver animation opportunities)
- Toast/alert notifications
- Form inputs (text fields, dropdowns, toggles)
- Modal/dialog pattern
- Search functionality
- Pagination or infinite scroll behavior

---

## Known Issues & Open Questions for Research

### Issues to Fix
1. **All screens must be dark themed** — v5 showed Dashboard and Contractor Quotes on parchment backgrounds. These need to be converted to dark workshop surfaces with parchment text. Research how to maintain readability and visual hierarchy on all-dark without feeling oppressive.
2. **Form input styling** — No text input, select, or toggle styles exist. These are critical for the upload flow, search, and settings. Need to design form elements that match the colonial/iron aesthetic on dark backgrounds.
3. **Mobile responsiveness** — Current responsive breakpoints are basic (just column collapse). Need a thorough mobile-first pass, especially for the fluid project layout and estimate detail view.
4. **Accessibility** — Contrast ratios on dark backgrounds with warm-sand and parchment text need WCAG AA verification. The hand-drawn fonts may need size minimums for legibility.

### Research Questions
1. **Dark mode readability** — With everything dark, how do we create visual separation between sections without hard borders? Research: shadow elevation on dark, subtle background value shifts, texture variation.
2. **Caveat font at small sizes** — Caveat works great for large cost numbers but may be hard to read at 14px or below. Research minimum viable size for this font or alternatives that maintain the hand-drawn feel.
3. **Colonial serif alternatives** — Libre Baskerville is good but there may be better options that lean more into the colonial broadside / early American print aesthetic. Research: Playfair Display, EB Garamond, Crimson Pro, or actual colonial-era digitized typefaces.
4. **Beaver illustration system** — Currently using inline SVG sketches. For production, we need either: (a) an SVG sprite sheet with beaver in various poses/contexts, or (b) a system for generating consistent beaver illustrations. Research best approach.
5. **Wood/brass texture performance** — Multiple SVG noise filters + repeating gradients could impact performance on low-end mobile devices. Research lightweight alternatives or pre-rendered texture images.
6. **Animation / micro-interactions** — No animation specs exist yet. Research what fits the aesthetic: should interactions feel mechanical (workshop machinery), organic (wood flexing), or paper-like (pages turning)? The beaver could have subtle idle animations.

---

## Design System Skill — Current State

An initial skill package was created (SKILL.md + design-system.md) in the first iteration but is now **outdated**. It was based on a teal-blue palette and DM Sans typography. The skill files need to be completely rewritten to reflect the current decisions documented above.

### Skill File Deliverables Needed
1. **SKILL.md** — Updated instruction layer for Claude Code agents
2. **design-system.md** — Complete token reference (colors, type, spacing, shadows, textures)
3. **components.md** — Pattern library for each designed component
4. **anti-patterns.md** — Explicit "never do this" reference with examples
5. **beaver-guide.md** — Beaver personality guidelines (when to use, what it says, illustration contexts)

### Skill Deployment
- Skill folder goes in the Claude Code project directory
- Referenced in CLAUDE.md so agents read it before any frontend work
- Should be testable via the skill-creator eval loop (see /mnt/skills/examples/skill-creator/SKILL.md)

---

## File References

| File | Description |
|------|-------------|
| `docs/design/buildit-design-handoff.md` | This document (in build directory) |
| `docs/design/buildit-design-v5.html` | Latest design iteration — 5 feature windows (PRIMARY VISUAL REFERENCE) |
| `Branding/20251013_BuildIt_Logo USA.png` | Color logo (beaver + flag) — marketing use |
| `Branding/20251013_BuildIt_Logo B_W.png` | B&W logo (beaver silhouette) — favicon source |

**Note:** The v5 HTML is a static showcase of 5 screens. Open in a browser to see the rendered design. All CSS tokens and component patterns are implemented inline.

---

## Decision Log (Chronological)

1. Objective: create a reusable design skill that improves Claude Code's visual output
2. Started minimal — tokens + anti-patterns only, iterate via eval loop
3. Palette: chose Option B (muted/dusty red-white-blue) over bold or mixed
4. Primary action color: neutral dark (iron/charcoal), red & blue are accents only
5. Beaver mascot appears throughout the app — not just the logo
6. Beaver theme: "industrious helper" — should permeate as consistent personality
7. Font: rejected DM Sans for body (too generic), moved to Architects Daughter (pencil-hand)
8. Rejected tile grid layout — moved to fluid asymmetric photo-forward layout
9. Info overlaid on photos — not in card bodies below
10. Body text font: rejected Architects Daughter for explanatory copy (too casual) — moved to Libre Baskerville (warm serif)
11. Cost numbers: rejected JetBrains Mono (too military) — moved to Caveat bold (hand-drawn)
12. Three-tier type system established: pencil-hand / warm serif / hand-drawn numbers
13. Colonial/carpentry aesthetic added at medium weight: wood grain, brass hardware, aged paper, blueprint corners
14. Increased to medium-heavy: workbench textures, brass tacks, wax seals, measuring tape timeline
15. **Final direction: ALL DARK THEMED — no light/parchment screens**

---

## Agent Team Instructions

### Execution Phases (parallelized for 2-agent team)

**Phase 1 — Can run in parallel:**
- Agent A: Research open questions (dark readability patterns, font min sizes, WCAG contrast, texture performance, animation direction)
- Agent B: Write `design-system.md` (full token reference) + `anti-patterns.md` — uses only locked decisions from this doc, no research needed

**Phase 2 — After Phase 1 research completes:**
- Agent A: Convert v5 screens to all-dark + design missing components (form inputs, modals, mobile nav, error states) — informed by research findings
- Agent B: Write `components.md` (pattern library from v5 + new components) + `beaver-guide.md` — incorporates Agent A's research on illustration approach

**Phase 3 — Both agents:**
- Write `SKILL.md` instruction layer
- Set up eval prompts for testing the skill with Claude Code
- Test skill output against v5 reference for visual fidelity

### Constraints
- Stack: React + Tailwind (extend config with design tokens)
- Deployment: Vercel
- Budget context: $200 Claude Code budget — be efficient with iterations
- Jacob reviews visually — produce renderable HTML demos, not just documentation
