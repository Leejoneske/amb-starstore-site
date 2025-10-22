-- Enhanced referral tracking functions for 100 stars activation system
-- This migration adds functions to handle referral activation and commission calculation

-- Function to update ambassador earnings
CREATE OR REPLACE FUNCTION update_ambassador_earnings(
  ambassador_id uuid,
  additional_earnings numeric
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE ambassador_profiles
  SET 
    total_earnings = total_earnings + additional_earnings,
    updated_at = NOW()
  WHERE id = ambassador_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION update_ambassador_earnings(uuid, numeric) TO authenticated;

-- Function to get tier commission rate
CREATE OR REPLACE FUNCTION get_tier_commission_rate(tier_name text)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN CASE tier_name
    WHEN 'explorer' THEN 5.0
    WHEN 'pioneer' THEN 7.0
    WHEN 'trailblazer' THEN 10.0
    WHEN 'legend' THEN 15.0
    ELSE 5.0
  END;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_tier_commission_rate(text) TO authenticated;

-- Function to check and activate referrals based on MongoDB transaction data
CREATE OR REPLACE FUNCTION check_referral_activations()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  referral_record RECORD;
  activation_count integer := 0;
  total_commission numeric := 0;
  commission_rate numeric;
  commission_amount numeric;
  result json;
BEGIN
  -- Loop through pending referrals that have MongoDB user IDs
  FOR referral_record IN 
    SELECT 
      r.id as referral_id,
      r.ambassador_id,
      r.mongo_referred_user_id,
      ap.current_tier,
      ap.referral_code
    FROM referrals r
    JOIN ambassador_profiles ap ON r.ambassador_id = ap.id
    WHERE r.status = 'pending' 
    AND r.mongo_referred_user_id IS NOT NULL
  LOOP
    -- Note: In a real implementation, you would query MongoDB here
    -- For now, we'll create a placeholder that can be called from the application
    -- The application will handle the MongoDB query and call this function with the results
    
    -- This function serves as a template for the activation logic
    -- The actual activation will be handled by the useReferralActivationTracking hook
    NULL;
  END LOOP;

  result := json_build_object(
    'activations', activation_count,
    'total_commission', total_commission,
    'message', 'Activation check completed'
  );

  RETURN result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION check_referral_activations() TO authenticated;

-- Function to manually activate a referral (called from application after MongoDB check)
CREATE OR REPLACE FUNCTION activate_referral(
  referral_id uuid,
  total_stars integer,
  activation_threshold integer DEFAULT 100
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  referral_record RECORD;
  commission_rate numeric;
  commission_amount numeric;
  result json;
BEGIN
  -- Get referral details
  SELECT 
    r.id,
    r.ambassador_id,
    r.mongo_referred_user_id,
    ap.current_tier
  INTO referral_record
  FROM referrals r
  JOIN ambassador_profiles ap ON r.ambassador_id = ap.id
  WHERE r.id = referral_id AND r.status = 'pending';

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Referral not found or already activated'
    );
  END IF;

  -- Check if user has reached activation threshold
  IF total_stars < activation_threshold THEN
    RETURN json_build_object(
      'success', false,
      'error', format('User has only %s stars, needs %s for activation', total_stars, activation_threshold)
    );
  END IF;

  -- Get commission rate for current tier
  commission_rate := get_tier_commission_rate(referral_record.current_tier);
  commission_amount := total_stars * (commission_rate / 100.0);

  -- Update referral status
  UPDATE referrals
  SET 
    status = 'active',
    activated_at = NOW(),
    updated_at = NOW()
  WHERE id = referral_id;

  -- Create commission transaction
  INSERT INTO transactions (
    ambassador_id,
    commission_amount,
    commission_rate,
    stars_awarded,
    status,
    transaction_date,
    tier_at_transaction,
    source,
    telegram_user_id,
    notes
  ) VALUES (
    referral_record.ambassador_id,
    commission_amount,
    commission_rate,
    total_stars,
    'completed',
    NOW(),
    referral_record.current_tier,
    'telegram',
    referral_record.mongo_referred_user_id,
    format('Referral activation bonus - User reached %s stars (threshold: %s)', total_stars, activation_threshold)
  );

  -- Update ambassador earnings
  PERFORM update_ambassador_earnings(referral_record.ambassador_id, commission_amount);

  -- Update ambassador active referrals count
  UPDATE ambassador_profiles
  SET 
    active_referrals = active_referrals + 1,
    updated_at = NOW()
  WHERE id = referral_record.ambassador_id;

  result := json_build_object(
    'success', true,
    'referral_id', referral_id,
    'ambassador_id', referral_record.ambassador_id,
    'commission_earned', commission_amount,
    'commission_rate', commission_rate,
    'total_stars', total_stars
  );

  RETURN result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION activate_referral(uuid, integer, integer) TO authenticated;

-- Function to get referral statistics for an ambassador
CREATE OR REPLACE FUNCTION get_referral_stats(ambassador_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stats json;
BEGIN
  SELECT json_build_object(
    'total_referrals', COUNT(*),
    'active_referrals', COUNT(*) FILTER (WHERE status = 'active'),
    'pending_referrals', COUNT(*) FILTER (WHERE status = 'pending'),
    'this_month_referrals', COUNT(*) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE)),
    'conversion_rate', CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND((COUNT(*) FILTER (WHERE status = 'active')::numeric / COUNT(*)::numeric) * 100, 2)
      ELSE 0 
    END
  )
  INTO stats
  FROM referrals
  WHERE referrals.ambassador_id = get_referral_stats.ambassador_id;

  RETURN stats;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_referral_stats(uuid) TO authenticated;

-- Create index for better performance on referral queries
CREATE INDEX IF NOT EXISTS idx_referrals_status_ambassador ON referrals(status, ambassador_id);
CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON referrals(created_at);
CREATE INDEX IF NOT EXISTS idx_referrals_activated_at ON referrals(activated_at) WHERE activated_at IS NOT NULL;

-- Add activated_at column to referrals table if it doesn't exist
ALTER TABLE referrals 
ADD COLUMN IF NOT EXISTS activated_at timestamptz;

-- Update existing active referrals to have activated_at timestamp
UPDATE referrals 
SET activated_at = updated_at 
WHERE status = 'active' AND activated_at IS NULL;

-- Add comments for documentation
COMMENT ON FUNCTION update_ambassador_earnings(uuid, numeric) IS 'Updates ambassador total earnings by adding additional earnings';
COMMENT ON FUNCTION get_tier_commission_rate(text) IS 'Returns commission rate percentage for a given tier';
COMMENT ON FUNCTION activate_referral(uuid, integer, integer) IS 'Activates a referral when user reaches star threshold and calculates commission';
COMMENT ON FUNCTION get_referral_stats(uuid) IS 'Returns comprehensive referral statistics for an ambassador';
COMMENT ON COLUMN referrals.activated_at IS 'Timestamp when referral was activated (reached 100+ stars)';