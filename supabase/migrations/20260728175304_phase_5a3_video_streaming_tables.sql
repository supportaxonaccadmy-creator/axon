/*
# Phase 5A.3 — Enterprise Video Learning & Streaming System

## Purpose
Adds storage-linked columns to the existing `videos` table and creates
`video_progress` and `video_watch_history` tables for student watch tracking.

## Modified Tables
- `videos` — added 6 nullable columns:
  - `file_id` (uuid, references files.id) — link to uploaded video file
  - `thumbnail_file_id` (uuid, references files.id) — link to thumbnail image
  - `duration_seconds` (integer) — precise video duration
  - `video_quality` (text) — e.g. 720p, 1080p
  - `resolution` (text) — e.g. 1920x1080
  - `created_by` (uuid, references profiles.id) — who created the video
- Added indexes on file_id, created_by, status (already exists)

## New Tables
- `video_progress` — one record per student per video, tracks watch position,
  completion percentage, and completion status. Unique constraint on
  (student_id, video_id) ensures only one progress record per video per student.
- `video_watch_history` — log of individual watch sessions with device info
  and session duration.

## Security (RLS)
- `video_progress`: admins full CRUD; students can read/write only their own records
- `video_watch_history`: admins full CRUD; students can insert/read only their own records
*/

-- ============================================================
-- 1. Add columns to existing videos table
-- ============================================================

DO $$ BEGIN
  ALTER TABLE videos ADD COLUMN file_id uuid REFERENCES files(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE videos ADD COLUMN thumbnail_file_id uuid REFERENCES files(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE videos ADD COLUMN duration_seconds integer;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE videos ADD COLUMN video_quality text;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE videos ADD COLUMN resolution text;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE videos ADD COLUMN created_by uuid REFERENCES profiles(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_videos_file_id ON videos (file_id);
CREATE INDEX IF NOT EXISTS idx_videos_created_by ON videos (created_by);

-- ============================================================
-- 2. Create video_progress table
-- ============================================================

CREATE TABLE IF NOT EXISTS video_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  video_id uuid NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  watched_seconds integer NOT NULL DEFAULT 0,
  last_position_seconds integer NOT NULL DEFAULT 0,
  completed_percentage integer NOT NULL DEFAULT 0,
  is_completed boolean NOT NULL DEFAULT false,
  last_watched_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_video_progress_student_video
  ON video_progress (student_id, video_id);

CREATE INDEX IF NOT EXISTS idx_video_progress_student ON video_progress (student_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_video ON video_progress (video_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_completed ON video_progress (is_completed);
CREATE INDEX IF NOT EXISTS idx_video_progress_last_watched ON video_progress (last_watched_at DESC);

ALTER TABLE video_progress ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
DROP POLICY IF EXISTS "admin_all_video_progress" ON video_progress;
CREATE POLICY "admin_all_video_progress" ON video_progress FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role)
  );

DROP POLICY IF EXISTS "admin_insert_video_progress" ON video_progress;
CREATE POLICY "admin_insert_video_progress" ON video_progress FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role)
  );

DROP POLICY IF EXISTS "admin_update_video_progress" ON video_progress;
CREATE POLICY "admin_update_video_progress" ON video_progress FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role)
  );

DROP POLICY IF EXISTS "admin_delete_video_progress" ON video_progress;
CREATE POLICY "admin_delete_video_progress" ON video_progress FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role)
  );

-- Students can read their own progress
DROP POLICY IF EXISTS "read_own_video_progress" ON video_progress;
CREATE POLICY "read_own_video_progress" ON video_progress FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

-- Students can insert their own progress
DROP POLICY IF EXISTS "insert_own_video_progress" ON video_progress;
CREATE POLICY "insert_own_video_progress" ON video_progress FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

-- Students can update their own progress
DROP POLICY IF EXISTS "update_own_video_progress" ON video_progress;
CREATE POLICY "update_own_video_progress" ON video_progress FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- ============================================================
-- 3. Create video_watch_history table
-- ============================================================

CREATE TABLE IF NOT EXISTS video_watch_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  video_id uuid NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  session_duration integer NOT NULL DEFAULT 0,
  device_info jsonb,
  watched_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_video_watch_history_student ON video_watch_history (student_id);
CREATE INDEX IF NOT EXISTS idx_video_watch_history_video ON video_watch_history (video_id);
CREATE INDEX IF NOT EXISTS idx_video_watch_history_watched_at ON video_watch_history (watched_at DESC);

ALTER TABLE video_watch_history ENABLE ROW LEVEL SECURITY;

-- Admins can read all
DROP POLICY IF EXISTS "admin_all_video_watch_history" ON video_watch_history;
CREATE POLICY "admin_all_video_watch_history" ON video_watch_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role)
  );

-- Students can read their own history
DROP POLICY IF EXISTS "read_own_video_watch_history" ON video_watch_history;
CREATE POLICY "read_own_video_watch_history" ON video_watch_history FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

-- Students can insert their own history
DROP POLICY IF EXISTS "insert_own_video_watch_history" ON video_watch_history;
CREATE POLICY "insert_own_video_watch_history" ON video_watch_history FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

-- Admins can delete
DROP POLICY IF EXISTS "admin_delete_video_watch_history" ON video_watch_history;
CREATE POLICY "admin_delete_video_watch_history" ON video_watch_history FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role)
  );

-- ============================================================
-- 4. Updated_at trigger for video_progress
-- ============================================================

CREATE OR REPLACE FUNCTION update_video_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_video_progress_updated_at ON video_progress;
CREATE TRIGGER trigger_video_progress_updated_at
  BEFORE UPDATE ON video_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_video_progress_updated_at();
