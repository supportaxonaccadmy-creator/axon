/*
# Phase 5A.1 — Add Payment Gateway Columns to Purchases Table

## Summary
This migration adds payment gateway integration columns to the existing `purchases` table
to support real Razorpay payment processing. No new tables are created — only nullable
columns are added to the existing purchases table so existing data is not affected.

## Changes to `purchases` table:
- `payment_gateway` (text) — Which gateway processed the payment (razorpay, stripe, etc.)
- `payment_order_id` (text) — Gateway order ID (e.g. Razorpay order_id)
- `payment_id` (text) — Gateway payment ID (e.g. Razorpay payment_id)
- `payment_signature` (text) — Signature for verification (Razorpay signature)
- `payment_method` (text) — Payment method used (card, upi, netbanking, etc.)
- `currency` (text, default 'INR') — Currency code for the transaction
- `paid_at` (timestamptz) — When the payment was completed
- `failure_reason` (text) — Reason for payment failure if any
- `refund_status` (text) — Refund status (none, pending, completed, failed)
- `refund_id` (text) — Gateway refund ID
- `webhook_payload` (jsonb) — Raw webhook payload from gateway

## Security
- No RLS policy changes — existing policies remain in place.
- All new columns are nullable so existing rows are unaffected.
- `webhook_payload` stores raw gateway data for audit purposes.

## Important Notes
1. All columns are nullable to maintain backward compatibility.
2. The existing `payment_status` column already tracks pending/completed/failed/refunded.
3. The existing `transaction_reference` column is preserved for backward compatibility.
4. No data migration needed — existing purchases simply have NULL for new columns.
*/

DO $$
BEGIN
  -- Add payment gateway columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchases' AND column_name = 'payment_gateway') THEN
    ALTER TABLE purchases ADD COLUMN payment_gateway text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchases' AND column_name = 'payment_order_id') THEN
    ALTER TABLE purchases ADD COLUMN payment_order_id text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchases' AND column_name = 'payment_id') THEN
    ALTER TABLE purchases ADD COLUMN payment_id text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchases' AND column_name = 'payment_signature') THEN
    ALTER TABLE purchases ADD COLUMN payment_signature text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchases' AND column_name = 'payment_method') THEN
    ALTER TABLE purchases ADD COLUMN payment_method text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchases' AND column_name = 'paid_at') THEN
    ALTER TABLE purchases ADD COLUMN paid_at timestamptz;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchases' AND column_name = 'failure_reason') THEN
    ALTER TABLE purchases ADD COLUMN failure_reason text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchases' AND column_name = 'refund_status') THEN
    ALTER TABLE purchases ADD COLUMN refund_status text DEFAULT 'none';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchases' AND column_name = 'refund_id') THEN
    ALTER TABLE purchases ADD COLUMN refund_id text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchases' AND column_name = 'webhook_payload') THEN
    ALTER TABLE purchases ADD COLUMN webhook_payload jsonb;
  END IF;
END $$;

-- Add index for faster lookup by payment_order_id
CREATE INDEX IF NOT EXISTS idx_purchases_payment_order_id ON purchases (payment_order_id) WHERE payment_order_id IS NOT NULL;

-- Add index for faster lookup by payment_id
CREATE INDEX IF NOT EXISTS idx_purchases_payment_id ON purchases (payment_id) WHERE payment_id IS NOT NULL;
