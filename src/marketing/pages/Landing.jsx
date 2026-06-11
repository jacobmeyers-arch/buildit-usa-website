/**
 * Landing.jsx — Home page
 * Created: 2026-05-31
 * Reworked: 2026-06-11 — hero now demonstrates instead of describing (HeroDemo
 *   slot, future home of the live estimator), cards reorganized around customer
 *   outcomes (AI services first — the primary conversion), and the page ends at
 *   the shared ContactSection like every other page.
 */
import { Link } from 'react-router-dom';
import { Section, SectionHeading, Card, CTA, Eyebrow } from '../components/primitives.jsx';
import HeroDemo from '../components/HeroDemo.jsx';
import ContactSection from '../components/ContactSection.jsx';
import usePageMeta from '../usePageMeta.js';

/* Outcome cards — ordered by conversion priority: AI services (primary),
   the planner (secondary, a service product), then the proof. */
const WAYS = [
  {
    to: '/ai-for-your-work',
    title: 'Get your business running on AI',
    body: 'Hours back every week — email, estimates, reports, and research handled by a system built around your work. Starts with a free one-hour session.',
    cta: 'See what it does',
    img: '/beavers/blueprints.jpg',
  },
  {
    to: '/whole-home-planner',
    title: 'Plan your whole property — $500',
    body: 'Every project on your place scoped, priced, and put in order — one report you can budget against for years instead of guessing one quote at a time.',
    cta: 'See the planner',
    img: '/projects/porch/porch-01.webp',
  },
  {
    to: '/projects',
    title: 'See real projects',
    body: 'Real scopes, real numbers, one project executed and tracked against the plan. Judge the work, not the pitch.',
    cta: 'See the proof',
    img: '/projects/pigbarn/pigbarn-01.jpg',
  },
];

export default function Landing() {
  usePageMeta(
    'Build It USA — Practical AI, Built From the Field',
    'AI that works the way you work. Hands-on AI services and training from Jacob Meyers, plus the $500 Whole-Home Planner. Start with a free intro session.'
  );

  return (
    <>
      {/* Hero — text + demonstration, side by side */}
      <section className="max-w-container mx-auto px-5 pt-16 pb-16 mobile:pt-24 mobile:pb-24">
        <div className="grid gap-10 mobile:grid-cols-[1.1fr_1fr] items-center">
          <div>
            <Eyebrow>Practical AI, built from the field</Eyebrow>
            <h1 className="text-4xl mobile:text-6xl leading-[1.05] text-parchment mt-4">
              AI that works the way you work.
            </h1>
            <p className="text-warm-sand text-lg mobile:text-xl mt-6 leading-relaxed">
              I'm Jacob Meyers. I spent my career managing complex builds, then learned to run my
              own work on AI. Build It USA helps businesses and professionals do the same — real
              adoption, no hype.
            </p>
            <div className="flex flex-wrap gap-4 mt-9">
              <CTA href="#contact" variant="light">Book a free intro</CTA>
              <CTA to="/ai-for-your-work" variant="ghost">See what AI can do</CTA>
            </div>
          </div>
          <HeroDemo />
        </div>
      </section>

      <div className="wood-divider max-w-container mx-auto" />

      {/* Outcome cards */}
      <Section>
        <SectionHeading
          eyebrow="Start here"
          title="What do you need done?"
          intro="Three ways in — pick the one that matches your problem."
        />
        <div className="grid gap-6 mobile:grid-cols-3 mt-12">
          {WAYS.map((w) => (
            <Card key={w.to} className="flex flex-col">
              <img src={w.img} alt="" className="aspect-square w-full object-cover rounded-card mb-5" />
              <h3 className="text-2xl text-parchment">{w.title}</h3>
              <p className="text-warm-sand mt-3 flex-1 leading-relaxed">{w.body}</p>
              <Link to={w.to} className="text-brass-light font-pencil-hand text-lg mt-5 hover:underline">
                {w.cta} →
              </Link>
            </Card>
          ))}
        </div>
      </Section>

      {/* Why this, not hype */}
      <Section className="!pt-0">
        <div className="card-workshop p-8 mobile:p-12">
          <div className="max-w-3xl">
            <Eyebrow>Why Build It USA</Eyebrow>
            <h2 className="text-3xl mobile:text-4xl text-parchment mt-2 leading-tight">
              From the job site, not the lab.
            </h2>
            <p className="text-warm-sand text-lg mt-5 leading-relaxed">
              Most AI advice comes from people who've never hit a deadline, held a budget, or
              answered to a client. I have. I teach it the way I'd teach a new hire — plain
              language, real work, focused on what saves you time and makes you money.
            </p>
            <div className="mt-8">
              <CTA href="#contact" variant="light">Book a free intro</CTA>
            </div>
          </div>
        </div>
      </Section>

      <ContactSection />
    </>
  );
}
