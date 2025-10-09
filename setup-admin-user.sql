-- ============================================
-- SETUP ADMIN USER SCRIPT
-- ============================================
-- This script ensures the admin user is properly set up

-- First, let's check if the admin user exists
SELECT 
  p.email, 
  ur.role,
  p.id as profile_id,
  ap.id as ambassador_id
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.user_id
LEFT JOIN public.ambassador_profiles ap ON p.id = ap.user_id
WHERE p.email = 'johnwanderi202@gmail.com';

-- If the admin user doesn't exist or doesn't have the right role, create it
-- This will be handled by the application when the user signs up

-- Let's also check if we have any applications to test with
SELECT 
  id,
  full_name,
  email,
  status,
  created_at
FROM public.applications
ORDER BY created_at DESC
LIMIT 5;

-- Check if the admin functions exist
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%admin%'
ORDER BY routine_name;