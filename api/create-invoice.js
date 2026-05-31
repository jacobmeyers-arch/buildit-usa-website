/**
 * /api/create-invoice - Create Invoice with Stripe Payment Link + QR Code
 *
 * Creates a Stripe Payment Link, generates a QR code, stores the invoice,
 * and returns the QR code data URL + payment URL.
 */

import Stripe from 'stripe';
import QRCode from 'qrcode';
import { supabaseAdmin } from './lib/supabase-admin.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173';

function isValidUuid(str) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

/**
 * Generate a unique invoice number: INV-YYYYMMDD-XXXX
 */
function generateInvoiceNumber() {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `INV-${dateStr}-${rand}`;
}

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Content-Type', 'application/json');

  try {
    const { userId, projectId, description, amountDollars, customerEmail, customerName, dueDate } = req.body;

    // Validate required fields
    if (!description || !amountDollars) {
      return res.status(400).json({ error: 'Missing required fields: description, amountDollars' });
    }

    const amount = parseFloat(amountDollars);
    if (isNaN(amount) || amount <= 0 || amount > 100000) {
      return res.status(400).json({ error: 'Invalid amount. Must be between $0.01 and $100,000' });
    }

    if (userId && !isValidUuid(userId)) {
      return res.status(400).json({ error: 'Invalid userId format' });
    }

    if (projectId && !isValidUuid(projectId)) {
      return res.status(400).json({ error: 'Invalid projectId format' });
    }

    const amountCents = Math.round(amount * 100);
    const invoiceNumber = generateInvoiceNumber();

    // Create a Stripe Product + Price for this invoice
    const product = await stripe.products.create({
      name: `Invoice ${invoiceNumber}`,
      description: description,
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: amountCents,
      currency: 'usd',
    });

    // Create a Payment Link (mobile-optimized, supports Apple Pay/Google Pay)
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [{ price: price.id, quantity: 1 }],
      metadata: {
        invoice_number: invoiceNumber,
        user_id: userId || '',
        project_id: projectId || '',
      },
      after_completion: {
        type: 'redirect',
        redirect: {
          url: `${ALLOWED_ORIGIN}?screen=invoicePaid&invoice=${invoiceNumber}`,
        },
      },
      payment_method_types: ['card'],
    });

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(paymentLink.url, {
      width: 300,
      margin: 2,
      color: { dark: '#1a1a1a', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    });

    // Store invoice in Supabase
    const { data: invoice, error: dbError } = await supabaseAdmin
      .from('invoices')
      .insert({
        user_id: userId || null,
        project_id: projectId || null,
        invoice_number: invoiceNumber,
        description,
        amount_cents: amountCents,
        status: 'pending',
        stripe_payment_link_id: paymentLink.id,
        stripe_payment_link_url: paymentLink.url,
        qr_code_data_url: qrCodeDataUrl,
        payment_url: paymentLink.url,
        customer_email: customerEmail || null,
        customer_name: customerName || null,
        due_date: dueDate || null,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Failed to store invoice:', dbError);
      return res.status(500).json({ error: 'Failed to store invoice' });
    }

    return res.status(200).json({
      invoice: {
        id: invoice.id,
        invoiceNumber,
        description,
        amountDollars: amount,
        amountCents,
        status: 'pending',
        paymentUrl: paymentLink.url,
        qrCodeDataUrl,
        customerEmail: customerEmail || null,
        customerName: customerName || null,
        dueDate: dueDate || null,
        createdAt: invoice.created_at,
      },
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return res.status(500).json({ error: 'Failed to create invoice' });
  }
}
