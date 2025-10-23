-- Star Store Data Cache Tables
-- These tables cache data from the main Star Store app for resilience

-- Users cache table
CREATE TABLE IF NOT EXISTS starstore_users_cache (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id text NOT NULL,
  username text,
  total_referrals integer DEFAULT 0,
  active_referrals integer DEFAULT 0,
  pending_referrals integer DEFAULT 0,
  total_earnings numeric DEFAULT 0,
  buy_orders integer DEFAULT 0,
  sell_orders integer DEFAULT 0,
  total_stars_earned integer DEFAULT 0,
  created_at timestamptz,
  last_active timestamptz,
  is_ambassador boolean DEFAULT false,
  ambassador_tier text,
  ambassador_synced_at timestamptz,
  synced_at timestamptz DEFAULT now(),
  UNIQUE(telegram_id)
);

-- Referrals cache table
CREATE TABLE IF NOT EXISTS starstore_referrals_cache (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  starstore_id text NOT NULL,
  referrer_user_id text NOT NULL,
  referred_user_id text NOT NULL,
  referrer_username text,
  referred_username text,
  status text NOT NULL CHECK (status IN ('pending', 'active', 'completed')),
  date_referred timestamptz,
  withdrawn boolean DEFAULT false,
  referrer_is_ambassador boolean DEFAULT false,
  referrer_tier text,
  synced_at timestamptz DEFAULT now(),
  UNIQUE(starstore_id)
);

-- Transactions cache table
CREATE TABLE IF NOT EXISTS starstore_transactions_cache (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  starstore_id text NOT NULL,
  type text NOT NULL CHECK (type IN ('buy', 'sell')),
  telegram_id text NOT NULL,
  username text,
  amount numeric NOT NULL,
  stars integer NOT NULL,
  status text NOT NULL,
  created_at timestamptz,
  is_premium boolean DEFAULT false,
  premium_duration integer,
  wallet_address text,
  synced_at timestamptz DEFAULT now(),
  UNIQUE(starstore_id)
);

-- Analytics cache table
CREATE TABLE IF NOT EXISTS starstore_analytics_cache (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  total_users integer DEFAULT 0,
  total_referrals integer DEFAULT 0,
  active_referrals integer DEFAULT 0,
  total_transactions integer DEFAULT 0,
  conversion_rate numeric DEFAULT 0,
  today_users integer DEFAULT 0,
  today_referrals integer DEFAULT 0,
  week_users integer DEFAULT 0,
  week_referrals integer DEFAULT 0,
  month_users integer DEFAULT 0,
  month_referrals integer DEFAULT 0,
  total_earnings numeric DEFAULT 0,
  total_stars_traded integer DEFAULT 0,
  starstore_timestamp timestamptz,
  synced_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_starstore_users_telegram_id ON starstore_users_cache(telegram_id);
CREATE INDEX IF NOT EXISTS idx_starstore_users_synced_at ON starstore_users_cache(synced_at);
CREATE INDEX IF NOT EXISTS idx_starstore_users_is_ambassador ON starstore_users_cache(is_ambassador);

CREATE INDEX IF NOT EXISTS idx_starstore_referrals_referrer ON starstore_referrals_cache(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_starstore_referrals_status ON starstore_referrals_cache(status);
CREATE INDEX IF NOT EXISTS idx_starstore_referrals_synced_at ON starstore_referrals_cache(synced_at);

CREATE INDEX IF NOT EXISTS idx_starstore_transactions_telegram_id ON starstore_transactions_cache(telegram_id);
CREATE INDEX IF NOT EXISTS idx_starstore_transactions_type ON starstore_transactions_cache(type);
CREATE INDEX IF NOT EXISTS idx_starstore_transactions_status ON starstore_transactions_cache(status);
CREATE INDEX IF NOT EXISTS idx_starstore_transactions_synced_at ON starstore_transactions_cache(synced_at);

CREATE INDEX IF NOT EXISTS idx_starstore_analytics_synced_at ON starstore_analytics_cache(synced_at);

-- Enable RLS (Row Level Security)
ALTER TABLE starstore_users_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE starstore_referrals_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE starstore_transactions_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE starstore_analytics_cache ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (admins and ambassadors)
CREATE POLICY "Allow authenticated users to read users cache" ON starstore_users_cache
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read referrals cache" ON starstore_referrals_cache
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read transactions cache" ON starstore_transactions_cache
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read analytics cache" ON starstore_analytics_cache
  FOR SELECT TO authenticated USING (true);

-- Allow service role to manage cache data
CREATE POLICY "Allow service role to manage users cache" ON starstore_users_cache
  FOR ALL TO service_role USING (true);

CREATE POLICY "Allow service role to manage referrals cache" ON starstore_referrals_cache
  FOR ALL TO service_role USING (true);

CREATE POLICY "Allow service role to manage transactions cache" ON starstore_transactions_cache
  FOR ALL TO service_role USING (true);

CREATE POLICY "Allow service role to manage analytics cache" ON starstore_analytics_cache
  FOR ALL TO service_role USING (true);

-- Add comments for documentation
COMMENT ON TABLE starstore_users_cache IS 'Cached user data from Star Store for resilience';
COMMENT ON TABLE starstore_referrals_cache IS 'Cached referral data from Star Store for resilience';
COMMENT ON TABLE starstore_transactions_cache IS 'Cached transaction data from Star Store for resilience';
COMMENT ON TABLE starstore_analytics_cache IS 'Cached analytics data from Star Store for resilience';