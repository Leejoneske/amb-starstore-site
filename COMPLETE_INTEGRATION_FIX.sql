-- COMPLETE INTEGRATION FIX
-- This sets up the ambassador app to properly integrate with the main app

-- 1. Fix telegram_username column if missing
ALTER TABLE ambassador_profiles 
ADD COLUMN IF NOT EXISTS telegram_username text;

-- 2. Ensure user_roles table exists and has proper permissions
CREATE TABLE IF NOT EXISTS user_roles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    role text NOT NULL CHECK (role IN ('admin', 'ambassador', 'user')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id)
);

-- Enable RLS on user_roles if not already enabled
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
CREATE POLICY "Users can view their own roles" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage all roles" ON user_roles;
CREATE POLICY "Service role can manage all roles" ON user_roles
  FOR ALL USING (true);

-- 3. Create the Telegram connection functions
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
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  SELECT id INTO v_ambassador_id FROM ambassador_profiles WHERE user_id = v_user_id;
  IF v_ambassador_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Ambassador profile not found');
  END IF;
  
  IF p_telegram_id IS NULL OR p_telegram_id = '' THEN
    RETURN json_build_object('success', false, 'error', 'Telegram ID is required');
  END IF;
  
  IF NOT (p_telegram_id ~ '^\d+$' AND length(p_telegram_id) >= 5) THEN
    RETURN json_build_object('success', false, 'error', 'Invalid Telegram ID format');
  END IF;
  
  UPDATE ambassador_profiles 
  SET telegram_id = p_telegram_id, telegram_username = p_telegram_username, updated_at = now()
  WHERE id = v_ambassador_id;
  
  RETURN json_build_object('success', true, 'ambassador_id', v_ambassador_id, 'telegram_id', p_telegram_id);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', 'Database error: ' || SQLERRM);
END;
$$;

-- 4. Create disconnect function
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
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  SELECT id INTO v_ambassador_id FROM ambassador_profiles WHERE user_id = v_user_id;
  IF v_ambassador_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Ambassador profile not found');
  END IF;
  
  UPDATE ambassador_profiles 
  SET telegram_id = NULL, telegram_username = NULL, updated_at = now()
  WHERE id = v_ambassador_id;
  
  RETURN json_build_object('success', true, 'ambassador_id', v_ambassador_id);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', 'Database error: ' || SQLERRM);
END;
$$;

-- 5. Create missing update_first_login function
CREATE OR REPLACE FUNCTION update_first_login(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Mark first login completed
  UPDATE ambassador_profiles 
  SET updated_at = now()
  WHERE user_id = user_uuid;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION update_ambassador_telegram_info(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION disconnect_ambassador_telegram() TO authenticated;
GRANT EXECUTE ON FUNCTION update_first_login(uuid) TO authenticated;

-- Comments
COMMENT ON FUNCTION update_ambassador_telegram_info IS 'Connect ambassador Telegram account';
COMMENT ON FUNCTION disconnect_ambassador_telegram IS 'Disconnect ambassador Telegram account';
COMMENT ON FUNCTION update_first_login IS 'Track first login for analytics';