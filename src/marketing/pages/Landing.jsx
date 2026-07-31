/**
 * Landing.jsx — Home page. The whole site, minus the proof.
 * Created: 2026-05-31
 * Rewritten: 2026-07-31 — /services and /about were absorbed here and deleted.
 *   Site cut to 25% of its former word count: prose replaced by a pricing table
 *   and a proof strip. One page, one funnel, one CTA. Motion added (Reveal,
 *   CountUp) — palette and type unchanged.
 */
import { Link } from 'react-router-dom';
import {
  Section, SectionHeading, CTA, Eyebrow, Reveal, Stat, Rule,
} from '../components/primitives.jsx';
import HeroDemo from '../components/HeroDemo.jsx';
import ContactSection from '../components/ContactSection.jsx';
import usePageMeta from '../usePageMeta.js';
import { PRICING } from '../config.js';

export default function Landing() {
  usePageMeta(
    'Build It USA — Practical AI, Built From the Field',
    'Hands-on AI training and done-for-you services from Jacob Meyers. Free intro session, $500 Whole-Home Planner, property work. Capital District, NY.'
  );

  return (
    <>
      {/* Hero */}
      <section className="hero-grid max-w-container mx-auto px-5 pt-14 pb-14 mobile:pt-20 mobile:pb-20">
        <div className="grid gap-12 mobile:grid-cols-[1.1fr_1fr] items-center">
          <Reveal>
            <Eyebrow>Practical AI, built from the field</Eyebrow>
            <h1 className="text-4xl mobile:text-6xl leading-[1.05] text-parchment mt-4">
              AI that works the way you work.
            </h1>
            <p className="text-warm-sand text-lg mobile:text-xl mt-6 leading-relaxed">
              I'm Jacob Meyers. I ran complex builds, then put my own work on AI.
              Now I do the same for yours.
            </p>
            <div className="mt-9">
              <CTA href="#contact" variant="light">Book a free intro</CTA>
            </div>
          </Reveal>
          <Reveal delay={140}>
            <HeroDemo />
          </Reveal>
        </div>
      </section>

      {/* Proof strip — the numbers do the talking */}
      <Section className="!pt-0">
        <Reveal><Eyebrow>Proof</Eyebrow></Reveal>
        <div className="grid gap-4 mobile:grid-cols-3 mt-5">
          <Stat value={1} suffix="%" label="materials estimate vs. my receipts" />
          <Stat value={10} prefix="< " suffix=" min" label="photos to a priced scope" delay={90} />
          <Stat value={74} suffix=" hrs" label="tracked to the hour, published" delay={180} />
        </div>
        <Reveal delay={240}>
          <Link
            to="/projects"
            className="text-brass-light font-pencil-hand text-lg mt-6 inline-block hover:underline"
          >
            See both builds →
          </Link>
        </Reveal>
      </Section>

      <Rule />

      {/* Pricing pointer — prices visible without leaving home, full table on
          /pricing. Keeps the #pricing id so any old /#pricing link still lands. */}
      <Section id="pricing">
        <SectionHeading
          eyebrow="Pricing"
          title="From a free hour to a $500 whole-property plan."
        />
        <div className="grid grid-cols-2 mobile:grid-cols-5 gap-3 mt-8">
          {PRICING.map((row, i) => (
            <Reveal key={row.name} delay={i * 60} className="card-workshop p-4 text-center">
              <div className="font-hand text-3xl text-brass-light leading-none">{row.price}</div>
              <p className="text-warm-sand text-sm mt-2 leading-snug">{row.name}</p>
            </Reveal>
          ))}
        </div>
        <Reveal delay={320} className="mt-8">
          <CTA to="/pricing" variant="light">See what's included</CTA>
        </Reveal>
      </Section>

      <Rule />

      {/* Who I am */}
      <Section narrow>
        <Reveal>
          <Eyebrow>Who I am</Eyebrow>
          <p className="text-parchment text-xl mt-4 leading-relaxed">
            I solve problems from first principles and build systems that compound — across
            construction, engineering, food manufacturing, mine reclamation, and biomedical.
            AI is just the newest system.
          </p>
        </Reveal>
      </Section>

      <ContactSection />
    </>
  );
}
