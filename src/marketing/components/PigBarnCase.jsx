/**
 * PigBarnCase.jsx — Real case study: pig-barn demolition on my own property
 * Created: 2026-05-31
 * Cut: 2026-07-31 — 320 words → ~100. Intro, footnote, and closing paragraphs
 *   deleted; the table carried them. One closing line kept as the thesis.
 *
 * Numbers rounded for readability. Labor valued at ~$50/hr (lower-skill demo/haul;
 * Jacob's skilled rate is $70). Photos demonstrate scale.
 */
import { Section, Eyebrow, Stat, Reveal } from './primitives.jsx';
import DeliveryTiers from './DeliveryTiers.jsx';

/* Republished 2026-07-31 from the v3 estimate's data block. The page had been
   showing "~$5,200–7,800", a pre-v3 figure; the v3 Solo GC band is below. */
const TIERS = [
  ['Self-managed / Solo GC', 'You hire and coordinate every trade', '$8,039 – 11,449'],
  ['General Contractor', 'One contractor, insured crews', '$10,611 – 15,113'],
  ['Design-Build Firm', 'Design, permits, supervision, warranty', '$12,862 – 22,898'],
];

const PHOTOS = [1, 2, 3, 4, 5, 6, 7].map(
  (n) => `/projects/pigbarn/pigbarn-${String(n).padStart(2, '0')}.jpg`
);

const COMPARE = [
  ['Scope', 'From photos: clear, salvage, hand-demo, haul, dumpster', 'Ran as scoped'],
  ['Labor', '4–6 working days', '77 hrs — 15 brush · 4 tractor · 8 demo · 50 haul'],
  ['Biggest driver', 'Flagged the ~80-yd hand-carry', '50 of 77 hrs — exactly that'],
  ['Disposal', '1–2 × 30-yd dumpster', '~$800, one container'],
  ['Bottom line', '$8,039 – 11,449 at Solo GC', '~$4,700 self-performed'],
];

export default function PigBarnCase() {
  return (
    <Section>
      <Reveal className="max-w-3xl">
        <Eyebrow>First project, executed</Eyebrow>
        <h2 className="text-3xl mobile:text-4xl text-parchment mt-2 leading-tight">
          Scoped in under 10 minutes. The plan held.
        </h2>
      </Reveal>

      {/* Photo gallery — scale */}
      <Reveal delay={80}>
        <figure className="mt-10">
          <img
            src={PHOTOS[0]}
            alt="The pig barn before demolition"
            className="rounded-frame w-full object-cover max-h-[28rem]"
          />
          <div className="grid grid-cols-3 mobile:grid-cols-6 gap-3 mt-3">
            {PHOTOS.slice(1).map((src) => (
              <img key={src} src={src} alt="" className="rounded-card w-full h-24 object-cover" />
            ))}
          </div>
          <figcaption className="text-warm-sand/85 text-sm mt-3">
            ~300 SF outbuilding — overgrown, leaning, full of debris.
          </figcaption>
        </figure>
      </Reveal>

      {/* Stat chips */}
      <div className="grid gap-4 mobile:grid-cols-3 mt-10">
        <Stat value={10} prefix="< " suffix=" min" label="to a full scope + estimate" />
        <Stat value={77} suffix=" hrs" label="actual labor, inside the call" delay={90} />
        <Stat value={800} prefix="~$" label="dumpster — on the money" delay={180} />
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
                <span className="text-warm-sand text-sm font-serif">(10 min, from photos)</span>
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
        actual="~$4,700"
        note={
          <>
            The estimate priced hand demolition to a contractor standard; I used a tractor. The
            rest of the gap is margin I don't pay myself, plus the permit and hazardous-material
            handling a paid contractor owes on a building like this and an owner does not.
          </>
        }
      />

      <Reveal>
        <p className="text-parchment text-lg mt-10 max-w-3xl leading-relaxed">
          The teardown isn't the point. The ten minutes is.
        </p>
      </Reveal>
    </Section>
  );
}
