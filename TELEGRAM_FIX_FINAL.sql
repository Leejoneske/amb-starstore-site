-- FINAL TELEGRAM CONNECTION FIX
-- Run this SQL in your Supabase SQL Editor

-- First, let's add the telegram_username column if it doesn't exist
ALTER TABLE ambassador_profiles 
ADD COLUMN IF NOT EXISTS telegram_username text;

-- Now create the updated function
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
  
  -- Update the ambassador profile (with telegram_username column now available)
  UPDATE ambassador_profiles 
  SET 
    telegram_id = p_telegram_id,
    telegram_username = p_telegram_username,
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
    'telegram_username', p_telegram_username,
    'message', 'Telegram connection successful!'
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false, 
    'error', 'Database error: ' || SQLERRM
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_ambassador_telegram_info(text, text) TO authenticated;

-- Test the function (optional)
-- SELECT update_ambassador_telegram_info('123456789', 'testuser');

COMMENT ON FUNCTION update_ambassador_telegram_info IS 'Securely update ambassador Telegram connection info, with telegram_username column support';