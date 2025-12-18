-- Create table to store ambassador emails synced from MongoDB
CREATE TABLE public.ambassador_emails (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id text,
  email text NOT NULL,
  full_name text,
  username text,
  tier text,
  referral_code text,
  source text NOT NULL DEFAULT 'waitlist', -- 'waitlist' or 'synced'
  mongo_id text, -- Original MongoDB document ID
  synced_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(email)
);

-- Create index for faster lookups
CREATE INDEX idx_ambassador_emails_telegram_id ON public.ambassador_emails(telegram_id);
CREATE INDEX idx_ambassador_emails_email ON public.ambassador_emails(email);
CREATE INDEX idx_ambassador_emails_source ON public.ambassador_emails(source);

-- Enable RLS
ALTER TABLE public.ambassador_emails ENABLE ROW LEVEL SECURITY;

-- Admin-only access policies
CREATE POLICY "Admins can manage ambassador emails"
ON public.ambassador_emails
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Service role can manage (for edge functions)
CREATE POLICY "Service role can manage ambassador emails"
ON public.ambassador_emails
FOR ALL
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text)
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Add updated_at trigger
CREATE TRIGGER update_ambassador_emails_updated_at
  BEFORE UPDATE ON public.ambassador_emails
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();