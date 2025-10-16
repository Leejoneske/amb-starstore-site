-- Add function to get auth users information for admin tracking
-- This function allows admins to see user activation status

CREATE OR REPLACE FUNCTION get_auth_users_info()
RETURNS TABLE (
  id uuid,
  email text,
  last_sign_in_at timestamptz,
  email_confirmed_at timestamptz,
  created_at timestamptz,
  password_changed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the current user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  -- Return auth user information
  RETURN QUERY
  SELECT 
    au.id,
    au.email::text,
    au.last_sign_in_at,
    au.email_confirmed_at,
    au.created_at,
    -- Check if password was changed by comparing created_at with last password change
    -- This is a heuristic - if last_sign_in_at is more than 5 minutes after created_at,
    -- we assume they changed their password
    CASE 
      WHEN au.last_sign_in_at IS NOT NULL AND 
           au.last_sign_in_at > au.created_at + INTERVAL '5 minutes'
      THEN true
      ELSE false
    END as password_changed
  FROM auth.users au
  WHERE EXISTS (
    SELECT 1 FROM ambassador_profiles ap 
    WHERE ap.user_id = au.id
  );
END;
$$;

-- Grant execute permission to authenticated users (will be restricted by the function itself)
GRANT EXECUTE ON FUNCTION get_auth_users_info() TO authenticated;

-- Add a trigger to track first login and password changes
CREATE OR REPLACE FUNCTION track_user_activation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update ambassador profile when user first logs in
  IF OLD.last_sign_in_at IS NULL AND NEW.last_sign_in_at IS NOT NULL THEN
    UPDATE ambassador_profiles 
    SET 
      status = 'active',
      updated_at = NOW()
    WHERE user_id = NEW.id AND status != 'active';
  END IF;

  RETURN NEW;
END;
$$;

-- Note: We can't directly create triggers on auth.users in Supabase
-- This function is prepared for when we can use it or call it manually

-- Add columns to ambassador_profiles to track activation
ALTER TABLE ambassador_profiles 
ADD COLUMN IF NOT EXISTS first_login_at timestamptz,
ADD COLUMN IF NOT EXISTS activation_email_sent_at timestamptz,
ADD COLUMN IF NOT EXISTS password_change_required boolean DEFAULT true;

-- Update existing records
UPDATE ambassador_profiles 
SET 
  activation_email_sent_at = approved_at,
  password_change_required = true
WHERE approved_at IS NOT NULL AND activation_email_sent_at IS NULL;

-- Create a function to update first login timestamp
CREATE OR REPLACE FUNCTION update_first_login(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE ambassador_profiles 
  SET 
    first_login_at = COALESCE(first_login_at, NOW()),
    password_change_required = false,
    updated_at = NOW()
  WHERE user_id = user_uuid AND first_login_at IS NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION update_first_login(uuid) TO authenticated;

-- Create a view for easy ambassador status tracking
CREATE OR REPLACE VIEW ambassador_status_view AS
SELECT 
  ap.*,
  p.email,
  p.full_name,
  CASE 
    WHEN ap.first_login_at IS NOT NULL THEN 'activated'
    WHEN ap.approved_at IS NOT NULL THEN 'approved_pending_login'
    ELSE 'pending_approval'
  END as activation_status,
  EXTRACT(days FROM (NOW() - COALESCE(ap.approved_at, ap.created_at))) as days_since_approval
FROM ambassador_profiles ap
JOIN profiles p ON ap.user_id = p.id;

-- Grant access to the view
GRANT SELECT ON ambassador_status_view TO authenticated;

-- Add RLS policy for the view
CREATE POLICY "Admins can view all ambassador statuses" ON ambassador_status_view
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );