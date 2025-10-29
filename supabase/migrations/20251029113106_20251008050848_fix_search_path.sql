-- Fix search_path for functions that are missing it

-- Update generate_referral_code function
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    code := upper(substr(md5(random()::text), 1, 8));
    SELECT EXISTS(SELECT 1 FROM public.ambassador_profiles WHERE referral_code = code) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN code;
END;
$$;

-- Update calculate_tier function
CREATE OR REPLACE FUNCTION public.calculate_tier(referral_count INT)
RETURNS public.app_tier
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF referral_count >= 100 THEN RETURN 'elite';
  ELSIF referral_count >= 70 THEN RETURN 'advanced';
  ELSIF referral_count >= 50 THEN RETURN 'growing';
  ELSE RETURN 'entry';
  END IF;
END;
$$;

-- Update update_updated_at function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;