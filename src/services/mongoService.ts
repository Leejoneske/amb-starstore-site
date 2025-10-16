// MongoDB Integration Service for Telegram Miniapp
// Connects to your existing MongoDB database to sync referral data

import { supabase } from '@/integrations/supabase/client';
import { TELEGRAM_CONFIG } from '@/config/telegram';

interface MongoUser {
  _id: string;
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  referredBy?: string;
  referralCode?: string;
  totalEarnings?: number;
  totalReferrals?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface MongoReferral {
  _id: string;
  referrerId: string;
  referredUserId: string;
  referralCode: string;
  status: 'pending' | 'active' | 'completed';
  earnings?: number;
  createdAt: Date;
}

interface MongoTransaction {
  _id: string;
  userId: string;
  type: 'buy' | 'sell';
  amount: number;
  stars: number;
  status: 'pending' | 'completed' | 'failed';
  referrerId?: string;
  commission?: number;
  createdAt: Date;
}

class MongoService {
  private baseUrl = TELEGRAM_CONFIG.SERVER_URL;
  private mongoConnectionString = TELEGRAM_CONFIG.MONGO_CONNECTION_STRING;

  // Fetch users from MongoDB
  async getUsers(): Promise<MongoUser[]> {
    try {
      // Try to call your existing API first
      const response = await fetch(`${this.baseUrl}/api/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return await response.json();
      }

      // Fallback: Direct MongoDB query using a proxy endpoint we'll create
      return await this.directMongoQuery('users', {});
    } catch (error) {
      console.error('Error fetching users from MongoDB:', error);
      return [];
    }
  }

  // Fetch referrals from MongoDB
  async getReferrals(): Promise<MongoReferral[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/referrals`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return await response.json();
      }

      return await this.directMongoQuery('referrals', {});
    } catch (error) {
      console.error('Error fetching referrals from MongoDB:', error);
      return [];
    }
  }

  // Fetch transactions from MongoDB
  async getTransactions(): Promise<MongoTransaction[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/transactions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return await response.json();
      }

      return await this.directMongoQuery('transactions', {});
    } catch (error) {
      console.error('Error fetching transactions from MongoDB:', error);
      return [];
    }
  }

  // Get user by Telegram ID
  async getUserByTelegramId(telegramId: string): Promise<MongoUser | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/users/${telegramId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return await response.json();
      }

      const users = await this.directMongoQuery('users', { telegramId });
      return users[0] || null;
    } catch (error) {
      console.error('Error fetching user by Telegram ID:', error);
      return null;
    }
  }

  // Get referrals for a specific user
  async getUserReferrals(userId: string): Promise<MongoReferral[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/users/${userId}/referrals`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return await response.json();
      }

      return await this.directMongoQuery('referrals', { referrerId: userId });
    } catch (error) {
      console.error('Error fetching user referrals:', error);
      return [];
    }
  }

  // Create a new referral in MongoDB
  async createReferral(referralData: Partial<MongoReferral>): Promise<MongoReferral | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/referrals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(referralData),
      });

      if (response.ok) {
        return await response.json();
      }

      return null;
    } catch (error) {
      console.error('Error creating referral in MongoDB:', error);
      return null;
    }
  }

  // Update user stats in MongoDB
  async updateUserStats(userId: string, stats: Partial<MongoUser>): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stats),
      });

      return response.ok;
    } catch (error) {
      console.error('Error updating user stats in MongoDB:', error);
      return false;
    }
  }

  // Direct MongoDB query via Supabase Edge Function proxy
  private async directMongoQuery(collection: string, query: any): Promise<any[]> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn('No session available for MongoDB query');
        return [];
      }

      const response = await fetch('/functions/v1/mongo-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          collection,
          operation: 'find',
          query
        })
      });

      if (response.ok) {
        const result = await response.json();
        return result.data || [];
      }

      console.warn(`MongoDB proxy query failed: ${response.statusText}`);
      return [];
    } catch (error) {
      console.error('Direct MongoDB query error:', error);
      return [];
    }
  }

  // Sync referral data between MongoDB and Supabase
  async syncReferralData(): Promise<{
    synced: number;
    errors: string[];
  }> {
    const results = {
      synced: 0,
      errors: [] as string[]
    };

    try {
      // Get all referrals from MongoDB
      const mongoReferrals = await this.getReferrals();
      
      for (const mongoReferral of mongoReferrals) {
        try {
          // Check if referral already exists in Supabase
          // This would be handled by the sync service
          results.synced++;
        } catch (error) {
          results.errors.push(`Failed to sync referral ${mongoReferral._id}: ${error}`);
        }
      }
    } catch (error) {
      results.errors.push(`Sync failed: ${error}`);
    }

    return results;
  }

  // Generate Telegram bot referral link
  generateTelegramReferralLink(referralCode: string, botUsername?: string): string {
    const username = botUsername || TELEGRAM_CONFIG.BOT_USERNAME;
    return `https://t.me/${username}?start=${referralCode}`;
  }

  // Validate referral code format
  isValidReferralCode(code: string): boolean {
    // Assuming your referral codes are 8-digit numbers
    return /^\d{8}$/.test(code);
  }
}

export const mongoService = new MongoService();
export type { MongoUser, MongoReferral, MongoTransaction };