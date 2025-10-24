-- SIMPLE TELEGRAM CONNECTION FIX (without telegram_username)
-- Run this if the main fix doesn't work

CREATE OR REPLACE FUNCTION update_ambassador_telegram_info(
  p_telegram_id text,
  p_telegram_username text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_ambassador_id uuid;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Find the ambassador profile for this user
  SELECT id INTO v_ambassador_id FROM ambassador_profiles WHERE user_id = v_user_id;
  IF v_ambassador_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Ambassador profile not found');
  END IF;
  
  -- Validate telegram_id format
  IF p_telegram_id IS NULL OR p_telegram_id = '' THEN
    RETURN json_build_object('success', false, 'error', 'Telegram ID is required');
  END IF;
  
  IF NOT (p_telegram_id ~ '^\d+$' AND length(p_telegram_id) >= 5) THEN
    RETURN json_build_object('success', false, 'error', 'Invalid Telegram ID format. Must be numeric and at least 5 digits.');
  END IF;
  
  -- Update ONLY telegram_id (skip telegram_username to avoid column issues)
  UPDATE ambassador_profiles 
  SET 
    telegram_id = p_telegram_id,
    updated_at = now()
  WHERE id = v_ambassador_id;
  
  -- Check if update was successful
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Failed to update ambassador profile');
  END IF;
  
  -- Return success
  RETURN json_build_object(
    'success', true, 
    'ambassador_id', v_ambassador_id,
    'telegram_id', p_telegram_id,
    'message', 'Telegram ID connected successfully!'
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false, 
    'error', 'Database error: ' || SQLERRM
  );
END;
$$;

GRANT EXECUTE ON FUNCTION update_ambassador_telegram_info(text, text) TO authenticated;