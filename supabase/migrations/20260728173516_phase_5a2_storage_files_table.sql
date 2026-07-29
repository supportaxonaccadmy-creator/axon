/*
# Phase 5A.2 — Enterprise Storage & File Upload System

## Purpose
Creates a `files` table to track all uploaded assets in Supabase Storage.

## New Tables
- `files` — tracks every uploaded file with bucket, path, MIME, size, entity link, status

## Indexes
- entity_type, entity_id, uploaded_by, created_at, status, storage_bucket

## Security (RLS)
- Admins get full CRUD.
- Authenticated users can read files they uploaded.
- Authenticated users can read files marked is_public = true.
- Students can read files linked to batches they have active enrollment in.
*/

CREATE TABLE IF NOT EXISTS files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_bucket text NOT NULL,
  file_path text NOT NULL,
  file_name text NOT NULL,
  original_name text NOT NULL,
  mime_type text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  file_type text NOT NULL,
  uploaded_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  entity_type text,
  entity_id uuid,
  is_public boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_files_entity_type ON files (entity_type);
CREATE INDEX IF NOT EXISTS idx_files_entity_id ON files (entity_id);
CREATE INDEX IF NOT EXISTS idx_files_uploaded_by ON files (uploaded_by);
CREATE INDEX IF NOT EXISTS idx_files_created_at ON files (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_files_status ON files (status);
CREATE INDEX IF NOT EXISTS idx_files_storage_bucket ON files (storage_bucket);

ALTER TABLE files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_files" ON files;
CREATE POLICY "admin_all_files" ON files FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::user_role
    )
  );

DROP POLICY IF EXISTS "admin_insert_files" ON files;
CREATE POLICY "admin_insert_files" ON files FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::user_role
    )
  );

DROP POLICY IF EXISTS "admin_update_files" ON files;
CREATE POLICY "admin_update_files" ON files FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::user_role
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::user_role
    )
  );

DROP POLICY IF EXISTS "admin_delete_files" ON files;
CREATE POLICY "admin_delete_files" ON files FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::user_role
    )
  );

DROP POLICY IF EXISTS "read_own_files" ON files;
CREATE POLICY "read_own_files" ON files FOR SELECT
  TO authenticated
  USING (uploaded_by = auth.uid());

DROP POLICY IF EXISTS "read_public_files" ON files;
CREATE POLICY "read_public_files" ON files FOR SELECT
  TO authenticated
  USING (is_public = true AND status = 'active');

DROP POLICY IF EXISTS "read_enrolled_files" ON files;
CREATE POLICY "read_enrolled_files" ON files FOR SELECT
  TO authenticated
  USING (
    status = 'active'
    AND entity_type = 'batch'
    AND EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.profile_id = auth.uid()
      AND enrollments.batch_id = files.entity_id
      AND enrollments.access_status = 'active'
    )
  );

CREATE OR REPLACE FUNCTION update_files_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_files_updated_at ON files;
CREATE TRIGGER trigger_files_updated_at
  BEFORE UPDATE ON files
  FOR EACH ROW
  EXECUTE FUNCTION update_files_updated_at();
