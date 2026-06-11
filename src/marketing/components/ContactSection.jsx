/**
 * ContactSection.jsx — Shared closing contact block (the one funnel)
 * Created: 2026-06-11
 *
 * Every marketing page ends here: same layout, same form, copy tuned per page
 * via props. The nav's "Book a free intro" button anchors to id="contact", so
 * this section must appear exactly once on every routed page.
 */
import { Section, Eyebrow } from './primitives.jsx';
import ContactForm from './ContactForm.jsx';
import { CONTACT } from '../config.js';

export default function ContactSection({
  eyebrow = 'Get in touch',
  title = 'Start with a free intro call.',
  intro = "A working session, not a sales pitch — bring a real problem from your work and we'll point AI at it together. You'll know within the hour whether this is worth your time.",
  children,
}) {
  return (
    <Section id="contact">
      <div className="grid gap-10 mobile:grid-cols-[1fr_1.2fr] items-start">
        <div>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="text-3xl mobile:text-4xl text-parchment mt-2 leading-tight">{title}</h2>
          <p className="text-warm-sand text-lg mt-5 leading-relaxed">{intro}</p>
          {children}
          <div className="mt-8 space-y-2">
            <a
              href={`mailto:${CONTACT.email}`}
              className="block text-parchment hover:text-brass-light transition-colors break-all"
            >
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
  );
}
