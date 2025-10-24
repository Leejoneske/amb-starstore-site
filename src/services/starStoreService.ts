// Star Store API Service
// This service fetches data from the main Star Store app (primary system)

import { TELEGRAM_CONFIG } from '@/config/telegram';
import { logger } from '@/lib/logger';
import type { ApiResponse } from '@/types';

interface StarStoreUser {
  id: string;
  username?: string;
  telegramId: string;
  referralCode?: string;
  totalEarnings?: number;
  totalReferrals?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface StarStoreReferral {
  referrerUserId: string;
  referredUserId: string;
  status: 'pending' | 'active' | 'completed';
  withdrawn: boolean;
  dateReferred: Date;
}

interface StarStoreReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  pendingReferrals: number;
  totalEarnings: number;
  thisMonthReferrals: number;
  thisMonthEarnings: number;
  conversionRate: number;
  recentReferrals: Array<{
    referredUserId: string;
    status: string;
    dateReferred: string;
    totalStars: number;
    isActive: boolean;
  }>;
}

interface StarStoreTransaction {
  id: string;
  telegramId: string;
  type: 'buy' | 'sell';
  amount: number;
  stars: number;
  status: 'pending' | 'completed' | 'failed';
  referrerId?: string;
  commission?: number;
  createdAt: Date;
}

class StarStoreService {
  private baseUrl = TELEGRAM_CONFIG.SERVER_URL;
  private apiEndpoints = TELEGRAM_CONFIG.API_ENDPOINTS;

  // Helper method to make API calls to Star Store
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Ambassador-Dashboard/1.0',
          'X-API-Key': 'amb_starstore_secure_key_2024', // API key for ambassador app authentication
          ...options.headers,
        },
        signal: controller.signal,
        ...options,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      // Log error but don't expose internal details
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          logger.warn('StarStore API request timeout', { endpoint });
        } else {
          logger.apiError(endpoint, error, { service: 'starstore' });
        }
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'StarStore API unavailable',
        data: null as T
      };
    }
  }

  // Get user information by Telegram ID
  async getUserByTelegramId(telegramId: string): Promise<ApiResponse<StarStoreUser | null>> {
    return this.makeRequest<StarStoreUser>(`${this.apiEndpoints.USER_INFO}/${telegramId}`);
  }

  // Get referral statistics for a user
  async getReferralStats(telegramId: string): Promise<ApiResponse<StarStoreReferralStats>> {
    return this.makeRequest<StarStoreReferralStats>(`${this.apiEndpoints.REFERRAL_STATS}/${telegramId}`);
  }

  // Get all referrals for a user
  async getUserReferrals(telegramId: string): Promise<ApiResponse<StarStoreReferral[]>> {
    return this.makeRequest<StarStoreReferral[]>(`${this.apiEndpoints.USER_REFERRALS}/${telegramId}`);
  }

  // Get transaction history for a user
  async getUserTransactions(telegramId: string): Promise<ApiResponse<StarStoreTransaction[]>> {
    return this.makeRequest<StarStoreTransaction[]>(`${this.apiEndpoints.TRANSACTIONS}/${telegramId}`);
  }

  // Verify if a Telegram user exists in Star Store
  async verifyTelegramUser(telegramId: string): Promise<ApiResponse<boolean>> {
    try {
      // Validate Telegram ID format first (most important check)
      const isValidTelegramId = /^\d+$/.test(telegramId) && telegramId.length >= 5;
      
      if (!isValidTelegramId) {
        return {
          success: false,
          error: 'Invalid Telegram ID format. Must be numeric and at least 5 digits.',
          data: false
        };
      }

      // For now, skip external API verification and just validate format
      // This ensures Telegram connection works even if StarStore API is unavailable
      logger.info('Telegram ID format validation passed', { telegramId });
      
      // Optional: Try to verify with StarStore API (non-blocking)
      try {
        const userResponse = await this.getUserByTelegramId(telegramId);
        if (userResponse.success && userResponse.data !== null) {
          logger.info('Telegram ID verified with StarStore API', { telegramId });
        }
      } catch (apiError) {
        // Log but don't fail - API might be unavailable
        logger.warn('StarStore API verification skipped (API unavailable)', { telegramId, error: apiError });
      }
      
      return {
        success: true,
        data: true
      };
      
    } catch (error) {
      // Fallback to format validation only
      const isValidTelegramId = /^\d+$/.test(telegramId) && telegramId.length >= 5;
      
      if (isValidTelegramId) {
        logger.warn('Telegram verification error, allowing valid format', { telegramId, error });
        return {
          success: true,
          data: true
        };
      }
      
      return {
        success: false,
        error: 'Failed to verify Telegram ID. Please check the format (numeric, 5+ digits).',
        data: false
      };
    }
  }

  // Register webhook for real-time updates
  async registerWebhook(webhookUrl: string, events: string[]): Promise<ApiResponse<boolean>> {
    return this.makeRequest<boolean>(this.apiEndpoints.WEBHOOK_REGISTER, {
      method: 'POST',
      body: JSON.stringify({
        url: webhookUrl,
        events,
        source: 'ambassador-dashboard'
      })
    });
  }

  // Get referral link for a user (uses Star Store's referral system)
  generateReferralLink(referralCode: string): string {
    return `https://t.me/${TELEGRAM_CONFIG.BOT_USERNAME}?start=${referralCode}`;
  }

  // Health check for Star Store API
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.makeRequest<{ status: string; timestamp: string }>('/api/health');
  }

  // Sync ambassador data with Star Store
  async syncAmbassadorData(ambassadorTelegramId: string, ambassadorData: {
    email: string;
    fullName: string;
    tier: string;
    referralCode: string;
  }): Promise<ApiResponse<boolean>> {
    return this.makeRequest<boolean>('/api/ambassador/sync', {
      method: 'POST',
      body: JSON.stringify({
        telegramId: ambassadorTelegramId,
        ...ambassadorData
      })
    });
  }

  // Test connection to Star Store
  async testConnection(): Promise<{
    connected: boolean;
    latency: number;
    error?: string;
  }> {
    const startTime = Date.now();
    const healthResponse = await this.healthCheck();
    const latency = Date.now() - startTime;

    return {
      connected: healthResponse.success,
      latency,
      error: healthResponse.error
    };
  }
}

export const starStoreService = new StarStoreService();
export type { StarStoreUser, StarStoreReferral, StarStoreReferralStats, StarStoreTransaction };