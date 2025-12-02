-- Update calculate_tier function to consider multiple factors
CREATE OR REPLACE FUNCTION public.calculate_tier(
  referral_count INT,
  quality_rate NUMERIC DEFAULT 0,
  social_posts INT DEFAULT 0
)
RETURNS public.app_tier
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Legend tier: 100+ referrals, 85%+ quality rate, 15+ social posts
  IF referral_count >= 100 AND quality_rate >= 85 AND social_posts >= 15 THEN 
    RETURN 'elite';
  -- Trailblazer tier: 50+ referrals, 80%+ quality rate, 12+ social posts
  ELSIF referral_count >= 50 AND quality_rate >= 80 AND social_posts >= 12 THEN 
    RETURN 'advanced';
  -- Pioneer tier: 25+ referrals, 75%+ quality rate, 8+ social posts
  ELSIF referral_count >= 25 AND quality_rate >= 75 AND social_posts >= 8 THEN 
    RETURN 'growing';
  -- Explorer tier: 10+ referrals, 70%+ quality rate, 4+ social posts
  ELSIF referral_count >= 10 AND quality_rate >= 70 AND social_posts >= 4 THEN
    RETURN 'entry';
  -- Default to entry if minimum not met but has some referrals
  ELSE 
    RETURN 'entry';
  END IF;
END;
$$;

-- Update the trigger to pass all necessary parameters
CREATE OR REPLACE FUNCTION public.update_ambassador_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_stars BIGINT;
  total_transactions INT;
  quality_transactions INT;
  calculated_quality_rate NUMERIC;
  social_posts_count INT;
BEGIN
  -- Update total earnings
  UPDATE public.ambassador_profiles
  SET 
    total_earnings = total_earnings + NEW.commission_amount,
    pending_earnings = pending_earnings + NEW.commission_amount
  WHERE id = NEW.ambassador_id;
  
  -- Update star metrics
  SELECT 
    COALESCE(SUM(stars_awarded), 0),
    COUNT(*),
    COUNT(*) FILTER (WHERE stars_awarded >= 250)
  INTO total_stars, total_transactions, quality_transactions
  FROM public.transactions
  WHERE ambassador_id = NEW.ambassador_id AND status = 'completed';
  
  -- Get social posts count for this month
  SELECT COUNT(*)
  INTO social_posts_count
  FROM public.social_posts
  WHERE ambassador_id = NEW.ambassador_id
    AND EXTRACT(MONTH FROM posted_at) = EXTRACT(MONTH FROM CURRENT_DATE)
    AND EXTRACT(YEAR FROM posted_at) = EXTRACT(YEAR FROM CURRENT_DATE);
  
  -- Calculate quality rate
  calculated_quality_rate := CASE 
    WHEN total_transactions > 0 THEN (quality_transactions::DECIMAL / total_transactions * 100)
    ELSE 0
  END;
  
  -- Update ambassador profile with calculated metrics and new tier
  UPDATE public.ambassador_profiles
  SET 
    lifetime_stars = total_stars,
    avg_stars_per_transaction = CASE 
      WHEN total_transactions > 0 THEN total_stars::DECIMAL / total_transactions 
      ELSE 0 
    END,
    quality_transaction_rate = calculated_quality_rate,
    social_posts_this_month = social_posts_count,
    current_tier = public.calculate_tier(total_referrals, calculated_quality_rate, social_posts_count)
  WHERE id = NEW.ambassador_id;
  
  RETURN NEW;
END;
$$;