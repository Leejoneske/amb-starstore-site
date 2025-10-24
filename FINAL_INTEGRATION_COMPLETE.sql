-- FINAL COMPLETE AMBASSADOR APP INTEGRATION
-- Run this in Supabase SQL Editor to complete the integration

-- 1. Ensure telegram_username column exists
ALTER TABLE ambassador_profiles 
ADD COLUMN IF NOT EXISTS telegram_username text;

-- 2. Create or update user_roles table with proper permissions
CREATE TABLE IF NOT EXISTS user_roles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    role text NOT NULL CHECK (role IN ('admin', 'ambassador', 'user')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id)
);

-- Enable RLS and create policies
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Service role can manage all roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;

-- Create comprehensive policies
CREATE POLICY "Users can view their own roles" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all roles" ON user_roles
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Admins can manage all roles" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- 3. Create all required secure functions
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
  -- Get current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Find ambassador profile
  SELECT id INTO v_ambassador_id FROM ambassador_profiles WHERE user_id = v_user_id;
  IF v_ambassador_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Ambassador profile not found');
  END IF;
  
  -- Validate Telegram ID
  IF p_telegram_id IS NULL OR p_telegram_id = '' THEN
    RETURN json_build_object('success', false, 'error', 'Telegram ID is required');
  END IF;
  
  IF NOT (p_telegram_id ~ '^\d+$' AND length(p_telegram_id) >= 5) THEN
    RETURN json_build_object('success', false, 'error', 'Invalid Telegram ID format');
  END IF;
  
  -- Update ambassador profile
  UPDATE ambassador_profiles 
  SET 
    telegram_id = p_telegram_id, 
    telegram_username = p_telegram_username, 
    updated_at = now()
  WHERE id = v_ambassador_id;
  
  RETURN json_build_object(
    'success', true, 
    'ambassador_id', v_ambassador_id, 
    'telegram_id', p_telegram_id,
    'telegram_username', p_telegram_username
  );
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

-- 5. Create first login tracking function
CREATE OR REPLACE FUNCTION update_first_login(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE ambassador_profiles 
  SET updated_at = now()
  WHERE user_id = user_uuid;
END;
$$;

-- 6. Grant all necessary permissions
GRANT EXECUTE ON FUNCTION update_ambassador_telegram_info(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION disconnect_ambassador_telegram() TO authenticated;
GRANT EXECUTE ON FUNCTION update_first_login(uuid) TO authenticated;

-- 7. Add helpful comments
COMMENT ON FUNCTION update_ambassador_telegram_info IS 'Securely connect ambassador Telegram account';
COMMENT ON FUNCTION disconnect_ambassador_telegram IS 'Securely disconnect ambassador Telegram account';
COMMENT ON FUNCTION update_first_login IS 'Track first login for analytics';

-- 8. Create test data if needed (optional - run only if you want test data)
-- INSERT INTO user_roles (user_id, role) 
-- SELECT auth.uid(), 'ambassador' 
-- WHERE NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid());

-- Success message
SELECT 'Ambassador app integration setup complete! ✅' as status;