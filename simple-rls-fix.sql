-- ============================================
-- SIMPLE RLS FIX FOR ADMIN ACCESS
-- ============================================
-- Run this in Supabase SQL Editor to fix admin access

-- First, let's check if the admin user exists and has the right role
SELECT 
  p.email, 
  ur.role,
  p.id as profile_id
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.user_id
WHERE p.email = 'johnwanderi202@gmail.com';

-- If the above query shows the admin user, let's fix the RLS policies

-- 1. Fix profiles table - allow admins to insert profiles
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Allow admins to update applications
DROP POLICY IF EXISTS "Admins can update applications" ON public.applications;
CREATE POLICY "Admins can update applications"
  ON public.applications FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. Allow admins to insert ambassador profiles
DROP POLICY IF EXISTS "Admins can insert ambassador profiles" ON public.ambassador_profiles;
CREATE POLICY "Admins can insert ambassador profiles"
  ON public.ambassador_profiles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Allow admins to insert user roles
DROP POLICY IF EXISTS "Admins can insert user roles" ON public.user_roles;
CREATE POLICY "Admins can insert user roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. Allow admins to update user roles
DROP POLICY IF EXISTS "Admins can update user roles" ON public.user_roles;
CREATE POLICY "Admins can update user roles"
  ON public.user_roles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Test the policies
SELECT 'RLS policies updated successfully' as status;