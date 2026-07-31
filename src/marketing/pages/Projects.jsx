/**
 * Projects.jsx — The proof page. How the estimator works, then two builds checked against it.
 * Created: 2026-06-11
 * Cut: 2026-07-31 — prose deleted; the tables already carried it.
 * Rebuilt: 2026-07-31 — every plan-table range republished from the v3 estimates'
 *   embedded data blocks. Four of the five rows had been carrying pre-v3 numbers
 *   (the porch ~2x low, the bathroom ~2.5x low, the pig barn on v1's broken math);
 *   only the garage, updated 7/29, was current. Added the delivery-tier explainer —
 *   the tool prices every scope at Solo GC / GC / Design-Build and none of that
 *   was anywhere on the site.
 *
 * Word budget: this page is intentionally over the site budget (Jacob's call) —
 * explaining the estimator is the page's job. Keep it tabular.
 */
import { Section, Eyebrow, Reveal, Rule } from '../components/primitives.jsx';
import PigBarnCase from '../components/PigBarnCase.jsx';
import GarageCase from '../components/GarageCase.jsx';
import ContactSection from '../components/ContactSection.jsx';
import usePageMeta from '../usePageMeta.js';

/* How the tool turns one build-up into three prices. Multipliers are the live
   v3 tier values (Simple 1.25 / Moderate 1.65 / Complex 2.0–2.5 apply to
   complexity; these three apply to delivery). */
const TIERS = [
  ['Self-managed / Solo GC', 'You hire and coordinate every trade yourself', '1.25x'],
  ['General Contractor', 'One contractor runs the job with insured crews', '1.65x'],
  ['Design-Build Firm', 'Design, permits, supervision, warranty — one accountable builder', '2.0–2.5x'],
];

/* The five priority projects, republished 2026-07-31 from each v3 estimate's
   embedded data block. Ranges are the Solo GC band — the leanest tier — so they
   are directly comparable to what the two executed projects actually cost.
   `tier` is the complexity classification, which is why the spread is so wide. */
const PROJECTS = [
  { name: 'Screened porch', detail: 'Existing room → 3-season conversion', tier: 'Moderate', range: '$47,414 – 71,122' },
  { name: 'Downstairs bathroom', detail: 'Gut & reconfigure two baths', tier: 'Complex', range: '$45,561 – 72,015' },
  { name: 'Garage exterior', detail: 'Siding, doors & trim', tier: 'Simple', range: '$19,452 – 29,178', done: true },
  { name: 'Bedroom addition', detail: 'Finish-out: carpet, trim, doors, paint', tier: 'Simple', range: '$9,954 – 13,888' },
  { name: 'Pig barn teardown', detail: 'Demo & debris removal', tier: 'Simple', range: '$8,039 – 11,449', done: true },
];

function Range({ children, done }) {
  return (
    <span className={`font-hand text-xl whitespace-nowrap ${done ? 'text-brass-light' : 'text-parchment'}`}>
      {children}
    </span>
  );
}

export default function Projects() {
  usePageMeta(
    'Real Projects — Build It USA',
    'How the estimate is built, and two projects taken from estimate to finished work with every hour and dollar tracked against the plan.'
  );

  return (
    <>
      {/* Hero */}
      <section className="hero-grid max-w-container mx-auto px-5 pt-14 pb-10 mobile:pt-20">
        <Reveal className="max-w-3xl">
          <Eyebrow>My own property</Eyebrow>
          <h1 className="text-4xl mobile:text-5xl leading-tight text-parchment mt-3">
            Real scopes. Real numbers. Two built and checked.
          </h1>
        </Reveal>
      </section>

      {/* How the estimate is built */}
      <Section className="!pt-4">
        <Reveal className="max-w-3xl">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="text-3xl mobile:text-4xl text-parchment mt-2 leading-tight">
            One build-up, three prices.
          </h2>
          <p className="text-warm-sand text-lg mt-4 leading-relaxed">
            Photos and a walkthrough go in. What comes out is a real scope of work priced line by
            line — then multiplied by who you hire to do it.
          </p>
        </Reveal>

        <Reveal delay={80} className="card-workshop p-5 mobile:p-7 mt-8">
          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-iron-mid">
              {TIERS.map(([label, sub, mult]) => (
                <tr key={label} className="text-warm-sand row-live align-baseline">
                  <td className="py-3 pr-4">
                    <div className="text-parchment font-pencil-hand text-lg leading-tight">{label}</div>
                    <div className="text-warm-sand/85 text-sm mt-0.5">{sub}</div>
                  </td>
                  <td className="py-3 pl-3 text-right">
                    <span className="font-hand text-2xl text-brass-light whitespace-nowrap">{mult}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>

        <p className="text-warm-sand/85 text-sm mt-4 max-w-3xl leading-relaxed">
          Same scope, same build-up — what changes is who carries the risk, the insurance, and the
          callback. <span className="text-parchment">Every range on this page is Solo GC, the leanest
          of the three.</span> Confidence sets how wide a range is, not how high it sits; without a
          contractor's site visit the tool caps itself at 60%, so these are feasibility ranges, not bids.
        </p>
      </Section>

      <Rule />

      {/* The plan — five projects */}
      <Section>
        <Reveal className="max-w-3xl">
          <Eyebrow>The plan</Eyebrow>
          <h2 className="text-3xl mobile:text-4xl text-parchment mt-2 leading-tight">
            Five projects, priced in an afternoon.
          </h2>
        </Reveal>

        {/* Mobile: stacked */}
        <div className="space-y-2.5 mobile:hidden mt-8">
          {PROJECTS.map((p, i) => (
            <Reveal key={p.name} delay={i * 60} className="card-workshop p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="text-parchment font-pencil-hand text-lg">
                  {p.name}
                  {p.done && <span className="text-brass-light text-sm font-serif"> ✓ built</span>}
                </div>
                <Range done={p.done}>{p.range}</Range>
              </div>
              <p className="text-warm-sand text-sm mt-1">
                {p.detail} <span className="text-warm-sand/70">· {p.tier}</span>
              </p>
            </Reveal>
          ))}
        </div>

        {/* Desktop: table */}
        <Reveal className="card-workshop p-7 hidden mobile:block mt-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-brass-light font-pencil-hand">
                <th className="py-2 pr-4 font-normal">Project</th>
                <th className="py-2 px-3 font-normal">What it covers</th>
                <th className="py-2 px-3 font-normal">Complexity</th>
                <th className="py-2 pl-3 font-normal text-right">Solo GC range</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-iron-mid align-top">
              {PROJECTS.map((p) => (
                <tr key={p.name} className="text-warm-sand row-live">
                  <td className="py-3 pr-4 text-parchment font-pencil-hand whitespace-nowrap">
                    {p.name}
                    {p.done && <span className="text-brass-light text-sm font-serif"> ✓ built</span>}
                  </td>
                  <td className="py-3 px-3">{p.detail}</td>
                  <td className="py-3 px-3 whitespace-nowrap">{p.tier}</td>
                  <td className="py-3 pl-3 text-right">
                    <Range done={p.done}>{p.range}</Range>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>

        <p className="text-warm-sand/80 text-sm italic mt-4 max-w-3xl">
          Complexity is what drives the spread — a bathroom coordinates eight trades, a teardown
          coordinates none. The garage figure is the June re-issue: an in-house audit found the
          April estimate low, so it was corrected and re-priced.
        </p>
      </Section>

      <Rule />
      <PigBarnCase />
      <Rule />
      <GarageCase />

      {/* No intro copy here — the tables above have already made the case. */}
      <ContactSection
        eyebrow="Or just talk first"
        title="Start with a free intro call."
        intro=""
      />
    </>
  );
}
