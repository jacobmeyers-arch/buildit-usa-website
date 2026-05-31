/**
 * Training.jsx — Offerings + contact
 * Created: 2026-05-31
 * Copy drafted from context; review/edit freely.
 *
 * Paid tiers link to a Stripe Payment Link when set in config.js;
 * otherwise (and for the free intro) they route to the contact form.
 */
import { Section, SectionHeading, Card, Eyebrow } from '../components/primitives.jsx';
import ContactForm from '../components/ContactForm.jsx';
import { TRAINING_TIERS, PAYMENT_LINKS, CONTACT } from '../config.js';

function TierCard({ tier }) {
  const link = tier.payment ? PAYMENT_LINKS[tier.payment] : '';
  const usePayment = Boolean(link);

  return (
    <Card className="flex flex-col">
      <h3 className="text-2xl text-parchment">{tier.name}</h3>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="font-hand text-5xl text-brass-light leading-none">{tier.price}</span>
        {tier.unit && <span className="text-warm-sand text-lg">{tier.unit}</span>}
      </div>
      <p className="text-parchment mt-3 font-pencil-hand text-lg">{tier.tagline}</p>
      <p className="text-warm-sand mt-2 leading-relaxed">{tier.summary}</p>

      <ul className="mt-5 space-y-2 flex-1">
        {tier.bullets.map((b) => (
          <li key={b} className="text-warm-sand flex gap-2 leading-relaxed">
            <span className="text-brass-light" aria-hidden="true">—</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>

      {usePayment ? (
        <a href={link} target="_blank" rel="noreferrer" className="btn-iron-light text-center mt-6">
          {tier.cta}
        </a>
      ) : (
        <a href="#contact" className="btn-iron-light text-center mt-6">
          {tier.cta}
        </a>
      )}
    </Card>
  );
}

export default function Training() {
  return (
    <>
      {/* Hero */}
      <section className="max-w-container mx-auto px-5 pt-20 pb-12 mobile:pt-28">
        <div className="max-w-3xl">
          <Eyebrow>Training</Eyebrow>
          <h1 className="text-4xl mobile:text-5xl leading-tight text-parchment mt-3">
            Learn to run AI like a pro.
          </h1>
          <p className="text-warm-sand text-lg mt-6 leading-relaxed">
            Start free, go as deep as you want. Every session is hands-on and built around your
            actual work — you leave using what we built, not holding a binder you'll never open.
          </p>
        </div>
      </section>

      {/* Tiers */}
      <Section className="!pt-4">
        <div className="grid gap-6 mobile:grid-cols-3 items-stretch">
          {TRAINING_TIERS.map((t) => (
            <TierCard key={t.key} tier={t} />
          ))}
        </div>
        <p className="text-warm-sand/70 text-sm mt-6 text-center">
          Follow-up questions after any session are always free. Open door.
        </p>
      </Section>

      <div className="wood-divider max-w-container mx-auto" />

      {/* Contact */}
      <Section id="contact">
        <div className="grid gap-10 mobile:grid-cols-[1fr_1.2fr] items-start">
          <div>
            <Eyebrow>Get in touch</Eyebrow>
            <h2 className="text-3xl mobile:text-4xl text-parchment mt-2 leading-tight">
              Let's talk.
            </h2>
            <p className="text-warm-sand text-lg mt-5 leading-relaxed">
              Tell me a bit about your business or what you'd like help with, and I'll get back
              to you personally. Booking a paid session? Use the buttons above — or reach out
              here and we'll find a time.
            </p>
            <div className="mt-8 space-y-2">
              <a href={`mailto:${CONTACT.email}`} className="block text-parchment hover:text-brass-light transition-colors break-all">
                {CONTACT.email}
              </a>
              <a href={CONTACT.phoneHref} className="block text-parchment hover:text-brass-light transition-colors">
                {CONTACT.phone}
              </a>
            </div>
          </div>
          <ContactForm />
        </div>
      </Section>
    </>
  );
}
