/**
 * WholeHome.jsx — Whole-Home Planner service page
 * Created: 2026-05-31
 * Slimmed: 2026-06-11 — this page now sells; the proof proves elsewhere. The
 *   full worked example (five-project plan + per-estimate detail + pig-barn
 *   plan-vs-actual) moved to /projects. Structure here: offer → what you get →
 *   proof snippet → price + contact. Positioned as a done-for-you service
 *   product (sibling to Property), not a training offering.
 */
import { Section, SectionHeading, Card, CTA, Eyebrow } from '../components/primitives.jsx';
import ContactSection from '../components/ContactSection.jsx';
import usePageMeta from '../usePageMeta.js';
import { PAYMENT_LINKS } from '../config.js';

/* What the $500 report delivers. */
const DELIVERS = [
  ['Every project, scoped', 'A clear scope of work for each project on the property — not a vague wishlist, an actual plan you can hand to a contractor.'],
  ['Priced with a range', 'A realistic cost band for each one, with the big drivers called out, so nothing blindsides you later.'],
  ['Prioritized & sequenced', 'What to do first, what can wait, and what pairs well together — ordered by cost, urgency, and what unlocks what.'],
  ['One document', 'It all lands in a single Whole-Home Report you can budget against, share, and work down over years.'],
];

/* Proof snippet — the headline numbers from the executed case study (/projects). */
const PROOF_STATS = [
  ['5 projects', 'scoped and priced in one afternoon'],
  ['< 10 min', 'from photos to a full scope + estimate'],
  ['1 built', 'tracked against the plan — it held'],
];

export default function WholeHome() {
  usePageMeta(
    'Whole-Home Planner — $500 | Build It USA',
    'Every project on your property scoped, priced, and put in order — one report you can budget against for years. $500 flat for your five priority projects.'
  );

  return (
    <>
      {/* Hero — the offer */}
      <section className="max-w-container mx-auto px-5 pt-20 pb-12 mobile:pt-28">
        <div className="max-w-3xl">
          <Eyebrow>Whole-Home Planner — a done-for-you service</Eyebrow>
          <h1 className="text-4xl mobile:text-5xl leading-tight text-parchment mt-3">
            Every project on your property — scoped, priced, and put in order.
          </h1>
          <p className="text-warm-sand text-lg mt-6 leading-relaxed">
            Most homeowners juggle a mental list of "someday" projects with no plan and no numbers.
            The Whole-Home Planner turns that into one document: your five priority projects scoped,
            a cost range on each, and a sensible order to tackle them — so you can budget years out,
            not guess one quote at a time.
          </p>
          <div className="flex flex-wrap gap-4 mt-9">
            <CTA href={PAYMENT_LINKS.wholeHouse} variant="light">Get your plan — $500</CTA>
            <CTA to="/projects" variant="ghost">See a real one first</CTA>
          </div>
        </div>
      </section>

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

      {/* Proof snippet → /projects */}
      <Section>
        <SectionHeading
          eyebrow="Proven on my own property first"
          title="I ran it on my own place before selling it to you."
          intro="Five projects on my house and outbuildings, scoped and priced in one sitting. Then I executed one — the pig-barn teardown — and tracked every hour and dollar against the plan."
        />
        <div className="grid gap-4 mobile:grid-cols-3 mt-10">
          {PROOF_STATS.map(([n, l]) => (
            <Card key={l} className="text-center">
              <div className="font-hand text-4xl text-brass-light leading-none">{n}</div>
              <p className="text-warm-sand mt-2">{l}</p>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 mobile:grid-cols-[1fr_1.4fr] items-center mt-8">
          <img
            src="/projects/pigbarn/pigbarn-01.jpg"
            alt="The pig barn before demolition — the executed project from the plan"
            className="rounded-frame w-full aspect-[4/3] object-cover"
          />
          <div>
            <p className="text-parchment text-lg leading-relaxed">
              The full plan is public — every scope, every range, and the executed project's
              estimate next to its actuals.
            </p>
            <div className="mt-6">
              <CTA to="/projects" variant="light">See the full example</CTA>
            </div>
          </div>
        </div>
      </Section>

      <div className="wood-divider max-w-container mx-auto" />

      {/* Price + contact */}
      <ContactSection
        eyebrow="Get your plan"
        title="$500. Five projects. One report."
        intro="One flat price for your five priority projects — each one scoped and priced into a single plan. Pay below to get started, or reach out with questions first."
      >
        <div className="mt-7">
          <CTA href={PAYMENT_LINKS.wholeHouse} variant="light">Book &amp; pay — $500</CTA>
        </div>
      </ContactSection>
    </>
  );
}
