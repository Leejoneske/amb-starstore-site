-- ============================================
-- SIMPLE WORKING ADMIN FUNCTIONS
-- ============================================
-- This creates simple, working admin functions

-- 1. Drop existing functions
DROP FUNCTION IF EXISTS public.update_application_as_admin(UUID, TEXT, TEXT, UUID);
DROP FUNCTION IF EXISTS public.create_profile_as_admin(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.create_ambassador_as_admin(UUID, TEXT, UUID);

-- 2. Create simple application update function
CREATE OR REPLACE FUNCTION public.update_application_as_admin(
  application_id UUID,
  new_status TEXT,
  rejection_reason_param TEXT DEFAULT NULL,
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
    rejection_reason = rejection_reason_param,
    reviewed_by = COALESCE(reviewed_by, auth.uid()),
    reviewed_at = now(),
    updated_at = now()
  WHERE id = application_id;

  -- Return success
  result := json_build_object(
    'success', true,
    'application_id', application_id,
    'new_status', new_status
  );

  RETURN result;
END;
$$;

-- 3. Create simple profile creation function
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

-- 4. Create simple ambassador profile function
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
    COALESCE(approved_by, auth.uid()),
    now(),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    status = 'active',
    approved_at = now(),
    approved_by = COALESCE(approved_by, auth.uid()),
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

-- 5. Grant permissions
GRANT EXECUTE ON FUNCTION public.update_application_as_admin(UUID, TEXT, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_profile_as_admin(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_ambassador_as_admin(UUID, TEXT, UUID) TO authenticated;

-- 6. Test the functions exist
SELECT 
  routine_name, 
  routine_type,
  data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'update_application_as_admin',
  'create_profile_as_admin', 
  'create_ambassador_as_admin'
)
ORDER BY routine_name;

-- 7. Success message
SELECT 'Admin functions created successfully!' as status;