-- Add disconnect function for Telegram
CREATE OR REPLACE FUNCTION disconnect_ambassador_telegram()
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
  
  -- Clear telegram connection
  UPDATE ambassador_profiles 
  SET 
    telegram_id = NULL,
    telegram_username = NULL,
    updated_at = now()
  WHERE id = v_ambassador_id;
  
  -- Return success
  RETURN json_build_object(
    'success', true, 
    'ambassador_id', v_ambassador_id,
    'message', 'Telegram disconnected successfully'
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false, 
    'error', 'Database error: ' || SQLERRM
  );
END;
$$;

GRANT EXECUTE ON FUNCTION disconnect_ambassador_telegram() TO authenticated;