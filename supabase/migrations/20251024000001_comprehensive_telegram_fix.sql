-- Comprehensive fix for Telegram connection issues
-- This migration addresses RLS policies and adds a secure function for updates

-- First, ensure the RLS policy exists (drop and recreate to avoid conflicts)
DROP POLICY IF EXISTS "Ambassadors can update their own telegram info" ON public.ambassador_profiles;

-- Create the policy to allow users to update their own ambassador profiles
CREATE POLICY "Ambassadors can update their own telegram info"
  ON public.ambassador_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create a secure function for updating Telegram info
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
  v_result json;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Find the ambassador profile for this user
  SELECT id INTO v_ambassador_id
  FROM ambassador_profiles
  WHERE user_id = v_user_id;
  
  IF v_ambassador_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Ambassador profile not found');
  END IF;
  
  -- Validate telegram_id format
  IF p_telegram_id IS NULL OR p_telegram_id = '' THEN
    RETURN json_build_object('success', false, 'error', 'Telegram ID is required');
  END IF;
  
  IF NOT (p_telegram_id ~ '^\d+$' AND length(p_telegram_id) >= 5) THEN
    RETURN json_build_object('success', false, 'error', 'Invalid Telegram ID format');
  END IF;
  
  -- Update the ambassador profile
  UPDATE ambassador_profiles 
  SET 
    telegram_id = p_telegram_id,
    telegram_username = p_telegram_username,
    updated_at = now()
  WHERE id = v_ambassador_id;
  
  -- Return success
  RETURN json_build_object(
    'success', true, 
    'ambassador_id', v_ambassador_id,
    'telegram_id', p_telegram_id,
    'telegram_username', p_telegram_username
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

-- Add comments
COMMENT ON FUNCTION update_ambassador_telegram_info IS 'Securely update ambassador Telegram connection info';
COMMENT ON POLICY "Ambassadors can update their own telegram info" ON public.ambassador_profiles IS 
'Allows ambassadors to update their own Telegram connection information';