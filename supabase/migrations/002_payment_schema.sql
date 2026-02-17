-- ============================================
-- 002_payment_schema.sql
-- ============================================

CREATE TABLE property_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) UNIQUE NOT NULL,
  plan_type text NOT NULL DEFAULT 'free',
  stripe_session_id text,
  report_storage_path text,
  report_generated_at timestamp,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- RLS
ALTER TABLE property_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own plans" ON property_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own plans" ON property_plans FOR UPDATE USING (auth.uid() = user_id);

-- Note: INSERT handled server-side via service_role key (webhook + verify-payment).
-- No client INSERT policy needed.

-- Add priority fields to projects (used by cross-project analysis)
ALTER TABLE projects ADD COLUMN priority_score integer;
ALTER TABLE projects ADD COLUMN priority_reason text;
ALTER TABLE projects ADD COLUMN bundle_group text;
ALTER TABLE projects ADD COLUMN recommended_sequence integer;
