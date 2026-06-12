-- ============================================================
-- SAMRIDDHI NETWORK — SUPABASE POSTGRESQL SCHEMA
-- Run this entire file in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. GROUPS
-- ============================================================
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  max_members INTEGER DEFAULT 2500,
  cycle_months INTEGER DEFAULT 16,
  monthly_amount DECIMAL(10,2) DEFAULT 1200.00,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  referral_code VARCHAR(20) UNIQUE NOT NULL,
  sponsor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  position VARCHAR(10),
  role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_active BOOLEAN DEFAULT TRUE,
  id_proof_url VARCHAR(500),
  group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  consecutive_missed_installments INTEGER DEFAULT 0,
  membership_type VARCHAR(20) DEFAULT 'standard' CHECK (membership_type IN ('standard', 'double_id')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. NETWORK TREE (N-ary — unlimited children per node)
-- ============================================================
CREATE TABLE IF NOT EXISTS tree_nodes (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tree_edges (
  parent_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  child_user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (parent_user_id, child_user_id)
);

-- ============================================================
-- 4. WALLETS
-- ============================================================
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  balance DECIMAL(12,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  tier VARCHAR(20) NOT NULL CHECK (tier IN ('booking', 'mid', 'deluxe', 'double_id')),
  category VARCHAR(50) CHECK (category IN ('appliance', 'furniture', 'electronics', 'vehicle', 'other')),
  is_active BOOLEAN DEFAULT TRUE,
  image_url VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. USER PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS user_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  selection_stage VARCHAR(20) CHECK (selection_stage IN ('booking', 'reward_mid', 'reward_deluxe', 'double_id')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed')),
  purchased_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. TRANSACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL CHECK (type IN ('credit', 'debit')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  ref_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. INCOME LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS income_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  income_type VARCHAR(20) NOT NULL CHECK (income_type IN ('direct', 'pair', 'installment', 'rank')),
  amount DECIMAL(10,2) NOT NULL,
  from_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  level INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. PAIRS
-- ============================================================
CREATE TABLE IF NOT EXISTS pairs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  left_count INTEGER DEFAULT 0,
  right_count INTEGER DEFAULT 0,
  active_leg_count INTEGER DEFAULT 0,
  leg_counts JSONB DEFAULT '[]',
  total_pairs INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 10. INSTALLMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS installments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  month_number INTEGER NOT NULL CHECK (month_number BETWEEN 1 AND 16),
  amount DECIMAL(10,2) DEFAULT 1200.00,
  due_date TIMESTAMPTZ NOT NULL,
  paid_date TIMESTAMPTZ,
  status VARCHAR(10) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'missed')),
  UNIQUE(user_id, group_id, month_number)
);

-- ============================================================
-- 11. REWARD CATALOG
-- ============================================================
CREATE TABLE IF NOT EXISTS reward_catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  month_range_start INTEGER NOT NULL,
  month_range_end INTEGER NOT NULL,
  reward_name VARCHAR(200) NOT NULL,
  reward_category VARCHAR(50),
  quantity_per_draw INTEGER DEFAULT 1,
  image_url VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 12. LUCKY DRAWS
-- ============================================================
CREATE TABLE IF NOT EXISTS lucky_draws (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  month_number INTEGER NOT NULL,
  winner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reward_catalog_id UUID REFERENCES reward_catalog(id) ON DELETE SET NULL,
  drawn_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'drawn' CHECK (status IN ('drawn', 'collected'))
);

-- ============================================================
-- 13. RANKS
-- ============================================================
CREATE TABLE IF NOT EXISTS ranks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  pairs_required INTEGER NOT NULL,
  reward_name VARCHAR(200) NOT NULL,
  reward_value DECIMAL(12,2),
  monthly_income DECIMAL(10,2) DEFAULT 0,
  income_duration_months INTEGER DEFAULT 0,
  rank_order INTEGER NOT NULL UNIQUE
);

-- ============================================================
-- 14. USER RANKS
-- ============================================================
CREATE TABLE IF NOT EXISTS user_ranks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rank_id UUID NOT NULL REFERENCES ranks(id) ON DELETE CASCADE,
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  monthly_income_start TIMESTAMPTZ,
  monthly_income_end TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  UNIQUE(user_id, rank_id)
);

-- ============================================================
-- 15. USER REWARDS
-- ============================================================
CREATE TABLE IF NOT EXISTS user_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reward_name VARCHAR(200) NOT NULL,
  reward_type VARCHAR(20) CHECK (reward_type IN ('rank_milestone')),
  rank_id UUID REFERENCES ranks(id) ON DELETE SET NULL,
  status VARCHAR(30) DEFAULT 'pending_collection' CHECK (status IN ('pending_collection', 'collected')),
  id_proof_verified BOOLEAN DEFAULT FALSE,
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  collected_at TIMESTAMPTZ
);

-- ============================================================
-- 16. LUCKY DRAW SCHEDULES (admin sets date → members notified)
-- ============================================================
CREATE TABLE IF NOT EXISTS lucky_draw_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  month_number INTEGER NOT NULL CHECK (month_number BETWEEN 1 AND 17),
  draw_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, month_number)
);

-- ============================================================
-- 17. NOTIFICATIONS (in-app alerts for members)
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(40) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  meta JSONB DEFAULT '{}',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read_at);
CREATE INDEX IF NOT EXISTS idx_lucky_draw_schedules_date ON lucky_draw_schedules(draw_date);

-- ============================================================
-- WITHDRAWALS TABLE (for wallet withdrawal requests)
-- ============================================================
CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  bank_name VARCHAR(100),
  account_number VARCHAR(50),
  ifsc_code VARCHAR(20),
  account_holder VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note TEXT,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- ============================================================
-- PAYMENTS (Razorpay — activation fee / Month 1 installment)
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  razorpay_order_id VARCHAR(100) NOT NULL UNIQUE,
  razorpay_payment_id VARCHAR(100) UNIQUE,
  razorpay_signature VARCHAR(300),
  amount DECIMAL(10,2) NOT NULL,
  payment_purpose VARCHAR(30) DEFAULT 'activation' CHECK (payment_purpose IN ('activation', 'installment')),
  installment_month INTEGER CHECK (installment_month IS NULL OR (installment_month BETWEEN 1 AND 16)),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'captured', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_users_sponsor_id ON users(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_users_group_id ON users(group_id);
CREATE INDEX IF NOT EXISTS idx_tree_nodes_parent ON tree_nodes(parent_id);
CREATE INDEX IF NOT EXISTS idx_tree_edges_parent ON tree_edges(parent_user_id);
CREATE INDEX IF NOT EXISTS idx_income_logs_user ON income_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_installments_user ON installments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ranks_user ON user_ranks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rewards_user ON user_rewards(user_id);
