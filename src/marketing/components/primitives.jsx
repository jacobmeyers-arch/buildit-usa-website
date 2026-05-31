/**
 * primitives.jsx — Small shared layout pieces for marketing pages
 * Created: 2026-05-31
 *
 * Keeps pages readable and the workshop styling consistent.
 */
import { Link } from 'react-router-dom';

export function Section({ children, className = '', id, narrow = false }) {
  return (
    <section
      id={id}
      className={`mx-auto px-5 py-16 mobile:py-24 ${narrow ? 'max-w-3xl' : 'max-w-container'} ${className}`}
    >
      {children}
    </section>
  );
}

export function Eyebrow({ children }) {
  return (
    <span className="font-pencil-hand text-brass-light uppercase tracking-[0.18em] text-sm">
      {children}
    </span>
  );
}

export function SectionHeading({ eyebrow, title, intro, center = false }) {
  return (
    <div className={center ? 'text-center max-w-2xl mx-auto' : 'max-w-2xl'}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="text-3xl mobile:text-4xl text-parchment mt-2 leading-tight">{title}</h2>
      {intro && <p className="text-warm-sand text-lg mt-4 leading-relaxed">{intro}</p>}
    </div>
  );
}

export function Card({ children, className = '' }) {
  return <div className={`card-workshop p-6 ${className}`}>{children}</div>;
}

/** Primary CTA — internal route or external link. */
export function CTA({ to, href, children, variant = 'light', className = '' }) {
  const cls = (variant === 'light' ? 'btn-iron-light' : variant === 'ghost' ? 'btn-ghost-parchment' : 'btn-iron') + ` inline-block text-center ${className}`;
  if (href) {
    return (
      <a href={href} className={cls} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link to={to} className={cls}>
      {children}
    </Link>
  );
}
