/**
 * Nav.jsx — Sticky top navigation for the marketing site
 * Created: 2026-05-31
 *
 * Workshop aesthetic: iron bar, parchment links, brass active accent.
 * Collapses to a toggle menu below the `mobile` breakpoint (860px).
 */
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

/* Ordered by the funnel: what AI does → what you can buy → the proof → who I am.
   "Home" dropped — the logo covers it. */
const LINKS = [
  { to: '/ai-for-your-work', label: 'AI Tools' },
  { to: '/services', label: 'Services' },
  { to: '/whole-home-planner', label: 'Planner' },
  { to: '/property', label: 'Property' },
  { to: '/projects', label: 'Projects' },
  { to: '/about', label: 'About' },
];

function linkClass({ isActive }) {
  return [
    'font-pencil-hand text-lg tracking-wide transition-colors',
    isActive ? 'text-brass-light' : 'text-parchment hover:text-brass-light',
  ].join(' ');
}

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-iron/95 backdrop-blur border-b border-iron-mid">
      <nav className="max-w-container mx-auto px-5 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <img src="/logo-usa.png" alt="Build It USA" className="h-9 w-auto" />
          <span className="font-pencil-hand text-xl tracking-wide text-parchment">
            Build It USA
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden mobile:flex items-center gap-8">
          {LINKS.map((l) => (
            <li key={l.to}>
              <NavLink to={l.to} end={l.end} className={linkClass}>
                {l.label}
              </NavLink>
            </li>
          ))}
          <li>
            {/* Plain anchor — every page has a ContactSection with id="contact" */}
            <a href="#contact" className="btn-iron-light !py-2 !px-5 text-base">
              Book a free intro
            </a>
          </li>
        </ul>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="mobile:hidden flex flex-col gap-1.5 p-2"
        >
          <span className="block h-0.5 w-6 bg-parchment" />
          <span className="block h-0.5 w-6 bg-parchment" />
          <span className="block h-0.5 w-6 bg-parchment" />
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <ul className="mobile:hidden border-t border-iron-mid bg-iron px-5 py-4 flex flex-col gap-4">
          {LINKS.map((l) => (
            <li key={l.to}>
              <NavLink to={l.to} end={l.end} className={linkClass} onClick={() => setOpen(false)}>
                {l.label}
              </NavLink>
            </li>
          ))}
          <li>
            <a
              href="#contact"
              className="btn-iron-light inline-block !py-2 !px-5 text-base"
              onClick={() => setOpen(false)}
            >
              Book a free intro
            </a>
          </li>
        </ul>
      )}
    </header>
  );
}
