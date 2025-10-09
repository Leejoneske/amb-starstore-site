-- ============================================
-- FIX RLS POLICIES FOR ADMIN ACCESS
-- ============================================
-- This script fixes RLS policies to allow admins to manage all data

-- Fix profiles table RLS policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create new policies that allow admins full access
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

-- Allow admins to insert profiles
CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete profiles
CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Fix applications table RLS policies
DROP POLICY IF EXISTS "Users can view their own applications" ON public.applications;
DROP POLICY IF EXISTS "Anyone can insert applications" ON public.applications;

CREATE POLICY "Users can view their own applications"
  ON public.applications FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can insert applications"
  ON public.applications FOR INSERT
  WITH CHECK (true);

-- Allow admins to update applications
CREATE POLICY "Admins can update applications"
  ON public.applications FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Fix ambassador_profiles table RLS policies
DROP POLICY IF EXISTS "Ambassadors can view their own profile" ON public.ambassador_profiles;
DROP POLICY IF EXISTS "Admins can update ambassador profiles" ON public.ambassador_profiles;

CREATE POLICY "Ambassadors can view their own profile"
  ON public.ambassador_profiles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage ambassador profiles"
  ON public.ambassador_profiles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow ambassadors to view their own profile
CREATE POLICY "Ambassadors can view their own profile only"
  ON public.ambassador_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Fix user_roles table RLS policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Allow admins to manage all roles
CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Fix referrals table RLS policies
DROP POLICY IF EXISTS "Ambassadors can view their referrals" ON public.referrals;

CREATE POLICY "Ambassadors can view their referrals"
  ON public.referrals FOR SELECT
  USING (
    ambassador_id IN (
      SELECT id FROM public.ambassador_profiles WHERE user_id = auth.uid()
    ) OR public.has_role(auth.uid(), 'admin')
  );

-- Allow admins to manage all referrals
CREATE POLICY "Admins can manage all referrals"
  ON public.referrals FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Fix transactions table RLS policies
DROP POLICY IF EXISTS "Ambassadors can view their transactions" ON public.transactions;

CREATE POLICY "Ambassadors can view their transactions"
  ON public.transactions FOR SELECT
  USING (
    ambassador_id IN (
      SELECT id FROM public.ambassador_profiles WHERE user_id = auth.uid()
    ) OR public.has_role(auth.uid(), 'admin')
  );

-- Allow admins to manage all transactions
CREATE POLICY "Admins can manage all transactions"
  ON public.transactions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Fix social_posts table RLS policies
DROP POLICY IF EXISTS "Ambassadors can manage their social posts" ON public.social_posts;

CREATE POLICY "Ambassadors can manage their social posts"
  ON public.social_posts FOR ALL
  USING (
    ambassador_id IN (
      SELECT id FROM public.ambassador_profiles WHERE user_id = auth.uid()
    ) OR public.has_role(auth.uid(), 'admin')
  );

-- Fix payouts table RLS policies
DROP POLICY IF EXISTS "Ambassadors can view their payouts" ON public.payouts;

CREATE POLICY "Ambassadors can view their payouts"
  ON public.payouts FOR SELECT
  USING (
    ambassador_id IN (
      SELECT id FROM public.ambassador_profiles WHERE user_id = auth.uid()
    ) OR public.has_role(auth.uid(), 'admin')
  );

-- Allow admins to manage all payouts
CREATE POLICY "Admins can manage all payouts"
  ON public.payouts FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Fix analytics_events table RLS policies
DROP POLICY IF EXISTS "Admins can view analytics" ON public.analytics_events;

CREATE POLICY "Admins can view analytics"
  ON public.analytics_events FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to manage all analytics
CREATE POLICY "Admins can manage all analytics"
  ON public.analytics_events FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Verify policies are created
SELECT 'RLS policies updated successfully' as status;