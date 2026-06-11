/**
 * Projects.jsx — Real projects: the worked whole-property plan + the executed pig barn
 * Created: 2026-06-11
 *
 * The proof page. Holds the case-study material that used to live inside the
 * Whole-Home Planner page: the five-project plan on my own property (table +
 * per-project estimate details) and the pig-barn plan-vs-actual (PigBarnCase).
 * The planner page now sells; this page proves. Both case studies stay on one
 * page (SIMPLE baseline) — split into per-project pages only if this grows.
 */
import { Section, SectionHeading, Eyebrow, CTA } from '../components/primitives.jsx';
import PigBarnCase from '../components/PigBarnCase.jsx';
import ContactSection from '../components/ContactSection.jsx';
import usePageMeta from '../usePageMeta.js';

/* The plan — the five priority projects. Ranges are the
   confidence-compressed "likely" band from each estimate (the full ranges run
   wider). `done` marks the one project actually executed. */
const PROJECTS = [
  { name: 'Screened porch', detail: 'Existing room → 3-season conversion', range: '$27,900 – 32,420' },
  { name: 'Downstairs bathroom', detail: 'Gut & reconfigure (2 full → 1 full + 1 half)', range: '$24,190 – 28,130' },
  { name: 'Garage exterior', detail: 'Siding, doors & trim', range: '$11,450 – 13,300' },
  { name: 'Bedroom addition', detail: 'Finish-out: carpet, trim, doors, paint', range: '$8,750 – 11,250' },
  { name: 'Pig barn teardown', detail: 'Demo & debris removal — built, see below', range: '$5,990 – 6,970', done: true },
];

/* Per-project estimate detail — the "AI estimate" view (scope, how the range
   tightens from a first pass to an 85% post-walk band, and the single biggest
   cost driver) for the four estimate-only projects. The pig barn gets its full
   plan-vs-actual treatment below. */
const DETAILS = [
  {
    name: 'Screened porch',
    timeline: 'Est. 3–4 weeks',
    today: '60%',
    todayRange: '$24,130 – 36,190',
    likely: '$27,900 – 32,420',
    photos: ['/projects/porch/porch-01.webp'],
    scope: [
      'Full demo + floor framing reinforced to kill the deflection',
      'Frame 8 floor-to-ceiling screen openings with structural headers',
      'New PT deck floor (~235 SF), matching siding, pellet stove',
    ],
    driver:
      "Carrying beam can't be inspected until demo — reinforce vs. replace is a $1,500–3,000 swing.",
  },
  {
    name: 'Downstairs bathroom',
    timeline: 'Est. 3–4 weeks',
    today: '58%',
    todayRange: '$20,670 – 31,650',
    likely: '$24,190 – 28,130',
    scope: [
      'Gut both baths; relocate a wall → one full + one half bath',
      'All-new plumbing rough-in and electrical (GFCIs, fan, lighting)',
      'Tile floors + tub surround, two vanities, tub, two toilets, paint',
    ],
    driver:
      'Material grade is the lever — mid-range to high-end tile and fixtures adds $2,000–5,000+.',
  },
  {
    name: 'Garage exterior',
    timeline: 'Est. 5–8 working days',
    today: '58%',
    todayRange: '$9,770 – 14,970',
    likely: '$11,450 – 13,300',
    photos: [
      '/projects/garage/garage-01.webp',
      '/projects/garage/garage-02.webp',
    ],
    scope: [
      'Swap two swing barn doors for two new overhead doors',
      'Scrape and repaint all four faces — heavy prep on peeling clapboard',
      'Targeted siding + trim replacement; repair both door surrounds',
    ],
    driver:
      'Door choice drives it — overhead vs. swing moves material $500–1,500; hidden rot adds ~$15–25/SF.',
  },
  {
    name: 'Bedroom addition',
    timeline: 'Est. 5–8 working days',
    today: '67%',
    todayRange: '$7,640 – 12,360',
    likely: '$8,750 – 11,250',
    scope: [
      'Mid-grade carpet + pad — bedroom, closet, landing (~260 SF)',
      'Trim milled to match the old house; three interior doors',
      'Ceiling fan, baseboard heat, two coats of paint throughout',
    ],
    driver:
      'The custom door into the old house is the wildcard — a narrow, angled opening priced site-built.',
  },
];

function RangePill({ children, tone = 'default' }) {
  const cls = tone === 'done' ? 'text-brass-light' : 'text-parchment';
  return <span className={`font-hand text-xl whitespace-nowrap ${cls}`}>{children}</span>;
}

/* One estimate broken down the way the pig barn is — scope, range tightening,
   and the biggest cost driver — minus the "actual" column (these weren't built). */
function ProjectDetail({ p }) {
  return (
    <div className="card-workshop p-6 mobile:p-8">
      <div className="flex flex-col gap-2 mobile:flex-row mobile:items-start mobile:justify-between">
        <div>
          <h4 className="text-2xl text-parchment font-pencil-hand leading-tight">{p.name}</h4>
          <p className="text-warm-sand/80 text-sm mt-1">{p.timeline}</p>
        </div>
        <div className="mobile:text-right">
          <div className="font-hand text-3xl text-brass-light leading-none">{p.likely}</div>
          <p className="text-warm-sand/80 text-sm mt-1">likely range</p>
        </div>
      </div>

      {p.photos && (
        <div className="flex flex-col mobile:flex-row gap-3 mt-6">
          {p.photos.map((src) => (
            <img
              key={src}
              src={src}
              alt=""
              className={`rounded-card w-full object-cover mobile:flex-1 ${
                p.portrait ? 'aspect-[3/4] max-w-xs' : 'aspect-[4/3]'
              } ${p.photos.length === 1 && !p.portrait ? 'mobile:max-w-lg' : ''}`}
            />
          ))}
        </div>
      )}

      <div className="grid gap-x-8 gap-y-2 mt-6 mobile:grid-cols-2">
        {p.scope.map((s) => (
          <div key={s} className="flex gap-2 text-warm-sand leading-relaxed">
            <span className="text-brass-light" aria-hidden="true">—</span>
            <span>{s}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-4 mt-7 mobile:grid-cols-2">
        <div className="border border-iron-mid rounded-card p-4">
          <span className="font-pencil-hand text-brass-light text-sm uppercase tracking-widest">
            How the range tightens
          </span>
          <p className="text-warm-sand text-sm mt-2">
            Today <span className="text-parchment">{p.today}</span>: {p.todayRange}
          </p>
          <p className="text-warm-sand text-sm mt-1">
            After a contractor walk <span className="text-parchment">85%</span>: {p.likely}
          </p>
        </div>
        <div className="border border-iron-mid rounded-card p-4">
          <span className="font-pencil-hand text-brass-light text-sm uppercase tracking-widest">
            Biggest variable
          </span>
          <p className="text-warm-sand text-sm mt-2">{p.driver}</p>
        </div>
      </div>
    </div>
  );
}

export default function Projects() {
  usePageMeta(
    'Real Projects — Build It USA',
    'Real scopes and real numbers: a five-project whole-property plan, and one project executed and tracked against the plan. Judge the work, not the pitch.'
  );

  return (
    <>
      {/* Hero */}
      <section className="max-w-container mx-auto px-5 pt-20 pb-12 mobile:pt-28">
        <div className="max-w-3xl">
          <Eyebrow>Real projects</Eyebrow>
          <h1 className="text-4xl mobile:text-5xl leading-tight text-parchment mt-3">
            Real scopes. Real numbers. One built and checked.
          </h1>
          <p className="text-warm-sand text-lg mt-6 leading-relaxed">
            Everything here is from my own property, with the numbers public: five projects scoped
            and priced in an afternoon, then one executed with every hour and dollar tracked
            against the plan. Judge the work, not the pitch.
          </p>
        </div>
      </section>

      <div className="wood-divider max-w-container mx-auto" />

      {/* The worked example — my own property */}
      <Section>
        <SectionHeading
          eyebrow="Case study 1 — the whole-property plan"
          title="Five projects in an afternoon."
          intro="I pointed the system at my own house and outbuildings. In one sitting it produced a full plan — five priority projects, each scoped and priced — the kind of whole-property picture that's normally weeks of contractor visits."
        />

        {/* Project list — mobile stacked */}
        <div className="mt-10 space-y-3 mobile:hidden">
          {PROJECTS.map((p) => (
            <div key={p.name} className="card-workshop p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="text-parchment font-pencil-hand text-lg">{p.name}</div>
                <RangePill tone={p.done ? 'done' : 'default'}>{p.range}</RangePill>
              </div>
              <p className="text-warm-sand text-sm mt-1">{p.detail}</p>
            </div>
          ))}
        </div>

        {/* Project list — desktop table */}
        <div className="card-workshop p-7 mt-10 hidden mobile:block">
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
                <tr key={p.name} className="text-warm-sand">
                  <td className="py-2.5 pr-4 text-parchment font-pencil-hand whitespace-nowrap">
                    {p.name}
                    {p.done && <span className="text-brass-light text-sm font-serif"> ✓ built</span>}
                  </td>
                  <td className="py-2.5 px-3">{p.detail}</td>
                  <td className="py-2.5 pl-3 text-right">
                    <RangePill tone={p.done ? 'done' : 'default'}>{p.range}</RangePill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-warm-sand/80 text-sm italic mt-4 max-w-3xl">
          Ranges are the realistic "likely" band, shown per project so you can prioritize and
          sequence the work instead of staring at one intimidating lump sum.
        </p>

        {/* Per-project detail — the estimate behind each number */}
        <div className="mt-14">
          <h3 className="text-2xl mobile:text-3xl text-parchment leading-tight">
            What's behind each number
          </h3>
          <p className="text-warm-sand mt-3 max-w-3xl leading-relaxed">
            Each estimate is a real scope of work — here are the four I haven't built yet, with how
            the range tightens after a contractor walk. The fifth I didn't just estimate — I built it →
          </p>
          <div className="space-y-5 mt-8">
            {DETAILS.map((p) => (
              <ProjectDetail key={p.name} p={p} />
            ))}
          </div>
        </div>
      </Section>

      <div className="wood-divider max-w-container mx-auto" />

      {/* Case study 2 — the executed pig barn (plan vs. actual) */}
      <PigBarnCase />

      <div className="wood-divider max-w-container mx-auto" />

      {/* Cross-sell — get this for your place */}
      <Section className="!pt-4">
        <div className="card-workshop p-8 mobile:p-10 grid gap-6 mobile:grid-cols-[1.4fr_1fr] items-center">
          <div>
            <Eyebrow>Want this for your place?</Eyebrow>
            <h2 className="text-3xl mobile:text-4xl text-parchment mt-2 leading-tight">
              The Whole-Home Planner is exactly this — for your property.
            </h2>
            <p className="text-warm-sand text-lg mt-4 leading-relaxed">
              Five priority projects scoped, priced, and put in order, delivered as one report you
              can budget against for years. $500 flat.
            </p>
          </div>
          <div className="mobile:text-right">
            <CTA to="/whole-home-planner" variant="light">See the planner</CTA>
          </div>
        </div>
      </Section>

      <ContactSection
        eyebrow="Or just talk first"
        title="Start with a free intro call."
        intro="Questions about a project, the planner, or what AI could do for your own work — reach out and I'll get back to you personally."
      />
    </>
  );
}
