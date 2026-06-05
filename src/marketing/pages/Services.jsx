/**
 * Services.jsx — Everything you can buy: done-for-you services + AI training.
 * Created: 2026-05-31 (was Training.jsx — renamed to Services; added the
 *   $500 Whole-Home Planner as a done-for-you offering above the training tiers).
 *
 * Paid items link to a Stripe Payment Link from config.js; the free intro and any
 * blank link fall back to the contact form. Done-for-you (Planner) is kept visually
 * separate from teach-you (Training) so the offering stays coherent.
 */
import { Section, SectionHeading, Card, CTA, Eyebrow } from '../components/primitives.jsx';
import ContactForm from '../components/ContactForm.jsx';
import { TRAINING_TIERS, PAYMENT_LINKS, CONTACT } from '../config.js';

const PLANNER_BULLETS = [
  'Every project scoped — a real scope of work, not a wishlist',
  'A realistic cost range on each, with the big drivers called out',
  'Prioritized and sequenced — what to do first, what can wait',
  'It all lands in one Whole-Home Report you can budget against',
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
            Have me do the work — a Whole-Home plan or help around your property — or learn to
            run AI on your own. Either way, it starts with a real conversation, not a sales pitch.
          </p>
        </div>
      </section>

      {/* Done-for-you — Whole-Home Planner */}
      <Section className="!pt-4">
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
              <CTA to="/whole-home-planner" variant="ghost">See a real example</CTA>
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
      <Section className="!pt-4">
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
              {[
                'Build & repair — decks, outbuildings, barns, fencing',
                'Land & drainage — grading, runoff, access',
                'Equipment & seasonal labor — tractor work, baling, extra hands',
                'AI planning for your operation — crops, animals, logistics',
              ].map((b) => (
                <li key={b} className="text-warm-sand flex gap-2 leading-relaxed">
                  <span className="text-brass-light" aria-hidden="true">—</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3 mt-7">
              <CTA to="/property" variant="light">See what I do</CTA>
              <CTA href="#contact" variant="ghost">Request an estimate</CTA>
            </div>
          </div>
          <div>
            <p className="text-parchment text-lg leading-relaxed">
              I do this on my own place — baling hay, fixing drainage, raising animals, building
              what the property needs.
            </p>
            <p className="text-warm-sand mt-4 leading-relaxed">
              Every job starts with an onsite walk and a real number — no guessing from photos.
            </p>
          </div>
        </div>
      </Section>

      <div className="wood-divider max-w-container mx-auto" />

      {/* Teach-you — Training */}
      <Section className="!pt-4">
        <SectionHeading
          eyebrow="Training"
          title="Learn to run AI like a pro."
          intro="Hands-on and built around your actual work — you leave using what we built, not holding a binder you'll never open."
        />
        <div className="grid gap-6 mobile:grid-cols-3 items-stretch mt-10">
          {TRAINING_TIERS.map((t) => (
            <TierCard key={t.key} tier={t} />
          ))}
        </div>
        <p className="text-warm-sand/70 text-sm mt-6 text-center">
          Follow-up questions after any session are always free. Open door.
        </p>
      </Section>

      <div className="wood-divider max-w-container mx-auto" />

      {/* Contact */}
      <Section id="contact">
        <div className="grid gap-10 mobile:grid-cols-[1fr_1.2fr] items-start">
          <div>
            <Eyebrow>Get in touch</Eyebrow>
            <h2 className="text-3xl mobile:text-4xl text-parchment mt-2 leading-tight">
              Let's talk.
            </h2>
            <p className="text-warm-sand text-lg mt-5 leading-relaxed">
              Tell me about your business, your property, or what you need, and I'll get back to
              you personally. Ready to book? Use the buttons above.
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
