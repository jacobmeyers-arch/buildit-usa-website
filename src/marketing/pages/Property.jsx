/**
 * Property.jsx — Land, farm & home-repair services
 * Created: 2026-06-04
 *
 * The general-contracting + farm-labor + AI-planning lane. Nav label is the
 * plain word "Property"; the page headline carries the fuller story. Tied to the
 * Build It USA thesis — own your home, own your land, own your food — but led
 * with plain language, not jargon. Project-request driven: every job starts with
 * an onsite estimate.
 *
 * NOTE: copy is a first draft from context (tractors, baling, drainage, decks,
 * GC/repair, seasonal labor, AI ag planning). Review and correct the facts —
 * service list, geography, and how you want the estimate model described.
 */
import { Section, SectionHeading, Card, CTA, Eyebrow } from '../components/primitives.jsx';
import ContactSection from '../components/ContactSection.jsx';
import usePageMeta from '../usePageMeta.js';
import { CONTACT } from '../config.js';

/* The work, grouped. Edit freely — these are the buckets from our conversation. */
const SERVICES = [
  {
    title: 'Build & repair',
    body:
      'Decks, outbuildings, barns, fencing, and the general repair work any property needs. Same standards as my remodeling work, pointed at the land.',
  },
  {
    title: 'Land & drainage',
    body:
      'Drainage, grading, and the dirt work that keeps a property usable — fixing the wet spots, the runoff, and the access problems before they cost you a season.',
  },
  {
    title: 'Equipment & seasonal labor',
    body:
      'Tractor work, baling, and an extra set of skilled hands when the season is short and the farm is shorter on help. Project work or seasonal — whatever the job needs.',
  },
  {
    title: 'AI planning for your operation',
    body:
      'The part nobody else offers: AI put to work on your operation — crop and rotation planning, animal and feed logistics, yield-and-cost math, and what to put where. The same AI muscle from my training work, aimed at agriculture.',
  },
];

/* How a job runs — project-request driven, onsite estimate first. */
const STEPS = [
  ['You reach out', 'Tell me about the property and what you need done — a project, a season of help, or a plan for your operation.'],
  ['Onsite estimate', 'I come walk it. No guessing from photos — I look at the actual land, the actual problem, and scope it in person.'],
  ['You get a plan & a price', 'A real scope of work and a straight number, the same way I price everything. No surprises mid-job.'],
  ['We build it', 'The work gets done right — and if AI planning is part of it, you walk away able to run it yourself.'],
];

export default function Property() {
  usePageMeta(
    'Property — Land, Farm & Home Repair | Build It USA',
    'General contracting and farm help in the Capital District: build and repair, drainage and land work, equipment and seasonal labor, plus AI planning for your operation.'
  );

  return (
    <>
      {/* Hero — plain headline, concrete work named immediately */}
      <section className="max-w-container mx-auto px-5 pt-20 pb-12 mobile:pt-28">
        <div className="max-w-3xl">
          <Eyebrow>Property</Eyebrow>
          <h1 className="text-4xl mobile:text-5xl leading-tight text-parchment mt-3">
            Everything your property needs — built and fixed right.
          </h1>
          <p className="text-warm-sand text-lg mt-6 leading-relaxed">
            General contracting and repair, drainage and land work, tractor and seasonal labor,
            and AI put to work planning your operation. Whether it's a deck, a wet field, a barn,
            or a whole farm that needs a smarter plan — this is the help to get it done.
          </p>
          <div className="flex flex-wrap gap-4 mt-9">
            <CTA href="#contact" variant="light">Request an estimate</CTA>
            <CTA href={CONTACT.phoneHref} variant="ghost">Or call me</CTA>
          </div>
        </div>
      </section>

      <div className="wood-divider max-w-container mx-auto" />

      {/* What I do */}
      <Section>
        <SectionHeading
          eyebrow="The work"
          title="What I do out here."
          intro="Real general-contracting and farm help, plus the planning side most contractors can't touch. Take one piece or the whole thing — every job is scoped to what you actually need."
        />
        <div className="grid gap-6 mobile:grid-cols-2 mt-10">
          {SERVICES.map((s) => (
            <Card key={s.title}>
              <h3 className="text-xl text-parchment">{s.title}</h3>
              <p className="text-warm-sand mt-2 leading-relaxed">{s.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      <div className="wood-divider max-w-container mx-auto" />

      {/* Why — the values tie-in, plainly stated */}
      <Section>
        <div className="grid gap-10 mobile:grid-cols-[1.1fr_1fr] items-center">
          <div>
            <Eyebrow>Why this</Eyebrow>
            <h2 className="text-3xl mobile:text-4xl text-parchment mt-2 leading-tight">
              Own your home. Own your land. Own your food.
            </h2>
            <p className="text-warm-sand text-lg mt-5 leading-relaxed">
              Build It USA is about owning your own work and depending less on systems that don't
              have your back. The Whole-Home Planner is that for your house. This is that for your
              land — the buildings, the dirt, the equipment, and the food you can produce yourself.
            </p>
            <p className="text-warm-sand mt-4 leading-relaxed">
              I'm not theorizing about it. I do this on my own place — out baling hay with my
              boys, fixing drainage, raising animals, building what the property needs. The same
              skills, and the same AI tools, I'll bring to yours.
            </p>
          </div>
          <Card className="!p-8">
            <p className="text-parchment text-lg leading-relaxed font-pencil-hand">
              "There are a lot of farms and properties around here that need real help — skilled
              hands, the right equipment, and a smarter way to plan. That's the gap I'm built to
              fill."
            </p>
            <p className="text-warm-sand/85 text-sm mt-4">— Jacob</p>
          </Card>
        </div>
      </Section>

      <div className="wood-divider max-w-container mx-auto" />

      {/* How it works */}
      <Section>
        <SectionHeading
          eyebrow="How it works"
          title="Every job starts with a walk."
          intro="Project-request driven and priced in person — you reach out, I come look, and you get a real plan and a real number before any work starts."
        />
        <div className="grid gap-6 mobile:grid-cols-4 mt-10">
          {STEPS.map(([title, body], i) => (
            <Card key={title} className="flex flex-col">
              <span className="font-hand text-4xl text-brass-light leading-none">{i + 1}</span>
              <h3 className="text-lg text-parchment mt-3 font-pencil-hand">{title}</h3>
              <p className="text-warm-sand mt-2 leading-relaxed text-[0.95rem]">{body}</p>
            </Card>
          ))}
        </div>
      </Section>

      <div className="wood-divider max-w-container mx-auto" />

      {/* Contact */}
      <ContactSection
        eyebrow="Request an estimate"
        title="Tell me about the property."
        intro="A project, a season of help, or a plan for your operation — tell me what you're working on and I'll come walk it. No cost to get a real estimate."
      />
    </>
  );
}
