-- Run in Supabase SQL Editor (existing databases).
-- Links Razorpay payments to activation vs monthly installments.

ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_purpose VARCHAR(30) DEFAULT 'activation';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS installment_month INTEGER;

ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_payment_purpose_check;
ALTER TABLE payments ADD CONSTRAINT payments_payment_purpose_check
  CHECK (payment_purpose IN ('activation', 'installment'));

ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_installment_month_check;
ALTER TABLE payments ADD CONSTRAINT payments_installment_month_check
  CHECK (installment_month IS NULL OR (installment_month BETWEEN 1 AND 16));
