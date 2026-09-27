/**
 * SkillsSection.jsx — The skills you leave with. The site's value proposition.
 * Created: 2026-09-27 (Jacob's direction)
 *
 * The estimating tools stopped being a back-room detail and became the thing
 * being sold: you get the skills, installed in your own Claude, and you can
 * price a project you are only thinking about before you call anybody.
 *
 * Two renderings, one component (`compact`) so the copy lives in exactly one
 * place — config.js `SKILLS` / `EXAMPLES`:
 *   compact  — home page. Names only, no descriptions. The home page is on a
 *              ~240-word innerText budget (repo CLAUDE.md) and five full
 *              descriptions would blow it; the depth belongs on /pricing, which
 *              is budget-exempt.
 *   full     — /pricing. The table, the handoff, and links to two real reports.
 *
 * NOTE ON NAMING AI: the 2026-07-31 rule barred AI/Claude from customer-facing
 * copy. Jacob overrode it 2026-09-27 — the tool is the product, so it gets named.
 * The rule still holds everywhere it wasn't overridden.
 */
import { Section, Eyebrow, Reveal, CTA } from './primitives.jsx';
import { SKILLS, EXAMPLES } from '../config.js';

/* What the handoff actually is — the answer to "so I get a file?". */
const HANDOFF = [
  ['I install it', 'In your Claude, on your account. Not a login to something of mine.'],
  ['We run it on your project', 'A real one you are weighing, start to finished report, with you driving.'],
  ['You keep sharpening it', 'Feed it what a job actually cost and it gets closer. Same way I built mine — and you can write your own from there.'],
];

export default function SkillsSection({ compact = false }) {
  if (compact) {
    return (
      <Section id="skills">
        <Reveal className="max-w-3xl">
          <Eyebrow>What you leave with</Eyebrow>
          <h2 className="text-3xl mobile:text-4xl text-parchment mt-2 leading-tight">
            The estimating skills, running in your own Claude.
          </h2>
          <p className="text-warm-sand text-lg mt-4 leading-relaxed">
            Price a project you are only thinking about — before you call anyone.
          </p>
        </Reveal>

        {/* Names only. Descriptions live on /pricing; see the header note. */}
        <div className="flex flex-wrap gap-2.5 mt-7">
          {SKILLS.map(([name], i) => (
            <Reveal key={name} delay={i * 60} as="span" className="inline-block">
              <span className="card-workshop inline-block px-4 py-2 text-parchment font-pencil-hand">
                {name}
              </span>
            </Reveal>
          ))}
        </div>

        <Reveal delay={340} className="mt-8">
          <CTA to="/pricing#skills" variant="light">
            See a report it wrote
          </CTA>
        </Reveal>
      </Section>
    );
  }

  return (
    <Section id="skills">
      <Reveal className="max-w-3xl">
        <Eyebrow>What you leave with</Eyebrow>
        <h2 className="text-3xl mobile:text-4xl text-parchment mt-2 leading-tight">
          The estimating skills, running in your own Claude.
        </h2>
        <p className="text-warm-sand text-lg mt-4 leading-relaxed">
          These are the same skills that priced every project on this site. You get them, in
          your own account — so you can put a number on a project you are only thinking about
          before you call anybody, including me.
        </p>
      </Reveal>

      {/* What it does */}
      <Reveal delay={80} className="card-workshop p-5 mobile:p-7 mt-8">
        <table className="w-full text-left border-collapse">
          <tbody className="divide-y divide-iron-mid align-top">
            {SKILLS.map(([name, what]) => (
              <tr key={name} className="text-warm-sand row-live">
                <td className="py-4 pr-4 text-parchment font-pencil-hand text-lg mobile:whitespace-nowrap align-top">
                  {name}
                </td>
                <td className="py-4 pl-0 mobile:pl-3 leading-relaxed">{what}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Reveal>

      {/* Real output — the proof that the list above is not a wishlist */}
      <div className="mt-12">
        <Reveal className="max-w-3xl">
          <h3 className="text-2xl mobile:text-3xl text-parchment leading-tight">
            Two reports it wrote
          </h3>
          <p className="text-warm-sand mt-3 leading-relaxed">
            Unedited, from my own property. Open them and read the line items, the flagged
            unknowns, and the sequence of operations.
          </p>
        </Reveal>
        <div className="grid gap-3 mobile:grid-cols-2 mt-6">
          {EXAMPLES.map((ex, i) => (
            <Reveal key={ex.href} delay={i * 80}>
              <a
                href={ex.href}
                target="_blank"
                rel="noreferrer"
                className="card-workshop p-5 block group"
              >
                <div className="text-parchment group-hover:text-brass-light transition-colors font-pencil-hand text-lg">
                  {ex.name} →
                </div>
                <p className="text-warm-sand text-sm mt-1">{ex.meta}</p>
              </a>
            </Reveal>
          ))}
        </div>
      </div>

      {/* How the handoff works */}
      <div className="mt-12">
        <Reveal className="max-w-3xl">
          <h3 className="text-2xl mobile:text-3xl text-parchment leading-tight">
            How you get them
          </h3>
        </Reveal>
        <ol className="mt-6 space-y-3">
          {HANDOFF.map(([label, detail], i) => (
            <Reveal key={label} delay={i * 70} as="li" className="card-workshop p-5 flex gap-4">
              <span className="font-hand text-3xl text-brass-light leading-none">{i + 1}</span>
              <p className="leading-relaxed">
                <span className="text-parchment font-pencil-hand text-lg">{label}</span>
                <span className="text-warm-sand"> — {detail}</span>
              </p>
            </Reveal>
          ))}
        </ol>
        <p className="text-warm-sand/80 text-sm mt-5 max-w-3xl leading-relaxed">
          You need your own Claude account to run them — the free tier will not carry a full
          estimate. Getting that set up is part of the first hour, and it is free.
        </p>
      </div>
    </Section>
  );
}
