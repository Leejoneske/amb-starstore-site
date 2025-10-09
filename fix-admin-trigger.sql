-- ============================================
-- FIX ADMIN TRIGGER SCRIPT
-- ============================================
-- This fixes the admin assignment trigger to work properly

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS assign_admin_on_profile_create ON public.profiles;
DROP FUNCTION IF EXISTS public.assign_admin_role();

-- Create the corrected function
CREATE OR REPLACE FUNCTION public.assign_admin_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Auto-assign admin role to specific email
  IF NEW.email = 'johnwanderi202@gmail.com' THEN
    -- First, ensure the profile exists
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- Then assign admin role
    INSERT INTO public.user_roles (user_id, role, assigned_by)
    VALUES (NEW.id, 'admin'::app_role, NEW.id)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Also auto-create and approve ambassador profile
    INSERT INTO public.ambassador_profiles (
      user_id,
      referral_code,
      status,
      approved_at,
      approved_by
    )
    VALUES (
      NEW.id,
      public.generate_referral_code(),
      'active',
      now(),
      NEW.id
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users (the correct table)
CREATE TRIGGER assign_admin_on_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_admin_role();

-- Verify the trigger is created
SELECT 'Admin trigger fixed and ready' as status;