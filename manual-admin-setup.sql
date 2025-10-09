-- ============================================
-- MANUAL ADMIN SETUP SCRIPT
-- ============================================
-- Run this AFTER you've signed up with johnwanderi202@gmail.com

-- Step 1: Find the user ID for johnwanderi202@gmail.com
-- (Replace 'USER_ID_HERE' with the actual UUID from the query below)
-- SELECT id, email FROM auth.users WHERE email = 'johnwanderi202@gmail.com';

-- Step 2: Manually assign admin role
-- (Uncomment and run after getting the user ID)
/*
INSERT INTO public.user_roles (user_id, role, assigned_by)
VALUES (
    'USER_ID_HERE',  -- Replace with actual user ID
    'admin'::app_role, 
    'USER_ID_HERE'   -- Replace with actual user ID
)
ON CONFLICT (user_id, role) DO NOTHING;
*/

-- Step 3: Manually create and approve ambassador profile
-- (Uncomment and run after getting the user ID)
/*
INSERT INTO public.ambassador_profiles (
    user_id,
    referral_code,
    status,
    approved_at,
    approved_by
)
VALUES (
    'USER_ID_HERE',  -- Replace with actual user ID
    public.generate_referral_code(),
    'active',
    now(),
    'USER_ID_HERE'   -- Replace with actual user ID
)
ON CONFLICT (user_id) DO NOTHING;
*/

-- Step 4: Verify admin setup
-- (Run this to check if admin is properly set up)
SELECT 
    p.email,
    p.full_name,
    ur.role,
    ap.status as ambassador_status,
    ap.referral_code
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.user_id
LEFT JOIN public.ambassador_profiles ap ON p.id = ap.user_id
WHERE p.email = 'johnwanderi202@gmail.com';