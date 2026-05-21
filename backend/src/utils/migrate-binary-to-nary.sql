-- One-time migration: binary_tree (left/right) → tree_nodes + tree_edges
-- Run in Supabase SQL Editor after deploying new application code.

-- 1. Create new tables if not present
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

ALTER TABLE pairs ADD COLUMN IF NOT EXISTS active_leg_count INTEGER DEFAULT 0;
ALTER TABLE pairs ADD COLUMN IF NOT EXISTS leg_counts JSONB DEFAULT '[]';

-- 2. Migrate nodes from binary_tree
INSERT INTO tree_nodes (user_id, parent_id, created_at)
SELECT user_id, parent_id, created_at
FROM binary_tree
ON CONFLICT (user_id) DO NOTHING;

-- 3. Migrate left/right edges
INSERT INTO tree_edges (parent_user_id, child_user_id, created_at)
SELECT user_id, left_child_id, created_at
FROM binary_tree
WHERE left_child_id IS NOT NULL
ON CONFLICT (parent_user_id, child_user_id) DO NOTHING;

INSERT INTO tree_edges (parent_user_id, child_user_id, created_at)
SELECT user_id, right_child_id, created_at
FROM binary_tree
WHERE right_child_id IS NOT NULL
ON CONFLICT (parent_user_id, child_user_id) DO NOTHING;

-- 4. Optional: drop legacy table after verifying migration
-- DROP TABLE IF EXISTS binary_tree;
