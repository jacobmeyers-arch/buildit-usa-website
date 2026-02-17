# Supabase Setup Instructions

The migration files are ready, but need to be applied manually since the Supabase CLI is not installed.

## 1. Apply Migrations

Go to the Supabase dashboard SQL Editor and run each migration file in order:

1. Run `001_initial_schema.sql` - Creates users, projects, project_photos, interactions, events tables with RLS
2. Run `002_payment_schema.sql` - Creates property_plans table and adds priority fields to projects

## 2. Create Storage Buckets

### project-photos bucket
- Name: `project-photos`
- Public: Yes (read)
- File size limit: 5MB
- Allowed MIME types: image/jpeg, image/png, image/webp

**Policies:**
- Public read access (no auth required)
- Service role write access (server-side only)
- Path structure: 
  - Before user creation: `temp/{sessionId}/{photoOrder}.jpg`
  - After user creation: `{userId}/{projectId}/{photoOrder}.jpg`

**RLS Policies to create:**
```sql
-- Allow public reads
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'project-photos');

-- Allow authenticated users to upload to their own folders
CREATE POLICY "Users upload own photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow unauthenticated uploads to temp folder (via service role)
CREATE POLICY "Service role temp uploads"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'project-photos' AND (storage.foldername(name))[1] = 'temp');
```

### property-reports bucket
- Name: `property-reports`
- Public: No
- File size limit: 10MB
- Allowed MIME types: application/pdf

**Policies:**
- Authenticated read/write restricted to `{userId}/` prefix

**RLS Policies to create:**
```sql
-- Users read own reports
CREATE POLICY "Users read own reports"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'property-reports' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Users write own reports (via service role)
CREATE POLICY "Service role report writes"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'property-reports');
```

## 3. Verify Setup

After applying migrations and creating buckets, verify:
- All 6 tables exist (users, projects, project_photos, interactions, events, property_plans)
- RLS is enabled on all tables
- All indexes are created
- Both storage buckets exist with correct policies
