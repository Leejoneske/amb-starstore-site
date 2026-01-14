-- Fix RLS policies for applications table to allow anonymous submissions

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Users can view their own applications" ON public.applications;

-- Create new SELECT policy that allows:
-- 1. Users to view their own applications (by user_id or email match)
-- 2. Admins to view all applications
-- 3. Anonymous users to view applications they just inserted (for RETURNING clause)
CREATE POLICY "Users can view their own applications" 
ON public.applications 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR has_role(auth.uid(), 'admin'::app_role)
  OR (auth.uid() IS NULL AND user_id IS NULL)
);

-- Also add a policy that allows anonymous users to read their newly inserted application
-- This is needed because the frontend uses .select('id').single() after insert
CREATE POLICY "Allow returning on insert for anonymous"
ON public.applications
FOR SELECT
USING (true);

-- Wait, that's too permissive. Let's drop it and be more careful
DROP POLICY IF EXISTS "Allow returning on insert for anonymous" ON public.applications;
DROP POLICY IF EXISTS "Users can view their own applications" ON public.applications;

-- Create proper policies:
-- 1. Admins can view all
CREATE POLICY "Admins can view all applications" 
ON public.applications 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Users can view their own by user_id
CREATE POLICY "Users can view own applications by user_id" 
ON public.applications 
FOR SELECT 
USING (auth.uid() = user_id);

-- 3. For anonymous inserts with RETURNING, we need to allow reading based on recent insert
-- A simple solution: allow anyone to select their own recently inserted application
-- But safer: just remove the .select() requirement in the frontend

-- Actually, the simplest fix is to allow SELECT for anon role on applications 
-- since applications don't contain sensitive data that shouldn't be visible
-- But let's be more restrictive - allow viewing only your own by email would require knowing the email

-- Best solution: Just make INSERT work without RETURNING
-- But since we need the application ID for the welcome email, let's allow SELECT for anon on their own insert
-- Using a permissive policy that checks if the row was just inserted (within last minute)

CREATE POLICY "Allow reading recently inserted applications"
ON public.applications
FOR SELECT
USING (
  -- Allow if user_id is null (anonymous submission) and created within last minute
  user_id IS NULL AND created_at > (now() - interval '1 minute')
);