import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mongoService, MongoUser, MongoReferral, MongoTransaction } from '@/services/mongoService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Hook to fetch MongoDB users
export const useMongoUsers = () => {
  return useQuery({
    queryKey: ['mongo-users'],
    queryFn: () => mongoService.getUsers(),
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
  });
};

// Hook to fetch MongoDB referrals
export const useMongoReferrals = (userId?: string) => {
  return useQuery({
    queryKey: ['mongo-referrals', userId],
    queryFn: () => userId ? mongoService.getUserReferrals(userId) : mongoService.getReferrals(),
    enabled: !!userId || userId === undefined,
    refetchInterval: 3 * 60 * 1000, // Refresh every 3 minutes
  });
};

// Hook to fetch MongoDB transactions
export const useMongoTransactions = () => {
  return useQuery({
    queryKey: ['mongo-transactions'],
    queryFn: () => mongoService.getTransactions(),
    refetchInterval: 2 * 60 * 1000, // Refresh every 2 minutes
  });
};

// Hook to sync data between MongoDB and Supabase
export const useDataSync = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const syncMutation = useMutation({
    mutationFn: async () => {
      // Get MongoDB data
      const mongoUsers = await mongoService.getUsers();
      const mongoReferrals = await mongoService.getReferrals();
      const mongoTransactions = await mongoService.getTransactions();

      const results = {
        users: { synced: 0, errors: [] as string[] },
        referrals: { synced: 0, errors: [] as string[] },
        transactions: { synced: 0, errors: [] as string[] }
      };

      // Sync users - match by Telegram ID or email
      for (const mongoUser of (mongoUsers.data || [])) {
        try {
          // Check if user exists in Supabase by looking for matching referral code or email
          const { data: existingAmbassador } = await supabase
            .from('ambassador_profiles')
            .select('*, profiles!inner(*)')
            .or(`referral_code.eq.${mongoUser.referralCode},profiles.email.ilike.%${mongoUser.username}%`)
            .single();

          if (existingAmbassador) {
            // Update existing ambassador with MongoDB data
            await supabase
              .from('ambassador_profiles')
              .update({
                // Add MongoDB-specific fields
                telegram_id: mongoUser.telegramId,
                telegram_username: mongoUser.username,
                mongo_total_earnings: mongoUser.totalEarnings || 0,
                mongo_total_referrals: mongoUser.totalReferrals || 0,
                last_mongo_sync: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('id', existingAmbassador.id);

            results.users.synced++;
          }
        } catch (error) {
          results.users.errors.push(`Failed to sync user ${mongoUser.telegramId}: ${error}`);
        }
      }

      // Sync referrals
      for (const mongoReferral of (mongoReferrals.data || [])) {
        try {
          // Check if referral already exists
          const { data: existingReferral } = await supabase
            .from('referrals')
            .select('*')
            .eq('mongo_referral_id', mongoReferral._id)
            .single();

          if (!existingReferral) {
            // Find corresponding ambassador
            const { data: ambassador } = await supabase
              .from('ambassador_profiles')
              .select('*')
              .eq('telegram_id', mongoReferral.referrerId)
              .single();

            if (ambassador) {
              // Create new referral entry
              await supabase
                .from('referrals')
                .insert({
                  ambassador_id: ambassador.id,
                  referral_code: mongoReferral.referralCode,
                  mongo_referral_id: mongoReferral._id,
                  mongo_referred_user_id: mongoReferral.referredUserId,
                  status: mongoReferral.status === 'completed' ? 'active' : 'pending',
                  referred_at: mongoReferral.createdAt.toISOString(),
                  created_at: mongoReferral.createdAt.toISOString()
                });

              results.referrals.synced++;
            }
          }
        } catch (error) {
          results.referrals.errors.push(`Failed to sync referral ${mongoReferral._id}: ${error}`);
        }
      }

      // Sync transactions
      for (const mongoTransaction of (mongoTransactions.data || [])) {
        try {
          // Check if transaction already exists
          const { data: existingTransaction } = await supabase
            .from('transactions')
            .select('*')
            .eq('mongo_transaction_id', mongoTransaction._id)
            .single();

          if (!existingTransaction && mongoTransaction.referrerId) {
            // Find corresponding ambassador
            const { data: ambassador } = await supabase
              .from('ambassador_profiles')
              .select('*')
              .eq('telegram_id', mongoTransaction.referrerId)
              .single();

            if (ambassador) {
              // Create transaction entry
              await supabase
                .from('transactions')
                .insert({
                  ambassador_id: ambassador.id,
                  amount: mongoTransaction.amount,
                  commission_amount: mongoTransaction.commission || 0,
                  commission_rate: mongoTransaction.commission ? (mongoTransaction.commission / mongoTransaction.amount) * 100 : 0,
                  stars_awarded: mongoTransaction.stars,
                  status: mongoTransaction.status === 'completed' ? 'completed' : 'pending',
                  mongo_transaction_id: mongoTransaction._id,
                  transaction_date: mongoTransaction.createdAt.toISOString(),
                  tier_at_transaction: ambassador.current_tier,
                  notes: `Synced from Telegram miniapp - ${mongoTransaction.type}`
                });

              results.transactions.synced++;
            }
          }
        } catch (error) {
          results.transactions.errors.push(`Failed to sync transaction ${mongoTransaction._id}: ${error}`);
        }
      }

      return results;
    },
    onSuccess: (results) => {
      const totalSynced = results.users.synced + results.referrals.synced + results.transactions.synced;
      const totalErrors = results.users.errors.length + results.referrals.errors.length + results.transactions.errors.length;

      toast({
        title: "Data Sync Complete! 🔄",
        description: `Synced ${totalSynced} records. ${totalErrors > 0 ? `${totalErrors} errors occurred.` : 'No errors!'}`,
        variant: totalErrors > 0 ? "destructive" : "default",
      });

      // Refresh all queries
      queryClient.invalidateQueries({ queryKey: ['mongo-users'] });
      queryClient.invalidateQueries({ queryKey: ['mongo-referrals'] });
      queryClient.invalidateQueries({ queryKey: ['mongo-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['ambassador-profile'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (error) => {
      toast({
        title: "Sync Failed",
        description: `Failed to sync data: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  return {
    syncData: syncMutation.mutate,
    isSyncing: syncMutation.isPending,
    syncResults: syncMutation.data
  };
};

// Hook to get combined referral stats (MongoDB + Supabase)
export const useCombinedReferralStats = (ambassadorId?: string) => {
  const { data: mongoReferrals } = useMongoReferrals();
  const { data: supabaseReferrals } = useQuery({
    queryKey: ['supabase-referrals', ambassadorId],
    queryFn: async () => {
      if (!ambassadorId) return [];
      const { data } = await supabase
        .from('referrals')
        .select('*')
        .eq('ambassador_id', ambassadorId);
      return data || [];
    },
    enabled: !!ambassadorId
  });

  return useQuery({
    queryKey: ['combined-referral-stats', ambassadorId, mongoReferrals, supabaseReferrals],
    queryFn: () => {
      const stats = {
        totalReferrals: 0,
        telegramReferrals: mongoReferrals?.data?.length || 0,
        webReferrals: supabaseReferrals?.length || 0,
        activeReferrals: 0,
        pendingReferrals: 0,
        totalEarnings: 0
      };

      // Count active/pending from both sources
      if (mongoReferrals?.data) {
        stats.activeReferrals += mongoReferrals.data.filter(r => r.status === 'active' || r.status === 'completed').length;
        stats.pendingReferrals += mongoReferrals.data.filter(r => r.status === 'pending').length;
      }

      if (supabaseReferrals) {
        stats.activeReferrals += supabaseReferrals.filter(r => r.status === 'active').length;
        stats.pendingReferrals += supabaseReferrals.filter(r => r.status === 'pending').length;
      }

      stats.totalReferrals = stats.telegramReferrals + stats.webReferrals;

      return stats;
    },
    enabled: !!(mongoReferrals || supabaseReferrals)
  });
};