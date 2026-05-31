/**
 * config.js — Build It USA marketing site configuration
 *
 * Central place for public contact details, Stripe Payment Link URLs,
 * and the training tier data shared across pages.
 * Created: 2026-05-31
 *
 * PAYMENT LINKS: paste the URLs from your Stripe dashboard
 *   (Dashboard → Payment Links → + New → one per offering).
 *   While a link is blank, that tier's button falls back to the contact form.
 */

export const CONTACT = {
  name: 'Jacob Meyers',
  email: 'jacob.meyers@buildit-usa.com',
  phone: '518.928.9130',
  phoneHref: 'tel:+15189289130',
};

// Paste your Stripe Payment Link URLs here (leave blank to fall back to contact form).
export const PAYMENT_LINKS = {
  oneOnOne: 'https://buy.stripe.com/28EbJ04cObeC1XpfJu6EU00',  // $100/hr — 1:1 Follow-Up
  deepDive: 'https://buy.stripe.com/aFa5kC5gSbeCgSj0OA6EU01',  // $300 — 4-Hour Deep Dive
  wholeHouse: 'https://buy.stripe.com/5kQaEWfVwbeC9pR54Q6EU02', // $500 — Whole-Home Planner
};

/**
 * Training offerings. `payment` keys map into PAYMENT_LINKS above;
 * `free` tiers route to the contact form instead of Stripe.
 */
export const TRAINING_TIERS = [
  {
    key: 'intro',
    name: '1-Hour Intro',
    price: 'Free',
    tagline: 'Start using AI today.',
    summary:
      'A working session, not a sales pitch. We build your custom AI instructions live and you walk out using it the same day.',
    bullets: [
      'Custom instructions built with you, on the spot',
      'The reverse-prompting method that makes AI actually useful',
      'No cost, no obligation — open door afterward',
    ],
    cta: 'Book a free intro',
    free: true,
  },
  {
    key: 'oneOnOne',
    name: '1:1 Follow-Up',
    price: '$100',
    unit: '/hr',
    tagline: 'Targeted help on a real problem.',
    summary:
      'Power-user setup and workflows aimed at one specific problem in your business or work.',
    bullets: [
      'Set up the context files and workflow for your trade or role',
      'Solve a real, current bottleneck together',
      'Leave with a repeatable system, not a one-off answer',
    ],
    cta: 'Book & pay',
    payment: 'oneOnOne',
  },
  {
    key: 'deepDive',
    name: '4-Hour Deep Dive',
    price: '$300',
    tagline: 'Build the compounding backend.',
    summary:
      'The full power-user buildout: a system that gets sharper every time you use it instead of resetting to zero.',
    bullets: [
      'Context files, memory, and end-of-session protocols',
      'A setup that compounds across every job',
      'Walk out independent — you run it, not me',
    ],
    cta: 'Book & pay',
    payment: 'deepDive',
  },
];
