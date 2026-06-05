/**
 * Landing.jsx — Home page
 * Created: 2026-05-31
 * Copy drafted from context; review/edit freely.
 */
import { Link } from 'react-router-dom';
import { Section, SectionHeading, Card, CTA, Eyebrow } from '../components/primitives.jsx';

const WAYS = [
  {
    to: '/about',
    title: 'Who I am',
    body: 'A builder and project manager who learned AI by using it to run real work — then built systems around it.',
    cta: 'About me',
    img: '/beavers/blueprints.jpg',
  },
  {
    to: '/ai-for-your-work',
    title: 'What AI can do for you',
    body: 'Concrete ways AI supports a business or a career — and why running it like a system beats one-off chats.',
    cta: 'See examples',
    img: '/beavers/architecture.jpg',
  },
  {
    to: '/services',
    title: 'Work with me',
    body: 'A done-for-you Whole-Home Planner, or hands-on AI training from a free intro to a full deep dive.',
    cta: 'See services',
    img: '/beavers/framing.jpg',
  },
];

export default function Landing() {
  return (
    <>
      {/* Hero */}
      <section className="max-w-container mx-auto px-5 pt-20 pb-16 mobile:pt-28 mobile:pb-24">
        <div className="max-w-3xl">
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
            <CTA to="/ai-for-your-work" variant="light">See what AI can do</CTA>
            <CTA to="/services" variant="ghost">Book a free intro</CTA>
          </div>
        </div>
      </section>

      <div className="wood-divider max-w-container mx-auto" />

      {/* Three ways in */}
      <Section>
        <SectionHeading
          eyebrow="Start here"
          title="Three ways in"
          intro="However you like to learn, there's a door that fits."
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
              <CTA to="/services" variant="light">Get started</CTA>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
