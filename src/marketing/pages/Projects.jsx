/**
 * Projects.jsx — The proof page. Photos and tables, almost no prose.
 * Created: 2026-06-11
 * Cut: 2026-07-31 — the three "what's behind each number" scope cards and the
 *   cross-sell block were deleted; the table already carries that information.
 *   Depth lives in the two executed case studies below, which are the product.
 */
import { Section, Eyebrow, Reveal, Rule } from '../components/primitives.jsx';
import PigBarnCase from '../components/PigBarnCase.jsx';
import GarageCase from '../components/GarageCase.jsx';
import ContactSection from '../components/ContactSection.jsx';
import usePageMeta from '../usePageMeta.js';

/* The five priority projects. Ranges are the confidence-compressed "likely"
   band from each estimate. `done` marks the two actually executed. */
const PROJECTS = [
  { name: 'Screened porch', detail: 'Existing room → 3-season conversion', range: '$27,900 – 32,420' },
  { name: 'Downstairs bathroom', detail: 'Gut & reconfigure two baths', range: '$24,190 – 28,130' },
  { name: 'Garage exterior', detail: 'Siding, doors & trim', range: '$19,450 – 29,180', done: true },
  { name: 'Bedroom addition', detail: 'Finish-out: carpet, trim, doors, paint', range: '$8,750 – 11,250' },
  { name: 'Pig barn teardown', detail: 'Demo & debris removal', range: '$5,990 – 6,970', done: true },
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
    'Real scopes and real numbers: a five-project whole-property plan, and two projects built and tracked against it — hours, receipts, and where the estimate was wrong.'
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

      {/* The plan — five projects */}
      <Section className="!pt-6">
        {/* Mobile: stacked */}
        <div className="space-y-2.5 mobile:hidden">
          {PROJECTS.map((p, i) => (
            <Reveal key={p.name} delay={i * 60} className="card-workshop p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="text-parchment font-pencil-hand text-lg">
                  {p.name}
                  {p.done && <span className="text-brass-light text-sm font-serif"> ✓ built</span>}
                </div>
                <Range done={p.done}>{p.range}</Range>
              </div>
              <p className="text-warm-sand text-sm mt-1">{p.detail}</p>
            </Reveal>
          ))}
        </div>

        {/* Desktop: table */}
        <Reveal className="card-workshop p-7 hidden mobile:block">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-brass-light font-pencil-hand">
                <th className="py-2 pr-4 font-normal">Project</th>
                <th className="py-2 px-3 font-normal">What it covers</th>
                <th className="py-2 pl-3 font-normal text-right">Likely range</th>
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
                  <td className="py-3 pl-3 text-right">
                    <Range done={p.done}>{p.range}</Range>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>

        <p className="text-warm-sand/80 text-sm italic mt-4 max-w-3xl">
          The garage figure is the June re-issue — an in-house audit found the April estimate low.
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
