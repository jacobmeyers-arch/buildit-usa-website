/**
 * Services.jsx — Everything you can buy: AI training + done-for-you services.
 * Created: 2026-05-31 (was Training.jsx)
 * Consolidated: 2026-07-05 — absorbed the AI-for-Your-Work value case (stats +
 *   the math), the Whole-Home Planner page, and the Property page. Those routes
 *   now redirect here (#planner / #property anchors). One page sells everything;
 *   /projects proves it. Training leads — intro calls are the primary conversion.
 *
 * Paid items link to a Stripe Payment Link from config.js; the free intro and any
 * blank link fall back to the contact form.
 */
import { Section, SectionHeading, Card, CTA, Eyebrow } from '../components/primitives.jsx';
import ContactSection from '../components/ContactSection.jsx';
import usePageMeta from '../usePageMeta.js';
import { TRAINING_TIERS, PAYMENT_LINKS, CONTACT } from '../config.js';

/* Illustrative headline stats — what running AI as a system returns.
   $ figure matches the math: 8–10 hrs/week valued at $50/hr. */
const STATS = [
  { value: '~8–10 hrs', label: 'put back in your week' },
  { value: '~$1,700+', label: 'of your time back each month, valued at $50/hr' },
  { value: 'Every job', label: 'a little easier than the last' },
];

const PLANNER_BULLETS = [
  'Every project scoped — a real scope of work, not a wishlist',
  'A realistic cost range on each, with the big drivers called out',
  'Prioritized and sequenced — what to do first, what can wait',
  'It all lands in one Whole-Home Report you can budget against',
];

const PROPERTY_BULLETS = [
  'Build & repair — decks, outbuildings, barns, fencing',
  'Land & drainage — grading, runoff, access',
  'Equipment & seasonal labor — tractor work, baling, extra hands',
  'AI planning for your operation — crops, animals, logistics',
];

function TierCard({ tier }) {
  const link = tier.payment ? PAYMENT_LINKS[tier.payment] : '';
  const usePayment = Boolean(link);

  return (
    <Card className="flex flex-col">
      <h3 className="text-2xl text-parchment">{tier.name}</h3>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="font-hand text-5xl text-brass-light leading-none">{tier.price}</span>
        {tier.unit && <span className="text-warm-sand text-lg">{tier.unit}</span>}
      </div>
      <p className="text-parchment mt-3 font-pencil-hand text-lg">{tier.tagline}</p>
      <p className="text-warm-sand mt-2 leading-relaxed">{tier.summary}</p>

      <ul className="mt-5 space-y-2 flex-1">
        {tier.bullets.map((b) => (
          <li key={b} className="text-warm-sand flex gap-2 leading-relaxed">
            <span className="text-brass-light" aria-hidden="true">—</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>

      {usePayment ? (
        <a href={link} target="_blank" rel="noreferrer" className="btn-iron-light text-center mt-6">
          {tier.cta}
        </a>
      ) : (
        <a href="#contact" className="btn-iron-light text-center mt-6">
          {tier.cta}
        </a>
      )}
    </Card>
  );
}

export default function Services() {
  usePageMeta(
    'Services — AI Training, Whole-Home Planner & Property | Build It USA',
    'Hands-on AI training from a free intro to a full deep dive, the $500 Whole-Home Planner, and property work — land, farm, and repair. Capital District, NY.'
  );

  return (
    <>
      {/* Hero */}
      <section className="max-w-container mx-auto px-5 pt-20 pb-12 mobile:pt-28">
        <div className="max-w-3xl">
          <Eyebrow>Services</Eyebrow>
          <h1 className="text-4xl mobile:text-5xl leading-tight text-parchment mt-3">
            Ways to work with me.
          </h1>
          <p className="text-warm-sand text-lg mt-6 leading-relaxed">
            Learn to run AI on your own — starting with a free hour — or have me do the work: a
            Whole-Home plan or help around your property. Either way, it starts with a real
            conversation, not a sales pitch.
          </p>
          <div className="mt-8">
            <CTA href="#contact" variant="light">Book a free intro</CTA>
          </div>
        </div>
      </section>

      {/* What it's worth — the case, compressed */}
      <Section className="!pt-2 !pb-10">
        <div className="grid gap-6 mobile:grid-cols-3">
          {STATS.map((s) => (
            <Card key={s.label} className="text-center">
              <div className="font-hand text-5xl text-brass-light leading-none">{s.value}</div>
              <p className="text-warm-sand mt-3">{s.label}</p>
            </Card>
          ))}
        </div>
        <p className="text-warm-sand text-sm italic mt-4 text-center">
          Illustrative figures — your actual savings depend on your work and your rate.
        </p>
      </Section>

      {/* Teach-you — Training (primary) */}
      <Section id="training" className="!pt-4">
        <SectionHeading
          eyebrow="Training"
          title="Learn to run AI like a pro."
          intro="Hands-on and built around your actual work — you leave using what we built, not holding a binder you'll never open. Start with the free hour; there's no catch and no pitch."
        />
        <div className="grid gap-6 mobile:grid-cols-3 items-stretch mt-10">
          {TRAINING_TIERS.map((t) => (
            <TierCard key={t.key} tier={t} />
          ))}
        </div>
        <p className="text-warm-sand/80 text-sm mt-6 text-center">
          Follow-up questions after any session are always free. Open door.
        </p>
      </Section>

      <div className="wood-divider max-w-container mx-auto" />

      {/* Done-for-you — Whole-Home Planner */}
      <Section id="planner" className="!pt-4">
        <SectionHeading
          eyebrow="Done for you"
          title="Whole-Home Planner"
          intro="Every project on your property — scoped, priced, and put in order, delivered as one report you can budget against for years."
        />
        <div className="card-workshop p-7 mobile:p-9 mt-10 grid gap-8 mobile:grid-cols-[1fr_1.1fr] items-center">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-hand text-6xl text-brass-light leading-none">$500</span>
              <span className="text-warm-sand text-lg">five priority projects</span>
            </div>
            <ul className="mt-6 space-y-2.5">
              {PLANNER_BULLETS.map((b) => (
                <li key={b} className="text-warm-sand flex gap-2 leading-relaxed">
                  <span className="text-brass-light" aria-hidden="true">—</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3 mt-7">
              <a
                href={PAYMENT_LINKS.wholeHouse}
                target="_blank"
                rel="noreferrer"
                className="btn-iron-light text-center"
              >
                Book &amp; pay — $500
              </a>
              <CTA to="/projects" variant="ghost">See a real example</CTA>
            </div>
          </div>
          <div>
            <p className="text-parchment text-lg leading-relaxed">
              I ran this on my own property first — five projects scoped and priced in an
              afternoon, then I executed one and the plan held.
            </p>
            <p className="text-warm-sand mt-4 leading-relaxed">
              That's what you get: the whole picture in one document, so you stop guessing one
              quote at a time and start planning years out.
            </p>
          </div>
        </div>
      </Section>

      <div className="wood-divider max-w-container mx-auto" />

      {/* Done-for-you — Property (land, farm & repair) */}
      <Section id="property" className="!pt-4">
        <SectionHeading
          eyebrow="Done for you"
          title="Property"
          intro="General contracting and farm help on your property — build and repair, drainage and land work, equipment and seasonal labor, plus AI put to work planning your operation."
        />
        <div className="card-workshop p-7 mobile:p-9 mt-10 grid gap-8 mobile:grid-cols-[1.1fr_1fr] items-center">
          <div>
            <p className="text-parchment text-lg leading-relaxed">
              Same standards as my remodeling work, pointed at the land and the food you can
              produce yourself. Own your home, own your land, own your food.
            </p>
            <ul className="mt-6 space-y-2.5">
              {PROPERTY_BULLETS.map((b) => (
                <li key={b} className="text-warm-sand flex gap-2 leading-relaxed">
                  <span className="text-brass-light" aria-hidden="true">—</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3 mt-7">
              <CTA href="#contact" variant="light">Request an estimate</CTA>
              <CTA href={CONTACT.phoneHref} variant="ghost">Or call me</CTA>
            </div>
          </div>
          <div>
            <p className="text-parchment text-lg leading-relaxed">
              I do this on my own place — baling hay, fixing drainage, raising animals, building
              what the property needs.
            </p>
            <p className="text-warm-sand mt-4 leading-relaxed">
              Remodels I can scope from photos — land needs boots on it. Every property job
              starts with an onsite walk and a real number.
            </p>
          </div>
        </div>
      </Section>

      <div className="wood-divider max-w-container mx-auto" />

      {/* Contact */}
      <ContactSection
        eyebrow="Get in touch"
        title="Start with a free intro call."
        intro="Tell me about your business, your property, or what you need, and I'll get back to you personally. Ready to book? Use the buttons above."
      />
    </>
  );
}
