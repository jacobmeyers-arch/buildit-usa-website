/**
 * GarageCase.jsx — Real case study #2: garage exterior, executed on my own property
 * Created: 2026-07-29
 * Cut: 2026-07-31 — 626 words → ~180; the prose restated the tables.
 * Normalized: 2026-07-31 — the published comparison was apples-to-oranges: the
 *   quote carried scope that was never built (overhead doors, openers, electrical,
 *   permit) and a prep method that was never used. Both corrected so the quote
 *   compares 1:1 to the work performed. Lead-safe practice (RRP) is deliberately
 *   RETAINED — it isn't an option a customer declines, it's a cost the rule puts
 *   on a paid contractor and not on an owner, and naming it explains most of the
 *   prep gap. The prep re-price (48 → 30 mh) is Jacob's ruling, 2026-07-31.
 *
 * Figures: workspace calibration memo, 250 Hop City Rd client folder,
 * 20260729_Garage-Calibration/. Labor imputed at $50/hr, the pig-barn convention.
 * Work performed 7/12–7/24/2026.
 */
import { Section, Eyebrow, Stat, Reveal } from './primitives.jsx';
import DeliveryTiers from './DeliveryTiers.jsx';

const HERO = '/projects/garage/garage-09.webp';
const PHOTOS = [1, 2, 3, 4, 5, 6, 7, 8].map(
  (n) => `/projects/garage/garage-${String(n).padStart(2, '0')}.webp`
);

/* What changed between the estimate as issued and the estimate as compared. */
const CORRECTION = [
  ['Overhead doors, openers, electrical, permit', 'Priced', 'Removed — never built'],
  ['Surface prep', '48 hrs heavy hand scrape', '30 hrs — wash 2×, spot scrape, light sand'],
  ['Lead-safe practice', '20 hrs', 'Kept — a paid contractor owes it here'],
  ['Solo GC basis', '$19,452 – 29,178', '$15,320 – 22,980'],
];

/* Method- and scope-matched. Both columns now describe the same job. */
const COMPARE = [
  ['Scope', 'Re-side, rebuild doors, prep and paint all four faces', 'Built as scoped'],
  ['Materials', '$2,535', '$2,563 in receipts — 1% apart'],
  ['Labor', '228 crew-hours, two people, callback standard', '74 person-hours — me, my tools, a pressure washer'],
  ['Surface prep', '30 hrs — wash 2×, spot scrape, light sand', '11 hrs — 8 washing, 3 scraping'],
  ['Lead-safe practice', '20 hrs — contained wash, collected debris', 'Not required of an owner'],
  ['Hidden rot', 'Flagged at walkthrough, 10% reserve set', 'It was there — a full face off to the studs'],
  ['Disposal', '$475', '$423, one 10-yard pull'],
  ['Bottom line', '$15,320 – 22,980 at Solo GC', '~$6,700 self-performed'],
];

const TIERS = [
  ['Self-managed / Solo GC', 'You hire and coordinate every trade', '$15,320 – 22,980'],
  ['General Contractor', 'One contractor, insured crews', '$20,222 – 30,334'],
  ['Design-Build Firm', 'Design, permits, supervision, warranty', '$24,512 – 45,960'],
];

/* Sums to the $12,465 gap. Exactly one row is an estimating error, and it is
   the smallest number on the list. */
const GAP = [
  ['Labor — method and standard', '~$6,010', 'A two-person crew to callback standard, against me and my own tools.'],
  ['Contractor margin', '~$3,830', "I don't pay myself one."],
  ['Reserve never drawn', '~$1,350', 'The rot was real. It came out of my hours, not my wallet.'],
  ['Lead-safe practice', '~$1,250', "Owed by a contractor on this building. Not owed by me."],
  ['Disposal', '~$52', 'Priced 12% high.'],
  ['Materials', '−$28', 'Nothing. The takeoff was right.'],
];

export default function GarageCase() {
  return (
    <Section>
      <Reveal className="max-w-3xl">
        <Eyebrow>Second project, executed</Eyebrow>
        <h2 className="text-3xl mobile:text-4xl text-parchment mt-2 leading-tight">
          Quoted $19,150 to hire out. It cost me $6,700.
        </h2>
        <p className="text-warm-sand text-lg mt-4 leading-relaxed">
          Before comparing those two numbers I had to fix the first one. The estimate as issued
          priced work I never built and a method I never used — comparing it to the actual would
          have been dishonest in my own favour.
        </p>
      </Reveal>

      {/* Photo sequence */}
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

      {/* The correction */}
      <div className="mt-14">
        <Reveal className="max-w-3xl">
          <h3 className="text-2xl mobile:text-3xl text-parchment leading-tight">
            Fixing the quote first
          </h3>
        </Reveal>
        <Reveal delay={80} className="card-workshop p-5 mobile:p-7 mt-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-brass-light font-pencil-hand">
                <th className="py-2 pr-4 font-normal"></th>
                <th className="py-2 px-3 font-normal">As issued</th>
                <th className="py-2 pl-3 font-normal">Corrected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-iron-mid align-top">
              {CORRECTION.map(([k, was, now]) => (
                <tr key={k} className="text-warm-sand row-live">
                  <td className="py-3 pr-4 text-parchment font-pencil-hand">{k}</td>
                  <td className="py-3 px-3">{was}</td>
                  <td className="py-3 pl-3 text-parchment">{now}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </div>

      {/* Why the prep line was wrong — the lead-safe explanation */}
      <Reveal className="card-workshop p-6 mobile:p-8 mt-8 max-w-3xl">
        <Eyebrow>Why the prep line was wrong</Eyebrow>
        <p className="text-warm-sand mt-3 leading-relaxed">
          Photographs show you a building has failing paint. They don't show you how much of it is
          loose. So the estimate priced the safe answer — scrape it all by hand.
        </p>
        <p className="text-warm-sand mt-3 leading-relaxed">
          There's a second reason it priced that way. Lead-safe work practice binds a contractor
          working for pay on a building this old: contained wash area, collected debris, bagged
          disposal. You don't freely blast paint chips off a building somebody is paying you to
          work on. <span className="text-parchment">That rule doesn't reach an owner working on his
          own building.</span> I washed it — twice, all four sides — and 48 hours of scraping became
          8 hours of washing plus 3 of spot-scraping.
        </p>
        <p className="text-parchment mt-3 leading-relaxed">
          So the corrected quote prices the method I actually used, and still carries the 20 hours
          of lead-safe practice a contractor could not skip. That single distinction is most of the
          prep gap — and none of it is the estimate being wrong.
        </p>
      </Reveal>

      {/* Stat chips */}
      <div className="grid gap-4 mobile:grid-cols-3 mt-12">
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
              <span className="text-brass-light">Corrected estimate: </span>{est}
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
                Corrected estimate{' '}
                <span className="text-warm-sand text-sm font-serif">(scope- and method-matched)</span>
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

      <DeliveryTiers
        rows={TIERS}
        actual="$6,685"
        note="Same corrected scope, priced at each delivery model. I sit below the leanest of the three because I am the crew, the margin, and the warranty."
      />

      {/* The decomposition */}
      <div className="mt-14">
        <Reveal>
          <h3 className="text-2xl mobile:text-3xl text-parchment leading-tight">
            Where the $12,465 went
          </h3>
        </Reveal>
        <div className="grid gap-4 mobile:grid-cols-2 mt-8">
          {GAP.map(([label, amount, why], i) => (
            <Reveal
              key={label}
              delay={i * 70}
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
          Priced for a crew working by hand, insured, to a standard they have to come back and
          stand behind — the right number for a customer, the wrong one for a Saturday. Knowing
          which you're buying is the point.
        </p>
        <p className="text-warm-sand/85 text-sm mt-4 max-w-3xl italic">
          Figures rounded. Labor imputed at $50/hr. Materials are receipts; hours are my own record.
        </p>
      </Reveal>
    </Section>
  );
}
