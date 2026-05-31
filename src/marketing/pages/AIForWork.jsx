/**
 * AIForWork.jsx — Concrete value + the case for local AI + power-user systems
 * Created: 2026-05-31
 * Updated: 2026-05-31 — made the value concrete: headline stats, a featured
 *   estimating before/after, a sample daily brief, per-use-case time figures,
 *   a before/after time table, and an ROI line. All numbers are ILLUSTRATIVE.
 * Copy drafted from context; review/edit freely.
 */
import { Section, SectionHeading, Card, CTA, Eyebrow } from '../components/primitives.jsx';
import PigBarnCase from '../components/PigBarnCase.jsx';

/* Illustrative headline stats */
const STATS = [
  { value: '~8–10 hrs', label: 'put back in your week' },
  { value: '~$2,000+', label: 'of your time saved each month' },
  { value: 'Every job', label: 'a little easier than the last' },
];

/* Remaining use cases with a concrete "what it looks like" + time figure */
const EXAMPLES = [
  {
    title: 'Research & decisions',
    look: 'Compare three financing options, or vet a new method before you commit — with a clear recommendation and the trade-offs laid out.',
    from: '2 hrs',
    to: '20 min',
  },
  {
    title: 'Client communication',
    look: 'Explain a change order, write a status update, or turn a tense email into a calm one — in your voice, ready to send.',
    from: '20 min',
    to: '2 min',
  },
  {
    title: 'Documentation & reporting',
    look: 'Field notes, photos, and voice memos become a clean report — the same format every time, nothing forgotten.',
    from: '1 hr',
    to: '10 min',
  },
  {
    title: 'Learning faster',
    look: 'A new code, tool, or process explained at your level, with the parts that actually touch your job up front.',
    from: 'an afternoon',
    to: 'minutes',
  },
];

/* Before/after time table */
const TIME_ROWS = [
  ['Estimate from rough notes', '3 hrs', '30 min', '2.5 hrs'],
  ['Daily email & admin', '1 hr', '15 min', '45 min'],
  ['Status updates & client replies', '30 min', '5 min', '25 min'],
  ['Field notes → report', '1 hr', '10 min', '50 min'],
  ['Research a decision', '2 hrs', '20 min', '1.5 hrs'],
];

function TimeBadge({ from, to }) {
  return (
    <span className="inline-flex items-center gap-2 font-hand text-2xl text-brass-light">
      {from} <span className="text-warm-sand text-base font-serif">→</span> {to}
    </span>
  );
}

export default function AIForWork() {
  return (
    <>
      {/* Hero */}
      <section className="max-w-container mx-auto px-5 pt-20 pb-10 mobile:pt-28">
        <div className="max-w-3xl">
          <Eyebrow>AI for your work</Eyebrow>
          <h1 className="text-4xl mobile:text-5xl leading-tight text-parchment mt-3">
            What AI can actually do for your business or career.
          </h1>
          <p className="text-warm-sand text-lg mt-6 leading-relaxed">
            Forget the hype. Here's where AI earns its keep in real work — shown in hours and
            dollars, with a real look at what it produces. This is the value of running AI as a
            system, which is exactly what the training builds with you.
          </p>
        </div>
      </section>

      {/* Headline stats */}
      <Section className="!pt-2 !pb-10">
        <div className="grid gap-6 mobile:grid-cols-3">
          {STATS.map((s) => (
            <Card key={s.label} className="text-center">
              <div className="font-hand text-5xl text-brass-light leading-none">{s.value}</div>
              <p className="text-warm-sand mt-3">{s.label}</p>
            </Card>
          ))}
        </div>
        <p className="text-warm-sand/60 text-sm italic mt-4 text-center">
          Illustrative figures — your actual savings depend on your work and your rate.
        </p>
      </Section>

      {/* Featured: real case study — pig-barn demolition */}
      <PigBarnCase />

      {/* Featured: morning daily brief */}
      <Section className="!pt-4">
        <SectionHeading
          eyebrow="Example: email & admin"
          title="A morning that starts ahead of the day."
          intro="Instead of opening to 30 unread emails, you open to a brief: what needs you, what's already drafted, and what you can ignore."
        />

        <div className="grid gap-6 mobile:grid-cols-[1.3fr_1fr] mt-10 items-start">
          {/* The brief mock */}
          <div className="card-workshop overflow-hidden">
            <div className="bg-iron-mid px-5 py-3 flex items-center justify-between">
              <span className="font-pencil-hand text-parchment text-lg">Your 7:00 AM brief — Monday</span>
              <span className="text-warm-sand text-sm">Inbox: 28 → 4 that matter</span>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <span className="font-pencil-hand text-brass-light text-sm uppercase tracking-widest">Needs you today</span>
                <ul className="mt-2 space-y-1.5 text-warm-sand">
                  <li>— Henderson change order: approve the $3,200 add before they pour</li>
                  <li>— Supplier flagged a 1-week tile delay — call to hold the schedule</li>
                </ul>
              </div>
              <div>
                <span className="font-pencil-hand text-brass-light text-sm uppercase tracking-widest">Drafted & waiting for your OK</span>
                <ul className="mt-2 space-y-1.5 text-warm-sand">
                  <li>— Reply to the Carters with next week's start window</li>
                  <li>— Follow-up + proposal recap to Monday's walkthrough lead</li>
                </ul>
              </div>
              <div>
                <span className="font-pencil-hand text-brass-light text-sm uppercase tracking-widest">Handled / no action</span>
                <p className="text-warm-sand mt-2">24 newsletters, receipts, and FYIs filed.</p>
              </div>
            </div>
          </div>

          {/* Payoff */}
          <Card className="flex flex-col justify-center">
            <TimeBadge from="~45 min/day" to="~5 min" />
            <p className="text-warm-sand mt-3 leading-relaxed">
              You spend five minutes saying "send it" and "call them," not forty-five sorting
              and writing. That's nearly <span className="text-parchment">~4 hours back every week</span> —
              before you've finished your coffee.
            </p>
          </Card>
        </div>
      </Section>

      {/* More use cases */}
      <Section className="!pt-4">
        <SectionHeading eyebrow="And more" title="Other ways it pays off" />
        <div className="grid gap-6 mobile:grid-cols-2 mt-10">
          {EXAMPLES.map((e) => (
            <Card key={e.title}>
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-xl text-parchment">{e.title}</h3>
                <TimeBadge from={e.from} to={e.to} />
              </div>
              <p className="text-warm-sand mt-3 leading-relaxed">{e.look}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* The math */}
      <Section className="!pt-4">
        <SectionHeading
          eyebrow="The math"
          title="Add it up across a normal week."
        />
        <div className="card-workshop p-5 mobile:p-7 mt-8 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[460px]">
            <thead>
              <tr className="text-brass-light font-pencil-hand">
                <th className="py-2 pr-4 font-normal">Task</th>
                <th className="py-2 px-3 font-normal">Without AI</th>
                <th className="py-2 px-3 font-normal">With AI</th>
                <th className="py-2 pl-3 font-normal text-right">Saved</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-iron-mid">
              {TIME_ROWS.map(([task, without, withAi, saved]) => (
                <tr key={task} className="text-warm-sand">
                  <td className="py-2.5 pr-4 text-parchment">{task}</td>
                  <td className="py-2.5 px-3">{without}</td>
                  <td className="py-2.5 px-3">{withAi}</td>
                  <td className="py-2.5 pl-3 text-right font-hand text-xl text-brass-light">{saved}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-parchment text-lg mt-6 leading-relaxed max-w-2xl">
          Across a normal week that's roughly <span className="font-hand text-2xl text-brass-light">8–10 hours</span> back.
          Even valued at $50/hr, that's about <span className="font-hand text-2xl text-brass-light">$1,700+ a month</span> —
          at your real rate, a good deal more.
        </p>
        <p className="text-warm-sand/60 text-sm italic mt-3">
          Illustrative — swap in your own tasks, times, and rate.
        </p>
      </Section>

      <div className="wood-divider max-w-container mx-auto" />

      {/* Local AI operations */}
      <Section>
        <div className="grid gap-10 mobile:grid-cols-2 items-center">
          <div>
            <Eyebrow>The real unlock</Eyebrow>
            <h2 className="text-3xl mobile:text-4xl text-parchment mt-2 leading-tight">
              Own your AI operation — don't just rent a chat.
            </h2>
            <div className="text-warm-sand text-lg mt-5 space-y-4 leading-relaxed">
              <p>
                Most people use AI one disposable conversation at a time. It never learns your
                business, so you re-explain yourself constantly and the quality never climbs —
                and you never see numbers like the ones above.
              </p>
              <p>
                A <strong className="text-parchment">local AI operation</strong> is different:
                AI set up around <em>your</em> work, with your context and your rules, that you
                control. Your information stays yours. The value builds instead of resetting.
                And you're not locked into anyone else's tool or pricing.
              </p>
            </div>
          </div>
          <img
            src="/beavers/electrical.jpg"
            alt=""
            className="rounded-frame w-full object-cover max-h-80"
          />
        </div>
      </Section>

      {/* Power-user system */}
      <Section className="!pt-0">
        <SectionHeading
          eyebrow="How power users run it"
          title="The system behind those numbers"
          intro="This is exactly how I run my own AI setup — and what the paid training builds with you."
        />
        <div className="grid gap-6 mobile:grid-cols-4 mt-12">
          {[
            ['1', 'Context files', 'Your standards, rates, and processes live in simple files the AI reads — one source of truth, reused on every job.'],
            ['2', 'Memory', 'The system remembers what it learns about your business instead of starting from zero every time.'],
            ['3', 'Session protocols', 'End each session by saving what was learned and what is next, so it picks up where you left off.'],
            ['4', 'It compounds', 'Each piece makes the next job easier — that\'s why the savings grow instead of staying flat.'],
          ].map(([n, title, body]) => (
            <Card key={n} className="flex flex-col">
              <span className="font-hand text-5xl text-brass-light leading-none">{n}</span>
              <h3 className="text-xl text-parchment mt-3">{title}</h3>
              <p className="text-warm-sand mt-2 leading-relaxed">{body}</p>
            </Card>
          ))}
        </div>

        <div className="card-workshop p-8 mobile:p-10 mt-12 text-center max-w-3xl mx-auto">
          <p className="text-parchment text-xl mobile:text-2xl leading-snug">
            The free hour gets you started. The 1:1 and Deep Dive build the compounding backend —
            the part that turns AI into the system that earns those hours back, week after week.
          </p>
          <div className="mt-7">
            <CTA to="/training" variant="light">See the training</CTA>
          </div>
        </div>
      </Section>
    </>
  );
}
