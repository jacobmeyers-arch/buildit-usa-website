/**
 * Pricing.jsx — The payment page. Every offering, what it includes, and the button.
 * Created: 2026-07-31
 *
 * Restored as a standalone route after the 4→2 page cut put the price table on
 * the home page only. This is the URL to hand out, QR-code, and send people to
 * when they're ready to pay — the home page keeps a compact pointer to it.
 *
 * Exempt from the site copy budget by Jacob's direction: this page's job is to
 * close, and a $500 button needs more than a one-liner behind it. Still a table,
 * not cards — the "what you get" column carries the substance.
 */
import { Section, Eyebrow, Reveal, Rule } from '../components/primitives.jsx';
import ContactSection from '../components/ContactSection.jsx';
import usePageMeta from '../usePageMeta.js';
import { PRICING, PAYMENT_LINKS } from '../config.js';

function payHref(row) {
  const link = row.payment ? PAYMENT_LINKS[row.payment] : '';
  return { href: link || '#contact', external: Boolean(link) };
}

export default function Pricing() {
  usePageMeta(
    'Pricing — Build It USA',
    'Every offering and what it costs: a free 1-hour intro, $100 follow-up, $300 deep dive, the $500 Whole-Home Planner, and quoted property work.'
  );

  return (
    <>
      {/* Hero */}
      <section className="hero-grid max-w-container mx-auto px-5 pt-14 pb-10 mobile:pt-20">
        <Reveal className="max-w-3xl">
          <Eyebrow>Pricing</Eyebrow>
          <h1 className="text-4xl mobile:text-5xl leading-tight text-parchment mt-3">
            Everything, and what it costs.
          </h1>
          <p className="text-warm-sand text-lg mt-5 leading-relaxed">
            Flat prices, paid up front. No estimates on the training, no hourly surprises.
          </p>
        </Reveal>
      </section>

      <Section className="!pt-4">
        {/* Mobile: stacked cards — a 4-column table doesn't survive a phone. */}
        <div className="space-y-3 mobile:hidden">
          {PRICING.map((row, i) => {
            const { href, external } = payHref(row);
            return (
              <Reveal key={row.name} delay={i * 60} className="card-workshop p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <div className="font-pencil-hand text-lg text-parchment">{row.name}</div>
                  <div className="font-hand text-3xl text-brass-light leading-none whitespace-nowrap">
                    {row.price}
                  </div>
                </div>
                <p className="text-warm-sand text-sm mt-2 leading-snug">{row.detail}</p>
                <a
                  href={href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noreferrer' : undefined}
                  className="btn-iron-light !py-2 !px-5 text-base block text-center mt-4"
                >
                  {row.cta}
                </a>
              </Reveal>
            );
          })}
        </div>

        {/* Desktop: the table */}
        <Reveal className="card-workshop p-7 hidden mobile:block">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-brass-light font-pencil-hand">
                <th className="py-2 pr-4 font-normal">Offering</th>
                <th className="py-2 px-3 font-normal">What you get</th>
                <th className="py-2 px-3 font-normal text-right">Price</th>
                <th className="py-2 pl-3 font-normal"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-iron-mid align-top">
              {PRICING.map((row) => {
                const { href, external } = payHref(row);
                return (
                  <tr key={row.name} className="text-warm-sand row-live">
                    <td className="py-4 pr-4 text-parchment font-pencil-hand text-lg whitespace-nowrap">
                      {row.name}
                    </td>
                    <td className="py-4 px-3 leading-relaxed">{row.detail}</td>
                    <td className="py-4 px-3 text-right">
                      <span className="font-hand text-3xl text-brass-light whitespace-nowrap">
                        {row.price}
                      </span>
                    </td>
                    <td className="py-4 pl-3 text-right">
                      <a
                        href={href}
                        target={external ? '_blank' : undefined}
                        rel={external ? 'noreferrer' : undefined}
                        className="btn-iron-light !py-2 !px-5 text-base whitespace-nowrap"
                      >
                        {row.cta}
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Reveal>

        <p className="text-warm-sand/80 text-sm mt-5">
          Follow-ups after any session are free. Open door. Paid sessions are booked through
          Stripe — you'll get a receipt and I'll email you within a day to schedule.
        </p>
      </Section>

      <Rule />

      <ContactSection
        eyebrow="Not sure which"
        title="Start with the free hour."
        intro="If you don't know which of these you need, that's what the free intro is for. Bring a real problem and we'll figure it out together."
      />
    </>
  );
}
