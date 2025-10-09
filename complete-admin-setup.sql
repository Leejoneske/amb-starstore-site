-- ============================================
-- COMPLETE ADMIN SETUP SCRIPT
-- ============================================
-- Run this script to set up everything for admin functionality

-- 1. Create admin functions
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

-- 2. Grant permissions
GRANT EXECUTE ON FUNCTION public.update_application_as_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_profile_as_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_ambassador_as_admin TO authenticated;

-- 3. Fix RLS policies to allow admin access
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update applications" ON public.applications;
CREATE POLICY "Admins can update applications"
  ON public.applications FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can insert ambassador profiles" ON public.ambassador_profiles;
CREATE POLICY "Admins can insert ambassador profiles"
  ON public.ambassador_profiles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Test the setup
SELECT 'Admin setup completed successfully!' as status;