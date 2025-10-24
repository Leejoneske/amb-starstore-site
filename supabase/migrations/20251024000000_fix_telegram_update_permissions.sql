-- Fix RLS permissions for Telegram connection updates
-- Allow ambassadors to update their own Telegram connection info

-- Add policy to allow users to update their own ambassador profile for specific fields
CREATE POLICY "Ambassadors can update their own telegram info"
  ON public.ambassador_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Comment explaining the policy
COMMENT ON POLICY "Ambassadors can update their own telegram info" ON public.ambassador_profiles IS 
'Allows ambassadors to update their own Telegram connection information and other non-critical profile fields';