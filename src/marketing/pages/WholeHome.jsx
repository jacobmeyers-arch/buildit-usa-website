/**
 * WholeHome.jsx — Whole-Home Planner service page
 * Created: 2026-05-31
 *
 * The estimating service as its own offering (sibling to Training). $500 for the
 * five priority projects on a property. Built around one real worked example: my
 * own property at 250 Hop City Rd — five projects scoped and priced in a single
 * sitting (drawn from a 9-project trial run). Per-project ranges only, no grand
 * total. Then the pig-barn block (PigBarnCase) is the proof: I executed one and
 * the plan held. Copy drafted from context; review/edit freely.
 */
import { Section, SectionHeading, Card, CTA, Eyebrow } from '../components/primitives.jsx';
import ContactForm from '../components/ContactForm.jsx';
import PigBarnCase from '../components/PigBarnCase.jsx';
import { CONTACT } from '../config.js';

/* The 250 Hop City plan — the five priority projects. Ranges are the
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
      'Full demo — drywall, insulation, carpet, subfloor, old windows, baseboard heat',
      'Floor joist + carrying beam reinforcement to kill the deflection',
      'Frame 8 floor-to-ceiling screen openings with structural headers',
      'New PT pine deck floor (~235 SF) + siding to match the house',
      'Pellet stove with chimney liner and a new ceiling fan',
    ],
    driver:
      "The carrying beam can't be inspected until demo — reinforce vs. full replacement is a $1,500–3,000 swing.",
  },
  {
    name: 'Downstairs bathroom',
    timeline: 'Est. 3–4 weeks',
    today: '58%',
    todayRange: '$20,670 – 31,650',
    likely: '$24,190 – 28,130',
    photos: ['/projects/bathroom/bathroom-before.webp'],
    scope: [
      'Gut both bathrooms to studs and subfloor',
      'Relocate a non-bearing wall → one full bath + one half bath',
      'All-new plumbing rough-in and electrical circuits (GFCIs, fan, lighting)',
      'Tile floors (~62 SF) + tub surround (~50 SF), two vanities, tub, two toilets',
      'New drywall, trim, doors, and paint throughout',
    ],
    driver:
      'Material grade is the lever — jumping from mid-range tile and fixtures to high-end adds $2,000–5,000+.',
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
      'Swap two swing barn doors for two new overhead garage doors',
      'Scrape and repaint all four faces — heavy prep on peeling clapboard',
      'Targeted siding replacement (bottom courses + damaged sections) and trim',
      'Full door-trim repair around both bays',
      'Scrape and repaint the upper loft door',
    ],
    driver:
      'Door choice is the single biggest variable — overhead vs. swing moves material $500–1,500; hidden rot adds ~$15–25/SF.',
  },
  {
    name: 'Bedroom addition',
    timeline: 'Est. 5–8 working days',
    today: '67%',
    todayRange: '$7,640 – 12,360',
    likely: '$8,750 – 11,250',
    photos: [
      '/projects/bedroom/bedroom-01.webp',
      '/projects/bedroom/bedroom-02.webp',
    ],
    scope: [
      'Mid-grade carpet + pad — bedroom, closet, landing (~260 SF)',
      'Built-up baseboard, window, and door casing milled to match the old house',
      'Two prehung interior doors + a site-built custom door into the old house',
      'Hang and wire a ceiling fan and baseboard heat to existing rough-ins',
      'Two coats of paint on all walls and new trim',
    ],
    driver:
      'The custom door into the old house is the wildcard — a narrow, angled opening priced site-built; structural changes push it up.',
  },
];

/* What the $500 report delivers. */
const DELIVERS = [
  ['Every project, scoped', 'A clear scope of work for each project on the property — not a vague wishlist, an actual plan you can hand to a contractor.'],
  ['Priced with a range', 'A realistic cost band for each one, with the big drivers called out, so nothing blindsides you later.'],
  ['Prioritized & sequenced', 'What to do first, what can wait, and what pairs well together — ordered by cost, urgency, and what unlocks what.'],
  ['One document', 'It all lands in a single Whole-Home Report you can budget against, share, and work down over years.'],
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
          <p className="text-warm-sand/70 text-sm mt-1">{p.timeline}</p>
        </div>
        <div className="mobile:text-right">
          <div className="font-hand text-3xl text-brass-light leading-none">{p.likely}</div>
          <p className="text-warm-sand/70 text-sm mt-1">likely range</p>
        </div>
      </div>

      {p.photos && (
        <div className="flex flex-col mobile:flex-row gap-3 mt-6">
          {p.photos.map((src) => (
            <img
              key={src}
              src={src}
              alt=""
              className="rounded-card w-full mobile:flex-1 h-60 mobile:h-52 object-cover"
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

export default function WholeHome() {
  return (
    <>
      {/* Hero */}
      <section className="max-w-container mx-auto px-5 pt-20 pb-12 mobile:pt-28">
        <div className="max-w-3xl">
          <Eyebrow>Whole-Home Planner</Eyebrow>
          <h1 className="text-4xl mobile:text-5xl leading-tight text-parchment mt-3">
            Every project on your property — scoped, priced, and put in order.
          </h1>
          <p className="text-warm-sand text-lg mt-6 leading-relaxed">
            Most homeowners juggle a mental list of "someday" projects with no real plan and no
            real numbers. The Whole-Home Planner turns that into one document: your five priority
            projects scoped, a cost range on each, and a sensible order to tackle them — so you can
            budget years out instead of guessing one quote at a time.
          </p>
          <div className="flex flex-wrap gap-4 mt-9">
            <CTA href="#contact" variant="light">Get your plan — $500</CTA>
            <CTA to="/training" variant="ghost">See the training</CTA>
          </div>
        </div>
      </section>

      <div className="wood-divider max-w-container mx-auto" />

      {/* The worked example — 250 Hop City */}
      <Section>
        <SectionHeading
          eyebrow="A real plan — my own property"
          title="250 Hop City Rd: five projects in an afternoon."
          intro="I pointed the system at my own house and outbuildings. In one sitting it produced a full plan — five priority projects, each scoped and priced. The kind of whole-property picture that's normally weeks of contractor visits and still no document at the end."
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

        <p className="text-warm-sand/70 text-sm italic mt-4 max-w-3xl">
          Ranges are the realistic "likely" band for each project. Shown per project on purpose —
          so you can prioritize and sequence the work rather than stare at one intimidating lump
          sum. The plan is built to be worked down over years.
        </p>

        {/* Per-project detail — the estimate behind each number */}
        <div className="mt-14">
          <h3 className="text-2xl mobile:text-3xl text-parchment leading-tight">
            What's behind each number
          </h3>
          <p className="text-warm-sand mt-3 max-w-3xl leading-relaxed">
            Each estimate is a real scope of work, not a guess — here's the plan for the four I
            haven't built yet, with how the range tightens after a contractor walks it and the one
            variable most likely to move the price. The fifth, I didn't just estimate. I built it →
          </p>
          <div className="space-y-5 mt-8">
            {DETAILS.map((p) => (
              <ProjectDetail key={p.name} p={p} />
            ))}
          </div>
        </div>
      </Section>

      <div className="wood-divider max-w-container mx-auto" />

      {/* The proof — pig barn executed (reused case-study component) */}
      <PigBarnCase />

      <div className="wood-divider max-w-container mx-auto" />

      {/* What you get */}
      <Section>
        <SectionHeading
          eyebrow="What you get"
          title="One report. Five projects. The whole plan."
          intro="The plan isn't a stack of estimates — it's a single document built to budget against and work down over time."
        />
        <div className="grid gap-6 mobile:grid-cols-2 mt-10">
          {DELIVERS.map(([title, body]) => (
            <Card key={title}>
              <h3 className="text-xl text-parchment">{title}</h3>
              <p className="text-warm-sand mt-2 leading-relaxed">{body}</p>
            </Card>
          ))}
        </div>
      </Section>

      <div className="wood-divider max-w-container mx-auto" />

      {/* Price + contact */}
      <Section id="contact">
        <div className="grid gap-10 mobile:grid-cols-[1fr_1.2fr] items-start">
          <div>
            <Eyebrow>Get your plan</Eyebrow>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-hand text-6xl text-brass-light leading-none">$500</span>
              <span className="text-warm-sand text-lg">five projects</span>
            </div>
            <p className="text-warm-sand text-lg mt-5 leading-relaxed">
              One flat price for your five priority projects — each one scoped and priced into a
              single plan. Tell me about your place below and I'll get you started.
            </p>
            <div className="mt-8 space-y-2">
              <a href={`mailto:${CONTACT.email}`} className="block text-parchment hover:text-brass-light transition-colors break-all">
                {CONTACT.email}
              </a>
              <a href={CONTACT.phoneHref} className="block text-parchment hover:text-brass-light transition-colors">
                {CONTACT.phone}
              </a>
            </div>
          </div>
          <ContactForm />
        </div>
      </Section>
    </>
  );
}
