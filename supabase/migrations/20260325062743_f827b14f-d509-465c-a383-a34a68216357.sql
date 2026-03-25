CREATE OR REPLACE FUNCTION public.check_newsletter_email(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM newsletter_subscribers WHERE email = lower(p_email) AND is_active = true
  )
$$;

DROP POLICY IF EXISTS "Anyone can check subscription" ON newsletter_subscribers;