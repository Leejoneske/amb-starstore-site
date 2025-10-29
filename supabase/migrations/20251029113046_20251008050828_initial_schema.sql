-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'ambassador', 'pending');

-- Create app_tier enum for ambassador tiers
CREATE TYPE public.app_tier AS ENUM ('entry', 'growing', 'advanced', 'elite');

-- Create transaction_status enum
CREATE TYPE public.transaction_status AS ENUM ('pending', 'completed', 'cancelled', 'refunded');

-- Create payout_status enum
CREATE TYPE public.payout_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  telegram_username TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- USER ROLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  assigned_by UUID REFERENCES public.profiles(id),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view their own roles"
    ON public.user_roles FOR SELECT
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- ============================================
-- AMBASSADOR PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.ambassador_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  referral_code TEXT UNIQUE NOT NULL,
  current_tier public.app_tier DEFAULT 'entry' NOT NULL,
  total_referrals INT DEFAULT 0 NOT NULL,
  active_referrals INT DEFAULT 0 NOT NULL,
  total_earnings DECIMAL(10,2) DEFAULT 0 NOT NULL,
  pending_earnings DECIMAL(10,2) DEFAULT 0 NOT NULL,
  lifetime_stars INT DEFAULT 0 NOT NULL,
  avg_stars_per_transaction DECIMAL(10,2) DEFAULT 0,
  quality_transaction_rate DECIMAL(5,2) DEFAULT 0,
  tier_progress INT DEFAULT 0 NOT NULL,
  social_posts_this_month INT DEFAULT 0 NOT NULL,
  status TEXT DEFAULT 'active' NOT NULL,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.ambassador_profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Ambassadors can view their own profile"
    ON public.ambassador_profiles FOR SELECT
    USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can update ambassador profiles"
    ON public.ambassador_profiles FOR UPDATE
    USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- TIER CONFIGURATION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.tier_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier public.app_tier UNIQUE NOT NULL,
  level INT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  referral_threshold INT NOT NULL,
  commission_rate DECIMAL(5,4) NOT NULL,
  base_earnings DECIMAL(10,2) NOT NULL,
  quality_bonus DECIMAL(10,2) NOT NULL,
  social_posts_required INT DEFAULT 0 NOT NULL,
  min_monthly_transactions INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.tier_configs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Anyone can view tier configs"
    ON public.tier_configs FOR SELECT
    TO authenticated
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Insert tier configurations
INSERT INTO public.tier_configs (tier, level, name, referral_threshold, commission_rate, base_earnings, quality_bonus, social_posts_required, min_monthly_transactions) 
VALUES
  ('entry', 1, 'Entry Level', 30, 0.06, 13.00, 30.00, 0, 0),
  ('growing', 2, 'Growing Ambassador', 50, 0.70, 35.00, 25.00, 4, 30),
  ('advanced', 3, 'Advanced Ambassador', 70, 0.75, 52.50, 28.50, 6, 50),
  ('elite', 4, 'Elite Ambassador', 100, 0.30, 30.00, 30.00, 8, 70)
ON CONFLICT (tier) DO NOTHING;

-- ============================================
-- REFERRALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID REFERENCES public.ambassador_profiles(id) ON DELETE CASCADE NOT NULL,
  referral_code TEXT NOT NULL,
  customer_email TEXT,
  customer_name TEXT,
  referred_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  first_purchase_at TIMESTAMPTZ,
  total_purchases INT DEFAULT 0 NOT NULL,
  total_spent DECIMAL(10,2) DEFAULT 0 NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Ambassadors can view their referrals"
    ON public.referrals FOR SELECT
    USING (
      ambassador_id IN (
        SELECT id FROM public.ambassador_profiles WHERE user_id = auth.uid()
      ) OR public.has_role(auth.uid(), 'admin')
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID REFERENCES public.ambassador_profiles(id) ON DELETE CASCADE NOT NULL,
  referral_id UUID REFERENCES public.referrals(id),
  order_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,4) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  stars_awarded INT DEFAULT 0 NOT NULL,
  status public.transaction_status DEFAULT 'pending' NOT NULL,
  tier_at_transaction public.app_tier NOT NULL,
  qualifies_for_bonus BOOLEAN DEFAULT false NOT NULL,
  notes TEXT,
  transaction_date TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Ambassadors can view their transactions"
    ON public.transactions FOR SELECT
    USING (
      ambassador_id IN (
        SELECT id FROM public.ambassador_profiles WHERE user_id = auth.uid()
      ) OR public.has_role(auth.uid(), 'admin')
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- SOCIAL POSTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID REFERENCES public.ambassador_profiles(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL,
  post_url TEXT,
  post_content TEXT,
  engagement_count INT DEFAULT 0,
  posted_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  verified BOOLEAN DEFAULT false NOT NULL,
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Ambassadors can manage their social posts"
    ON public.social_posts FOR ALL
    USING (
      ambassador_id IN (
        SELECT id FROM public.ambassador_profiles WHERE user_id = auth.uid()
      ) OR public.has_role(auth.uid(), 'admin')
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- PAYOUTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID REFERENCES public.ambassador_profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  quality_bonus DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  status public.payout_status DEFAULT 'pending' NOT NULL,
  payment_method TEXT,
  payment_reference TEXT,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Ambassadors can view their payouts"
    ON public.payouts FOR SELECT
    USING (
      ambassador_id IN (
        SELECT id FROM public.ambassador_profiles WHERE user_id = auth.uid()
      ) OR public.has_role(auth.uid(), 'admin')
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- APPLICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  telegram_username TEXT,
  social_media_links JSONB,
  experience TEXT,
  why_join TEXT,
  referral_strategy TEXT,
  status TEXT DEFAULT 'pending' NOT NULL,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view their own applications"
    ON public.applications FOR SELECT
    USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can insert applications"
    ON public.applications FOR INSERT
    WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- ANALYTICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID REFERENCES public.ambassador_profiles(id),
  event_type TEXT NOT NULL,
  event_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Admins can view analytics"
    ON public.analytics_events FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- TRIGGERS & FUNCTIONS
-- ============================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_ambassador_profiles_updated_at ON public.ambassador_profiles;
CREATE TRIGGER update_ambassador_profiles_updated_at
  BEFORE UPDATE ON public.ambassador_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    code := upper(substr(md5(random()::text), 1, 8));
    SELECT EXISTS(SELECT 1 FROM public.ambassador_profiles WHERE referral_code = code) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN code;
END;
$$;

-- Function to calculate tier based on referrals
CREATE OR REPLACE FUNCTION public.calculate_tier(referral_count INT)
RETURNS public.app_tier
LANGUAGE plpgsql
AS $$
BEGIN
  IF referral_count >= 100 THEN RETURN 'elite';
  ELSIF referral_count >= 70 THEN RETURN 'advanced';
  ELSIF referral_count >= 50 THEN RETURN 'growing';
  ELSE RETURN 'entry';
  END IF;
END;
$$;

-- Function to update ambassador stats after transaction
CREATE OR REPLACE FUNCTION public.update_ambassador_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_stars BIGINT;
  total_transactions INT;
  quality_transactions INT;
BEGIN
  -- Update total earnings
  UPDATE public.ambassador_profiles
  SET 
    total_earnings = total_earnings + NEW.commission_amount,
    pending_earnings = pending_earnings + NEW.commission_amount
  WHERE id = NEW.ambassador_id;
  
  -- Update star metrics
  SELECT 
    COALESCE(SUM(stars_awarded), 0),
    COUNT(*),
    COUNT(*) FILTER (WHERE stars_awarded >= 250)
  INTO total_stars, total_transactions, quality_transactions
  FROM public.transactions
  WHERE ambassador_id = NEW.ambassador_id AND status = 'completed';
  
  -- Update ambassador profile with calculated metrics
  UPDATE public.ambassador_profiles
  SET 
    lifetime_stars = total_stars,
    avg_stars_per_transaction = CASE 
      WHEN total_transactions > 0 THEN total_stars::DECIMAL / total_transactions 
      ELSE 0 
    END,
    quality_transaction_rate = CASE 
      WHEN total_transactions > 0 THEN (quality_transactions::DECIMAL / total_transactions * 100)
      ELSE 0
    END,
    current_tier = public.calculate_tier(total_referrals)
  WHERE id = NEW.ambassador_id;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_stats_after_transaction ON public.transactions;
CREATE TRIGGER update_stats_after_transaction
  AFTER INSERT OR UPDATE ON public.transactions
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION public.update_ambassador_stats();

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_ambassador_profiles_user_id ON public.ambassador_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_ambassador_profiles_referral_code ON public.ambassador_profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_ambassador_id ON public.transactions(ambassador_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_referrals_ambassador_id ON public.referrals(ambassador_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_ambassador_id ON public.social_posts(ambassador_id);
CREATE INDEX IF NOT EXISTS idx_payouts_ambassador_id ON public.payouts(ambassador_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);