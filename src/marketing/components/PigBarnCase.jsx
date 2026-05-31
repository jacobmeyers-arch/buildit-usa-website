/**
 * PigBarnCase.jsx — Real case study: 250 Hop City Rd pig-barn demolition
 * Created: 2026-05-31
 *
 * Shows the AI estimate vs. the actual outcome and the <10-minute SOW time-save.
 * Numbers rounded for readability. Labor valued at ~$50/hr (lower-skill demo/haul;
 * Jacob's skilled rate is $70). Photos demonstrate scale.
 */
import { Section, Eyebrow, Card } from './primitives.jsx';

const PHOTOS = [1, 2, 3, 4, 5, 6, 7].map(
  (n) => `/projects/pigbarn/pigbarn-${String(n).padStart(2, '0')}.jpg`
);

const STATS = [
  ['< 10 min', 'to a full scope + estimate'],
  ['77 hrs', 'actual labor — inside the 4–6 day call'],
  ['~$800', 'dumpster — on the money'],
];

const COMPARE = [
  ['Scope of work', 'Full SOW from photos: clear, salvage, hand-demo, haul, dumpster', 'Ran as scoped'],
  ['Labor', '4–6 working days', '77 hrs — 15 brush · 4 tractor · 8 demo · 50 haul'],
  ['Biggest cost driver', 'Flagged the ~80-yd hand-carry to the dumpster', '50 of 77 hrs — exactly that'],
  ['Disposal', '1–2 × 30-yd dumpster', '~$800, one container'],
  ['Bottom line', '~$5,200–$7,800 contractor price', '~$4,700 self-performed'],
];

export default function PigBarnCase() {
  return (
    <Section>
      <Eyebrow>The proof — one project, executed</Eyebrow>
      <h2 className="text-3xl mobile:text-4xl text-parchment mt-2 leading-tight max-w-3xl">
        Scoped in under 10 minutes. The plan held.
      </h2>
      <p className="text-warm-sand text-lg mt-4 leading-relaxed max-w-3xl">
        Estimates are easy to doubt — so I executed one. Of the five, the pig-barn teardown is the
        project I did myself, tracking every hour and dollar against what the plan said. From photos
        of an old ~300 SF post-and-beam barn, the system wrote a full scope, a priced estimate, and
        a confidence range in under ten minutes. Then I tore it down. Here's the plan against the actuals.
      </p>

      {/* Photo gallery — scale */}
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
        <figcaption className="text-warm-sand/70 text-sm mt-3">
          ~300 SF outbuilding (20′ × 15′ × 9′) — overgrown, leaning, full of debris.
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

      {/* AI vs actual */}
      {/* Mobile: stacked — fits the screen, no horizontal scroll */}
      <div className="mt-8 space-y-3 mobile:hidden">
        {COMPARE.map(([k, ai, act]) => (
          <div key={k} className="card-workshop p-4">
            <div className="text-parchment font-pencil-hand">{k}</div>
            <div className="mt-2 text-sm text-warm-sand">
              <span className="text-brass-light">AI estimate (10 min): </span>{ai}
            </div>
            <div className="mt-1 text-sm text-parchment">
              <span className="text-brass-light">Actual: </span>{act}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="card-workshop p-7 mt-8 hidden mobile:block">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-brass-light font-pencil-hand">
              <th className="py-2 pr-4 font-normal"></th>
              <th className="py-2 px-3 font-normal">
                AI estimate <span className="text-warm-sand text-sm font-serif">(10 min)</span>
              </th>
              <th className="py-2 pl-3 font-normal">Actual</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-iron-mid align-top">
            {COMPARE.map(([k, ai, act]) => (
              <tr key={k} className="text-warm-sand">
                <td className="py-2.5 pr-4 text-parchment font-pencil-hand whitespace-nowrap">{k}</td>
                <td className="py-2.5 px-3">{ai}</td>
                <td className="py-2.5 pl-3 text-parchment">{act}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-warm-sand/70 text-sm italic mt-4 max-w-3xl">
        Labor valued at ~$50/hr (lower-skill demo &amp; haul-off; my skilled rate is $70). Figures
        rounded. The estimate also caught the lead-paint risk and the salvage worth keeping —
        siding, doors, and hardware.
      </p>

      <p className="text-parchment text-lg mt-6 max-w-3xl leading-relaxed">
        The point isn't the teardown — it's that the scoping and estimating took ten minutes, and
        the plan was right. That's the same system the training sets up for your work.
      </p>
    </Section>
  );
}
