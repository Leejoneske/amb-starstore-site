import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ACTIVATION_THRESHOLD } from '@/config/telegram';
import type { Ambassador, Transaction } from '@/types';

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  pendingReferrals: number;
  totalEarnings: number;
  thisMonthReferrals: number;
  thisMonthEarnings: number;
  conversionRate: number;
  recentReferrals: Array<{
    id: string;
    referredAt: string;
    status: string;
    totalStars: number;
    isActive: boolean;
    telegramId?: string;
  }>;
}

interface ReferralActivation {
  referralId: string;
  userId: string;
  totalStars: number;
  activatedAt: string;
  commissionEarned: number;
}

// Hook to get referral statistics for an ambassador
export const useReferralStats = (ambassadorId?: string) => {
  return useQuery({
    queryKey: ['referral-stats', ambassadorId],
    queryFn: async (): Promise<ReferralStats> => {
      if (!ambassadorId) {
        throw new Error('Ambassador ID is required');
      }

      // Get all referrals for this ambassador
      const { data: referrals, error: referralsError } = await supabase
        .from('referrals')
        .select(`
          *,
          referred_user_transactions:transactions!referral_id(
            id,
            stars_awarded,
            status,
            transaction_date
          )
        `)
        .eq('ambassador_id', ambassadorId)
        .order('created_at', { ascending: false });

      if (referralsError) throw referralsError;

      // Calculate stats
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      let totalReferrals = referrals?.length || 0;
      let activeReferrals = 0;
      let pendingReferrals = 0;
      let totalEarnings = 0;
      let thisMonthReferrals = 0;
      let thisMonthEarnings = 0;

      const recentReferrals = referrals?.map(referral => {
        // Calculate total stars for this referral
        const totalStars = referral.referred_user_transactions?.reduce(
          (sum: number, tx: any) => sum + (tx.stars_awarded || 0), 
          0
        ) || 0;

        const isActive = totalStars >= ACTIVATION_THRESHOLD;
        const referredAt = new Date(referral.referred_at || referral.created_at);

        // Count active/pending
        if (isActive) {
          activeReferrals++;
        } else {
          pendingReferrals++;
        }

        // Count this month's referrals
        if (referredAt >= thisMonth) {
          thisMonthReferrals++;
        }

        return {
          id: referral.id,
          referredAt: referral.referred_at || referral.created_at,
          status: isActive ? 'active' : 'pending',
          totalStars,
          isActive,
          telegramId: referral.mongo_referred_user_id
        };
      }) || [];

      // Get earnings from transactions
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('commission_amount, transaction_date')
        .eq('ambassador_id', ambassadorId)
        .eq('status', 'completed');

      if (transactionsError) throw transactionsError;

      totalEarnings = transactions?.reduce((sum, tx) => sum + (tx.commission_amount || 0), 0) || 0;
      
      thisMonthEarnings = transactions?.filter(tx => 
        new Date(tx.transaction_date) >= thisMonth
      ).reduce((sum, tx) => sum + (tx.commission_amount || 0), 0) || 0;

      const conversionRate = totalReferrals > 0 ? (activeReferrals / totalReferrals) * 100 : 0;

      return {
        totalReferrals,
        activeReferrals,
        pendingReferrals,
        totalEarnings,
        thisMonthReferrals,
        thisMonthEarnings,
        conversionRate,
        recentReferrals: recentReferrals.slice(0, 10) // Latest 10 referrals
      };
    },
    enabled: !!ambassadorId,
    refetchInterval: 2 * 60 * 1000, // Refresh every 2 minutes
  });
};

// Hook to track referral activations (when users reach 100 stars)
export const useReferralActivationTracking = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const checkActivationMutation = useMutation({
    mutationFn: async (userId: string): Promise<ReferralActivation[]> => {
      // Get all referrals that might need activation check
      const { data: referrals, error: referralsError } = await supabase
        .from('referrals')
        .select(`
          id,
          ambassador_id,
          mongo_referred_user_id,
          status,
          ambassador:ambassador_profiles!ambassador_id(
            current_tier,
            referral_code
          )
        `)
        .eq('status', 'pending')
        .not('mongo_referred_user_id', 'is', null);

      if (referralsError) throw referralsError;

      const activations: ReferralActivation[] = [];

      for (const referral of referrals || []) {
        // Check total stars for this referred user from MongoDB transactions
        const { data: mongoTransactions, error: mongoError } = await supabase.functions.invoke('mongo-proxy', {
          body: {
            collection: 'transactions',
            query: { userId: referral.mongo_referred_user_id }
          }
        });

        if (mongoError) {
          console.error('Error fetching MongoDB transactions:', mongoError);
          continue;
        }

        const totalStars = mongoTransactions?.results?.reduce(
          (sum: number, tx: any) => sum + (tx.stars || 0), 
          0
        ) || 0;

        // Check if user has reached activation threshold
        if (totalStars >= ACTIVATION_THRESHOLD) {
          // Calculate commission based on ambassador tier
          const tier = referral.ambassador?.current_tier || 'explorer';
          const commissionRate = getTierCommissionRate(tier);
          const commissionEarned = totalStars * (commissionRate / 100);

          // Update referral status to active
          const { error: updateError } = await supabase
            .from('referrals')
            .update({ 
              status: 'active',
              activated_at: new Date().toISOString()
            })
            .eq('id', referral.id);

          if (updateError) {
            console.error('Error updating referral status:', updateError);
            continue;
          }

          // Create commission transaction
          const { error: transactionError } = await supabase
            .from('transactions')
            .insert({
              ambassador_id: referral.ambassador_id,
              commission_amount: commissionEarned,
              commission_rate: commissionRate,
              stars_awarded: totalStars,
              status: 'completed',
              transaction_date: new Date().toISOString(),
              tier_at_transaction: tier,
              source: 'telegram',
              telegram_user_id: referral.mongo_referred_user_id,
              notes: `Referral activation bonus - User reached ${totalStars} stars`
            });

          if (transactionError) {
            console.error('Error creating commission transaction:', transactionError);
            continue;
          }

          // Update ambassador total earnings
          const { error: ambassadorUpdateError } = await supabase.rpc('update_ambassador_earnings', {
            ambassador_id: referral.ambassador_id,
            additional_earnings: commissionEarned
          });

          if (ambassadorUpdateError) {
            console.error('Error updating ambassador earnings:', ambassadorUpdateError);
          }

          activations.push({
            referralId: referral.id,
            userId: referral.mongo_referred_user_id,
            totalStars,
            activatedAt: new Date().toISOString(),
            commissionEarned
          });
        }
      }

      return activations;
    },
    onSuccess: (activations) => {
      if (activations.length > 0) {
        toast({
          title: `🎉 ${activations.length} Referral${activations.length > 1 ? 's' : ''} Activated!`,
          description: `Your referred users reached 100+ stars. Commission earned: $${activations.reduce((sum, a) => sum + a.commissionEarned, 0).toFixed(2)}`,
        });

        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['referral-stats'] });
        queryClient.invalidateQueries({ queryKey: ['ambassador-profile'] });
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
      }
    },
    onError: (error) => {
      console.error('Referral activation check failed:', error);
      toast({
        title: "Activation Check Failed",
        description: "Failed to check referral activations. Please try again.",
        variant: "destructive",
      });
    }
  });

  return {
    checkActivations: checkActivationMutation.mutate,
    isChecking: checkActivationMutation.isPending
  };
};

// Helper function to get commission rate based on tier
function getTierCommissionRate(tier: string): number {
  const rates = {
    explorer: 5,    // 5% commission
    pioneer: 7,     // 7% commission
    trailblazer: 10, // 10% commission
    legend: 15      // 15% commission
  };
  return rates[tier as keyof typeof rates] || 5;
}

// Hook to create new referral tracking
export const useCreateReferral = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      ambassadorId: string;
      referralCode: string;
      telegramUserId?: string;
      source?: 'web' | 'telegram' | 'api';
    }) => {
      const { data, error } = await supabase
        .from('referrals')
        .insert({
          ambassador_id: params.ambassadorId,
          referral_code: params.referralCode,
          mongo_referred_user_id: params.telegramUserId,
          source: params.source || 'web',
          status: 'pending',
          referred_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Referral Tracked! 🎯",
        description: "New referral has been added to your account.",
      });
      queryClient.invalidateQueries({ queryKey: ['referral-stats'] });
    },
    onError: (error) => {
      toast({
        title: "Tracking Failed",
        description: error instanceof Error ? error.message : "Failed to track referral",
        variant: "destructive",
      });
    }
  });
};