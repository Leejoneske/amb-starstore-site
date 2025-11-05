import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsData {
  totalRevenue: number;
  monthlyRevenue: number;
  conversionRate: number;
  topPerformers: Array<{
    id: string;
    name: string;
    earnings: number;
    referrals: number;
  }>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    transactions: number;
  }>;
  tierDistribution: Array<{
    tier: string;
    count: number;
    percentage: number;
  }>;
  performanceMetrics: {
    avgTransactionValue: number;
    avgCommissionRate: number;
    totalTransactions: number;
    activeAmbassadors: number;
  };
}

export const useAnalytics = (isAdmin: boolean = false) => {
  return useQuery({
    queryKey: ['analytics', isAdmin],
    queryFn: async (): Promise<AnalyticsData> => {
      // Get all transactions for revenue calculations
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('*')
        .eq('status', 'completed');

      if (transError) throw transError;

      // Get all ambassadors for performance data
      const { data: ambassadors, error: ambError } = await supabase
        .from('ambassador_profiles')
        .select(`
          *,
          profiles!ambassador_profiles_user_id_fkey(full_name, email)
        `);

      if (ambError) throw ambError;

      // Calculate total revenue
      const totalRevenue = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;
      
      // Calculate monthly revenue (current month)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = transactions?.filter(t => {
        const date = new Date(t.transaction_date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      }).reduce((sum, t) => sum + t.amount, 0) || 0;

      // Calculate conversion rate (simplified)
      const totalReferrals = ambassadors?.reduce((sum, a) => sum + a.total_referrals, 0) || 0;
      const conversionRate = totalReferrals > 0 ? (transactions?.length || 0) / totalReferrals * 100 : 0;

      // Get top performers
      const topPerformers = ambassadors
        ?.sort((a, b) => b.total_earnings - a.total_earnings)
        .slice(0, 5)
        .map(a => ({
          id: a.id,
          name: a.profiles?.full_name || 'Unknown',
          earnings: a.total_earnings,
          referrals: a.total_referrals
        })) || [];

      // Calculate revenue by month (last 12 months)
      const revenueByMonth = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        const monthTransactions = transactions?.filter(t => {
          const tDate = new Date(t.transaction_date);
          return tDate.getMonth() === date.getMonth() && tDate.getFullYear() === date.getFullYear();
        }) || [];

        revenueByMonth.push({
          month,
          revenue: monthTransactions.reduce((sum, t) => sum + t.amount, 0),
          transactions: monthTransactions.length
        });
      }

      // Calculate tier distribution
      const tierCounts = ambassadors?.reduce((acc, a) => {
        acc[a.current_tier] = (acc[a.current_tier] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const totalAmbassadors = ambassadors?.length || 0;
      const tierDistribution = Object.entries(tierCounts).map(([tier, count]) => ({
        tier,
        count,
        percentage: totalAmbassadors > 0 ? (count / totalAmbassadors) * 100 : 0
      }));

      // Performance metrics
      const avgTransactionValue = transactions?.length ? totalRevenue / transactions.length : 0;
      const avgCommissionRate = transactions?.length 
        ? transactions.reduce((sum, t) => sum + t.commission_rate, 0) / transactions.length 
        : 0;
      const activeAmbassadors = ambassadors?.filter(a => a.status === 'active').length || 0;

      return {
        totalRevenue,
        monthlyRevenue,
        conversionRate,
        topPerformers,
        revenueByMonth,
        tierDistribution,
        performanceMetrics: {
          avgTransactionValue,
          avgCommissionRate,
          totalTransactions: transactions?.length || 0,
          activeAmbassadors
        }
      };
    },
    enabled: isAdmin,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
};

export const useAmbassadorAnalytics = (ambassadorId: string | undefined) => {
  return useQuery({
    queryKey: ['ambassador-analytics', ambassadorId],
    queryFn: async () => {
      if (!ambassadorId) return null;

      // Get ambassador's transactions
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('*')
        .eq('ambassador_id', ambassadorId)
        .order('transaction_date', { ascending: false });

      if (transError) throw transError;

      // Get ambassador's referrals
      const { data: referrals, error: refError } = await supabase
        .from('referrals')
        .select('*')
        .eq('ambassador_id', ambassadorId);

      if (refError) throw refError;

      // Calculate performance metrics
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);

      const recentTransactions = transactions?.filter(t => 
        new Date(t.transaction_date) >= last30Days
      ) || [];

      const monthlyEarnings = recentTransactions.reduce((sum, t) => sum + t.commission_amount, 0);
      const monthlyTransactions = recentTransactions.length;
      const avgStarsPerTransaction = recentTransactions.length > 0 
        ? recentTransactions.reduce((sum, t) => sum + t.stars_awarded, 0) / recentTransactions.length 
        : 0;

      // Calculate earnings by month (last 6 months)
      const earningsByMonth = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        
        const monthTransactions = transactions?.filter(t => {
          const tDate = new Date(t.transaction_date);
          return tDate.getMonth() === date.getMonth() && tDate.getFullYear() === date.getFullYear();
        }) || [];

        earningsByMonth.push({
          month,
          earnings: monthTransactions.reduce((sum, t) => sum + t.commission_amount, 0),
          transactions: monthTransactions.length,
          stars: monthTransactions.reduce((sum, t) => sum + t.stars_awarded, 0)
        });
      }

      // Referral conversion funnel
      const totalReferrals = referrals?.length || 0;
      const convertedReferrals = referrals?.filter(r => r.status === 'active').length || 0;
      const conversionRate = totalReferrals > 0 ? (convertedReferrals / totalReferrals) * 100 : 0;

      return {
        monthlyEarnings,
        monthlyTransactions,
        avgStarsPerTransaction,
        earningsByMonth,
        conversionRate,
        totalReferrals,
        convertedReferrals,
        recentActivity: transactions?.slice(0, 10) || []
      };
    },
    enabled: !!ambassadorId,
    refetchInterval: 2 * 60 * 1000, // Refresh every 2 minutes
  });
};