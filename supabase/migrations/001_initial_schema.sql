-- ============================================
-- 001_initial_schema.sql
-- ============================================

-- Users (profile table — auth.users created automatically by Supabase Auth for paid users)
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  zip_code text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Projects
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  title text,
  status text NOT NULL DEFAULT 'created',
  understanding_score integer DEFAULT 0,
  understanding_dimensions jsonb DEFAULT '{
    "project_type": false,
    "scope_direction": false,
    "space_dimensions": false,
    "condition": false,
    "materials_preference": false,
    "budget_framing": false,
    "timeline": false,
    "constraints": false
  }'::jsonb,
  scope_summary text,
  cost_estimate jsonb,
  budget_approach text,
  budget_target text,
  ready_to_hire boolean,
  interaction_count integer DEFAULT 0,
  deleted_at timestamp,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Project Photos
CREATE TABLE project_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) NOT NULL,
  photo_order integer NOT NULL DEFAULT 1,
  storage_path text NOT NULL,
  ai_analysis text,
  created_at timestamp DEFAULT now()
);

-- Interactions
CREATE TABLE interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) NOT NULL,
  type text NOT NULL,
  user_input text,
  ai_response text,
  metadata jsonb DEFAULT '{}',
  created_at timestamp DEFAULT now()
);

-- Analytics Events
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  event_type text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamp DEFAULT now()
);

-- Indexes
CREATE INDEX idx_interactions_project_created ON interactions(project_id, created_at);
CREATE INDEX idx_projects_user_status ON projects(user_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_events_user_type ON events(user_id, event_type);
CREATE INDEX idx_project_photos_project ON project_photos(project_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own record" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users create own record" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own record" ON users FOR UPDATE USING (auth.uid() = id);

-- projects (all queries MUST include WHERE deleted_at IS NULL)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own projects" ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);

-- project_photos
ALTER TABLE project_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own photos" ON project_photos FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));
CREATE POLICY "Users create own photos" ON project_photos FOR INSERT
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- interactions
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own interactions" ON interactions FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));
CREATE POLICY "Users create own interactions" ON interactions FOR INSERT
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- events (users can write own events; only service_role can read all)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users create own events" ON events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users read own events" ON events FOR SELECT USING (auth.uid() = user_id);

-- Note: Analytics dashboards query via service_role key (bypasses RLS)
-- Note: Free tier users are managed server-side via service_role key.
-- RLS policies apply to authenticated (paid) users making direct client calls.
