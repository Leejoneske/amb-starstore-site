-- ============================================
-- CREATE PROPER ADMIN FUNCTIONS
-- ============================================
-- This creates the actual functions needed for admin operations

-- 1. Create function to update application as admin
CREATE OR REPLACE FUNCTION public.update_application_as_admin(
  application_id UUID,
  new_status TEXT,
  reviewed_by UUID,
  rejection_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  -- Update application (bypasses RLS due to SECURITY DEFINER)
  UPDATE public.applications
  SET 
    status = new_status,
    reviewed_by = reviewed_by,
    reviewed_at = now(),
    rejection_reason = rejection_reason
  WHERE id = application_id;

  RETURN FOUND;
END;
$$;

-- 2. Create function to create profile as admin
CREATE OR REPLACE FUNCTION public.create_profile_as_admin(
  profile_id UUID,
  profile_email TEXT,
  profile_name TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  -- Insert profile (bypasses RLS due to SECURITY DEFINER)
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (profile_id, profile_email, profile_name)
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = now()
  RETURNING id;
END;
$$;

-- 3. Create function to create ambassador profile as admin
CREATE OR REPLACE FUNCTION public.create_ambassador_as_admin(
  user_id UUID,
  referral_code TEXT,
  approved_by UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ambassador_id UUID;
BEGIN
  -- Check if user is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  -- Insert ambassador profile (bypasses RLS due to SECURITY DEFINER)
  INSERT INTO public.ambassador_profiles (
    user_id,
    referral_code,
    status,
    approved_at,
    approved_by
  )
  VALUES (
    user_id,
    referral_code,
    'active',
    now(),
    approved_by
  )
  ON CONFLICT (user_id) DO UPDATE SET
    status = 'active',
    approved_at = now(),
    approved_by = EXCLUDED.approved_by
  RETURNING id INTO ambassador_id;

  RETURN ambassador_id;
END;
$$;

-- 4. Create function to assign admin role
CREATE OR REPLACE FUNCTION public.assign_admin_role_to_user(
  target_user_id UUID,
  assigned_by UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if current user is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  -- Assign admin role
  INSERT INTO public.user_roles (user_id, role, assigned_by)
  VALUES (target_user_id, 'admin'::app_role, assigned_by)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN TRUE;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.update_application_as_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_profile_as_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_ambassador_as_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_admin_role_to_user TO authenticated;

-- Test the functions exist
SELECT 'Admin functions created successfully' as status;