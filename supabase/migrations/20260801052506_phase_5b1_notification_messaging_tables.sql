/*
# Phase 5B.1 — Enterprise Notification, Communication & Messaging System

## Purpose
Creates a complete communication system between Admin and Students supporting
in-app notifications, email notifications, announcements, broadcast messages,
batch-wise notifications, and individual student messages.

## New Tables
1. notifications — notification metadata (type, title, message, priority, channels, action link, batch_id, scheduled_for)
2. notification_recipients — one row per recipient per notification, tracks read status
3. announcements — admin announcements with pinning, scheduling, expiration, batch/global
4. message_templates — reusable email templates with variables
5. email_logs — log of outgoing emails with status, retry count

## Security (RLS)
- notifications: admins full CRUD; students read only where they are a recipient
- notification_recipients: admins full CRUD; students read/update/delete own records
- announcements: admins full CRUD; students read published (global or enrolled batch)
- message_templates: admins only
- email_logs: admins only
*/

-- ============================================================
-- Enums
-- ============================================================

DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM (
    'course_purchased', 'enrollment_success', 'payment_failed',
    'live_class_reminder', 'live_class_started', 'assignment_available',
    'pdf_uploaded', 'video_uploaded', 'mcq_available',
    'course_completed', 'certificate_ready',
    'system_announcement', 'custom_admin_message'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE notification_priority AS ENUM ('low', 'normal', 'high', 'urgent');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE notification_channel AS ENUM ('in_app', 'email', 'push');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE announcement_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE template_type AS ENUM (
    'welcome', 'purchase_success', 'enrollment', 'password_reset',
    'payment_failed', 'live_reminder', 'certificate', 'custom'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE email_status AS ENUM ('pending', 'sent', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 1. notifications table
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type notification_type NOT NULL DEFAULT 'custom_admin_message',
  title text NOT NULL,
  message text NOT NULL,
  priority notification_priority NOT NULL DEFAULT 'normal',
  channels notification_channel[] NOT NULL DEFAULT ARRAY['in_app']::notification_channel[],
  action_url text,
  action_label text,
  batch_id uuid REFERENCES batches(id) ON DELETE CASCADE,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  scheduled_for timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications (type);
CREATE INDEX IF NOT EXISTS idx_notifications_batch ON notifications (batch_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled ON notifications (scheduled_for);

-- ============================================================
-- 2. notification_recipients table
-- ============================================================

CREATE TABLE IF NOT EXISTS notification_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id uuid NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_read boolean NOT NULL DEFAULT false,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_notif_recipients_unique
  ON notification_recipients (notification_id, recipient_id);
CREATE INDEX IF NOT EXISTS idx_notif_recipients_recipient ON notification_recipients (recipient_id);
CREATE INDEX IF NOT EXISTS idx_notif_recipients_read ON notification_recipients (is_read);
CREATE INDEX IF NOT EXISTS idx_notif_recipients_notification ON notification_recipients (notification_id);

-- ============================================================
-- 3. announcements table
-- ============================================================

CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  image_url text,
  is_pinned boolean NOT NULL DEFAULT false,
  is_global boolean NOT NULL DEFAULT false,
  batch_id uuid REFERENCES batches(id) ON DELETE CASCADE,
  status announcement_status NOT NULL DEFAULT 'draft',
  scheduled_for timestamptz,
  expires_at timestamptz,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_announcements_status ON announcements (status);
CREATE INDEX IF NOT EXISTS idx_announcements_batch ON announcements (batch_id);
CREATE INDEX IF NOT EXISTS idx_announcements_pinned ON announcements (is_pinned);
CREATE INDEX IF NOT EXISTS idx_announcements_created ON announcements (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_scheduled ON announcements (scheduled_for);

-- ============================================================
-- 4. message_templates table
-- ============================================================

CREATE TABLE IF NOT EXISTS message_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type template_type NOT NULL DEFAULT 'custom',
  subject text NOT NULL,
  body text NOT NULL,
  variables text[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_templates_type ON message_templates (type);
CREATE INDEX IF NOT EXISTS idx_templates_active ON message_templates (is_active);

-- ============================================================
-- 5. email_logs table
-- ============================================================

CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email text NOT NULL,
  recipient_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  subject text NOT NULL,
  body text NOT NULL,
  status email_status NOT NULL DEFAULT 'pending',
  error_message text,
  retry_count integer NOT NULL DEFAULT 0,
  notification_id uuid REFERENCES notifications(id) ON DELETE SET NULL,
  template_id uuid REFERENCES message_templates(id) ON DELETE SET NULL,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs (status);
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs (recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_created ON email_logs (created_at DESC);

-- ============================================================
-- RLS: Enable on all tables
-- ============================================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS: notifications policies
-- ============================================================

DROP POLICY IF EXISTS "admin_all_notifications" ON notifications;
CREATE POLICY "admin_all_notifications" ON notifications FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role));

DROP POLICY IF EXISTS "admin_insert_notifications" ON notifications;
CREATE POLICY "admin_insert_notifications" ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role));

DROP POLICY IF EXISTS "admin_update_notifications" ON notifications;
CREATE POLICY "admin_update_notifications" ON notifications FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role));

DROP POLICY IF EXISTS "admin_delete_notifications" ON notifications;
CREATE POLICY "admin_delete_notifications" ON notifications FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role));

DROP POLICY IF EXISTS "student_read_own_notifications" ON notifications;
CREATE POLICY "student_read_own_notifications" ON notifications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM notification_recipients nr
      WHERE nr.notification_id = notifications.id AND nr.recipient_id = auth.uid()
    )
  );

-- ============================================================
-- RLS: notification_recipients policies
-- ============================================================

DROP POLICY IF EXISTS "admin_all_notif_recipients" ON notification_recipients;
CREATE POLICY "admin_all_notif_recipients" ON notification_recipients FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role));

DROP POLICY IF EXISTS "admin_insert_notif_recipients" ON notification_recipients;
CREATE POLICY "admin_insert_notif_recipients" ON notification_recipients FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role));

DROP POLICY IF EXISTS "admin_update_notif_recipients" ON notification_recipients;
CREATE POLICY "admin_update_notif_recipients" ON notification_recipients FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role));

DROP POLICY IF EXISTS "admin_delete_notif_recipients" ON notification_recipients;
CREATE POLICY "admin_delete_notif_recipients" ON notification_recipients FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role));

DROP POLICY IF EXISTS "student_read_own_notif_recipients" ON notification_recipients;
CREATE POLICY "student_read_own_notif_recipients" ON notification_recipients FOR SELECT
  TO authenticated
  USING (recipient_id = auth.uid());

DROP POLICY IF EXISTS "student_update_own_notif_recipients" ON notification_recipients;
CREATE POLICY "student_update_own_notif_recipients" ON notification_recipients FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

DROP POLICY IF EXISTS "student_delete_own_notif_recipients" ON notification_recipients;
CREATE POLICY "student_delete_own_notif_recipients" ON notification_recipients FOR DELETE
  TO authenticated
  USING (recipient_id = auth.uid());

-- ============================================================
-- RLS: announcements policies
-- ============================================================

DROP POLICY IF EXISTS "admin_all_announcements" ON announcements;
CREATE POLICY "admin_all_announcements" ON announcements FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role));

DROP POLICY IF EXISTS "admin_insert_announcements" ON announcements;
CREATE POLICY "admin_insert_announcements" ON announcements FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role));

DROP POLICY IF EXISTS "admin_update_announcements" ON announcements;
CREATE POLICY "admin_update_announcements" ON announcements FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role));

DROP POLICY IF EXISTS "admin_delete_announcements" ON announcements;
CREATE POLICY "admin_delete_announcements" ON announcements FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role));

DROP POLICY IF EXISTS "student_read_published_announcements" ON announcements;
CREATE POLICY "student_read_published_announcements" ON announcements FOR SELECT
  TO authenticated
  USING (
    status = 'published'::announcement_status
    AND (
      is_global = true
      OR batch_id IS NULL
      OR EXISTS (
        SELECT 1 FROM enrollments e
        WHERE e.profile_id = auth.uid() AND e.batch_id = announcements.batch_id
      )
    )
  );

-- ============================================================
-- RLS: message_templates policies (admin only)
-- ============================================================

DROP POLICY IF EXISTS "admin_all_message_templates" ON message_templates;
CREATE POLICY "admin_all_message_templates" ON message_templates FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role));

DROP POLICY IF EXISTS "admin_insert_message_templates" ON message_templates;
CREATE POLICY "admin_insert_message_templates" ON message_templates FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role));

DROP POLICY IF EXISTS "admin_update_message_templates" ON message_templates;
CREATE POLICY "admin_update_message_templates" ON message_templates FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role));

DROP POLICY IF EXISTS "admin_delete_message_templates" ON message_templates;
CREATE POLICY "admin_delete_message_templates" ON message_templates FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role));

-- ============================================================
-- RLS: email_logs policies (admin only)
-- ============================================================

DROP POLICY IF EXISTS "admin_all_email_logs" ON email_logs;
CREATE POLICY "admin_all_email_logs" ON email_logs FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role));

DROP POLICY IF EXISTS "admin_insert_email_logs" ON email_logs;
CREATE POLICY "admin_insert_email_logs" ON email_logs FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role));

DROP POLICY IF EXISTS "admin_update_email_logs" ON email_logs;
CREATE POLICY "admin_update_email_logs" ON email_logs FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role));

DROP POLICY IF EXISTS "admin_delete_email_logs" ON email_logs;
CREATE POLICY "admin_delete_email_logs" ON email_logs FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::user_role));

-- ============================================================
-- Triggers: updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notifications_updated_at ON notifications;
CREATE TRIGGER trigger_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

CREATE OR REPLACE FUNCTION update_announcements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_announcements_updated_at ON announcements;
CREATE TRIGGER trigger_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_announcements_updated_at();

CREATE OR REPLACE FUNCTION update_message_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_message_templates_updated_at ON message_templates;
CREATE TRIGGER trigger_message_templates_updated_at
  BEFORE UPDATE ON message_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_message_templates_updated_at();
