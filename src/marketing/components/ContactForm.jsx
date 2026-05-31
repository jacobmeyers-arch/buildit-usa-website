/**
 * ContactForm.jsx — Inquiry form, posts to /api/contact (Resend)
 * Created: 2026-05-31
 *
 * Includes a hidden honeypot field for basic spam protection.
 */
import { useState } from 'react';
import { CONTACT } from '../config.js';

const INTERESTS = [
  'Free 1-hour intro',
  '1:1 follow-up',
  '4-hour deep dive',
  'General question',
];

export default function ContactForm() {
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    // Honeypot — if filled, silently pretend success (bot)
    if (data.company) {
      setStatus('sent');
      return;
    }

    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          interest: data.interest,
          message: data.message,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Something went wrong. Please try again.');
      }
      setStatus('sent');
      form.reset();
    } catch (err) {
      setStatus('error');
      setError(err.message);
    }
  }

  if (status === 'sent') {
    return (
      <div className="card-workshop p-8 text-center">
        <h3 className="text-2xl text-parchment">Message sent — thank you.</h3>
        <p className="text-warm-sand mt-3">
          I'll get back to you personally, usually within a day. In a hurry? Call{' '}
          <a href={CONTACT.phoneHref} className="text-brass-light hover:underline">{CONTACT.phone}</a>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card-workshop p-6 mobile:p-8 flex flex-col gap-5">
      {/* Honeypot (hidden from humans) */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <div className="grid gap-5 mobile:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-parchment font-pencil-hand text-lg">Name</span>
          <input name="name" required className="input-workshop" placeholder="Your name" />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-parchment font-pencil-hand text-lg">Email</span>
          <input name="email" type="email" required className="input-workshop" placeholder="you@example.com" />
        </label>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-parchment font-pencil-hand text-lg">What are you interested in?</span>
        <select name="interest" defaultValue={INTERESTS[0]} className="input-workshop">
          {INTERESTS.map((i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-parchment font-pencil-hand text-lg">Message</span>
        <textarea
          name="message"
          required
          rows={5}
          className="input-workshop resize-y"
          placeholder="Tell me a bit about your business or what you'd like help with."
        />
      </label>

      {status === 'error' && (
        <p className="text-warm-red text-sm">{error}</p>
      )}

      <button type="submit" disabled={status === 'sending'} className="btn-iron-light self-start disabled:opacity-60">
        {status === 'sending' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}
