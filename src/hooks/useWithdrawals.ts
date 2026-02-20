import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PayoutMethod {
  id: string;
  ambassador_id: string;
  method_type: 'usdt_ton' | 'paypal' | 'airtm' | 'bank_transfer' | 'crypto_other';
  label: string;
  details: Record<string, string>;
  is_default: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface WithdrawalRequest {
  id: string;
  ambassador_id: string;
  payout_method_id: string | null;
  amount: number;
  currency: string;
  status: 'pending' | 'under_review' | 'approved' | 'processing' | 'completed' | 'rejected' | 'cancelled';
  method_type: string;
  method_details: Record<string, string>;
  rejection_reason: string | null;
  admin_notes: string | null;
  processed_by: string | null;
  processed_at: string | null;
  payment_reference: string | null;
  minimum_amount_at_request: number | null;
  tier_at_request: string;
  requested_at: string;
  created_at: string;
  updated_at: string;
}

// ── Payout Methods ──────────────────────────────────────────────────────────

export const usePayoutMethods = (ambassadorId: string | undefined) => {
  return useQuery<PayoutMethod[]>({
    queryKey: ['payout-methods', ambassadorId],
    queryFn: async () => {
      if (!ambassadorId) return [];
      const { data, error } = await supabase
        .from('payout_methods')
        .select('*')
        .eq('ambassador_id', ambassadorId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as PayoutMethod[]) || [];
    },
    enabled: !!ambassadorId,
  });
};

export const useAddPayoutMethod = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payload: Omit<PayoutMethod, 'id' | 'is_verified' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('payout_methods')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payout-methods', variables.ambassador_id] });
      toast({ title: 'Payout method added!', description: 'Your withdrawal method has been saved.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

export const useDeletePayoutMethod = (ambassadorId: string | undefined) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (methodId: string) => {
      const { error } = await supabase.from('payout_methods').delete().eq('id', methodId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payout-methods', ambassadorId] });
      toast({ title: 'Method removed', description: 'Payout method deleted.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

export const useSetDefaultPayoutMethod = (ambassadorId: string | undefined) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ methodId }: { methodId: string }) => {
      if (!ambassadorId) throw new Error('No ambassador ID');
      // Unset all defaults, then set the chosen one
      await supabase
        .from('payout_methods')
        .update({ is_default: false })
        .eq('ambassador_id', ambassadorId);
      const { error } = await supabase
        .from('payout_methods')
        .update({ is_default: true })
        .eq('id', methodId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payout-methods', ambassadorId] });
      toast({ title: 'Default updated', description: 'Default payout method changed.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

// ── Withdrawal Requests ─────────────────────────────────────────────────────

export const useWithdrawalRequests = (ambassadorId: string | undefined) => {
  return useQuery<WithdrawalRequest[]>({
    queryKey: ['withdrawal-requests', ambassadorId],
    queryFn: async () => {
      if (!ambassadorId) return [];
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('ambassador_id', ambassadorId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as WithdrawalRequest[]) || [];
    },
    enabled: !!ambassadorId,
  });
};

export const useCreateWithdrawal = (ambassadorId: string | undefined) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payload: {
      amount: number;
      method_type: string;
      method_details: Record<string, string>;
      payout_method_id?: string;
    }) => {
      const { data, error } = await supabase.rpc('create_withdrawal_request', {
        p_ambassador_id: ambassadorId,
        p_amount: payload.amount,
        p_method_type: payload.method_type,
        p_method_details: payload.method_details,
        p_payout_method_id: payload.payout_method_id || null,
      });
      if (error) throw error;
      const result = data as { success: boolean; error?: string; request_id?: string; available_balance?: number };
      if (!result.success) throw new Error(result.error || 'Failed to create withdrawal request');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawal-requests', ambassadorId] });
      queryClient.invalidateQueries({ queryKey: ['ambassador-profile'] });
      toast({
        title: '✅ Withdrawal Requested!',
        description: 'Your withdrawal request has been submitted and is under review.',
      });
    },
    onError: (error: Error) => {
      toast({ title: 'Withdrawal Failed', description: error.message, variant: 'destructive' });
    },
  });
};

export const useCancelWithdrawal = (ambassadorId: string | undefined) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from('withdrawal_requests')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', requestId)
        .eq('status', 'pending');
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawal-requests', ambassadorId] });
      queryClient.invalidateQueries({ queryKey: ['ambassador-profile'] });
      toast({ title: 'Cancelled', description: 'Withdrawal request cancelled.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

// ── Admin Hooks ─────────────────────────────────────────────────────────────

export const useAllWithdrawalRequests = () => {
  return useQuery<(WithdrawalRequest & { ambassador_profiles?: { referral_code: string; current_tier: string; profiles?: { full_name: string | null; email: string } | null } | null })[]>({
    queryKey: ['all-withdrawal-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select(`
          *,
          ambassador_profiles (
            referral_code,
            current_tier,
            profiles (full_name, email)
          )
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as unknown as (WithdrawalRequest & { ambassador_profiles?: { referral_code: string; current_tier: string; profiles?: { full_name: string | null; email: string } | null } | null })[]) || [];
    },
  });
};

export const useProcessWithdrawal = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payload: {
      requestId: string;
      action: 'approve' | 'reject' | 'complete' | 'set_processing';
      paymentReference?: string;
      adminNotes?: string;
      rejectionReason?: string;
    }) => {
      const { data, error } = await supabase.rpc('process_withdrawal_request', {
        p_request_id: payload.requestId,
        p_action: payload.action,
        p_payment_reference: payload.paymentReference || null,
        p_admin_notes: payload.adminNotes || null,
        p_rejection_reason: payload.rejectionReason || null,
      });
      if (error) throw error;
      const result = data as { success: boolean; error?: string };
      if (!result.success) throw new Error(result.error || 'Action failed');
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['all-withdrawal-requests'] });
      queryClient.invalidateQueries({ queryKey: ['withdrawal-requests'] });
      queryClient.invalidateQueries({ queryKey: ['ambassador-profile'] });
      const labels: Record<string, string> = {
        approve: 'Approved ✅',
        reject: 'Rejected ❌',
        complete: 'Marked as Paid 💰',
        set_processing: 'Set to Processing 🔄',
      };
      toast({ title: labels[variables.action] || 'Updated', description: 'Withdrawal request updated.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};
