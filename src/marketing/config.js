/**
 * config.js — Build It USA marketing site configuration
 *
 * Central place for public contact details, Stripe Payment Link URLs,
 * and the pricing table shared across the site.
 * Created: 2026-05-31
 * Rewritten: 2026-07-31 — TRAINING_TIERS (prose cards) replaced by PRICING
 *   (one table). Every offering is now one row: name, price, one line, one action.
 *
 * PAYMENT LINKS: paste the URLs from your Stripe dashboard
 *   (Dashboard → Payment Links → + New → one per offering).
 *   While a link is blank, that row's button falls back to the contact form.
 */

export const CONTACT = {
  name: 'Jacob Meyers',
  email: 'jacob.meyers@buildit-usa.com',
  phone: '518.928.9130',
  phoneHref: 'tel:+15189289130',
};

// Paste your Stripe Payment Link URLs here (leave blank to fall back to contact form).
export const PAYMENT_LINKS = {
  oneOnOne: 'https://buy.stripe.com/28EbJ04cObeC1XpfJu6EU00',  // $100 flat — 1:1 Follow-Up
  deepDive: 'https://buy.stripe.com/aFa5kC5gSbeCgSj0OA6EU01',  // $300 — 4-Hour Deep Dive
  wholeHouse: 'https://buy.stripe.com/5kQaEWfVwbeC9pR54Q6EU02', // $500 — Whole-Home Planner
};

/**
 * The whole catalog, as table rows. `payment` keys map into PAYMENT_LINKS;
 * rows without one route to the contact form.
 *   note   — the single line of explanation the row gets
 *   detail — "what you get", for the /pricing page only. Kept as short comma-
 *            separated items so the page stays a table, not a wall of cards.
 *            Nobody clicks a $500 button off a one-liner.
 *   cta    — button label
 */
export const PRICING = [
  {
    name: '1-hour intro',
    price: 'Free',
    note: 'A working session. You leave using it.',
    detail: 'Custom instructions built with you on the spot; the reverse-prompting method; open door afterward',
    cta: 'Book',
  },
  {
    // "1:1" was unreadable in Architects Daughter — the colon vanishes.
    name: 'One-on-one follow-up',
    price: '$100',
    note: 'One real bottleneck, solved together.',
    detail: 'Context files and workflow for your trade; one current bottleneck solved; a repeatable system, not a one-off answer',
    cta: 'Book & pay',
    payment: 'oneOnOne',
  },
  {
    name: '4-hour deep dive',
    price: '$300',
    note: 'The full buildout. A system that sharpens with use.',
    detail: 'Context files, memory, end-of-session protocols; a setup that compounds across every job; you walk out running it',
    cta: 'Book & pay',
    payment: 'deepDive',
  },
  {
    name: 'Whole-Home Planner',
    price: '$500',
    note: 'Five projects scoped, priced, sequenced. One report.',
    detail: 'Five priority projects, each a real scope of work; a cost range with the big drivers called out; prioritized and sequenced; one report you budget against',
    cta: 'Book & pay',
    payment: 'wholeHouse',
  },
  {
    name: 'Property work',
    price: 'Quoted',
    note: 'Build, repair, drainage, equipment. Priced onsite.',
    detail: 'Build & repair — decks, outbuildings, barns, fencing; land & drainage; equipment and seasonal labor',
    cta: 'Ask',
  },
];
