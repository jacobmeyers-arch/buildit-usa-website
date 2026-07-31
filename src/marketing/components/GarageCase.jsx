/**
 * GarageCase.jsx — Real case study #2: garage exterior, executed on my own property
 * Created: 2026-07-29
 * Cut: 2026-07-31 — 626 words → ~180. The four prose paragraphs were deleted;
 *   the tables already said everything they said. Table cells compressed from
 *   sentences to phrases. One closing line survives because it is the thesis.
 *
 * Source of every figure: workspace calibration memo, 250 Hop City Rd client folder,
 * 20260729_Garage-Calibration/. Labor valued at ~$50/hr, the same convention as the
 * pig-barn case. Work performed 7/12–7/24/2026.
 */
import { Section, Eyebrow, Stat, Reveal } from './primitives.jsx';

/* Finished shot leads; before + progress run underneath. */
const HERO = '/projects/garage/garage-09.webp';
const PHOTOS = [1, 2, 3, 4, 5, 6, 7, 8].map(
  (n) => `/projects/garage/garage-${String(n).padStart(2, '0')}.webp`
);

const COMPARE = [
  ['Scope', 'Contractor job — overhead doors, openers, permit', 'Repair — I framed openings, built two swing doors on site'],
  ['Materials', '$2,535', '$2,563 in receipts'],
  ['Labor', '226 crew-hours, two people, hand methods', '74 hours — me, my tools, a pressure washer'],
  ['Surface prep', '48 hrs hand scraping, ~920 SF', '8 hrs washing + 3 scraping'],
  ['Hidden rot', 'Flagged at walkthrough, 10% reserve set', 'It was there — a full face off to the studs'],
  ['Disposal', '$475', '$423, one 10-yard pull'],
  ['Bottom line', '$19,450 – 29,180', '~$6,700 self-performed'],
];

/* The number people ask about: why $24K became $6,700.
   Four of these five have nothing to do with estimating accuracy. */
const GAP = [
  ['Options I dropped', '~$5,770', 'Overhead doors, openers, electrical, permit.'],
  ['My own labor', '~$6,800', 'A crew by hand vs. me with a pressure washer.'],
  ['Contractor margin', '~$3,700', "I don't pay myself one."],
  ['Reserve never spent', '~$1,300', 'The rot came out of my hours.'],
  ['The estimate being wrong', '~$30', 'Materials landed within one percent.'],
];

export default function GarageCase() {
  return (
    <Section>
      <Reveal className="max-w-3xl">
        <Eyebrow>Second project, executed</Eyebrow>
        <h2 className="text-3xl mobile:text-4xl text-parchment mt-2 leading-tight">
          The quote said $24,000. It cost me $6,700.
        </h2>
      </Reveal>

      {/* Photo sequence — finished first, then the build */}
      <Reveal delay={80}>
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
            1940s garage — bays reframed, a face stripped to studs, doors built on site.
          </figcaption>
        </figure>
      </Reveal>

      {/* Stat chips */}
      <div className="grid gap-4 mobile:grid-cols-3 mt-10">
        <Stat value={1} suffix="%" label="materials vs. receipts" />
        <Stat value={74} suffix=" hrs" label="actual labor, solo" delay={90} />
        <Stat value={423} prefix="$" label="dumpster — called at $475" delay={180} />
      </div>

      {/* Plan vs actual — mobile stacked */}
      <div className="mt-10 space-y-2.5 mobile:hidden">
        {COMPARE.map(([k, est, act], i) => (
          <Reveal key={k} delay={i * 50} className="card-workshop p-4">
            <div className="text-parchment font-pencil-hand">{k}</div>
            <div className="mt-2 text-sm text-warm-sand">
              <span className="text-brass-light">Estimate: </span>{est}
            </div>
            <div className="mt-1 text-sm text-parchment">
              <span className="text-brass-light">Actual: </span>{act}
            </div>
          </Reveal>
        ))}
      </div>

      {/* Plan vs actual — desktop table */}
      <Reveal className="card-workshop p-7 mt-10 hidden mobile:block">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-brass-light font-pencil-hand">
              <th className="py-2 pr-4 font-normal"></th>
              <th className="py-2 px-3 font-normal">
                Estimate{' '}
                <span className="text-warm-sand text-sm font-serif">(re-issued June 2026)</span>
              </th>
              <th className="py-2 pl-3 font-normal">Actual</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-iron-mid align-top">
            {COMPARE.map(([k, est, act]) => (
              <tr key={k} className="text-warm-sand row-live">
                <td className="py-3 pr-4 text-parchment font-pencil-hand whitespace-nowrap">{k}</td>
                <td className="py-3 px-3">{est}</td>
                <td className="py-3 pl-3 text-parchment">{act}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Reveal>

      {/* The decomposition — where the gap actually went */}
      <div className="mt-14">
        <Reveal>
          <h3 className="text-2xl mobile:text-3xl text-parchment leading-tight">
            Where the $17,600 went
          </h3>
        </Reveal>
        <div className="grid gap-4 mobile:grid-cols-2 mt-8">
          {GAP.map(([label, amount, why], i) => (
            <Reveal
              key={label}
              delay={i * 70}
              /* Five cards in two columns — the last one spans the row so it
                 reads as the punchline instead of an orphan. */
              className={`card-workshop p-6 ${i === GAP.length - 1 ? 'mobile:col-span-2' : ''}`}
            >
              <div className="flex items-baseline justify-between gap-4">
                <div className="text-parchment font-pencil-hand text-lg">{label}</div>
                <div className="font-hand text-3xl text-brass-light whitespace-nowrap">{amount}</div>
              </div>
              <p className="text-warm-sand mt-2 leading-relaxed">{why}</p>
            </Reveal>
          ))}
        </div>
      </div>

      <Reveal>
        <p className="text-parchment text-lg mt-10 max-w-3xl leading-relaxed">
          Priced for a crew working by hand — the right number for a customer, the wrong one
          for a Saturday. Knowing which you're buying is the point.
        </p>
      </Reveal>
    </Section>
  );
}
