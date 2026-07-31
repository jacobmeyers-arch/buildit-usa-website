/**
 * Footer.jsx — Site footer with brand and contact
 * Created: 2026-05-31
 * Reduced: 2026-07-31 — the MasterBeaver image was removed (it violated the
 *   repo convention against the mascot in footers, and had been live). The nav
 *   column went with it: with /services and /about absorbed into the home page,
 *   a one-link column was noise.
 */
import { Link } from 'react-router-dom';
import { CONTACT } from '../config.js';

export default function Footer() {
  const year = 2026;
  return (
    <footer className="border-t border-iron-mid bg-iron-hover mt-20">
      <div className="max-w-container mx-auto px-5 py-12 grid gap-8 mobile:grid-cols-2">
        {/* Brand */}
        <div>
          <div className="font-pencil-hand text-xl tracking-wide text-parchment">Build It USA</div>
          <p className="text-sm text-warm-sand mt-2 max-w-xs">
            Practical AI for businesses and the people who run them.
          </p>
          <Link
            to="/projects"
            className="text-brass-light font-pencil-hand mt-4 inline-block hover:underline"
          >
            Projects
          </Link>
        </div>

        {/* Contact */}
        <div className="flex flex-col gap-2 mobile:items-end">
          <span className="font-pencil-hand text-brass-light text-sm uppercase tracking-widest">
            Get in touch
          </span>
          <span className="text-parchment">{CONTACT.name}</span>
          <a
            href={`mailto:${CONTACT.email}`}
            className="text-parchment hover:text-brass-light transition-colors break-all"
          >
            {CONTACT.email}
          </a>
          <a
            href={CONTACT.phoneHref}
            className="text-parchment hover:text-brass-light transition-colors"
          >
            {CONTACT.phone}
          </a>
        </div>
      </div>

      <div className="border-t border-iron-mid">
        <p className="max-w-container mx-auto px-5 py-5 text-xs text-warm-sand/60">
          © {year} Build It USA. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
