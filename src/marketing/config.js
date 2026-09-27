/**
 * config.js — Build It USA marketing site configuration
 *
 * Central place for public contact details, the offerings table, and the
 * estimating-skill description shared across the site.
 * Created: 2026-05-31
 * Rewritten: 2026-07-31 — TRAINING_TIERS (prose cards) replaced by PRICING
 *   (one table). Every offering is now one row: name, price, one line, one action.
 * Revised: 2026-09-27 — three changes, all Jacob's direction:
 *   1. PHONE REMOVED from the site. CONTACT is email-only; there is no `phone`
 *      or `phoneHref` key any more. Do not reintroduce one without his say-so.
 *   2. NO FLAT RATES. Every offering is quoted. `price` reads "Ask" across the
 *      board (the free intro stays "Free" — it is not a rate being quoted).
 *      Up-front Stripe purchase is retired with it; see RETIRED below.
 *   3. SKILLS added — the estimating tools are now the published value of the
 *      site, not just the thing behind the service.
 *
 * RETIRED 2026-09-27 — Stripe Payment Links. Nothing is sold at a fixed price
 * any more, so every row routes to the contact form and these URLs are dormant.
 * The links themselves still exist in the Stripe dashboard; kept here so they
 * are recoverable without git archaeology if flat pricing ever comes back.
 *   oneOnOne:   https://buy.stripe.com/28EbJ04cObeC1XpfJu6EU00   ($100)
 *   deepDive:   https://buy.stripe.com/aFa5kC5gSbeCgSj0OA6EU01   ($300)
 *   wholeHouse: https://buy.stripe.com/5kQaEWfVwbeC9pR54Q6EU02   ($500)
 */

export const CONTACT = {
  name: 'Jacob Meyers',
  email: 'jacob.meyers@buildit-usa.com',
};

/**
 * The whole catalog, as table rows. Nothing carries a flat price: every job is
 * scoped and quoted, so `price` is "Ask" and every button lands on the form.
 *   note   — the single line of explanation the row gets
 *   detail — "what you get", for the /pricing page only. Kept as short comma-
 *            separated items so the page stays a table, not a wall of cards.
 *   cta    — button label
 */
export const PRICING = [
  {
    name: '1-hour intro',
    price: 'Free',
    note: 'A working session. You leave using it.',
    detail:
      'Your Claude set up with you on the spot; one estimating skill installed and run on a real project of yours; the reverse-prompting method; open door afterward',
    cta: 'Book',
  },
  {
    // "1:1" was unreadable in Architects Daughter — the colon vanishes.
    name: 'One-on-one follow-up',
    price: 'Ask',
    note: 'One real bottleneck, solved together.',
    detail:
      'Context files and workflow for your trade; one current bottleneck solved; a repeatable system, not a one-off answer',
    cta: 'Get a quote',
  },
  {
    name: 'Full buildout',
    price: 'Ask',
    note: 'The whole process, installed. Yours to sharpen.',
    detail:
      'Every Build It USA skill installed in your Claude; context files, memory, end-of-session protocols; how to tune a skill as you learn the job, and how to write your own; a setup that compounds across every project',
    cta: 'Get a quote',
  },
  {
    name: 'Whole-Home Planner',
    price: 'Ask',
    note: 'Five projects scoped, priced, sequenced. One report.',
    detail:
      'Five priority projects, each a real scope of work; a cost range with the big drivers called out; prioritized and sequenced; one report you budget against',
    cta: 'Get a quote',
  },
  {
    name: 'Property work',
    price: 'Ask',
    note: 'Build, repair, drainage, equipment. Priced onsite.',
    detail:
      'Build & repair — decks, outbuildings, barns, fencing; land & drainage; equipment and seasonal labor',
    cta: 'Get a quote',
  },
];

/**
 * SKILLS — what the estimating tools actually do. Added 2026-09-27.
 *
 * These are the live Claude skills behind every estimate on this site (workspace
 * `Build It USA/Tools/`). The site now says so plainly: the 2026-07-31 rule
 * against naming AI in customer-facing copy was overridden by Jacob on
 * 2026-09-27 for exactly this reason — the tool is the product now.
 *
 * Each row is [name, what it does]. Keep it to what the tool provably does;
 * every claim here traces to the tool instructions or a published report.
 */
export const SKILLS = [
  [
    'A ballpark you can budget against',
    'Photos and a walkthrough in. Out comes a real scope of work priced line by line — then priced again at each delivery tier, so hiring it out and doing it yourself sit side by side.',
  ],
  [
    'The breakdown',
    'Every line carries its own hours, crew size, materials and subtotal. Nothing is a lump sum you have to take on faith.',
  ],
  [
    'The questions it needs answered',
    'It asks one at a time and waits. Anything still unresolved prints as an action item to lock the price — a flagged unknown, never a silent guess.',
  ],
  [
    'Sequence and schedule',
    'Operations in the order they have to happen, with crew size and a working-day duration for the whole job.',
  ],
  [
    'A check on its own math',
    'Every figure renders from one machine-readable block inside the report, and a linter recomputes the whole document from it. A total that drifts by more than a dollar fails the report instead of shipping.',
  ],
];

/**
 * Real reports these skills produced, published as-is (address and phone removed).
 *
 * Revised 2026-09-27: the bathroom report was swapped for the pig barn so these
 * two ARE the two executed case studies on /projects. Every visitor can now read
 * the estimate and then the plan-vs-actual for the same job, both ways round.
 * Order matches /projects — pig barn first (first project), garage second.
 * Ranges and confidence below come from each report's own data block.
 */
export const EXAMPLES = [
  {
    href: '/examples/pig-barn-estimate.html',
    name: 'Pig barn teardown',
    meta: 'One page · $8,039–11,449 · 6–8 working days',
  },
  {
    href: '/examples/garage-exterior-estimate.html',
    name: 'Garage exterior',
    meta: 'One page · $19,452–29,178 · 14–17 working days',
  },
];

/**
 * RUN_COST — what it costs to actually run one of these. Added 2026-09-27
 * (Jacob: show the ROI).
 *
 * HOW THE FIGURE WAS DERIVED — re-derive it, don't nudge it:
 *   Input  ≈ 50K tokens — the estimating instructions + output template
 *            (98KB of markdown, ~27K tokens) that load on every run, plus a
 *            photo set and the walkthrough conversation.
 *   Output ≈ 30K tokens — the report itself (~69KB of HTML, ~21K tokens) plus
 *            the reasoning tokens, which bill as output.
 *   At Claude Opus 5 metered rates ($5/M input, $25/M output) that is
 *            $0.25 + $0.75 ≈ $1.00. Published as "$1–2" because rounding UP is
 *            the honest direction on a cost claim — understating the cost
 *            overstates the return.
 *
 * ⚠️ Two things keep this honest and must not be dropped:
 *   1. Customers run these on a Claude subscription, where there is NO
 *      per-report charge. Quoting a per-report price without saying so implies
 *      a bill they will never receive.
 *   2. Model pricing changes. Re-check it against Anthropic's current rates
 *      before treating this number as current. Verified 2026-09-27.
 */
export const RUN_COST = {
  perReport: '$1–2',
  basis: 'of compute, at metered rates',
  note: 'On a Claude subscription there is no per-report charge at all — it is already paid for. The figure above is what the computing behind one report is actually worth.',
};
