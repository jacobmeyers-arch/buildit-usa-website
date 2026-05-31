/**
 * About.jsx — Who Jacob Meyers is (role-level, no firms named)
 * Created: 2026-05-31
 * Copy drafted from context; review/edit freely.
 */
import { Section, SectionHeading, Card, CTA, Eyebrow } from '../components/primitives.jsx';

const PRINCIPLES = [
  {
    title: 'Plain language',
    body: 'No jargon, no mystique. If I can\'t explain it so you can use it tomorrow, I haven\'t done my job.',
  },
  {
    title: 'Grounded in real work',
    body: 'Estimates, proposals, scheduling, client communication, reporting — the actual work, not toy demos.',
  },
  {
    title: 'Systems that compound',
    body: 'The goal isn\'t a clever prompt. It\'s a setup that gets better every time you use it — and that you own.',
  },
  {
    title: 'Straight talk',
    body: 'I\'ll tell you where AI helps and where it doesn\'t. You make better decisions with honest information.',
  },
];

export default function About() {
  return (
    <>
      {/* Hero */}
      <section className="max-w-container mx-auto px-5 pt-20 pb-12 mobile:pt-28">
        <div className="grid gap-10 mobile:grid-cols-[1.4fr_1fr] items-center">
          <div>
            <Eyebrow>About</Eyebrow>
            <h1 className="text-4xl mobile:text-5xl leading-tight text-parchment mt-3">
              I'm Jacob Meyers.
            </h1>
            <p className="text-warm-sand text-lg mt-6 leading-relaxed">
              I've spent my career in construction and project management — running large
              industrial, commercial, and environmental builds where the budgets are big, the
              constraints are real, and the schedule doesn't care about excuses.
            </p>
            <p className="text-warm-sand text-lg mt-4 leading-relaxed">
              I'm a blue-collar intellectual: equally at home reading a set of drawings and
              reasoning from first principles. That mix is exactly why I got serious about AI —
              not as a gadget, but as a way to do more, faster, without dropping quality.
            </p>
          </div>
          <img
            src="/jacob-family.jpg"
            alt="Jacob Meyers with his family"
            className="rounded-frame w-full object-cover max-h-[28rem] mobile:max-h-none"
          />
        </div>
      </section>

      <div className="wood-divider max-w-container mx-auto" />

      {/* The turn to AI */}
      <Section narrow>
        <SectionHeading
          eyebrow="How I got here"
          title="I learned AI by running my own work on it."
        />
        <div className="text-warm-sand text-lg mt-6 space-y-4 leading-relaxed">
          <p>
            I didn't start with theory. I started by handing AI the real work in front of me —
            estimates, write-ups, research, planning — and figuring out how to make it
            genuinely useful instead of generically wrong.
          </p>
          <p>
            Along the way I built something most people never do: a system. Not a pile of
            prompts, but a setup with its own memory and operating rules that improves every
            time I use it. It knows how I work, holds onto what it learns, and compounds. That
            system is what I now help other people build for themselves.
          </p>
        </div>
        <figure className="mt-10">
          <img
            src="/jacob-family-wide.jpg"
            alt="Jacob Meyers and his family"
            className="rounded-frame w-full object-cover"
          />
          <figcaption className="text-warm-sand/70 text-sm mt-3 text-center">
            Why I do this — the people behind the work.
          </figcaption>
        </figure>
      </Section>

      {/* Principles */}
      <Section className="!pt-0">
        <SectionHeading eyebrow="How I work" title="What you can expect from me" center />
        <div className="grid gap-6 mobile:grid-cols-2 mt-12 max-w-4xl mx-auto">
          {PRINCIPLES.map((p) => (
            <Card key={p.title}>
              <h3 className="text-2xl text-parchment">{p.title}</h3>
              <p className="text-warm-sand mt-3 leading-relaxed">{p.body}</p>
            </Card>
          ))}
        </div>
        <div className="text-center mt-12">
          <CTA to="/training" variant="light">Work with me</CTA>
        </div>
      </Section>
    </>
  );
}
