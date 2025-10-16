-- Add MongoDB integration fields to support cross-platform referral tracking
-- This enables syncing data between Telegram miniapp (MongoDB) and web dashboard (Supabase)

-- Add MongoDB-specific fields to ambassador_profiles
ALTER TABLE ambassador_profiles 
ADD COLUMN IF NOT EXISTS telegram_id text,
ADD COLUMN IF NOT EXISTS telegram_username text,
ADD COLUMN IF NOT EXISTS mongo_total_earnings numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS mongo_total_referrals integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_mongo_sync timestamptz,
ADD COLUMN IF NOT EXISTS mongo_user_id text;

-- Add MongoDB-specific fields to referrals table
ALTER TABLE referrals
ADD COLUMN IF NOT EXISTS mongo_referral_id text,
ADD COLUMN IF NOT EXISTS mongo_referred_user_id text,
ADD COLUMN IF NOT EXISTS source text DEFAULT 'web' CHECK (source IN ('web', 'telegram', 'api'));

-- Add MongoDB-specific fields to transactions table
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS mongo_transaction_id text,
ADD COLUMN IF NOT EXISTS source text DEFAULT 'web' CHECK (source IN ('web', 'telegram', 'api')),
ADD COLUMN IF NOT EXISTS telegram_user_id text;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ambassador_profiles_telegram_id ON ambassador_profiles(telegram_id);
CREATE INDEX IF NOT EXISTS idx_ambassador_profiles_mongo_user_id ON ambassador_profiles(mongo_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_mongo_referral_id ON referrals(mongo_referral_id);
CREATE INDEX IF NOT EXISTS idx_referrals_source ON referrals(source);
CREATE INDEX IF NOT EXISTS idx_transactions_mongo_transaction_id ON transactions(mongo_transaction_id);
CREATE INDEX IF NOT EXISTS idx_transactions_source ON transactions(source);
CREATE INDEX IF NOT EXISTS idx_transactions_telegram_user_id ON transactions(telegram_user_id);

-- Create a view for combined referral statistics
CREATE OR REPLACE VIEW combined_referral_stats AS
SELECT 
  ap.id as ambassador_id,
  ap.user_id,
  ap.referral_code,
  ap.telegram_id,
  ap.telegram_username,
  -- Web referrals (from Supabase)
  COALESCE(web_stats.web_referrals, 0) as web_referrals,
  COALESCE(web_stats.web_active_referrals, 0) as web_active_referrals,
  -- Telegram referrals (from MongoDB sync)
  COALESCE(tg_stats.telegram_referrals, 0) as telegram_referrals,
  COALESCE(tg_stats.telegram_active_referrals, 0) as telegram_active_referrals,
  -- Combined totals
  COALESCE(web_stats.web_referrals, 0) + COALESCE(tg_stats.telegram_referrals, 0) as total_referrals,
  COALESCE(web_stats.web_active_referrals, 0) + COALESCE(tg_stats.telegram_active_referrals, 0) as total_active_referrals,
  -- Earnings
  ap.total_earnings as web_earnings,
  ap.mongo_total_earnings as telegram_earnings,
  ap.total_earnings + COALESCE(ap.mongo_total_earnings, 0) as combined_earnings
FROM ambassador_profiles ap
LEFT JOIN (
  SELECT 
    ambassador_id,
    COUNT(*) as web_referrals,
    COUNT(*) FILTER (WHERE status = 'active') as web_active_referrals
  FROM referrals 
  WHERE source = 'web' OR source IS NULL
  GROUP BY ambassador_id
) web_stats ON ap.id = web_stats.ambassador_id
LEFT JOIN (
  SELECT 
    ambassador_id,
    COUNT(*) as telegram_referrals,
    COUNT(*) FILTER (WHERE status = 'active') as telegram_active_referrals
  FROM referrals 
  WHERE source = 'telegram'
  GROUP BY ambassador_id
) tg_stats ON ap.id = tg_stats.ambassador_id;

-- Grant access to the view
GRANT SELECT ON combined_referral_stats TO authenticated;

-- Create RLS policy for the view
CREATE POLICY "Users can view their own combined stats" ON combined_referral_stats
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Function to sync MongoDB user data
CREATE OR REPLACE FUNCTION sync_mongo_user_data(
  p_telegram_id text,
  p_telegram_username text DEFAULT NULL,
  p_mongo_user_id text DEFAULT NULL,
  p_total_earnings numeric DEFAULT 0,
  p_total_referrals integer DEFAULT 0
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_ambassador_id uuid;
  v_result json;
BEGIN
  -- Find ambassador by telegram_id or create/update
  SELECT id INTO v_ambassador_id
  FROM ambassador_profiles
  WHERE telegram_id = p_telegram_id;

  IF v_ambassador_id IS NOT NULL THEN
    -- Update existing ambassador
    UPDATE ambassador_profiles
    SET 
      telegram_username = COALESCE(p_telegram_username, telegram_username),
      mongo_user_id = COALESCE(p_mongo_user_id, mongo_user_id),
      mongo_total_earnings = p_total_earnings,
      mongo_total_referrals = p_total_referrals,
      last_mongo_sync = NOW(),
      updated_at = NOW()
    WHERE id = v_ambassador_id;
    
    v_result = json_build_object(
      'success', true,
      'action', 'updated',
      'ambassador_id', v_ambassador_id
    );
  ELSE
    v_result = json_build_object(
      'success', false,
      'error', 'Ambassador not found for telegram_id: ' || p_telegram_id
    );
  END IF;

  RETURN v_result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION sync_mongo_user_data(text, text, text, numeric, integer) TO authenticated;

-- Function to create referral from MongoDB data
CREATE OR REPLACE FUNCTION create_mongo_referral(
  p_ambassador_telegram_id text,
  p_mongo_referral_id text,
  p_mongo_referred_user_id text,
  p_referral_code text,
  p_status text DEFAULT 'pending',
  p_referred_at timestamptz DEFAULT NOW()
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_ambassador_id uuid;
  v_referral_id uuid;
  v_result json;
BEGIN
  -- Find ambassador by telegram_id
  SELECT id INTO v_ambassador_id
  FROM ambassador_profiles
  WHERE telegram_id = p_ambassador_telegram_id;

  IF v_ambassador_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Ambassador not found for telegram_id: ' || p_ambassador_telegram_id
    );
  END IF;

  -- Check if referral already exists
  SELECT id INTO v_referral_id
  FROM referrals
  WHERE mongo_referral_id = p_mongo_referral_id;

  IF v_referral_id IS NOT NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Referral already exists with mongo_referral_id: ' || p_mongo_referral_id
    );
  END IF;

  -- Create new referral
  INSERT INTO referrals (
    ambassador_id,
    referral_code,
    mongo_referral_id,
    mongo_referred_user_id,
    status,
    source,
    referred_at,
    created_at
  ) VALUES (
    v_ambassador_id,
    p_referral_code,
    p_mongo_referral_id,
    p_mongo_referred_user_id,
    p_status,
    'telegram',
    p_referred_at,
    NOW()
  ) RETURNING id INTO v_referral_id;

  RETURN json_build_object(
    'success', true,
    'referral_id', v_referral_id,
    'ambassador_id', v_ambassador_id
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_mongo_referral(text, text, text, text, text, timestamptz) TO authenticated;

-- Add comments for documentation
COMMENT ON COLUMN ambassador_profiles.telegram_id IS 'Telegram user ID from miniapp';
COMMENT ON COLUMN ambassador_profiles.telegram_username IS 'Telegram username from miniapp';
COMMENT ON COLUMN ambassador_profiles.mongo_total_earnings IS 'Total earnings from MongoDB/Telegram miniapp';
COMMENT ON COLUMN ambassador_profiles.mongo_total_referrals IS 'Total referrals from MongoDB/Telegram miniapp';
COMMENT ON COLUMN ambassador_profiles.last_mongo_sync IS 'Last time data was synced from MongoDB';
COMMENT ON COLUMN ambassador_profiles.mongo_user_id IS 'MongoDB ObjectId for this user';

COMMENT ON COLUMN referrals.mongo_referral_id IS 'MongoDB ObjectId of the referral record';
COMMENT ON COLUMN referrals.mongo_referred_user_id IS 'MongoDB ObjectId of the referred user';
COMMENT ON COLUMN referrals.source IS 'Source of the referral: web, telegram, or api';

COMMENT ON COLUMN transactions.mongo_transaction_id IS 'MongoDB ObjectId of the transaction record';
COMMENT ON COLUMN transactions.source IS 'Source of the transaction: web, telegram, or api';
COMMENT ON COLUMN transactions.telegram_user_id IS 'Telegram user ID who made the transaction';