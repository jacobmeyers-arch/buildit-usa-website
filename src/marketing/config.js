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
 *   note  — the single line of explanation that row is allowed
 *   cta   — button label
 */
export const PRICING = [
  {
    name: '1-hour intro',
    price: 'Free',
    note: 'A working session. You leave using it.',
    cta: 'Book',
  },
  {
    // "1:1" was unreadable in Architects Daughter — the colon vanishes.
    name: 'One-on-one follow-up',
    price: '$100',
    note: 'One real bottleneck, solved together.',
    cta: 'Book & pay',
    payment: 'oneOnOne',
  },
  {
    name: '4-hour deep dive',
    price: '$300',
    note: 'The full buildout. A system that sharpens with use.',
    cta: 'Book & pay',
    payment: 'deepDive',
  },
  {
    name: 'Whole-Home Planner',
    price: '$500',
    note: 'Five projects scoped, priced, sequenced. One report.',
    cta: 'Book & pay',
    payment: 'wholeHouse',
  },
  {
    name: 'Property work',
    price: 'Quoted',
    note: 'Build, repair, drainage, equipment. Priced onsite.',
    cta: 'Ask',
  },
];
