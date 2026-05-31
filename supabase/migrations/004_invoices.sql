-- Invoice system for QR code payments
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  project_id UUID REFERENCES projects(id),

  -- Invoice details
  invoice_number TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled', 'expired')),

  -- Stripe
  stripe_payment_link_id TEXT,
  stripe_payment_link_url TEXT,
  stripe_session_id TEXT,

  -- QR code
  qr_code_data_url TEXT,
  payment_url TEXT NOT NULL,

  -- PDF
  pdf_storage_path TEXT,

  -- Metadata
  customer_email TEXT,
  customer_name TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for lookups
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_stripe_session_id ON invoices(stripe_session_id);
