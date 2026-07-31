/**
 * DeliveryTiers.jsx — The same scope priced at all three delivery models.
 * Created: 2026-07-31
 *
 * The estimating tool computes one build-up, then multiplies it by who is
 * delivering the work: Solo GC 1.25x, General Contractor 1.65x, Design-Build
 * 2.0–2.5x. Showing all three is the point — a single number invites anchoring,
 * and the spread IS the service being bought.
 *
 * The `actual` row is what the project really cost self-performed, which lands
 * below even the leanest tier. That gap is decomposed elsewhere on the page —
 * never present it as an accuracy result on its own.
 */
import { Reveal } from './primitives.jsx';

export default function DeliveryTiers({ rows, actual, note }) {
  return (
    <div className="mt-10">
      <Reveal>
        <h3 className="text-2xl mobile:text-3xl text-parchment leading-tight">
          The same job, three ways to buy it
        </h3>
      </Reveal>

      <Reveal delay={80} className="card-workshop p-5 mobile:p-7 mt-6">
        <table className="w-full text-left border-collapse">
          <tbody className="divide-y divide-iron-mid">
            {rows.map(([label, sub, range]) => (
              <tr key={label} className="text-warm-sand row-live align-baseline">
                <td className="py-3 pr-4">
                  <div className="text-parchment font-pencil-hand text-lg leading-tight">{label}</div>
                  <div className="text-warm-sand/85 text-sm mt-0.5">{sub}</div>
                </td>
                <td className="py-3 pl-3 text-right">
                  <span className="font-hand text-2xl mobile:text-3xl text-parchment whitespace-nowrap">
                    {range}
                  </span>
                </td>
              </tr>
            ))}
            <tr className="align-baseline">
              <td className="pt-4 pr-4">
                <div className="text-brass-light font-pencil-hand text-lg leading-tight">
                  What it actually cost me
                </div>
                <div className="text-warm-sand/85 text-sm mt-0.5">Self-performed, my own tools</div>
              </td>
              <td className="pt-4 pl-3 text-right">
                <span className="font-hand text-3xl mobile:text-4xl text-brass-light whitespace-nowrap">
                  {actual}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </Reveal>

      {note && <p className="text-warm-sand/85 text-sm mt-4 max-w-3xl leading-relaxed">{note}</p>}
    </div>
  );
}
