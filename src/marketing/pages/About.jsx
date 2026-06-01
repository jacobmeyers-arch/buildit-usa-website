/**
 * About.jsx — Who Jacob Meyers is (simple, first-principles + systems framing)
 * Created: 2026-05-31
 * Rewritten: 2026-05-31 — simplified per SIMPLE tenet; concise voice; domain breadth
 *   (engineering, construction, food mfg, mine reclamation, environmental data,
 *   biomedical) with first-principles + systems thinking as the throughline.
 * Role/domain-level only — no firms named.
 */
import { Section, Eyebrow, CTA } from '../components/primitives.jsx';

const FIELDS = [
  'Construction & engineering',
  'Food manufacturing',
  'Mine reclamation',
  'Environmental data systems',
  'Biomedical engineering',
];

export default function About() {
  return (
    <>
      {/* Hero */}
      <Section narrow className="!pb-8">
        <Eyebrow>About</Eyebrow>
        <h1 className="text-4xl mobile:text-5xl leading-tight text-parchment mt-3">
          I'm Jacob Meyers.
        </h1>
        <p className="text-warm-sand text-lg mt-5 leading-relaxed">
          I solve problems from first principles and build systems that compound. I've done it
          across very different fields — the approach travels; the industry doesn't.
        </p>
      </Section>

      {/* Vista banner */}
      <div className="max-w-container mx-auto px-5">
        <img
          src="/vista.jpg"
          alt=""
          className="rounded-frame w-full object-cover max-h-[26rem]"
        />
      </div>

      {/* Fields */}
      <Section narrow className="!pb-8">
        <Eyebrow>Fields I've worked in</Eyebrow>
        <ul className="mt-5 flex flex-wrap gap-3">
          {FIELDS.map((f) => (
            <li
              key={f}
              className="card-workshop px-4 py-2 text-parchment font-pencil-hand text-lg"
            >
              {f}
            </li>
          ))}
        </ul>
      </Section>

      {/* How I think */}
      <Section narrow className="!pt-0">
        <Eyebrow>How I think</Eyebrow>
        <div className="text-warm-sand text-lg mt-5 space-y-4 leading-relaxed">
          <p>
            <span className="text-parchment font-pencil-hand">First principles.</span> Break a
            problem down to what's actually true, then build back up. No cargo-culting.
          </p>
          <p>
            <span className="text-parchment font-pencil-hand">Systems thinking.</span> Design the
            whole, not the part — so it improves over time instead of needing constant rescue.
          </p>
          <p>AI is just the newest system. That's why I can teach it in any field — including yours.</p>
        </div>
        <div className="mt-8">
          <CTA to="/services" variant="light">Work with me</CTA>
        </div>
      </Section>
    </>
  );
}
