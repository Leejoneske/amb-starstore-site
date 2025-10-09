-- ============================================
-- DATABASE STATE CHECK SCRIPT
-- ============================================
-- This script will show you the current state of all tables

-- Check table row counts
SELECT 
    'profiles' as table_name, 
    COUNT(*) as row_count,
    'User profiles' as description
FROM public.profiles
UNION ALL
SELECT 
    'user_roles', 
    COUNT(*),
    'User role assignments'
FROM public.user_roles
UNION ALL
SELECT 
    'ambassador_profiles', 
    COUNT(*),
    'Ambassador profiles'
FROM public.ambassador_profiles
UNION ALL
SELECT 
    'applications', 
    COUNT(*),
    'Application submissions'
FROM public.applications
UNION ALL
SELECT 
    'referrals', 
    COUNT(*),
    'Referral records'
FROM public.referrals
UNION ALL
SELECT 
    'transactions', 
    COUNT(*),
    'Commission transactions'
FROM public.transactions
UNION ALL
SELECT 
    'social_posts', 
    COUNT(*),
    'Social media posts'
FROM public.social_posts
UNION ALL
SELECT 
    'payouts', 
    COUNT(*),
    'Payout records'
FROM public.payouts
UNION ALL
SELECT 
    'analytics_events', 
    COUNT(*),
    'Analytics events'
FROM public.analytics_events
ORDER BY table_name;

-- Check for any existing users
SELECT 
    'Current Users' as info,
    email,
    full_name,
    created_at
FROM public.profiles
ORDER BY created_at DESC;

-- Check tier configurations (these should remain)
SELECT 
    'Tier Configs' as info,
    tier,
    name,
    commission_rate,
    referral_threshold
FROM public.tier_configs
ORDER BY level;