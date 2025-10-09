
-- Set up admin role for johnwanderi202@gmail.com
-- This will run after user signs up, but we'll set it up to auto-assign

-- Create a function to auto-assign admin role for specific email
CREATE OR REPLACE FUNCTION public.assign_admin_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Auto-assign admin role to specific email
  IF NEW.email = 'johnwanderi202@gmail.com' THEN
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

-- Create trigger to assign admin role on profile creation
CREATE TRIGGER assign_admin_on_profile_create
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_admin_role();
