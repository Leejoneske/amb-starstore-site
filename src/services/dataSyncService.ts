// Data Sync Service - Fetches from Star Store and caches in Supabase
// This ensures data availability even when main app is down

import { supabase } from '@/integrations/supabase/client';
import { starStoreService } from './starStoreService';
import { logger } from '@/lib/logger';

interface StarStoreUser {
  id: string;
  username?: string;
  telegramId: string;
  totalReferrals: number;
  activeReferrals: number;
  pendingReferrals: number;
  totalEarnings: number;
  buyOrders: number;
  sellOrders: number;
  totalStarsEarned: number;
  createdAt: string;
  lastActive: string;
  isAmbassador: boolean;
  ambassadorTier?: string;
  ambassadorSyncedAt?: string;
}

interface StarStoreReferral {
  id: string;
  referrerUserId: string;
  referredUserId: string;
  referrerUsername: string;
  referredUsername: string;
  status: 'pending' | 'active' | 'completed';
  dateReferred: string;
  withdrawn: boolean;
  referrerIsAmbassador: boolean;
  referrerTier?: string;
}

interface StarStoreTransaction {
  id: string;
  type: 'buy' | 'sell';
  telegramId: string;
  username?: string;
  amount: number;
  stars: number;
  status: string;
  createdAt: string;
  isPremium?: boolean;
  premiumDuration?: number;
  walletAddress?: string;
}

interface StarStoreAnalytics {
  overview: {
    totalUsers: number;
    totalReferrals: number;
    activeReferrals: number;
    totalTransactions: number;
    conversionRate: string;
  };
  growth: {
    today: { users: number; referrals: number };
    week: { users: number; referrals: number };
    month: { users: number; referrals: number };
  };
  financial: {
    totalEarnings: number;
    totalStarsTraded: number;
  };
  timestamp: string;
}

class DataSyncService {
  private syncInProgress = false;
  private lastSyncTime: Date | null = null;
  private syncInterval = 5 * 60 * 1000; // 5 minutes

  // Sync all data from Star Store to Supabase
  async syncAllData(): Promise<{
    success: boolean;
    synced: {
      users: number;
      referrals: number;
      transactions: number;
      analytics: boolean;
    };
    errors: string[];
  }> {
    if (this.syncInProgress) {
      return {
        success: false,
        synced: { users: 0, referrals: 0, transactions: 0, analytics: false },
        errors: ['Sync already in progress']
      };
    }

    this.syncInProgress = true;
    const result = {
      success: true,
      synced: { users: 0, referrals: 0, transactions: 0, analytics: false },
      errors: [] as string[]
    };

    try {
      logger.info('Starting comprehensive data sync from Star Store');

      // Sync users data
      try {
        const usersSynced = await this.syncUsersData();
        result.synced.users = usersSynced;
      } catch (error) {
        result.errors.push(`Users sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        result.success = false;
      }

      // Sync referrals data
      try {
        const referralsSynced = await this.syncReferralsData();
        result.synced.referrals = referralsSynced;
      } catch (error) {
        result.errors.push(`Referrals sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        result.success = false;
      }

      // Sync transactions data
      try {
        const transactionsSynced = await this.syncTransactionsData();
        result.synced.transactions = transactionsSynced;
      } catch (error) {
        result.errors.push(`Transactions sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        result.success = false;
      }

      // Sync analytics data
      try {
        await this.syncAnalyticsData();
        result.synced.analytics = true;
      } catch (error) {
        result.errors.push(`Analytics sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        result.success = false;
      }

      this.lastSyncTime = new Date();
      logger.info('Data sync completed', { result });

    } catch (error) {
      result.success = false;
      result.errors.push(`Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      logger.error('Data sync failed', {}, error as Error);
    } finally {
      this.syncInProgress = false;
    }

    return result;
  }

  // Sync users data from Star Store - TEMPORARILY DISABLED
  private async syncUsersData(): Promise<number> {
    console.log('⚠️ StarStore users data sync temporarily disabled');
    return 0;
    const users: StarStoreUser[] = data.users;

    // Clear existing cached users data
    await supabase.from('starstore_users_cache').delete().neq('id', '');

    // Insert new users data
    const usersToInsert = users.map(user => ({
      telegram_id: user.telegramId,
      username: user.username,
      total_referrals: user.totalReferrals,
      active_referrals: user.activeReferrals,
      pending_referrals: user.pendingReferrals,
      total_earnings: user.totalEarnings,
      buy_orders: user.buyOrders,
      sell_orders: user.sellOrders,
      total_stars_earned: user.totalStarsEarned,
      created_at: user.createdAt,
      last_active: user.lastActive,
      is_ambassador: user.isAmbassador,
      ambassador_tier: user.ambassadorTier,
      ambassador_synced_at: user.ambassadorSyncedAt,
      synced_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('starstore_users_cache')
      .insert(usersToInsert);

    if (error) throw error;
    return users.length;
  }

  // Sync referrals data from Star Store
  private async syncReferralsData(): Promise<number> {
    const response = await fetch(`${starStoreService['baseUrl']}/api/admin/referrals-data?limit=500`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    const referrals: StarStoreReferral[] = data.referrals;

    // Clear existing cached referrals data
    await supabase.from('starstore_referrals_cache').delete().neq('id', '');

    // Insert new referrals data
    const referralsToInsert = referrals.map(referral => ({
      starstore_id: referral.id,
      referrer_user_id: referral.referrerUserId,
      referred_user_id: referral.referredUserId,
      referrer_username: referral.referrerUsername,
      referred_username: referral.referredUsername,
      status: referral.status,
      date_referred: referral.dateReferred,
      withdrawn: referral.withdrawn,
      referrer_is_ambassador: referral.referrerIsAmbassador,
      referrer_tier: referral.referrerTier,
      synced_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('starstore_referrals_cache')
      .insert(referralsToInsert);

    if (error) throw error;
    return referrals.length;
  }

  // Sync transactions data from Star Store
  private async syncTransactionsData(): Promise<number> {
    const response = await fetch(`${starStoreService['baseUrl']}/api/admin/transactions-data?limit=500`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    const transactions: StarStoreTransaction[] = data.transactions;

    // Clear existing cached transactions data
    await supabase.from('starstore_transactions_cache').delete().neq('id', '');

    // Insert new transactions data
    const transactionsToInsert = transactions.map(transaction => ({
      starstore_id: transaction.id,
      type: transaction.type,
      telegram_id: transaction.telegramId,
      username: transaction.username,
      amount: transaction.amount,
      stars: transaction.stars,
      status: transaction.status,
      created_at: transaction.createdAt,
      is_premium: transaction.isPremium || false,
      premium_duration: transaction.premiumDuration,
      wallet_address: transaction.walletAddress,
      synced_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('starstore_transactions_cache')
      .insert(transactionsToInsert);

    if (error) throw error;
    return transactions.length;
  }

  // Sync analytics data from Star Store - TEMPORARILY DISABLED
  private async syncAnalyticsData(): Promise<void> {
    console.log('⚠️ StarStore analytics data sync temporarily disabled');
    
    const analytics: StarStoreAnalytics = await response.json();

    // Clear existing analytics cache
    await supabase.from('starstore_analytics_cache').delete().neq('id', '');

    // Insert new analytics data
    const { error } = await supabase
      .from('starstore_analytics_cache')
      .insert({
        total_users: analytics.overview.totalUsers,
        total_referrals: analytics.overview.totalReferrals,
        active_referrals: analytics.overview.activeReferrals,
        total_transactions: analytics.overview.totalTransactions,
        conversion_rate: parseFloat(analytics.overview.conversionRate),
        today_users: analytics.growth.today.users,
        today_referrals: analytics.growth.today.referrals,
        week_users: analytics.growth.week.users,
        week_referrals: analytics.growth.week.referrals,
        month_users: analytics.growth.month.users,
        month_referrals: analytics.growth.month.referrals,
        total_earnings: analytics.financial.totalEarnings,
        total_stars_traded: analytics.financial.totalStarsTraded,
        starstore_timestamp: analytics.timestamp,
        synced_at: new Date().toISOString()
      });

    if (error) throw error;
  }

  // Get cached users data from Supabase - TEMPORARILY DISABLED
  async getCachedUsers(limit = 100, page = 1): Promise<{
    users: any[];
    total: number;
    lastSync: string | null;
  }> {
    console.log('⚠️ StarStore cached users query temporarily disabled');
    return {
      users: [],
      total: 0,
      lastSync: null
    };
  }

  // Get cached referrals data from Supabase - TEMPORARILY DISABLED
  async getCachedReferrals(limit = 100, page = 1): Promise<{
    referrals: any[];
    total: number;
    lastSync: string | null;
  }> {
    console.log('⚠️ StarStore cached referrals query temporarily disabled');
    return {
      referrals: [],
      total: 0,
      lastSync: null
    };
  }

  // Get cached transactions data from Supabase - TEMPORARILY DISABLED
  async getCachedTransactions(limit = 100, page = 1): Promise<{
    transactions: any[];
    total: number;
    lastSync: string | null;
  }> {
    console.log('⚠️ StarStore cached transactions query temporarily disabled');
    return {
      transactions: [],
      total: 0,
      lastSync: null
    };
  }

  // Get cached analytics data from Supabase - TEMPORARILY DISABLED
  async getCachedAnalytics(): Promise<any> {
    console.log('⚠️ StarStore cached analytics query temporarily disabled');
    return null;
  }

  // Auto sync with interval
  startAutoSync(): void {
    setInterval(async () => {
      if (!this.syncInProgress) {
        try {
          await this.syncAllData();
        } catch (error) {
          logger.error('Auto sync failed', {}, error as Error);
        }
      }
    }, this.syncInterval);
  }

  // Get sync status
  getSyncStatus(): {
    inProgress: boolean;
    lastSync: Date | null;
    nextSync: Date | null;
  } {
    return {
      inProgress: this.syncInProgress,
      lastSync: this.lastSyncTime,
      nextSync: this.lastSyncTime 
        ? new Date(this.lastSyncTime.getTime() + this.syncInterval)
        : null
    };
  }
}

export const dataSyncService = new DataSyncService();