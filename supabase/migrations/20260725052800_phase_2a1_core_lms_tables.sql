/*
# Phase 2A.1 — Core LMS Tables

## Purpose
Creates the foundational LMS content hierarchy: Batch → Subject → Chapter → Class.
This hierarchy will be used by Videos, PDF Notes, MCQs, Live Classes, Test Series,
Progress Tracking, and Purchases in later phases.

## New Tables
1. batches — top-level grouping (e.g., "GNM 1st Year")
2. subjects — belongs to batch (e.g., "Anatomy")
3. chapters — belongs to subject (e.g., "Chapter 1: Intro")
4. classes — belongs to chapter (e.g., "Class 1: Cell Structure")

## Enum
- lms_status: 'draft' | 'published' | 'archived'

## Relationships
- Batch hasMany Subjects (cascade delete)
- Subject hasMany Chapters (cascade delete)
- Chapter hasMany Classes (cascade delete)

## Indexes
- slug, foreign key, sort_order, status, created_at on all tables

## Security (RLS)
- Public/Student read: only published records (status = 'published')
- Admin full CRUD: role check via is_admin() helper

## Seed Data
- 1 Batch → 2 Subjects → 2 Chapters each → 2 Classes each (all published)
*/

-- ============================================================
-- ENUM: lms_status
-- ============================================================
DO $$ BEGIN
  CREATE TYPE lms_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- TABLE: batches
-- ============================================================
CREATE TABLE IF NOT EXISTS batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL,
  description text,
  thumbnail text,
  banner text,
  icon text,
  price numeric(10, 2) NOT NULL DEFAULT 0,
  discount_price numeric(10, 2),
  is_free boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  status lms_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT batches_slug_unique UNIQUE (slug)
);

-- ============================================================
-- TABLE: subjects
-- ============================================================
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL,
  description text,
  icon text,
  sort_order integer NOT NULL DEFAULT 0,
  status lms_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT subjects_batch_slug_unique UNIQUE (batch_id, slug)
);

-- ============================================================
-- TABLE: chapters
-- ============================================================
CREATE TABLE IF NOT EXISTS chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  status lms_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chapters_subject_slug_unique UNIQUE (subject_id, slug)
);

-- ============================================================
-- TABLE: classes
-- ============================================================
CREATE TABLE IF NOT EXISTS classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id uuid NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL,
  description text,
  thumbnail text,
  duration integer,
  sort_order integer NOT NULL DEFAULT 0,
  is_preview boolean NOT NULL DEFAULT false,
  status lms_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT classes_chapter_slug_unique UNIQUE (chapter_id, slug)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_batches_slug ON batches(slug);
CREATE INDEX IF NOT EXISTS idx_batches_status ON batches(status);
CREATE INDEX IF NOT EXISTS idx_batches_sort_order ON batches(sort_order);
CREATE INDEX IF NOT EXISTS idx_batches_created_at ON batches(created_at);

CREATE INDEX IF NOT EXISTS idx_subjects_slug ON subjects(slug);
CREATE INDEX IF NOT EXISTS idx_subjects_batch_id ON subjects(batch_id);
CREATE INDEX IF NOT EXISTS idx_subjects_status ON subjects(status);
CREATE INDEX IF NOT EXISTS idx_subjects_sort_order ON subjects(sort_order);
CREATE INDEX IF NOT EXISTS idx_subjects_created_at ON subjects(created_at);

CREATE INDEX IF NOT EXISTS idx_chapters_slug ON chapters(slug);
CREATE INDEX IF NOT EXISTS idx_chapters_subject_id ON chapters(subject_id);
CREATE INDEX IF NOT EXISTS idx_chapters_status ON chapters(status);
CREATE INDEX IF NOT EXISTS idx_chapters_sort_order ON chapters(sort_order);
CREATE INDEX IF NOT EXISTS idx_chapters_created_at ON chapters(created_at);

CREATE INDEX IF NOT EXISTS idx_classes_slug ON classes(slug);
CREATE INDEX IF NOT EXISTS idx_classes_chapter_id ON classes(chapter_id);
CREATE INDEX IF NOT EXISTS idx_classes_status ON classes(status);
CREATE INDEX IF NOT EXISTS idx_classes_sort_order ON classes(sort_order);
CREATE INDEX IF NOT EXISTS idx_classes_created_at ON classes(created_at);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_batches_updated_at ON batches;
CREATE TRIGGER trigger_batches_updated_at BEFORE UPDATE ON batches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_subjects_updated_at ON subjects;
CREATE TRIGGER trigger_subjects_updated_at BEFORE UPDATE ON subjects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_chapters_updated_at ON chapters;
CREATE TRIGGER trigger_chapters_updated_at BEFORE UPDATE ON chapters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_classes_updated_at ON classes;
CREATE TRIGGER trigger_classes_updated_at BEFORE UPDATE ON classes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- Helper function: is current user an admin?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.auth_user_id = auth.uid()
    AND profiles.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ------------------------------------------------------------
-- batches RLS
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "public_read_batches" ON batches;
CREATE POLICY "public_read_batches" ON batches FOR SELECT
  TO anon, authenticated USING (status = 'published');

DROP POLICY IF EXISTS "admin_select_batches" ON batches;
CREATE POLICY "admin_select_batches" ON batches FOR SELECT
  TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "admin_insert_batches" ON batches;
CREATE POLICY "admin_insert_batches" ON batches FOR INSERT
  TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_batches" ON batches;
CREATE POLICY "admin_update_batches" ON batches FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_batches" ON batches;
CREATE POLICY "admin_delete_batches" ON batches FOR DELETE
  TO authenticated USING (is_admin());

-- ------------------------------------------------------------
-- subjects RLS
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "public_read_subjects" ON subjects;
CREATE POLICY "public_read_subjects" ON subjects FOR SELECT
  TO anon, authenticated USING (status = 'published');

DROP POLICY IF EXISTS "admin_select_subjects" ON subjects;
CREATE POLICY "admin_select_subjects" ON subjects FOR SELECT
  TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "admin_insert_subjects" ON subjects;
CREATE POLICY "admin_insert_subjects" ON subjects FOR INSERT
  TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_subjects" ON subjects;
CREATE POLICY "admin_update_subjects" ON subjects FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_subjects" ON subjects;
CREATE POLICY "admin_delete_subjects" ON subjects FOR DELETE
  TO authenticated USING (is_admin());

-- ------------------------------------------------------------
-- chapters RLS
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "public_read_chapters" ON chapters;
CREATE POLICY "public_read_chapters" ON chapters FOR SELECT
  TO anon, authenticated USING (status = 'published');

DROP POLICY IF EXISTS "admin_select_chapters" ON chapters;
CREATE POLICY "admin_select_chapters" ON chapters FOR SELECT
  TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "admin_insert_chapters" ON chapters;
CREATE POLICY "admin_insert_chapters" ON chapters FOR INSERT
  TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_chapters" ON chapters;
CREATE POLICY "admin_update_chapters" ON chapters FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_chapters" ON chapters;
CREATE POLICY "admin_delete_chapters" ON chapters FOR DELETE
  TO authenticated USING (is_admin());

-- ------------------------------------------------------------
-- classes RLS
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "public_read_classes" ON classes;
CREATE POLICY "public_read_classes" ON classes FOR SELECT
  TO anon, authenticated USING (status = 'published');

DROP POLICY IF EXISTS "admin_select_classes" ON classes;
CREATE POLICY "admin_select_classes" ON classes FOR SELECT
  TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "admin_insert_classes" ON classes;
CREATE POLICY "admin_insert_classes" ON classes FOR INSERT
  TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_classes" ON classes;
CREATE POLICY "admin_update_classes" ON classes FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_classes" ON classes;
CREATE POLICY "admin_delete_classes" ON classes FOR DELETE
  TO authenticated USING (is_admin());

-- ============================================================
-- SEED DATA
-- 1 Batch → 2 Subjects → 2 Chapters each → 2 Classes each
-- ============================================================
INSERT INTO batches (title, slug, description, icon, price, is_free, is_published, sort_order, status)
VALUES (
  'GNM 1st Year',
  'gnm-1st-year',
  'First year of the General Nursing and Midwifery program covering foundational medical sciences.',
  'Stethoscope',
  4999,
  false,
  true,
  1,
  'published'
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO subjects (batch_id, title, slug, description, icon, sort_order, status)
VALUES (
  (SELECT id FROM batches WHERE slug = 'gnm-1st-year'),
  'Anatomy & Physiology',
  'anatomy-physiology',
  'Study of human body structure and function.',
  'Activity',
  1,
  'published'
)
ON CONFLICT (batch_id, slug) DO NOTHING;

INSERT INTO subjects (batch_id, title, slug, description, icon, sort_order, status)
VALUES (
  (SELECT id FROM batches WHERE slug = 'gnm-1st-year'),
  'Fundamentals of Nursing',
  'fundamentals-of-nursing',
  'Basic principles and practices of nursing care.',
  'Heart',
  2,
  'published'
)
ON CONFLICT (batch_id, slug) DO NOTHING;

INSERT INTO chapters (subject_id, title, slug, description, sort_order, status)
VALUES (
  (SELECT id FROM subjects WHERE slug = 'anatomy-physiology' AND batch_id = (SELECT id FROM batches WHERE slug = 'gnm-1st-year')),
  'Introduction to Human Body',
  'introduction-to-human-body',
  'Overview of body organization and basic anatomical terminology.',
  1,
  'published'
)
ON CONFLICT (subject_id, slug) DO NOTHING;

INSERT INTO chapters (subject_id, title, slug, description, sort_order, status)
VALUES (
  (SELECT id FROM subjects WHERE slug = 'anatomy-physiology' AND batch_id = (SELECT id FROM batches WHERE slug = 'gnm-1st-year')),
  'Skeletal System',
  'skeletal-system',
  'Structure and function of the human skeletal system.',
  2,
  'published'
)
ON CONFLICT (subject_id, slug) DO NOTHING;

INSERT INTO chapters (subject_id, title, slug, description, sort_order, status)
VALUES (
  (SELECT id FROM subjects WHERE slug = 'fundamentals-of-nursing' AND batch_id = (SELECT id FROM batches WHERE slug = 'gnm-1st-year')),
  'Nursing Process',
  'nursing-process',
  'The systematic approach to nursing care delivery.',
  1,
  'published'
)
ON CONFLICT (subject_id, slug) DO NOTHING;

INSERT INTO chapters (subject_id, title, slug, description, sort_order, status)
VALUES (
  (SELECT id FROM subjects WHERE slug = 'fundamentals-of-nursing' AND batch_id = (SELECT id FROM batches WHERE slug = 'gnm-1st-year')),
  'Patient Care Basics',
  'patient-care-basics',
  'Essential skills for daily patient care.',
  2,
  'published'
)
ON CONFLICT (subject_id, slug) DO NOTHING;

INSERT INTO classes (chapter_id, title, slug, description, duration, sort_order, is_preview, status)
VALUES (
  (SELECT c.id FROM chapters c JOIN subjects s ON c.subject_id = s.id WHERE c.slug = 'introduction-to-human-body' AND s.slug = 'anatomy-physiology'),
  'Body Organization',
  'body-organization',
  'Levels of structural organization in the human body.',
  1800,
  1,
  true,
  'published'
)
ON CONFLICT (chapter_id, slug) DO NOTHING;

INSERT INTO classes (chapter_id, title, slug, description, duration, sort_order, is_preview, status)
VALUES (
  (SELECT c.id FROM chapters c JOIN subjects s ON c.subject_id = s.id WHERE c.slug = 'introduction-to-human-body' AND s.slug = 'anatomy-physiology'),
  'Anatomical Terminology',
  'anatomical-terminology',
  'Standard terms for describing body directions and planes.',
  2400,
  2,
  false,
  'published'
)
ON CONFLICT (chapter_id, slug) DO NOTHING;

INSERT INTO classes (chapter_id, title, slug, description, duration, sort_order, is_preview, status)
VALUES (
  (SELECT c.id FROM chapters c JOIN subjects s ON c.subject_id = s.id WHERE c.slug = 'skeletal-system' AND s.slug = 'anatomy-physiology'),
  'Bone Structure',
  'bone-structure',
  'Detailed anatomy of bone tissue and structure.',
  3000,
  1,
  false,
  'published'
)
ON CONFLICT (chapter_id, slug) DO NOTHING;

INSERT INTO classes (chapter_id, title, slug, description, duration, sort_order, is_preview, status)
VALUES (
  (SELECT c.id FROM chapters c JOIN subjects s ON c.subject_id = s.id WHERE c.slug = 'skeletal-system' AND s.slug = 'anatomy-physiology'),
  'Joints and Articulations',
  'joints-and-articulations',
  'Types of joints and their movements.',
  2700,
  2,
  false,
  'published'
)
ON CONFLICT (chapter_id, slug) DO NOTHING;

INSERT INTO classes (chapter_id, title, slug, description, duration, sort_order, is_preview, status)
VALUES (
  (SELECT c.id FROM chapters c JOIN subjects s ON c.subject_id = s.id WHERE c.slug = 'nursing-process' AND s.slug = 'fundamentals-of-nursing'),
  'Assessment',
  'assessment',
  'Data collection and patient assessment techniques.',
  2100,
  1,
  true,
  'published'
)
ON CONFLICT (chapter_id, slug) DO NOTHING;

INSERT INTO classes (chapter_id, title, slug, description, duration, sort_order, is_preview, status)
VALUES (
  (SELECT c.id FROM chapters c JOIN subjects s ON c.subject_id = s.id WHERE c.slug = 'nursing-process' AND s.slug = 'fundamentals-of-nursing'),
  'Care Planning',
  'care-planning',
  'Developing effective nursing care plans.',
  2500,
  2,
  false,
  'published'
)
ON CONFLICT (chapter_id, slug) DO NOTHING;

INSERT INTO classes (chapter_id, title, slug, description, duration, sort_order, is_preview, status)
VALUES (
  (SELECT c.id FROM chapters c JOIN subjects s ON c.subject_id = s.id WHERE c.slug = 'patient-care-basics' AND s.slug = 'fundamentals-of-nursing'),
  'Hygiene and Comfort',
  'hygiene-and-comfort',
  'Maintaining patient hygiene and comfort standards.',
  1900,
  1,
  false,
  'published'
)
ON CONFLICT (chapter_id, slug) DO NOTHING;

INSERT INTO classes (chapter_id, title, slug, description, duration, sort_order, is_preview, status)
VALUES (
  (SELECT c.id FROM chapters c JOIN subjects s ON c.subject_id = s.id WHERE c.slug = 'patient-care-basics' AND s.slug = 'fundamentals-of-nursing'),
  'Vital Signs',
  'vital-signs',
  'Measuring and interpreting vital signs.',
  2200,
  2,
  false,
  'published'
)
ON CONFLICT (chapter_id, slug) DO NOTHING;
