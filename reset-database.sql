-- ============================================
-- DATABASE RESET SCRIPT
-- ============================================
-- This script will clear all data from the database tables
-- while preserving the table structure and configurations

-- Disable RLS temporarily for cleanup
SET session_replication_role = replica;

-- Clear all data from tables (in dependency order)
DELETE FROM public.analytics_events;
DELETE FROM public.payouts;
DELETE FROM public.transactions;
DELETE FROM public.social_posts;
DELETE FROM public.referrals;
DELETE FROM public.applications;
DELETE FROM public.ambassador_profiles;
DELETE FROM public.user_roles;
DELETE FROM public.profiles;

-- Re-enable RLS
SET session_replication_role = DEFAULT;

-- Reset sequences (if any)
-- Note: Most tables use gen_random_uuid() so no sequences to reset

-- Verify tables are empty
SELECT 'profiles' as table_name, COUNT(*) as count FROM public.profiles
UNION ALL
SELECT 'user_roles', COUNT(*) FROM public.user_roles
UNION ALL
SELECT 'ambassador_profiles', COUNT(*) FROM public.ambassador_profiles
UNION ALL
SELECT 'applications', COUNT(*) FROM public.applications
UNION ALL
SELECT 'referrals', COUNT(*) FROM public.referrals
UNION ALL
SELECT 'transactions', COUNT(*) FROM public.transactions
UNION ALL
SELECT 'social_posts', COUNT(*) FROM public.social_posts
UNION ALL
SELECT 'payouts', COUNT(*) FROM public.payouts
UNION ALL
SELECT 'analytics_events', COUNT(*) FROM public.analytics_events;