/*
# Phase 2A.2 — Content Tables (Videos, PDF Notes, MCQs, Attachments)

## Purpose
Creates the LMS content layer that hangs off the existing Class entity.
All content belongs to a Class (which belongs to Chapter -> Subject -> Batch).

## New Tables (5)
1. videos — video content for a class (YouTube or direct URL)
2. pdf_notes — PDF study material for a class
3. mcq_sets — MCQ test sets for a class
4. mcq_questions — individual questions within an MCQ set
5. attachments — additional file attachments for a class

## Relationships
- Class hasMany Videos (cascade delete)
- Class hasMany PDF Notes (cascade delete)
- Class hasMany MCQ Sets (cascade delete)
- MCQ Set hasMany MCQ Questions (cascade delete)
- Class hasMany Attachments (cascade delete)

## Indexes
- slug, class_id, mcq_set_id, status, sort_order, created_at on all tables
- GIN trigram indexes on title for fuzzy search (videos, pdf_notes, mcq_sets)

## Security (RLS)
- Public read: TO anon, authenticated — published records only
- Admin full CRUD: TO authenticated via is_admin() helper (reused from Phase 2A.1)

## Seed Data
- For the first class ("body-organization") of "Anatomy & Physiology":
  - 2 Videos, 2 PDFs, 1 MCQ Set with 10 MCQ Questions, 2 Attachments
- All seed records marked as published
*/

-- ============================================================
-- TABLE: videos
-- ============================================================
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL,
  description text,
  youtube_url text,
  video_url text,
  duration integer,
  thumbnail text,
  is_preview boolean NOT NULL DEFAULT false,
  status lms_status NOT NULL DEFAULT 'draft',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT videos_class_slug_unique UNIQUE (class_id, slug)
);

-- ============================================================
-- TABLE: pdf_notes
-- ============================================================
CREATE TABLE IF NOT EXISTS pdf_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL,
  description text,
  file_url text,
  total_pages integer,
  file_size bigint,
  is_downloadable boolean NOT NULL DEFAULT false,
  status lms_status NOT NULL DEFAULT 'draft',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pdf_notes_class_slug_unique UNIQUE (class_id, slug)
);

-- ============================================================
-- TABLE: mcq_sets
-- ============================================================
CREATE TABLE IF NOT EXISTS mcq_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL,
  description text,
  instructions text,
  duration_minutes integer,
  total_marks integer NOT NULL DEFAULT 0,
  passing_marks integer NOT NULL DEFAULT 0,
  attempts_allowed integer,
  shuffle_questions boolean NOT NULL DEFAULT false,
  show_result boolean NOT NULL DEFAULT true,
  status lms_status NOT NULL DEFAULT 'draft',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT mcq_sets_class_slug_unique UNIQUE (class_id, slug)
);

-- ============================================================
-- TABLE: mcq_questions
-- ============================================================
CREATE TABLE IF NOT EXISTS mcq_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mcq_set_id uuid NOT NULL REFERENCES mcq_sets(id) ON DELETE CASCADE,
  question text NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_c text NOT NULL,
  option_d text NOT NULL,
  correct_option char(1) NOT NULL CHECK (correct_option IN ('a', 'b', 'c', 'd')),
  explanation text,
  marks integer NOT NULL DEFAULT 1,
  negative_marks numeric(5, 2) NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  status lms_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLE: attachments
-- ============================================================
CREATE TABLE IF NOT EXISTS attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  title text NOT NULL,
  file_url text,
  file_type text,
  file_size bigint,
  status lms_status NOT NULL DEFAULT 'draft',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- videos indexes
CREATE INDEX IF NOT EXISTS idx_videos_slug ON videos(slug);
CREATE INDEX IF NOT EXISTS idx_videos_class_id ON videos(class_id);
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
CREATE INDEX IF NOT EXISTS idx_videos_sort_order ON videos(sort_order);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at);

-- pdf_notes indexes
CREATE INDEX IF NOT EXISTS idx_pdf_notes_slug ON pdf_notes(slug);
CREATE INDEX IF NOT EXISTS idx_pdf_notes_class_id ON pdf_notes(class_id);
CREATE INDEX IF NOT EXISTS idx_pdf_notes_status ON pdf_notes(status);
CREATE INDEX IF NOT EXISTS idx_pdf_notes_sort_order ON pdf_notes(sort_order);
CREATE INDEX IF NOT EXISTS idx_pdf_notes_created_at ON pdf_notes(created_at);

-- mcq_sets indexes
CREATE INDEX IF NOT EXISTS idx_mcq_sets_slug ON mcq_sets(slug);
CREATE INDEX IF NOT EXISTS idx_mcq_sets_class_id ON mcq_sets(class_id);
CREATE INDEX IF NOT EXISTS idx_mcq_sets_status ON mcq_sets(status);
CREATE INDEX IF NOT EXISTS idx_mcq_sets_sort_order ON mcq_sets(sort_order);
CREATE INDEX IF NOT EXISTS idx_mcq_sets_created_at ON mcq_sets(created_at);

-- mcq_questions indexes
CREATE INDEX IF NOT EXISTS idx_mcq_questions_mcq_set_id ON mcq_questions(mcq_set_id);
CREATE INDEX IF NOT EXISTS idx_mcq_questions_status ON mcq_questions(status);
CREATE INDEX IF NOT EXISTS idx_mcq_questions_sort_order ON mcq_questions(sort_order);
CREATE INDEX IF NOT EXISTS idx_mcq_questions_created_at ON mcq_questions(created_at);

-- attachments indexes
CREATE INDEX IF NOT EXISTS idx_attachments_class_id ON attachments(class_id);
CREATE INDEX IF NOT EXISTS idx_attachments_status ON attachments(status);
CREATE INDEX IF NOT EXISTS idx_attachments_sort_order ON attachments(sort_order);
CREATE INDEX IF NOT EXISTS idx_attachments_created_at ON attachments(created_at);

-- Search optimization: GIN trigram indexes on title for fuzzy search
CREATE INDEX IF NOT EXISTS idx_videos_title_trgm ON videos USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_pdf_notes_title_trgm ON pdf_notes USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_mcq_sets_title_trgm ON mcq_sets USING gin (title gin_trgm_ops);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
DROP TRIGGER IF EXISTS trigger_videos_updated_at ON videos;
CREATE TRIGGER trigger_videos_updated_at BEFORE UPDATE ON videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_pdf_notes_updated_at ON pdf_notes;
CREATE TRIGGER trigger_pdf_notes_updated_at BEFORE UPDATE ON pdf_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_mcq_sets_updated_at ON mcq_sets;
CREATE TRIGGER trigger_mcq_sets_updated_at BEFORE UPDATE ON mcq_sets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_mcq_questions_updated_at ON mcq_questions;
CREATE TRIGGER trigger_mcq_questions_updated_at BEFORE UPDATE ON mcq_questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_attachments_updated_at ON attachments;
CREATE TRIGGER trigger_attachments_updated_at BEFORE UPDATE ON attachments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdf_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mcq_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE mcq_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- videos RLS
DROP POLICY IF EXISTS "public_read_videos" ON videos;
CREATE POLICY "public_read_videos" ON videos FOR SELECT
  TO anon, authenticated USING (status = 'published');
DROP POLICY IF EXISTS "admin_select_videos" ON videos;
CREATE POLICY "admin_select_videos" ON videos FOR SELECT
  TO authenticated USING (is_admin());
DROP POLICY IF EXISTS "admin_insert_videos" ON videos;
CREATE POLICY "admin_insert_videos" ON videos FOR INSERT
  TO authenticated WITH CHECK (is_admin());
DROP POLICY IF EXISTS "admin_update_videos" ON videos;
CREATE POLICY "admin_update_videos" ON videos FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());
DROP POLICY IF EXISTS "admin_delete_videos" ON videos;
CREATE POLICY "admin_delete_videos" ON videos FOR DELETE
  TO authenticated USING (is_admin());

-- pdf_notes RLS
DROP POLICY IF EXISTS "public_read_pdf_notes" ON pdf_notes;
CREATE POLICY "public_read_pdf_notes" ON pdf_notes FOR SELECT
  TO anon, authenticated USING (status = 'published');
DROP POLICY IF EXISTS "admin_select_pdf_notes" ON pdf_notes;
CREATE POLICY "admin_select_pdf_notes" ON pdf_notes FOR SELECT
  TO authenticated USING (is_admin());
DROP POLICY IF EXISTS "admin_insert_pdf_notes" ON pdf_notes;
CREATE POLICY "admin_insert_pdf_notes" ON pdf_notes FOR INSERT
  TO authenticated WITH CHECK (is_admin());
DROP POLICY IF EXISTS "admin_update_pdf_notes" ON pdf_notes;
CREATE POLICY "admin_update_pdf_notes" ON pdf_notes FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());
DROP POLICY IF EXISTS "admin_delete_pdf_notes" ON pdf_notes;
CREATE POLICY "admin_delete_pdf_notes" ON pdf_notes FOR DELETE
  TO authenticated USING (is_admin());

-- mcq_sets RLS
DROP POLICY IF EXISTS "public_read_mcq_sets" ON mcq_sets;
CREATE POLICY "public_read_mcq_sets" ON mcq_sets FOR SELECT
  TO anon, authenticated USING (status = 'published');
DROP POLICY IF EXISTS "admin_select_mcq_sets" ON mcq_sets;
CREATE POLICY "admin_select_mcq_sets" ON mcq_sets FOR SELECT
  TO authenticated USING (is_admin());
DROP POLICY IF EXISTS "admin_insert_mcq_sets" ON mcq_sets;
CREATE POLICY "admin_insert_mcq_sets" ON mcq_sets FOR INSERT
  TO authenticated WITH CHECK (is_admin());
DROP POLICY IF EXISTS "admin_update_mcq_sets" ON mcq_sets;
CREATE POLICY "admin_update_mcq_sets" ON mcq_sets FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());
DROP POLICY IF EXISTS "admin_delete_mcq_sets" ON mcq_sets;
CREATE POLICY "admin_delete_mcq_sets" ON mcq_sets FOR DELETE
  TO authenticated USING (is_admin());

-- mcq_questions RLS
DROP POLICY IF EXISTS "public_read_mcq_questions" ON mcq_questions;
CREATE POLICY "public_read_mcq_questions" ON mcq_questions FOR SELECT
  TO anon, authenticated USING (status = 'published');
DROP POLICY IF EXISTS "admin_select_mcq_questions" ON mcq_questions;
CREATE POLICY "admin_select_mcq_questions" ON mcq_questions FOR SELECT
  TO authenticated USING (is_admin());
DROP POLICY IF EXISTS "admin_insert_mcq_questions" ON mcq_questions;
CREATE POLICY "admin_insert_mcq_questions" ON mcq_questions FOR INSERT
  TO authenticated WITH CHECK (is_admin());
DROP POLICY IF EXISTS "admin_update_mcq_questions" ON mcq_questions;
CREATE POLICY "admin_update_mcq_questions" ON mcq_questions FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());
DROP POLICY IF EXISTS "admin_delete_mcq_questions" ON mcq_questions;
CREATE POLICY "admin_delete_mcq_questions" ON mcq_questions FOR DELETE
  TO authenticated USING (is_admin());

-- attachments RLS
DROP POLICY IF EXISTS "public_read_attachments" ON attachments;
CREATE POLICY "public_read_attachments" ON attachments FOR SELECT
  TO anon, authenticated USING (status = 'published');
DROP POLICY IF EXISTS "admin_select_attachments" ON attachments;
CREATE POLICY "admin_select_attachments" ON attachments FOR SELECT
  TO authenticated USING (is_admin());
DROP POLICY IF EXISTS "admin_insert_attachments" ON attachments;
CREATE POLICY "admin_insert_attachments" ON attachments FOR INSERT
  TO authenticated WITH CHECK (is_admin());
DROP POLICY IF EXISTS "admin_update_attachments" ON attachments;
CREATE POLICY "admin_update_attachments" ON attachments FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());
DROP POLICY IF EXISTS "admin_delete_attachments" ON attachments;
CREATE POLICY "admin_delete_attachments" ON attachments FOR DELETE
  TO authenticated USING (is_admin());

-- ============================================================
-- SEED DATA
-- For the first class ("body-organization") of "Anatomy & Physiology"
-- ============================================================

-- Videos (2)
INSERT INTO videos (class_id, title, slug, description, youtube_url, duration, thumbnail, is_preview, status, sort_order)
VALUES (
  (SELECT cl.id FROM classes cl JOIN chapters ch ON cl.chapter_id = ch.id JOIN subjects s ON ch.subject_id = s.id WHERE cl.slug = 'body-organization' AND s.slug = 'anatomy-physiology'),
  'Introduction to Body Organization',
  'intro-to-body-organization',
  'Overview of the levels of structural organization in the human body.',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  1800,
  'https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg',
  true,
  'published',
  1
)
ON CONFLICT (class_id, slug) DO NOTHING;

INSERT INTO videos (class_id, title, slug, description, video_url, duration, thumbnail, is_preview, status, sort_order)
VALUES (
  (SELECT cl.id FROM classes cl JOIN chapters ch ON cl.chapter_id = ch.id JOIN subjects s ON ch.subject_id = s.id WHERE cl.slug = 'body-organization' AND s.slug = 'anatomy-physiology'),
  'Cell Structure Overview',
  'cell-structure-overview',
  'Detailed look at cellular components and their functions.',
  'https://example.com/videos/cell-structure.mp4',
  2400,
  'https://images.pexels.com/photos/3825529/pexels-photo-3825529.jpeg',
  false,
  'published',
  2
)
ON CONFLICT (class_id, slug) DO NOTHING;

-- PDF Notes (2)
INSERT INTO pdf_notes (class_id, title, slug, description, file_url, total_pages, file_size, is_downloadable, status, sort_order)
VALUES (
  (SELECT cl.id FROM classes cl JOIN chapters ch ON cl.chapter_id = ch.id JOIN subjects s ON ch.subject_id = s.id WHERE cl.slug = 'body-organization' AND s.slug = 'anatomy-physiology'),
  'Body Organization Notes',
  'body-organization-notes',
  'Comprehensive notes on body organization levels.',
  'https://example.com/pdfs/body-organization.pdf',
  24,
  1048576,
  true,
  'published',
  1
)
ON CONFLICT (class_id, slug) DO NOTHING;

INSERT INTO pdf_notes (class_id, title, slug, description, file_url, total_pages, file_size, is_downloadable, status, sort_order)
VALUES (
  (SELECT cl.id FROM classes cl JOIN chapters ch ON cl.chapter_id = ch.id JOIN subjects s ON ch.subject_id = s.id WHERE cl.slug = 'body-organization' AND s.slug = 'anatomy-physiology'),
  'Cell Biology Reference',
  'cell-biology-reference',
  'Reference material on cell biology fundamentals.',
  'https://example.com/pdfs/cell-biology.pdf',
  48,
  2097152,
  false,
  'published',
  2
)
ON CONFLICT (class_id, slug) DO NOTHING;

-- MCQ Set (1)
INSERT INTO mcq_sets (class_id, title, slug, description, instructions, duration_minutes, total_marks, passing_marks, attempts_allowed, shuffle_questions, show_result, status, sort_order)
VALUES (
  (SELECT cl.id FROM classes cl JOIN chapters ch ON cl.chapter_id = ch.id JOIN subjects s ON ch.subject_id = s.id WHERE cl.slug = 'body-organization' AND s.slug = 'anatomy-physiology'),
  'Body Organization Quiz',
  'body-organization-quiz',
  'Test your knowledge of body organization.',
  'Read each question carefully. Select the best answer.',
  30,
  10,
  6,
  3,
  true,
  true,
  'published',
  1
)
ON CONFLICT (class_id, slug) DO NOTHING;

-- MCQ Questions (10)
INSERT INTO mcq_questions (mcq_set_id, question, option_a, option_b, option_c, option_d, correct_option, explanation, marks, negative_marks, sort_order, status)
VALUES
  ((SELECT ms.id FROM mcq_sets ms JOIN classes cl ON ms.class_id = cl.id JOIN chapters ch ON cl.chapter_id = ch.id JOIN subjects s ON ch.subject_id = s.id WHERE ms.slug = 'body-organization-quiz' AND s.slug = 'anatomy-physiology'),
   'Which of the following is the smallest unit of life?', 'Tissue', 'Cell', 'Organ', 'Organ system', 'b', 'The cell is the basic structural and functional unit of life.', 1, 0, 1, 'published'),
  ((SELECT ms.id FROM mcq_sets ms JOIN classes cl ON ms.class_id = cl.id JOIN chapters ch ON cl.chapter_id = ch.id JOIN subjects s ON ch.subject_id = s.id WHERE ms.slug = 'body-organization-quiz' AND s.slug = 'anatomy-physiology'),
   'How many levels of structural organization are there in the human body?', '4', '5', '6', '7', 'c', 'There are 6 levels: chemical, cellular, tissue, organ, system, and organismal.', 1, 0, 2, 'published'),
  ((SELECT ms.id FROM mcq_sets ms JOIN classes cl ON ms.class_id = cl.id JOIN chapters ch ON cl.chapter_id = ch.id JOIN subjects s ON ch.subject_id = s.id WHERE ms.slug = 'body-organization-quiz' AND s.slug = 'anatomy-physiology'),
   'Which level of organization involves molecules combining to form cells?', 'Chemical level', 'Cellular level', 'Tissue level', 'Organ level', 'a', 'The chemical level involves atoms and molecules combining to form cells.', 1, 0, 3, 'published'),
  ((SELECT ms.id FROM mcq_sets ms JOIN classes cl ON ms.class_id = cl.id JOIN chapters ch ON cl.chapter_id = ch.id JOIN subjects s ON ch.subject_id = s.id WHERE ms.slug = 'body-organization-quiz' AND s.slug = 'anatomy-physiology'),
   'A group of similar cells working together forms a:', 'Organ', 'Tissue', 'System', 'Organism', 'b', 'A tissue is a group of similar cells that work together to perform a function.', 1, 0, 4, 'published'),
  ((SELECT ms.id FROM mcq_sets ms JOIN classes cl ON ms.class_id = cl.id JOIN chapters ch ON cl.chapter_id = ch.id JOIN subjects s ON ch.subject_id = s.id WHERE ms.slug = 'body-organization-quiz' AND s.slug = 'anatomy-physiology'),
   'Which organ system is responsible for transporting oxygen and nutrients?', 'Digestive system', 'Respiratory system', 'Cardiovascular system', 'Nervous system', 'c', 'The cardiovascular system transports oxygen, nutrients, and waste throughout the body.', 1, 0, 5, 'published'),
  ((SELECT ms.id FROM mcq_sets ms JOIN classes cl ON ms.class_id = cl.id JOIN chapters ch ON cl.chapter_id = ch.id JOIN subjects s ON ch.subject_id = s.id WHERE ms.slug = 'body-organization-quiz' AND s.slug = 'anatomy-physiology'),
   'The highest level of organization is the:', 'Organ system', 'Organism', 'Tissue', 'Cellular', 'b', 'The organismal level is the highest level, representing the complete living being.', 1, 0, 6, 'published'),
  ((SELECT ms.id FROM mcq_sets ms JOIN classes cl ON ms.class_id = cl.id JOIN chapters ch ON cl.chapter_id = ch.id JOIN subjects s ON ch.subject_id = s.id WHERE ms.slug = 'body-organization-quiz' AND s.slug = 'anatomy-physiology'),
   'Which of the following is NOT a basic life process?', 'Metabolism', 'Responsiveness', 'Photosynthesis', 'Growth', 'c', 'Photosynthesis is a plant process, not a human life process.', 1, 0.25, 7, 'published'),
  ((SELECT ms.id FROM mcq_sets ms JOIN classes cl ON ms.class_id = cl.id JOIN chapters ch ON cl.chapter_id = ch.id JOIN subjects s ON ch.subject_id = s.id WHERE ms.slug = 'body-organization-quiz' AND s.slug = 'anatomy-physiology'),
   'Homeostasis refers to:', 'Disease state', 'Maintaining internal balance', 'Cell division', 'Muscle contraction', 'b', 'Homeostasis is the maintenance of a stable internal environment.', 1, 0, 8, 'published'),
  ((SELECT ms.id FROM mcq_sets ms JOIN classes cl ON ms.class_id = cl.id JOIN chapters ch ON cl.chapter_id = ch.id JOIN subjects s ON ch.subject_id = s.id WHERE ms.slug = 'body-organization-quiz' AND s.slug = 'anatomy-physiology'),
   'Which imaging technique uses magnetic fields and radio waves?', 'X-ray', 'CT scan', 'MRI', 'Ultrasound', 'c', 'MRI (Magnetic Resonance Imaging) uses magnetic fields and radio waves.', 1, 0, 9, 'published'),
  ((SELECT ms.id FROM mcq_sets ms JOIN classes cl ON ms.class_id = cl.id JOIN chapters ch ON cl.chapter_id = ch.id JOIN subjects s ON ch.subject_id = s.id WHERE ms.slug = 'body-organization-quiz' AND s.slug = 'anatomy-physiology'),
   'The anatomical position is characterized by:', 'Standing upright, palms facing backward', 'Standing upright, palms facing forward', 'Lying down, palms facing up', 'Sitting, palms facing down', 'b', 'In the anatomical position, the body is upright with palms facing forward.', 1, 0, 10, 'published')
ON CONFLICT DO NOTHING;

-- Attachments (2)
INSERT INTO attachments (class_id, title, file_url, file_type, file_size, status, sort_order)
VALUES (
  (SELECT cl.id FROM classes cl JOIN chapters ch ON cl.chapter_id = ch.id JOIN subjects s ON ch.subject_id = s.id WHERE cl.slug = 'body-organization' AND s.slug = 'anatomy-physiology'),
  'Body Organization Slides',
  'https://example.com/attachments/body-org-slides.pdf',
  'application/pdf',
  524288,
  'published',
  1
)
ON CONFLICT DO NOTHING;

INSERT INTO attachments (class_id, title, file_url, file_type, file_size, status, sort_order)
VALUES (
  (SELECT cl.id FROM classes cl JOIN chapters ch ON cl.chapter_id = ch.id JOIN subjects s ON ch.subject_id = s.id WHERE cl.slug = 'body-organization' AND s.slug = 'anatomy-physiology'),
  'Anatomical Terminology Chart',
  'https://example.com/attachments/anatomical-terms.png',
  'image/png',
  1048576,
  'published',
  2
)
ON CONFLICT DO NOTHING;
