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
import { PRICING, PAYMENT_LINKS } from '../config.js';

function PriceRow({ row, delay }) {
  const link = row.payment ? PAYMENT_LINKS[row.payment] : '';
  const href = link || '#contact';

  return (
    <Reveal
      delay={delay}
      className="row-live border-t border-iron-mid px-3 py-5 flex flex-wrap items-center gap-x-6 gap-y-3"
    >
      <div className="min-w-[14rem] flex-1">
        <div className="font-pencil-hand text-lg text-parchment">{row.name}</div>
        <div className="text-warm-sand text-sm mt-1 leading-snug">{row.note}</div>
      </div>
      <div className="font-hand text-4xl text-brass-light leading-none w-24 mobile:text-right">
        {row.price}
      </div>
      <a
        href={href}
        target={link ? '_blank' : undefined}
        rel={link ? 'noreferrer' : undefined}
        className="btn-iron-light !py-2 !px-5 text-base w-full mobile:w-auto text-center"
      >
        {row.cta}
      </a>
    </Reveal>
  );
}

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

      {/* Pricing — the whole catalog, one table. This replaced the old
          "three ways in" cards, which restated these same five rows. */}
      <Section id="pricing">
        <SectionHeading eyebrow="Pricing" title="Everything, and what it costs." />
        <div className="card-workshop mt-10 px-4 mobile:px-6 py-2">
          {PRICING.map((row, i) => (
            <PriceRow key={row.name} row={row} delay={i * 70} />
          ))}
        </div>
        <p className="text-warm-sand/80 text-sm mt-5">
          Follow-ups after any session are free. Open door.
        </p>
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
