-- Update ambassador levels to match StarStore structure
-- Drop existing enum and create new one with StarStore levels

-- First, update any existing data to use new level names
UPDATE ambassador_profiles 
SET current_tier = CASE 
  WHEN current_tier = 'entry' THEN 'explorer'
  WHEN current_tier = 'growing' THEN 'connector' 
  WHEN current_tier = 'advanced' THEN 'pioneer'
  WHEN current_tier = 'elite' THEN 'elite'
  ELSE 'explorer'
END;

-- Drop the old enum type and create new one
DROP TYPE IF EXISTS app_tier CASCADE;
CREATE TYPE app_tier AS ENUM ('explorer', 'connector', 'pioneer', 'elite');

-- Recreate the ambassador_profiles table with updated tier column
ALTER TABLE ambassador_profiles 
ALTER COLUMN current_tier TYPE app_tier USING current_tier::text::app_tier;

-- Update tier_configs table with new StarStore levels
TRUNCATE tier_configs;
INSERT INTO tier_configs (tier, name, level, referral_threshold, min_monthly_transactions, social_posts_required, base_earnings, commission_rate, quality_bonus) VALUES
('explorer', 'Explorer', 1, 30, 30, 4, 30.00, 0.15, 5.00),
('connector', 'Connector', 2, 50, 50, 6, 60.00, 0.18, 8.00),
('pioneer', 'Pioneer', 3, 70, 70, 8, 80.00, 0.20, 12.00),
('elite', 'Elite', 4, 100, 100, 10, 110.00, 0.25, 20.00);

-- Update any existing transactions and payouts to use new tier names
UPDATE transactions 
SET tier_at_transaction = CASE 
  WHEN tier_at_transaction = 'entry' THEN 'explorer'
  WHEN tier_at_transaction = 'growing' THEN 'connector'
  WHEN tier_at_transaction = 'advanced' THEN 'pioneer'
  WHEN tier_at_transaction = 'elite' THEN 'elite'
  ELSE 'explorer'
END;