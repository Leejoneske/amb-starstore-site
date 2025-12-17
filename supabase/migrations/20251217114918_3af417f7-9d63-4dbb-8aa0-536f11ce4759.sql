-- Fix Supabase Security Advisor / Linter issues
-- 1) Enable RLS on public tables that are exposed without it
ALTER TABLE public.ambassador_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.starstore_users_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.starstore_referrals_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.starstore_transactions_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.starstore_analytics_cache ENABLE ROW LEVEL SECURITY;

-- 2) ambassador_profiles: normalize policies (avoid mixed role type casting)
DO $$
BEGIN
  -- Drop existing policies if present
  EXECUTE 'DROP POLICY IF EXISTS "Admins can update ambassador profiles" ON public.ambassador_profiles';
  EXECUTE 'DROP POLICY IF EXISTS "Ambassadors can update their own profile" ON public.ambassador_profiles';
  EXECUTE 'DROP POLICY IF EXISTS "Ambassadors can update their own telegram info" ON public.ambassador_profiles';
  EXECUTE 'DROP POLICY IF EXISTS "Ambassadors can view their own profile" ON public.ambassador_profiles';

  -- Recreate policies with consistent has_role(app_role)
  EXECUTE 'CREATE POLICY "Ambassadors can view their own profile" ON public.ambassador_profiles FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), ''admin''::public.app_role))';

  EXECUTE 'CREATE POLICY "Admins can update ambassador profiles" ON public.ambassador_profiles FOR UPDATE USING (public.has_role(auth.uid(), ''admin''::public.app_role)) WITH CHECK (public.has_role(auth.uid(), ''admin''::public.app_role))';

  EXECUTE 'CREATE POLICY "Ambassadors can update their own profile" ON public.ambassador_profiles FOR UPDATE USING (auth.uid() = user_id OR public.has_role(auth.uid(), ''admin''::public.app_role)) WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), ''admin''::public.app_role))';

  EXECUTE 'CREATE POLICY "Ambassadors can update their own telegram info" ON public.ambassador_profiles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
END $$;

-- 3) starstore_* cache tables: restrict to admins (and service role)
DO $$
BEGIN
  -- starstore_users_cache
  EXECUTE 'DROP POLICY IF EXISTS "Admins can view starstore users cache" ON public.starstore_users_cache';
  EXECUTE 'DROP POLICY IF EXISTS "Admins can manage starstore users cache" ON public.starstore_users_cache';
  EXECUTE 'DROP POLICY IF EXISTS "Service role can manage starstore users cache" ON public.starstore_users_cache';
  EXECUTE 'CREATE POLICY "Admins can manage starstore users cache" ON public.starstore_users_cache FOR ALL USING (public.has_role(auth.uid(), ''admin''::public.app_role)) WITH CHECK (public.has_role(auth.uid(), ''admin''::public.app_role))';
  EXECUTE 'CREATE POLICY "Service role can manage starstore users cache" ON public.starstore_users_cache FOR ALL USING ((auth.jwt() ->> ''role'') = ''service_role'') WITH CHECK ((auth.jwt() ->> ''role'') = ''service_role'')';

  -- starstore_referrals_cache
  EXECUTE 'DROP POLICY IF EXISTS "Admins can manage starstore referrals cache" ON public.starstore_referrals_cache';
  EXECUTE 'DROP POLICY IF EXISTS "Service role can manage starstore referrals cache" ON public.starstore_referrals_cache';
  EXECUTE 'CREATE POLICY "Admins can manage starstore referrals cache" ON public.starstore_referrals_cache FOR ALL USING (public.has_role(auth.uid(), ''admin''::public.app_role)) WITH CHECK (public.has_role(auth.uid(), ''admin''::public.app_role))';
  EXECUTE 'CREATE POLICY "Service role can manage starstore referrals cache" ON public.starstore_referrals_cache FOR ALL USING ((auth.jwt() ->> ''role'') = ''service_role'') WITH CHECK ((auth.jwt() ->> ''role'') = ''service_role'')';

  -- starstore_transactions_cache
  EXECUTE 'DROP POLICY IF EXISTS "Admins can manage starstore transactions cache" ON public.starstore_transactions_cache';
  EXECUTE 'DROP POLICY IF EXISTS "Service role can manage starstore transactions cache" ON public.starstore_transactions_cache';
  EXECUTE 'CREATE POLICY "Admins can manage starstore transactions cache" ON public.starstore_transactions_cache FOR ALL USING (public.has_role(auth.uid(), ''admin''::public.app_role)) WITH CHECK (public.has_role(auth.uid(), ''admin''::public.app_role))';
  EXECUTE 'CREATE POLICY "Service role can manage starstore transactions cache" ON public.starstore_transactions_cache FOR ALL USING ((auth.jwt() ->> ''role'') = ''service_role'') WITH CHECK ((auth.jwt() ->> ''role'') = ''service_role'')';

  -- starstore_analytics_cache
  EXECUTE 'DROP POLICY IF EXISTS "Admins can manage starstore analytics cache" ON public.starstore_analytics_cache';
  EXECUTE 'DROP POLICY IF EXISTS "Service role can manage starstore analytics cache" ON public.starstore_analytics_cache';
  EXECUTE 'CREATE POLICY "Admins can manage starstore analytics cache" ON public.starstore_analytics_cache FOR ALL USING (public.has_role(auth.uid(), ''admin''::public.app_role)) WITH CHECK (public.has_role(auth.uid(), ''admin''::public.app_role))';
  EXECUTE 'CREATE POLICY "Service role can manage starstore analytics cache" ON public.starstore_analytics_cache FOR ALL USING ((auth.jwt() ->> ''role'') = ''service_role'') WITH CHECK ((auth.jwt() ->> ''role'') = ''service_role'')';
END $$;

-- 4) Tighten message system RLS (admin-only + service role)
DO $$
BEGIN
  -- messages
  EXECUTE 'DROP POLICY IF EXISTS "Allow all authenticated users full access to messages" ON public.messages';
  EXECUTE 'DROP POLICY IF EXISTS "Allow service role to manage all messages" ON public.messages';
  EXECUTE 'DROP POLICY IF EXISTS "Service role full access to messages" ON public.messages';
  EXECUTE 'CREATE POLICY "Admins can manage all messages" ON public.messages FOR ALL USING (public.has_role(auth.uid(), ''admin''::public.app_role)) WITH CHECK (public.has_role(auth.uid(), ''admin''::public.app_role))';
  EXECUTE 'CREATE POLICY "Service role can manage all messages" ON public.messages FOR ALL USING ((auth.jwt() ->> ''role'') = ''service_role'') WITH CHECK ((auth.jwt() ->> ''role'') = ''service_role'')';

  -- message_templates
  EXECUTE 'DROP POLICY IF EXISTS "Allow all authenticated users full access to templates" ON public.message_templates';
  EXECUTE 'DROP POLICY IF EXISTS "Allow service role to manage all templates" ON public.message_templates';
  EXECUTE 'DROP POLICY IF EXISTS "Service role full access to templates" ON public.message_templates';
  EXECUTE 'CREATE POLICY "Admins can manage all templates" ON public.message_templates FOR ALL USING (public.has_role(auth.uid(), ''admin''::public.app_role)) WITH CHECK (public.has_role(auth.uid(), ''admin''::public.app_role))';
  EXECUTE 'CREATE POLICY "Service role can manage all templates" ON public.message_templates FOR ALL USING ((auth.jwt() ->> ''role'') = ''service_role'') WITH CHECK ((auth.jwt() ->> ''role'') = ''service_role'')';

  -- message_events
  EXECUTE 'DROP POLICY IF EXISTS "Allow all authenticated users full access to events" ON public.message_events';
  EXECUTE 'DROP POLICY IF EXISTS "Allow service role to manage all events" ON public.message_events';
  EXECUTE 'DROP POLICY IF EXISTS "Service role full access to events" ON public.message_events';
  EXECUTE 'CREATE POLICY "Admins can manage all events" ON public.message_events FOR ALL USING (public.has_role(auth.uid(), ''admin''::public.app_role)) WITH CHECK (public.has_role(auth.uid(), ''admin''::public.app_role))';
  EXECUTE 'CREATE POLICY "Service role can manage all events" ON public.message_events FOR ALL USING ((auth.jwt() ->> ''role'') = ''service_role'') WITH CHECK ((auth.jwt() ->> ''role'') = ''service_role'')';

  -- message_attachments
  EXECUTE 'DROP POLICY IF EXISTS "Allow all authenticated users full access to attachments" ON public.message_attachments';
  EXECUTE 'DROP POLICY IF EXISTS "Allow service role to manage all attachments" ON public.message_attachments';
  EXECUTE 'DROP POLICY IF EXISTS "Service role full access to attachments" ON public.message_attachments';
  EXECUTE 'CREATE POLICY "Admins can manage all attachments" ON public.message_attachments FOR ALL USING (public.has_role(auth.uid(), ''admin''::public.app_role)) WITH CHECK (public.has_role(auth.uid(), ''admin''::public.app_role))';
  EXECUTE 'CREATE POLICY "Service role can manage all attachments" ON public.message_attachments FOR ALL USING ((auth.jwt() ->> ''role'') = ''service_role'') WITH CHECK ((auth.jwt() ->> ''role'') = ''service_role'')';
END $$;

-- 5) profiles: add explicit INSERT policy (best practice)
DO $$
BEGIN
  EXECUTE 'DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles';
  EXECUTE 'CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id)';
END $$;

-- 6) Fix linter: function search_path mutable
CREATE OR REPLACE FUNCTION public.update_first_login(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.ambassador_profiles
  SET updated_at = now()
  WHERE user_id = user_uuid;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
