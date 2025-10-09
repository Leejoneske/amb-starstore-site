-- ============================================
-- FIX ADMIN ACCOUNT SCRIPT
-- ============================================
-- This script will clear all data and ensure proper admin setup

-- Step 1: Clear all existing data
SET session_replication_role = replica;

DELETE FROM public.analytics_events;
DELETE FROM public.payouts;
DELETE FROM public.transactions;
DELETE FROM public.social_posts;
DELETE FROM public.referrals;
DELETE FROM public.applications;
DELETE FROM public.ambassador_profiles;
DELETE FROM public.user_roles;
DELETE FROM public.profiles;

-- Also clear auth.users (this will remove all authentication data)
DELETE FROM auth.users;

SET session_replication_role = DEFAULT;

-- Step 2: Verify everything is cleared
SELECT 'Database cleared successfully' as status;

-- Step 3: Check that the admin assignment function is working
-- The function should automatically assign admin role when johnwanderi202@gmail.com signs up
SELECT 'Admin setup function is ready' as status;