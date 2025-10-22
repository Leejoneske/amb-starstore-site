// MongoDB Integration Service for Telegram Miniapp
// Connects to your existing MongoDB database to sync referral data

import { supabase } from '@/integrations/supabase/client';
import { telegramConfig } from '@/config/env';
import { logger } from '@/lib/logger';
import { validateApiResponse, mongoUserSchema, mongoReferralSchema, mongoTransactionSchema } from '@/lib/validation';
import type { MongoUser, MongoReferral, MongoTransaction, ApiResponse } from '@/types';

class MongoService {
  private baseUrl = telegramConfig.serverUrl;
  private mongoConnectionString = telegramConfig.mongoConnectionString;

  // Fetch users from MongoDB
  async getUsers(): Promise<ApiResponse<MongoUser[]>> {
    try {
      // Try to call your existing API first
      const response = await fetch(`${this.baseUrl}/api/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const rawData = await response.json();
        // Validate response data
        try {
          const validatedData = rawData.map((user: unknown) => 
            validateApiResponse(user, mongoUserSchema)
          );
          return { success: true, data: validatedData };
        } catch (validationError) {
          logger.warn('MongoDB API returned invalid user data', { validationError });
          return { success: true, data: rawData }; // Fallback to raw data
        }
      }

      // Fallback: Use Supabase proxy function
      const proxyResult = await this.callMongoProxy('users', {});
      return proxyResult;
    } catch (error) {
      logger.apiError('/api/users', error as Error, { service: 'mongo' });
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        data: []
      };
    }
  }

  // Fetch referrals from MongoDB
  async getReferrals(): Promise<ApiResponse<MongoReferral[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/referrals`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      }

      return await this.callMongoProxy('referrals', {});
    } catch (error) {
      logger.apiError('/api/referrals', error as Error, { service: 'mongo' });
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        data: []
      };
    }
  }

  // Fetch transactions from MongoDB
  async getTransactions(): Promise<ApiResponse<MongoTransaction[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/transactions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      }

      return await this.callMongoProxy('transactions', {});
    } catch (error) {
      logger.apiError('/api/transactions', error as Error, { service: 'mongo' });
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        data: []
      };
    }
  }

  // Get user by Telegram ID
  async getUserByTelegramId(telegramId: string): Promise<ApiResponse<MongoUser | null>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/users/${telegramId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      }

      const result = await this.callMongoProxy<MongoUser>('users', { telegramId });
      return {
        success: result.success,
        data: result.data?.[0] || null,
        error: result.error
      };
    } catch (error) {
      logger.apiError(`/api/users/${telegramId}`, error as Error, { service: 'mongo', telegramId });
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }

  // Get referrals for a specific user
  async getUserReferrals(userId: string): Promise<ApiResponse<MongoReferral[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/users/${userId}/referrals`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      }

      return await this.callMongoProxy('referrals', { referrerId: userId });
    } catch (error) {
      logger.apiError(`/api/users/${userId}/referrals`, error as Error, { service: 'mongo', userId });
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        data: []
      };
    }
  }

  // Create a new referral in MongoDB
  async createReferral(referralData: Partial<MongoReferral>): Promise<ApiResponse<MongoReferral | null>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/referrals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(referralData),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      }

      return { 
        success: false, 
        error: 'Failed to create referral',
        data: null
      };
    } catch (error) {
      logger.apiError('/api/referrals', error as Error, { service: 'mongo', action: 'create' });
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null
      };
    }
  }

  // Update user stats in MongoDB
  async updateUserStats(userId: string, stats: Partial<MongoUser>): Promise<ApiResponse<boolean>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stats),
      });

      return { 
        success: response.ok, 
        data: response.ok,
        error: response.ok ? undefined : 'Failed to update user stats'
      };
    } catch (error) {
      logger.apiError(`/api/users/${userId}`, error as Error, { service: 'mongo', action: 'update', userId });
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        data: false
      };
    }
  }

  // MongoDB query via Supabase proxy function
  private async callMongoProxy<T>(collection: string, query: Record<string, unknown>): Promise<ApiResponse<T[]>> {
    try {
      const { data, error } = await supabase.functions.invoke('mongo-proxy', {
        body: { collection, query }
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        data: data?.results || []
      };
    } catch (error) {
      logger.apiError('mongo-proxy', error as Error, { collection, query });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: []
      };
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
      logger.info('Starting referral data sync', { service: 'mongo' });
      
      // Get all referrals from MongoDB
      const referralsResponse = await this.getReferrals();
      
      if (!referralsResponse.success || !referralsResponse.data) {
        results.errors.push(`Failed to fetch referrals: ${referralsResponse.error}`);
        return results;
      }
      
      for (const mongoReferral of referralsResponse.data) {
        try {
          // Check if referral already exists in Supabase
          const { data: existingReferral } = await supabase
            .from('referrals')
            .select('id')
            .eq('mongo_id', mongoReferral._id)
            .single();

          if (!existingReferral) {
            // Create new referral in Supabase
            const { error } = await supabase
              .from('referrals')
              .insert({
                mongo_id: mongoReferral._id,
                referrer_id: mongoReferral.referrerId,
                referred_user_id: mongoReferral.referredUserId,
                referral_code: mongoReferral.referralCode,
                status: mongoReferral.status,
                earnings: mongoReferral.earnings || 0,
                created_at: mongoReferral.createdAt
              });

            if (error) {
              throw error;
            }
          }
          
          results.synced++;
        } catch (error) {
          const errorMsg = `Failed to sync referral ${mongoReferral._id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          results.errors.push(errorMsg);
          logger.error('Referral sync error', { mongoReferralId: mongoReferral._id }, error as Error);
        }
      }
      
      logger.info('Referral data sync completed', { 
        synced: results.synced, 
        errors: results.errors.length 
      });
    } catch (error) {
      const errorMsg = `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      results.errors.push(errorMsg);
      logger.error('Referral sync failed', {}, error as Error);
    }

    return results;
  }

  // Generate Telegram bot referral link
  generateTelegramReferralLink(referralCode: string, botUsername?: string): string {
    const username = botUsername || telegramConfig.botUsername;
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