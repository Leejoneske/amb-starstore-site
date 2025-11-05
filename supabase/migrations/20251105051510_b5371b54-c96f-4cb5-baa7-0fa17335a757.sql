-- Add telegram_id column to applications table
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS telegram_id TEXT;

-- Add referral_code column to applications table to store user's StarStore referral code
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS referral_code TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_applications_telegram_id ON public.applications(telegram_id);
CREATE INDEX IF NOT EXISTS idx_applications_referral_code ON public.applications(referral_code);