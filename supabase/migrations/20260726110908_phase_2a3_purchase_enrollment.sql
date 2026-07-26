/*
# Phase 2A.3 — Purchase & Enrollment System

## Purpose
Creates the purchase and enrollment layer for the LMS.
Students can purchase batches (paid or free) and get enrolled automatically.
Admins can manually enroll students. Supports lifetime and expiry-based access.
Designed for future Razorpay integration with a generic gateway field.

## New Tables (3)
1. batch_pricing — pricing config per batch (one-to-one with batches)
2. enrollments — student-to-batch enrollment tracking (unique per student+batch)
3. purchases — payment transaction records (generic gateway field for future Razorpay)

## New Enums (3)
- enrollment_type: 'purchase' | 'admin' | 'free'
- enrollment_status: 'active' | 'expired' | 'cancelled'
- payment_status: 'pending' | 'completed' | 'failed' | 'refunded'

## Relationships
- batch_pricing.batch_id -> batches.id (CASCADE)
- enrollments.profile_id -> profiles.id (CASCADE)
- enrollments.batch_id -> batches.id (CASCADE)
- enrollments.pricing_id -> batch_pricing.id (CASCADE)
- purchases.profile_id -> profiles.id (CASCADE)
- purchases.batch_id -> batches.id (CASCADE)
- purchases.pricing_id -> batch_pricing.id (CASCADE)

## Security (RLS)
- batch_pricing: published pricing visible to authenticated; admin full CRUD
- enrollments: students see own; admin full CRUD; students cannot self-enroll
- purchases: students see own; admin full CRUD; purchases created by payment flow
- Anonymous: NO access to any of these tables

## Seed Data
- 2 batch_pricing records (one paid, one free batch)
- 1 demo student profile
- 1 demo purchase
- 1 demo enrollment
*/

-- ============================================================
-- ENUMS
-- ============================================================
DO $$ BEGIN
  CREATE TYPE enrollment_type AS ENUM ('purchase', 'admin', 'free');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE enrollment_status AS ENUM ('active', 'expired', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- TABLE: batch_pricing
-- ============================================================
CREATE TABLE IF NOT EXISTS batch_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  price numeric(10, 2) NOT NULL DEFAULT 0,
  sale_price numeric(10, 2),
  currency text NOT NULL DEFAULT 'INR',
  is_free boolean NOT NULL DEFAULT false,
  lifetime_access boolean NOT NULL DEFAULT false,
  access_duration_days integer,
  status lms_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT batch_pricing_batch_unique UNIQUE (batch_id)
);

-- ============================================================
-- TABLE: enrollments
-- ============================================================
CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  batch_id uuid NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  pricing_id uuid NOT NULL REFERENCES batch_pricing(id) ON DELETE CASCADE,
  enrollment_type enrollment_type NOT NULL DEFAULT 'purchase',
  access_status enrollment_status NOT NULL DEFAULT 'active',
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT enrollments_profile_batch_unique UNIQUE (profile_id, batch_id)
);

-- ============================================================
-- TABLE: purchases
-- ============================================================
CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  batch_id uuid NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  pricing_id uuid NOT NULL REFERENCES batch_pricing(id) ON DELETE CASCADE,
  amount numeric(10, 2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'INR',
  payment_status payment_status NOT NULL DEFAULT 'pending',
  payment_method text,
  transaction_reference text,
  gateway text NOT NULL DEFAULT 'manual',
  purchased_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_batch_pricing_batch_id ON batch_pricing(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_pricing_status ON batch_pricing(status);
CREATE INDEX IF NOT EXISTS idx_batch_pricing_created_at ON batch_pricing(created_at);

CREATE INDEX IF NOT EXISTS idx_enrollments_profile_id ON enrollments(profile_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_batch_id ON enrollments(batch_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_pricing_id ON enrollments(pricing_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_access_status ON enrollments(access_status);
CREATE INDEX IF NOT EXISTS idx_enrollments_enrolled_at ON enrollments(enrolled_at);
CREATE INDEX IF NOT EXISTS idx_enrollments_expires_at ON enrollments(expires_at);
CREATE INDEX IF NOT EXISTS idx_enrollments_created_at ON enrollments(created_at);

CREATE INDEX IF NOT EXISTS idx_purchases_profile_id ON purchases(profile_id);
CREATE INDEX IF NOT EXISTS idx_purchases_batch_id ON purchases(batch_id);
CREATE INDEX IF NOT EXISTS idx_purchases_pricing_id ON purchases(pricing_id);
CREATE INDEX IF NOT EXISTS idx_purchases_payment_status ON purchases(payment_status);
CREATE INDEX IF NOT EXISTS idx_purchases_transaction_reference ON purchases(transaction_reference);
CREATE INDEX IF NOT EXISTS idx_purchases_gateway ON purchases(gateway);
CREATE INDEX IF NOT EXISTS idx_purchases_purchased_at ON purchases(purchased_at);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================
DROP TRIGGER IF EXISTS trigger_batch_pricing_updated_at ON batch_pricing;
CREATE TRIGGER trigger_batch_pricing_updated_at BEFORE UPDATE ON batch_pricing
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_enrollments_updated_at ON enrollments;
CREATE TRIGGER trigger_enrollments_updated_at BEFORE UPDATE ON enrollments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_purchases_updated_at ON purchases;
CREATE TRIGGER trigger_purchases_updated_at BEFORE UPDATE ON purchases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE batch_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Helper: get profile_id from auth.uid()
CREATE OR REPLACE FUNCTION get_profile_id()
RETURNS uuid AS $$
BEGIN
  RETURN (SELECT id FROM profiles WHERE profiles.auth_user_id = auth.uid());
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- batch_pricing RLS
DROP POLICY IF EXISTS "auth_read_batch_pricing" ON batch_pricing;
CREATE POLICY "auth_read_batch_pricing" ON batch_pricing FOR SELECT
  TO authenticated USING (status = 'published' OR is_admin());

DROP POLICY IF EXISTS "admin_insert_batch_pricing" ON batch_pricing;
CREATE POLICY "admin_insert_batch_pricing" ON batch_pricing FOR INSERT
  TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_batch_pricing" ON batch_pricing;
CREATE POLICY "admin_update_batch_pricing" ON batch_pricing FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_batch_pricing" ON batch_pricing;
CREATE POLICY "admin_delete_batch_pricing" ON batch_pricing FOR DELETE
  TO authenticated USING (is_admin());

-- enrollments RLS
DROP POLICY IF EXISTS "auth_read_enrollments" ON enrollments;
CREATE POLICY "auth_read_enrollments" ON enrollments FOR SELECT
  TO authenticated USING (profile_id = get_profile_id() OR is_admin());

DROP POLICY IF EXISTS "admin_insert_enrollments" ON enrollments;
CREATE POLICY "admin_insert_enrollments" ON enrollments FOR INSERT
  TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_enrollments" ON enrollments;
CREATE POLICY "admin_update_enrollments" ON enrollments FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_enrollments" ON enrollments;
CREATE POLICY "admin_delete_enrollments" ON enrollments FOR DELETE
  TO authenticated USING (is_admin());

-- purchases RLS
DROP POLICY IF EXISTS "auth_read_purchases" ON purchases;
CREATE POLICY "auth_read_purchases" ON purchases FOR SELECT
  TO authenticated USING (profile_id = get_profile_id() OR is_admin());

DROP POLICY IF EXISTS "admin_insert_purchases" ON purchases;
CREATE POLICY "admin_insert_purchases" ON purchases FOR INSERT
  TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_purchases" ON purchases;
CREATE POLICY "admin_update_purchases" ON purchases FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_purchases" ON purchases;
CREATE POLICY "admin_delete_purchases" ON purchases FOR DELETE
  TO authenticated USING (is_admin());

-- ============================================================
-- SEED DATA
-- ============================================================

-- Create a second batch (free) for demo
INSERT INTO batches (title, slug, description, icon, price, is_free, is_published, sort_order, status)
VALUES (
  'Free Nursing Basics',
  'free-nursing-basics',
  'A free introductory course covering essential nursing concepts.',
  'Heart',
  0,
  true,
  true,
  2,
  'published'
)
ON CONFLICT (slug) DO NOTHING;

-- Pricing for the paid batch (GNM 1st Year)
INSERT INTO batch_pricing (batch_id, price, sale_price, currency, is_free, lifetime_access, access_duration_days, status)
VALUES (
  (SELECT id FROM batches WHERE slug = 'gnm-1st-year'),
  4999,
  3499,
  'INR',
  false,
  false,
  365,
  'published'
)
ON CONFLICT (batch_id) DO NOTHING;

-- Pricing for the free batch
INSERT INTO batch_pricing (batch_id, price, sale_price, currency, is_free, lifetime_access, access_duration_days, status)
VALUES (
  (SELECT id FROM batches WHERE slug = 'free-nursing-basics'),
  0,
  null,
  'INR',
  true,
  true,
  null,
  'published'
)
ON CONFLICT (batch_id) DO NOTHING;

-- Create a demo student profile (if none exists)
INSERT INTO profiles (full_name, email, role, is_active)
SELECT 'Demo Student', 'demo.student@axon.test', 'student', true
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE role = 'student' LIMIT 1);

-- Demo purchase (for the paid batch)
INSERT INTO purchases (profile_id, batch_id, pricing_id, amount, currency, payment_status, payment_method, transaction_reference, gateway, purchased_at)
SELECT
  (SELECT id FROM profiles WHERE role = 'student' ORDER BY created_at LIMIT 1),
  (SELECT id FROM batches WHERE slug = 'gnm-1st-year'),
  (SELECT id FROM batch_pricing WHERE batch_id = (SELECT id FROM batches WHERE slug = 'gnm-1st-year')),
  3499,
  'INR',
  'completed',
  'upi',
  'DEMO_TXN_001',
  'manual',
  now()
WHERE NOT EXISTS (SELECT 1 FROM purchases LIMIT 1);

-- Demo enrollment (for the paid batch)
INSERT INTO enrollments (profile_id, batch_id, pricing_id, enrollment_type, access_status, enrolled_at, expires_at)
SELECT
  (SELECT id FROM profiles WHERE role = 'student' ORDER BY created_at LIMIT 1),
  (SELECT id FROM batches WHERE slug = 'gnm-1st-year'),
  (SELECT id FROM batch_pricing WHERE batch_id = (SELECT id FROM batches WHERE slug = 'gnm-1st-year')),
  'purchase',
  'active',
  now(),
  now() + interval '365 days'
WHERE NOT EXISTS (SELECT 1 FROM enrollments LIMIT 1);
