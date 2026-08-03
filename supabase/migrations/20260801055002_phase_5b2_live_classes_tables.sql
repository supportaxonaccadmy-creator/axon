/*
# Phase 5B.2 — Enterprise Live Classes, Meetings & Streaming System

## Purpose
Creates a complete live class system supporting Zoom, Google Meet, Jitsi Meet,
YouTube Live, and external URLs. Includes attendance tracking, recording library,
live chat (future-ready), meeting provider config, and reminders.

## New Tables
1. meeting_providers
2. live_classes
3. live_attendance
4. live_recordings
5. live_chat_messages
6. live_reminders

## Security (RLS)
- meeting_providers: admin only (all CRUD)
- live_classes: admin full CRUD; students read only classes for their enrolled batches
- live_attendance: admin full CRUD; students read own attendance records
- live_recordings: admin full CRUD; students read recordings for enrolled batches
- live_chat_messages: admin full CRUD; students insert/read for enrolled batches
- live_reminders: admin only
*/

-- ============================================================
-- Enums
-- ============================================================

DO $$ BEGIN
  CREATE TYPE meeting_provider_type AS ENUM (
    'zoom', 'google_meet', 'jitsi_meet', 'microsoft_teams',
    'youtube_live', 'custom_url'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE live_class_status AS ENUM ('scheduled', 'live', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE recurring_pattern AS ENUM ('none', 'daily', 'weekly', 'monthly', 'custom');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE recording_source AS ENUM ('youtube', 'vimeo', 'supabase_storage', 'external_url');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE reminder_type AS ENUM (
    '24h', '1h', '15min', 'started', 'cancelled', 'rescheduled', 'recording_available'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE reminder_status AS ENUM ('pending', 'sent', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 1. meeting_providers table
-- ============================================================

CREATE TABLE IF NOT EXISTS meeting_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  provider_type meeting_provider_type NOT NULL,
  api_key text,
  api_secret text,
  server_url text,
  default_settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_meeting_providers_type
  ON meeting_providers (provider_type);
CREATE INDEX IF NOT EXISTS idx_meeting_providers_active ON meeting_providers (is_active);

-- ============================================================
-- 2. live_classes table
-- ============================================================

CREATE TABLE IF NOT EXISTS live_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  provider_type meeting_provider_type NOT NULL DEFAULT 'custom_url',
  meeting_url text NOT NULL,
  meeting_password text,
  meeting_id text,
  host_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  batch_id uuid REFERENCES batches(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES subjects(id) ON DELETE SET NULL,
  chapter_id uuid REFERENCES chapters(id) ON DELETE SET NULL,
  class_id uuid REFERENCES classes(id) ON DELETE SET NULL,
  thumbnail_url text,
  banner_url text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  timezone text NOT NULL DEFAULT 'UTC',
  status live_class_status NOT NULL DEFAULT 'scheduled',
  recurring recurring_pattern NOT NULL DEFAULT 'none',
  recurring_interval integer,
  recurring_end_date timestamptz,
  waiting_room boolean NOT NULL DEFAULT false,
  max_participants integer,
  allow_recording boolean NOT NULL DEFAULT true,
  auto_recording boolean NOT NULL DEFAULT false,
  host_controls jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_live_classes_status ON live_classes (status);
CREATE INDEX IF NOT EXISTS idx_live_classes_batch ON live_classes (batch_id);
CREATE INDEX IF NOT EXISTS idx_live_classes_start ON live_classes (start_time);
CREATE INDEX IF NOT EXISTS idx_live_classes_provider ON live_classes (provider_type);
CREATE INDEX IF NOT EXISTS idx_live_classes_recurring ON live_classes (recurring);

-- ============================================================
-- 3. live_attendance table
-- ============================================================

CREATE TABLE IF NOT EXISTS live_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  live_class_id uuid NOT NULL REFERENCES live_classes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  join_time timestamptz,
  leave_time timestamptz,
  duration_seconds integer NOT NULL DEFAULT 0,
  status attendance_status NOT NULL DEFAULT 'absent',
  manual_override boolean NOT NULL DEFAULT false,
  overridden_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_live_attendance_unique
  ON live_attendance (live_class_id, student_id);
CREATE INDEX IF NOT EXISTS idx_live_attendance_student ON live_attendance (student_id);
CREATE INDEX IF NOT EXISTS idx_live_attendance_class ON live_attendance (live_class_id);
CREATE INDEX IF NOT EXISTS idx_live_attendance_status ON live_attendance (status);

-- ============================================================
-- 4. live_recordings table
-- ============================================================

CREATE TABLE IF NOT EXISTS live_recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  live_class_id uuid REFERENCES live_classes(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  source recording_source NOT NULL DEFAULT 'external_url',
  url text NOT NULL,
  download_url text,
  thumbnail_url text,
  duration_seconds integer,
  file_size_bytes bigint,
  batch_id uuid REFERENCES batches(id) ON DELETE CASCADE,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_live_recordings_class ON live_recordings (live_class_id);
CREATE INDEX IF NOT EXISTS idx_live_recordings_batch ON live_recordings (batch_id);
CREATE INDEX IF NOT EXISTS idx_live_recordings_source ON live_recordings (source);
CREATE INDEX IF NOT EXISTS idx_live_recordings_created ON live_recordings (created_at DESC);

-- ============================================================
-- 5. live_chat_messages table
-- ============================================================

CREATE TABLE IF NOT EXISTS live_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  live_class_id uuid NOT NULL REFERENCES live_classes(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message text NOT NULL,
  is_pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_live_chat_class ON live_chat_messages (live_class_id);
CREATE INDEX IF NOT EXISTS idx_live_chat_sender ON live_chat_messages (sender_id);
CREATE INDEX IF NOT EXISTS idx_live_chat_created ON live_chat_messages (created_at);

-- ============================================================
-- 6. live_reminders table
-- ============================================================

CREATE TABLE IF NOT EXISTS live_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  live_class_id uuid NOT NULL REFERENCES live_classes(id) ON DELETE CASCADE,
  reminder_type reminder_type NOT NULL,
  status reminder_status NOT NULL DEFAULT 'pending',
  scheduled_for timestamptz NOT NULL,
  sent_at timestamptz,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_live_reminders_class ON live_reminders (live_class_id);
CREATE INDEX IF NOT EXISTS idx_live_reminders_status ON live_reminders (status);
CREATE INDEX IF NOT EXISTS idx_live_reminders_scheduled ON live_reminders (scheduled_for);

-- ============================================================
-- Enable RLS on all tables
-- ============================================================

ALTER TABLE meeting_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_reminders ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS: meeting_providers (admin only)
-- ============================================================

DROP POLICY IF EXISTS "admin_all_meeting_providers" ON meeting_providers;
CREATE POLICY "admin_all_meeting_providers" ON meeting_providers FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role));

DROP POLICY IF EXISTS "admin_insert_meeting_providers" ON meeting_providers;
CREATE POLICY "admin_insert_meeting_providers" ON meeting_providers FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role));

DROP POLICY IF EXISTS "admin_update_meeting_providers" ON meeting_providers;
CREATE POLICY "admin_update_meeting_providers" ON meeting_providers FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role));

DROP POLICY IF EXISTS "admin_delete_meeting_providers" ON meeting_providers;
CREATE POLICY "admin_delete_meeting_providers" ON meeting_providers FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role));

-- ============================================================
-- RLS: live_classes
-- ============================================================

DROP POLICY IF EXISTS "admin_all_live_classes" ON live_classes;
CREATE POLICY "admin_all_live_classes" ON live_classes FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role));

DROP POLICY IF EXISTS "admin_insert_live_classes" ON live_classes;
CREATE POLICY "admin_insert_live_classes" ON live_classes FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role));

DROP POLICY IF EXISTS "admin_update_live_classes" ON live_classes;
CREATE POLICY "admin_update_live_classes" ON live_classes FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role));

DROP POLICY IF EXISTS "admin_delete_live_classes" ON live_classes;
CREATE POLICY "admin_delete_live_classes" ON live_classes FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role));

DROP POLICY IF EXISTS "student_read_enrolled_live_classes" ON live_classes;
CREATE POLICY "student_read_enrolled_live_classes" ON live_classes FOR SELECT
  TO authenticated
  USING (
    batch_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM enrollments e
      WHERE e.profile_id = auth.uid() AND e.batch_id = live_classes.batch_id
    )
  );

-- ============================================================
-- RLS: live_attendance
-- ============================================================

DROP POLICY IF EXISTS "admin_all_live_attendance" ON live_attendance;
CREATE POLICY "admin_all_live_attendance" ON live_attendance FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role));

DROP POLICY IF EXISTS "admin_insert_live_attendance" ON live_attendance;
CREATE POLICY "admin_insert_live_attendance" ON live_attendance FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role));

DROP POLICY IF EXISTS "admin_update_live_attendance" ON live_attendance;
CREATE POLICY "admin_update_live_attendance" ON live_attendance FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role));

DROP POLICY IF EXISTS "admin_delete_live_attendance" ON live_attendance;
CREATE POLICY "admin_delete_live_attendance" ON live_attendance FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role));

DROP POLICY IF EXISTS "student_read_own_attendance" ON live_attendance;
CREATE POLICY "student_read_own_attendance" ON live_attendance FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

DROP POLICY IF EXISTS "student_insert_own_attendance" ON live_attendance;
CREATE POLICY "student_insert_own_attendance" ON live_attendance FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "student_update_own_attendance" ON live_attendance;
CREATE POLICY "student_update_own_attendance" ON live_attendance FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- ============================================================
-- RLS: live_recordings
-- ============================================================

DROP POLICY IF EXISTS "admin_all_live_recordings" ON live_recordings;
CREATE POLICY "admin_all_live_recordings" ON live_recordings FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role));

DROP POLICY IF EXISTS "admin_insert_live_recordings" ON live_recordings;
CREATE POLICY "admin_insert_live_recordings" ON live_recordings FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role));

DROP POLICY IF EXISTS "admin_update_live_recordings" ON live_recordings;
CREATE POLICY "admin_update_live_recordings" ON live_recordings FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role));

DROP POLICY IF EXISTS "admin_delete_live_recordings" ON live_recordings;
CREATE POLICY "admin_delete_live_recordings" ON live_recordings FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role));

DROP POLICY IF EXISTS "student_read_enrolled_recordings" ON live_recordings;
CREATE POLICY "student_read_enrolled_recordings" ON live_recordings FOR SELECT
  TO authenticated
  USING (
    batch_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM enrollments e
      WHERE e.profile_id = auth.uid() AND e.batch_id = live_recordings.batch_id
    )
  );

-- ============================================================
-- RLS: live_chat_messages
-- ============================================================

DROP POLICY IF EXISTS "admin_all_live_chat" ON live_chat_messages;
CREATE POLICY "admin_all_live_chat" ON live_chat_messages FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role));

DROP POLICY IF EXISTS "admin_insert_live_chat" ON live_chat_messages;
CREATE POLICY "admin_insert_live_chat" ON live_chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role));

DROP POLICY IF EXISTS "admin_update_live_chat" ON live_chat_messages;
CREATE POLICY "admin_update_live_chat" ON live_chat_messages FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role));

DROP POLICY IF EXISTS "admin_delete_live_chat" ON live_chat_messages;
CREATE POLICY "admin_delete_live_chat" ON live_chat_messages FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role));

DROP POLICY IF EXISTS "student_read_enrolled_chat" ON live_chat_messages;
CREATE POLICY "student_read_enrolled_chat" ON live_chat_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM live_classes lc
      JOIN enrollments e ON e.batch_id = lc.batch_id AND e.profile_id = auth.uid()
      WHERE lc.id = live_chat_messages.live_class_id
    )
  );

DROP POLICY IF EXISTS "student_insert_enrolled_chat" ON live_chat_messages;
CREATE POLICY "student_insert_enrolled_chat" ON live_chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM live_classes lc
      JOIN enrollments e ON e.batch_id = lc.batch_id AND e.profile_id = auth.uid()
      WHERE lc.id = live_chat_messages.live_class_id
    )
  );

-- ============================================================
-- RLS: live_reminders (admin only)
-- ============================================================

DROP POLICY IF EXISTS "admin_all_live_reminders" ON live_reminders;
CREATE POLICY "admin_all_live_reminders" ON live_reminders FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role));

DROP POLICY IF EXISTS "admin_insert_live_reminders" ON live_reminders;
CREATE POLICY "admin_insert_live_reminders" ON live_reminders FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role));

DROP POLICY IF EXISTS "admin_update_live_reminders" ON live_reminders;
CREATE POLICY "admin_update_live_reminders" ON live_reminders FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role));

DROP POLICY IF EXISTS "admin_delete_live_reminders" ON live_reminders;
CREATE POLICY "admin_delete_live_reminders" ON live_reminders FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role));

-- ============================================================
-- Triggers: updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_live_classes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_live_classes_updated_at ON live_classes;
CREATE TRIGGER trigger_live_classes_updated_at
  BEFORE UPDATE ON live_classes
  FOR EACH ROW
  EXECUTE FUNCTION update_live_classes_updated_at();

CREATE OR REPLACE FUNCTION update_live_attendance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_live_attendance_updated_at ON live_attendance;
CREATE TRIGGER trigger_live_attendance_updated_at
  BEFORE UPDATE ON live_attendance
  FOR EACH ROW
  EXECUTE FUNCTION update_live_attendance_updated_at();

CREATE OR REPLACE FUNCTION update_live_recordings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_live_recordings_updated_at ON live_recordings;
CREATE TRIGGER trigger_live_recordings_updated_at
  BEFORE UPDATE ON live_recordings
  FOR EACH ROW
  EXECUTE FUNCTION update_live_recordings_updated_at();

CREATE OR REPLACE FUNCTION update_meeting_providers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_meeting_providers_updated_at ON meeting_providers;
CREATE TRIGGER trigger_meeting_providers_updated_at
  BEFORE UPDATE ON meeting_providers
  FOR EACH ROW
  EXECUTE FUNCTION update_meeting_providers_updated_at();
