-- ============================================
-- FIX ADMIN FUNCTIONS - Correct Parameter Names
-- ============================================

-- Drop existing functions
DROP FUNCTION IF EXISTS public.update_application_as_admin(UUID, TEXT, TEXT, UUID);
DROP FUNCTION IF EXISTS public.create_profile_as_admin(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.create_ambassador_as_admin(UUID, TEXT, UUID);

-- 1. Create application update function with correct parameter names
CREATE OR REPLACE FUNCTION public.update_application_as_admin(
  application_id UUID,
  new_status TEXT,
  rejection_reason TEXT DEFAULT NULL,
  reviewed_by UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  -- Check if user is admin
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  -- Update application
  UPDATE public.applications
  SET 
    status = new_status,
    rejection_reason = update_application_as_admin.rejection_reason,
    reviewed_by = COALESCE(update_application_as_admin.reviewed_by, auth.uid()),
    reviewed_at = now()
  WHERE id = update_application_as_admin.application_id;

  -- Return success
  result := json_build_object(
    'success', true,
    'application_id', application_id,
    'new_status', new_status
  );

  RETURN result;
END;
$$;

-- 2. Create profile creation function
CREATE OR REPLACE FUNCTION public.create_profile_as_admin(
  profile_id UUID,
  profile_email TEXT,
  profile_name TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  -- Check if user is admin
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  -- Create profile
  INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
  VALUES (profile_id, profile_email, profile_name, now(), now())
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = now();

  -- Return success
  result := json_build_object(
    'success', true,
    'profile_id', profile_id,
    'email', profile_email
  );

  RETURN result;
END;
$$;

-- 3. Create ambassador profile function
CREATE OR REPLACE FUNCTION public.create_ambassador_as_admin(
  user_id UUID,
  referral_code TEXT,
  approved_by UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  -- Check if user is admin
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  -- Create ambassador profile
  INSERT INTO public.ambassador_profiles (
    user_id,
    referral_code,
    status,
    approved_at,
    approved_by,
    created_at,
    updated_at
  )
  VALUES (
    user_id,
    referral_code,
    'active',
    now(),
    COALESCE(create_ambassador_as_admin.approved_by, auth.uid()),
    now(),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    status = 'active',
    approved_at = now(),
    approved_by = COALESCE(create_ambassador_as_admin.approved_by, auth.uid()),
    updated_at = now();

  -- Return success
  result := json_build_object(
    'success', true,
    'user_id', user_id,
    'referral_code', referral_code
  );

  RETURN result;
END;
$$;

-- 4. Grant permissions
GRANT EXECUTE ON FUNCTION public.update_application_as_admin(UUID, TEXT, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_profile_as_admin(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_ambassador_as_admin(UUID, TEXT, UUID) TO authenticated;