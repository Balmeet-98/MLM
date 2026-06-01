-- Optional cleanup after removing Lucky Draw from the application.
-- Run in Supabase SQL Editor on your production database.

-- 1. Remove lucky-draw notifications
DELETE FROM notifications WHERE type = 'lucky_draw_scheduled';

-- 2. Remove lucky-draw reward records (or set status if you need audit history)
DELETE FROM user_rewards WHERE reward_type = 'lucky_draw';

-- 3. Drop lucky-draw tables (order matters for FKs)
DROP TABLE IF EXISTS lucky_draw_schedules;
DROP TABLE IF EXISTS lucky_draws;
DROP TABLE IF EXISTS reward_catalog;

-- 4. Tighten user_rewards.reward_type (PostgreSQL)
ALTER TABLE user_rewards DROP CONSTRAINT IF EXISTS user_rewards_reward_type_check;
ALTER TABLE user_rewards ADD CONSTRAINT user_rewards_reward_type_check
  CHECK (reward_type IN ('rank_milestone'));

-- Note: The `groups` table and `users.group_id` are still used for installments.
-- Do not drop `groups` unless you redesign the installment model.
