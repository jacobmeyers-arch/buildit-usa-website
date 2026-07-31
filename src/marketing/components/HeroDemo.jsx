/**
 * HeroDemo.jsx — The landing hero's "show, don't tell" slot
 * Created: 2026-06-11
 * Tightened: 2026-07-31 — three steps, three words each. The duplicate
 *   "see the proof" link was dropped; the proof strip directly below carries it.
 *
 * Today: a static annotated demo — real pig-barn photo in, scope + price out.
 * Future: the live photo-upload estimator drops into this same component
 * boundary when that build ships. Keep the outer container's footprint stable
 * so the swap is a component change, not a homepage redesign.
 */
const FLOW = [
  ['Photos in', 'one walk-around, phone camera'],
  ['Ten minutes', 'full scope, priced'],
  ['Then I built it', 'the plan held'],
];

export default function HeroDemo() {
  return (
    <div className="card-workshop p-5 mobile:p-6 relative">
      {/* pinned-to-the-workbench accent */}
      <span className="brass-nail absolute top-3 left-1/2 -translate-x-1/2" aria-hidden="true" />
      <img
        src="/projects/pigbarn/pigbarn-01.jpg"
        alt="Old pig barn before demolition — scoped and priced from photos"
        className="rounded-card w-full aspect-[4/3] object-cover"
      />
      <ol className="mt-5 space-y-2.5">
        {FLOW.map(([label, detail], i) => (
          <li key={label} className="flex gap-3 items-baseline">
            <span className="font-hand text-2xl text-brass-light leading-none">{i + 1}</span>
            <p className="leading-snug">
              <span className="text-parchment font-pencil-hand text-lg">{label}</span>
              <span className="text-warm-sand"> — {detail}</span>
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
