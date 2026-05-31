/**
 * Footer.jsx — Site footer with brand, contact, and nav
 * Created: 2026-05-31
 */
import { Link } from 'react-router-dom';
import { CONTACT } from '../config.js';

export default function Footer() {
  const year = 2026;
  return (
    <footer className="border-t border-iron-mid bg-iron-hover mt-20">
      <div className="max-w-container mx-auto px-5 py-12 grid gap-10 mobile:grid-cols-3">
        {/* Brand */}
        <div className="flex items-start gap-3">
          <img src="/beaver-master.jpg" alt="Build It USA" className="h-16 w-16 rounded-card object-cover" />
          <div>
            <div className="font-pencil-hand text-xl tracking-wide text-parchment">Build It USA</div>
            <p className="text-sm text-warm-sand mt-1 max-w-xs">
              Practical AI adoption for businesses and the people who run them.
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-2">
          <span className="font-pencil-hand text-brass-light text-sm uppercase tracking-widest mb-1">Explore</span>
          <Link to="/" className="text-parchment hover:text-brass-light transition-colors">Home</Link>
          <Link to="/about" className="text-parchment hover:text-brass-light transition-colors">About</Link>
          <Link to="/ai-for-your-work" className="text-parchment hover:text-brass-light transition-colors">AI for Your Work</Link>
          <Link to="/whole-home-planner" className="text-parchment hover:text-brass-light transition-colors">Whole-Home Planner</Link>
          <Link to="/training" className="text-parchment hover:text-brass-light transition-colors">Training</Link>
        </nav>

        {/* Contact */}
        <div className="flex flex-col gap-2">
          <span className="font-pencil-hand text-brass-light text-sm uppercase tracking-widest mb-1">Get in touch</span>
          <span className="text-parchment">{CONTACT.name}</span>
          <a href={`mailto:${CONTACT.email}`} className="text-parchment hover:text-brass-light transition-colors break-all">
            {CONTACT.email}
          </a>
          <a href={CONTACT.phoneHref} className="text-parchment hover:text-brass-light transition-colors">
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
