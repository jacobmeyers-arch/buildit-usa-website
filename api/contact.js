/**
 * /api/contact — Contact form submission endpoint
 *
 * Validates an inquiry and emails it to Jacob via Resend (reuses api/lib/email.js).
 * Created: 2026-05-31
 */

import { sendContactEmail } from './lib/email.js';

const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', code: 405 });
  }

  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Content-Type', 'application/json');

  try {
    const { name, email, interest, message, company } = req.body || {};

    // Honeypot — bots fill the hidden "company" field. Pretend success.
    if (company) {
      return res.status(200).json({ success: true });
    }

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Please enter your name.', code: 400 });
    }
    if (!email || !EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.', code: 400 });
    }
    if (!message || typeof message !== 'string' || message.trim().length < 5) {
      return res.status(400).json({ error: 'Please include a short message.', code: 400 });
    }

    await sendContactEmail({
      name: name.trim().slice(0, 200),
      email: email.trim().slice(0, 200),
      interest: (interest || 'General').toString().slice(0, 120),
      message: message.trim().slice(0, 5000),
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Error in /api/contact:', error);
    return res.status(500).json({ error: 'Could not send your message. Please email me directly.', code: 500 });
  }
}
