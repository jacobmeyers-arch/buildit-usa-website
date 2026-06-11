/**
 * HeroDemo.jsx — The landing hero's "show, don't tell" slot
 * Created: 2026-06-11
 *
 * Today: a static annotated demo — real pig-barn photo in, scope + price out —
 * drawn from the executed case study on /projects.
 * Future: the live photo-upload estimator drops into this same component
 * boundary when that build ships. Keep the outer container's footprint stable
 * so the swap is a component change, not a homepage redesign.
 */
import { Link } from 'react-router-dom';

const FLOW = [
  ['Photos in', 'one walk-around with a phone camera'],
  ['Ten minutes later', 'a full scope of work and a priced estimate'],
  ['Then I built it', 'tracked every hour and dollar — the plan held'],
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
      <div className="mt-5 pt-4 border-t border-iron-mid flex items-baseline justify-between gap-3 flex-wrap">
        <div>
          <span className="font-hand text-3xl text-brass-light leading-none">$5,990 – 6,970</span>
          <span className="text-warm-sand text-sm block mt-1">estimated from photos — and it held</span>
        </div>
        <Link to="/projects" className="text-brass-light font-pencil-hand text-lg hover:underline">
          See the proof →
        </Link>
      </div>
    </div>
  );
}
