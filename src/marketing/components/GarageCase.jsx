/**
 * GarageCase.jsx — Real case study #2: garage exterior, executed on my own property
 * Created: 2026-07-29
 *
 * The second project taken from estimate to finished work with hours and receipts
 * tracked against the plan. Unlike the pig barn, the scope changed mid-stream —
 * options were priced and then dropped — so the honest story is the breakdown of
 * WHY the final number is a quarter of the quote, not the ratio itself.
 *
 * Source of every figure: workspace calibration memo, 250 Hop City Rd client folder,
 * 20260729_Garage-Calibration/. Labor valued at ~$50/hr, the same convention as the
 * pig-barn case. Work performed 7/12–7/24/2026.
 */
import { Section, Eyebrow, Card } from './primitives.jsx';

/* Finished shot leads; before + progress run underneath. */
const HERO = '/projects/garage/garage-09.webp';
const PHOTOS = [1, 2, 3, 4, 5, 6, 7, 8].map(
  (n) => `/projects/garage/garage-${String(n).padStart(2, '0')}.webp`
);

const STATS = [
  ['1%', 'materials — the estimate against my receipts'],
  ['74 hrs', 'actual labor — solo, plus 4 hours of help'],
  ['$423', 'dumpster — called at $475'],
];

const COMPARE = [
  [
    'Scope of work',
    'Re-side, rebuild the doors, scrape and repaint all four faces — priced as a contractor job with overhead doors, openers, a permit and lead-safe site practice',
    'Built as a repair. I framed the openings and built two swing doors on site. No overhead doors, no openers, no permit',
  ],
  [
    'Materials',
    '$2,535 for the scope I actually built',
    '$2,563 in receipts — one percent apart',
  ],
  [
    'Labor',
    '226 crew-hours — two people, hand methods, callback standard',
    '74 person-hours — me, my own tools, and a pressure washer',
  ],
  [
    'Surface prep',
    '48 hours of hand scraping across ~920 SF',
    '8 hours washing + 3 hours scraping. Different method, not a faster worker',
  ],
  [
    'Hidden rot',
    'Flagged at the walkthrough — "only verifiable by scraping" — and a 10% reserve set aside for it',
    'It was there. A full face came off to the studs, insulation and all',
  ],
  [
    'Disposal',
    '$475, one pull',
    '$422.65, one 10-yard pull',
  ],
  [
    'Bottom line',
    '$19,450 – 29,180 at contractor rates',
    '~$6,700 self-performed, on a scope I cut down',
  ],
];

/* The number people actually ask about: why $24K became $6,700.
   Four of these five have nothing to do with estimating accuracy. */
const GAP = [
  ['Options I dropped', '~$5,770', 'Overhead doors, openers, electrical, permit, lead-safe site practice. All priced, none bought.'],
  ['My own labor', '~$6,800', 'A two-person crew working by hand, against me with a pressure washer and no schedule.'],
  ['Contractor margin', '~$3,700', "I don't pay myself a margin. A real contractor has to."],
  ['Reserve never spent', '~$1,300', 'The rot money. The rot was real — it came out of my hours instead of my wallet.'],
  ['The estimate being wrong', '~$30', 'Materials landed within one percent. That is the whole estimating error.'],
];

export default function GarageCase() {
  return (
    <Section>
      <Eyebrow>The proof — a second project, executed</Eyebrow>
      <h2 className="text-3xl mobile:text-4xl text-parchment mt-2 leading-tight max-w-3xl">
        The quote said $24,000. It cost me $6,700. Here's every dollar of that difference.
      </h2>
      <p className="text-warm-sand text-lg mt-4 leading-relaxed max-w-3xl">
        A 1940s garage — 920 SF of failing paint, rotted bottom courses, and two barn doors held
        together by habit. It was estimated in April, re-estimated in June after an in-house audit
        caught errors in the first pass, and built in July. I tracked every hour and kept every
        receipt. A gap that big usually means somebody's number was fiction. This one breaks down
        into five parts, and only one of them is the estimate.
      </p>

      {/* Photo sequence — finished first, then the build */}
      <figure className="mt-10">
        <img
          src={HERO}
          alt="The garage after — new siding, rebuilt doors, two coats of black"
          className="rounded-frame w-full object-cover max-h-[28rem]"
        />
        <div className="grid grid-cols-4 mobile:grid-cols-8 gap-3 mt-3">
          {PHOTOS.map((src) => (
            <img key={src} src={src} alt="" className="rounded-card w-full h-24 object-cover" />
          ))}
        </div>
        <figcaption className="text-warm-sand/85 text-sm mt-3">
          Before, mid-build, and finished — bays reframed, a face stripped to the studs, doors built
          on site, two coats over the whole building.
        </figcaption>
      </figure>

      {/* Stat chips */}
      <div className="grid gap-4 mobile:grid-cols-3 mt-10">
        {STATS.map(([n, l]) => (
          <Card key={l} className="text-center">
            <div className="font-hand text-4xl text-brass-light leading-none">{n}</div>
            <p className="text-warm-sand mt-2">{l}</p>
          </Card>
        ))}
      </div>

      {/* Plan vs actual — mobile stacked */}
      <div className="mt-10 space-y-3 mobile:hidden">
        {COMPARE.map(([k, est, act]) => (
          <div key={k} className="card-workshop p-4">
            <div className="text-parchment font-pencil-hand">{k}</div>
            <div className="mt-2 text-sm text-warm-sand">
              <span className="text-brass-light">The estimate: </span>{est}
            </div>
            <div className="mt-1 text-sm text-parchment">
              <span className="text-brass-light">Actual: </span>{act}
            </div>
          </div>
        ))}
      </div>

      {/* Plan vs actual — desktop table */}
      <div className="card-workshop p-7 mt-10 hidden mobile:block">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-brass-light font-pencil-hand">
              <th className="py-2 pr-4 font-normal"></th>
              <th className="py-2 px-3 font-normal">
                The estimate{' '}
                <span className="text-warm-sand text-sm font-serif">(re-issued June 2026)</span>
              </th>
              <th className="py-2 pl-3 font-normal">Actual</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-iron-mid align-top">
            {COMPARE.map(([k, est, act]) => (
              <tr key={k} className="text-warm-sand">
                <td className="py-2.5 pr-4 text-parchment font-pencil-hand whitespace-nowrap">{k}</td>
                <td className="py-2.5 px-3">{est}</td>
                <td className="py-2.5 pl-3 text-parchment">{act}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* The decomposition — the honest answer to "why so far off" */}
      <div className="mt-14">
        <h3 className="text-2xl mobile:text-3xl text-parchment leading-tight max-w-3xl">
          Where the $17,600 went
        </h3>
        <p className="text-warm-sand mt-3 max-w-3xl leading-relaxed">
          A quote is a price for someone else to do the work, insured, to a standard they have to
          come back and stand behind. Doing it yourself removes most of that — and every piece of it
          can be named.
        </p>
        <div className="grid gap-4 mobile:grid-cols-2 mt-8">
          {GAP.map(([label, amount, why]) => (
            <div key={label} className="card-workshop p-6">
              <div className="flex items-baseline justify-between gap-4">
                <div className="text-parchment font-pencil-hand text-lg">{label}</div>
                <div className="font-hand text-3xl text-brass-light whitespace-nowrap">{amount}</div>
              </div>
              <p className="text-warm-sand mt-3 leading-relaxed">{why}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-warm-sand/85 text-sm italic mt-8 max-w-3xl">
        Labor valued at ~$50/hr, the same convention as the pig barn. The April estimate on this
        building was audited in-house that June and re-issued — the earlier figure was low, and the
        number above is the current one. Hours are my own record; materials are receipts.
      </p>

      <p className="text-parchment text-lg mt-6 max-w-3xl leading-relaxed">
        Here's what I take from it. The materials takeoff was right to a percent, the rot got called
        before anyone touched the wall, and the dumpster came in where it was priced. The labor was
        priced for a crew doing it by hand — which is the correct number to hand a customer, and the
        wrong number for a Saturday. Knowing which of those you're buying is the entire point of
        having a real estimate in front of you.
      </p>
    </Section>
  );
}
