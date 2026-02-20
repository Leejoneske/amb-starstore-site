-- =============================================
-- WITHDRAWAL SYSTEM SCHEMA
-- =============================================

-- 1. Payout methods table (user's preferred withdrawal methods)
CREATE TABLE public.payout_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ambassador_id UUID NOT NULL,
  method_type TEXT NOT NULL, -- 'usdt_ton', 'paypal', 'airtm', 'bank_transfer', 'crypto_other'
  label TEXT NOT NULL,       -- User-friendly label e.g. "My PayPal"
  details JSONB NOT NULL DEFAULT '{}', -- e.g. { "email": "...", "wallet": "...", "network": "TON" }
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT payout_methods_ambassador_id_fkey FOREIGN KEY (ambassador_id) REFERENCES public.ambassador_profiles(id) ON DELETE CASCADE
);

ALTER TABLE public.payout_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ambassadors can manage their own payout methods"
  ON public.payout_methods FOR ALL
  USING ((ambassador_id IN (SELECT id FROM ambassador_profiles WHERE user_id = auth.uid())) OR has_role(auth.uid(), 'admin'))
  WITH CHECK ((ambassador_id IN (SELECT id FROM ambassador_profiles WHERE user_id = auth.uid())) OR has_role(auth.uid(), 'admin'));

CREATE INDEX idx_payout_methods_ambassador_id ON public.payout_methods(ambassador_id);

-- 2. Withdrawal requests table
CREATE TABLE public.withdrawal_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ambassador_id UUID NOT NULL,
  payout_method_id UUID, -- references payout_methods
  amount NUMERIC NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending', -- pending | under_review | approved | processing | completed | rejected | cancelled
  method_type TEXT NOT NULL,             -- snapshot of method at time of request
  method_details JSONB NOT NULL DEFAULT '{}', -- snapshot of details at request time
  rejection_reason TEXT,
  admin_notes TEXT,
  processed_by UUID,
  processed_at TIMESTAMP WITH TIME ZONE,
  payment_reference TEXT,              -- transaction hash or payment ID
  minimum_amount_at_request NUMERIC,  -- minimum required for tier at time
  tier_at_request TEXT NOT NULL DEFAULT 'entry',
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT withdrawal_requests_ambassador_id_fkey FOREIGN KEY (ambassador_id) REFERENCES public.ambassador_profiles(id) ON DELETE CASCADE,
  CONSTRAINT withdrawal_requests_payout_method_id_fkey FOREIGN KEY (payout_method_id) REFERENCES public.payout_methods(id) ON DELETE SET NULL
);

ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ambassadors can view their own withdrawal requests"
  ON public.withdrawal_requests FOR SELECT
  USING ((ambassador_id IN (SELECT id FROM ambassador_profiles WHERE user_id = auth.uid())) OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Ambassadors can insert their own withdrawal requests"
  ON public.withdrawal_requests FOR INSERT
  WITH CHECK (ambassador_id IN (SELECT id FROM ambassador_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Ambassadors can cancel their own pending requests"
  ON public.withdrawal_requests FOR UPDATE
  USING (
    (ambassador_id IN (SELECT id FROM ambassador_profiles WHERE user_id = auth.uid()) AND status = 'pending')
    OR has_role(auth.uid(), 'admin')
  );

CREATE INDEX idx_withdrawal_requests_ambassador_id ON public.withdrawal_requests(ambassador_id);
CREATE INDEX idx_withdrawal_requests_status ON public.withdrawal_requests(status);

-- 3. Trigger to update updated_at on payout_methods
CREATE TRIGGER update_payout_methods_updated_at
  BEFORE UPDATE ON public.payout_methods
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Trigger to update updated_at on withdrawal_requests
CREATE TRIGGER update_withdrawal_requests_updated_at
  BEFORE UPDATE ON public.withdrawal_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Function to get min withdrawal amount by tier
CREATE OR REPLACE FUNCTION public.get_min_withdrawal_amount(p_tier TEXT)
RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  CASE p_tier
    WHEN 'entry'    THEN RETURN 10.00;
    WHEN 'growing'  THEN RETURN 20.00;
    WHEN 'advanced' THEN RETURN 15.00;
    WHEN 'elite'    THEN RETURN 10.00;
    ELSE RETURN 10.00;
  END CASE;
END;
$$;

-- 6. Function to validate and create a withdrawal request (atomic, prevents over-withdrawal)
CREATE OR REPLACE FUNCTION public.create_withdrawal_request(
  p_ambassador_id UUID,
  p_amount NUMERIC,
  p_method_type TEXT,
  p_method_details JSONB,
  p_payout_method_id UUID DEFAULT NULL,
  p_currency TEXT DEFAULT 'USD'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile RECORD;
  v_pending_withdrawals NUMERIC;
  v_available_balance NUMERIC;
  v_min_amount NUMERIC;
  v_request_id UUID;
BEGIN
  -- Get ambassador profile
  SELECT * INTO v_profile FROM ambassador_profiles WHERE id = p_ambassador_id AND user_id = auth.uid();
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Ambassador profile not found or unauthorized');
  END IF;

  -- Get minimum withdrawal amount for tier
  v_min_amount := public.get_min_withdrawal_amount(v_profile.current_tier::TEXT);

  -- Check minimum
  IF p_amount < v_min_amount THEN
    RETURN json_build_object('success', false, 'error', 'Amount below minimum withdrawal of $' || v_min_amount || ' for your tier');
  END IF;

  -- Calculate pending withdrawals (not yet completed or rejected/cancelled)
  SELECT COALESCE(SUM(amount), 0) INTO v_pending_withdrawals
  FROM withdrawal_requests
  WHERE ambassador_id = p_ambassador_id
    AND status IN ('pending', 'under_review', 'approved', 'processing');

  -- Available balance = pending_earnings - in-flight withdrawals
  v_available_balance := v_profile.pending_earnings - v_pending_withdrawals;

  IF p_amount > v_available_balance THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient available balance. Available: $' || ROUND(v_available_balance, 2));
  END IF;

  -- Create withdrawal request
  INSERT INTO withdrawal_requests (
    ambassador_id,
    payout_method_id,
    amount,
    currency,
    method_type,
    method_details,
    minimum_amount_at_request,
    tier_at_request,
    status
  ) VALUES (
    p_ambassador_id,
    p_payout_method_id,
    p_amount,
    p_currency,
    p_method_type,
    p_method_details,
    v_min_amount,
    v_profile.current_tier::TEXT,
    'pending'
  ) RETURNING id INTO v_request_id;

  RETURN json_build_object(
    'success', true,
    'request_id', v_request_id,
    'amount', p_amount,
    'available_balance', v_available_balance - p_amount
  );
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 7. Function for admin to process a withdrawal (approve → processing → completed)
CREATE OR REPLACE FUNCTION public.process_withdrawal_request(
  p_request_id UUID,
  p_action TEXT, -- 'approve' | 'reject' | 'complete' | 'set_processing'
  p_payment_reference TEXT DEFAULT NULL,
  p_admin_notes TEXT DEFAULT NULL,
  p_rejection_reason TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request RECORD;
  v_new_status TEXT;
BEGIN
  -- Verify admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'Admin access required');
  END IF;

  SELECT * INTO v_request FROM withdrawal_requests WHERE id = p_request_id;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Request not found');
  END IF;

  CASE p_action
    WHEN 'approve' THEN
      v_new_status := 'approved';
    WHEN 'set_processing' THEN
      v_new_status := 'processing';
    WHEN 'complete' THEN
      v_new_status := 'completed';
      -- Deduct from pending_earnings when completed
      UPDATE ambassador_profiles
      SET 
        pending_earnings = GREATEST(0, pending_earnings - v_request.amount),
        updated_at = now()
      WHERE id = v_request.ambassador_id;
    WHEN 'reject' THEN
      v_new_status := 'rejected';
    ELSE
      RETURN json_build_object('success', false, 'error', 'Invalid action');
  END CASE;

  UPDATE withdrawal_requests SET
    status = v_new_status,
    processed_by = auth.uid(),
    processed_at = now(),
    payment_reference = COALESCE(p_payment_reference, payment_reference),
    admin_notes = COALESCE(p_admin_notes, admin_notes),
    rejection_reason = COALESCE(p_rejection_reason, rejection_reason),
    updated_at = now()
  WHERE id = p_request_id;

  RETURN json_build_object(
    'success', true,
    'request_id', p_request_id,
    'new_status', v_new_status
  );
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;
