/**
 * primitives.jsx — Small shared layout pieces for marketing pages
 * Created: 2026-05-31
 * Motion added: 2026-07-31 — Reveal (scroll-in) and CountUp (animated figures).
 *   The site reads modern through behavior, not color; the palette and the
 *   three-tier type system are unchanged. All motion honors
 *   prefers-reduced-motion via the CSS in index.css plus the check below.
 */
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

/* True when the visitor has asked the OS to minimize animation. */
function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Fires once when the element scrolls into view.
 * Falls back to "always visible" where IntersectionObserver is unavailable,
 * so content is never hidden by a missing browser API.
 */
function useInView() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0, rootMargin: '0px 0px -10% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return [ref, inView];
}

/**
 * Reveal — settles content into place on scroll.
 * `delay` (ms) staggers siblings; keep it under ~240ms so nothing feels slow.
 */
export function Reveal({ children, delay = 0, className = '', as: Tag = 'div' }) {
  const [ref, inView] = useInView();
  return (
    <Tag
      ref={ref}
      className={`reveal ${inView ? 'is-in' : ''} ${className}`}
      style={{ '--d': `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

/**
 * CountUp — animates an integer up from zero when it scrolls into view.
 * This site is made of numbers, so this is where most of the "modern" lands.
 * Prefix/suffix carry the non-numeric parts ("$", " hrs", "%", "< ").
 */
export function CountUp({ value, prefix = '', suffix = '', duration = 1100, className = '' }) {
  const ref = useRef(null);
  /* Starts at the REAL value, never at zero. These figures are the argument the
     page makes — a visitor with reduced motion, a stalled observer, or a crawler
     that never scrolls must still read the true number. We only drop to zero
     once the observer confirms the element is below the fold, and a failsafe
     restores the value if the count-up somehow never runs. */
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') return;

    let frame;
    let started = false;

    const animate = () => {
      started = true;
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min((now - start) / duration, 1);
        // easeOutExpo — fast start, long settle. Matches --ease-out.
        const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        setShown(Math.round(value * eased));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!started) animate();
          io.disconnect();
        } else if (!started) {
          setShown(0); // below the fold — safe to reset so the count-up reads
        }
      },
      { threshold: 0, rootMargin: '0px 0px -10% 0px' }
    );
    io.observe(el);

    // Failsafe: never leave a zero on screen if the animation never started.
    const failsafe = setTimeout(() => {
      if (!started) setShown(value);
    }, 4000);

    return () => {
      io.disconnect();
      clearTimeout(failsafe);
      cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {shown.toLocaleString('en-US')}
      {suffix}
    </span>
  );
}

/** Stat — a single animated figure with its label. Used in the proof rows. */
export function Stat({ value, prefix, suffix, label, delay = 0 }) {
  return (
    <Reveal delay={delay} className="card-workshop p-6 text-center">
      <div className="font-hand text-5xl text-brass-light leading-none">
        <CountUp value={value} prefix={prefix} suffix={suffix} />
      </div>
      <p className="text-warm-sand mt-2 text-sm leading-snug">{label}</p>
    </Reveal>
  );
}

/* Padding pulled in 2026-07-31: with the copy cut to ~28% of its old volume,
   the previous py-20/28 left cavernous dead space between sections. */
export function Section({ children, className = '', id, narrow = false }) {
  return (
    <section
      id={id}
      className={`mx-auto px-5 py-12 mobile:py-16 ${narrow ? 'max-w-3xl' : 'max-w-container'} ${className}`}
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
    <Reveal className={center ? 'text-center max-w-2xl mx-auto' : 'max-w-2xl'}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="text-3xl mobile:text-4xl text-parchment mt-2 leading-tight">{title}</h2>
      {intro && <p className="text-warm-sand text-lg mt-4 leading-relaxed">{intro}</p>}
    </Reveal>
  );
}

export function Card({ children, className = '' }) {
  return <div className={`card-workshop p-6 ${className}`}>{children}</div>;
}

/** Hairline section break — the quiet alternative to a wood divider. */
export function Rule() {
  return <div className="rule-hair max-w-container mx-auto" />;
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
