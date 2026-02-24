-- ============================================
-- 003_profile_cache.sql — Address-to-Profile Feature
-- ============================================

-- Profile cache: stores property lookups to avoid repeated API calls
CREATE TABLE IF NOT EXISTS profile_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key text UNIQUE NOT NULL,           -- SHA-256 of normalized address
  address_data jsonb NOT NULL,              -- validated address fields
  profile_data jsonb NOT NULL,              -- full property profile + recommendations
  address_formatted text NOT NULL,          -- human-readable address string
  created_at timestamp DEFAULT now(),
  expires_at timestamp DEFAULT (now() + interval '30 days')
);

-- Fast lookup by cache key
CREATE INDEX IF NOT EXISTS idx_profile_cache_key ON profile_cache(cache_key);
-- For cleanup of expired entries
CREATE INDEX IF NOT EXISTS idx_profile_cache_expires ON profile_cache(expires_at);

-- RLS enabled, service_role only (no user-facing policies)
ALTER TABLE profile_cache ENABLE ROW LEVEL SECURITY;

-- Link projects to cached property profiles
-- property_profile_id: FK to profile_cache for address-flow projects
-- entry_type: 'camera' (default, photo flow) or 'address' (address lookup flow)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='property_profile_id') THEN
    ALTER TABLE projects ADD COLUMN property_profile_id uuid REFERENCES profile_cache(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='entry_type') THEN
    ALTER TABLE projects ADD COLUMN entry_type text DEFAULT 'camera';
  END IF;
END $$;
