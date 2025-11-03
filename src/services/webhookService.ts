// @ts-nocheck
// Webhook Service for receiving real-time updates from Star Store
// This service handles incoming webhooks from the primary Star Store system

import { logger } from '@/lib/logger';
import { starStoreService } from './starStoreService';

export interface WebhookEvent {
  event: string;
  timestamp: string;
  data: Record<string, unknown>;
  source: 'starstore';
}

export interface ReferralActivatedEvent extends WebhookEvent {
  event: 'referral_activated';
  data: {
    referralId: string;
    referrerTelegramId: string;
    referredTelegramId: string;
    totalStars: number;
    commissionEarned: number;
    activatedAt: string;
  };
}

export interface TransactionCompletedEvent extends WebhookEvent {
  event: 'transaction_completed';
  data: {
    transactionId: string;
    telegramId: string;
    type: 'buy' | 'sell';
    amount: number;
    stars: number;
    referrerId?: string;
    commission?: number;
  };
}

export interface UserRegisteredEvent extends WebhookEvent {
  event: 'user_registered';
  data: {
    telegramId: string;
    username?: string;
    referredBy?: string;
    registeredAt: string;
  };
}

type SupportedWebhookEvent = ReferralActivatedEvent | TransactionCompletedEvent | UserRegisteredEvent;

class WebhookService {
  private eventHandlers: Map<string, Array<(event: WebhookEvent) => void>> = new Map();
  private webhookUrl: string;

  constructor() {
    // In production, this would be your actual webhook endpoint
    this.webhookUrl = `${window.location.origin}/api/webhooks/starstore`;
  }

  // Register event handler
  on(eventType: string, handler: (event: WebhookEvent) => void): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }

  // Remove event handler
  off(eventType: string, handler: (event: WebhookEvent) => void): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // Process incoming webhook
  async processWebhook(event: SupportedWebhookEvent): Promise<void> {
    try {
      logger.info('Processing webhook event', { event: event.event, timestamp: event.timestamp });

      // Emit to registered handlers
      const handlers = this.eventHandlers.get(event.event) || [];
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          logger.error('Webhook handler error', { event: event.event }, error as Error);
        }
      });

      // Handle specific events
      switch (event.event) {
        case 'referral_activated':
          await this.handleReferralActivated(event as ReferralActivatedEvent);
          break;
        case 'transaction_completed':
          await this.handleTransactionCompleted(event as TransactionCompletedEvent);
          break;
        case 'user_registered':
          await this.handleUserRegistered(event as UserRegisteredEvent);
          break;
        default:
          logger.warn('Unknown webhook event type', { event: event.event });
      }
    } catch (error) {
      logger.error('Webhook processing error', { event: event.event }, error as Error);
      throw error;
    }
  }

  // Handle referral activation webhook
  private async handleReferralActivated(event: ReferralActivatedEvent): Promise<void> {
    const { referrerTelegramId, referredTelegramId, totalStars, commissionEarned } = event.data;

    // Update local cache/state if needed
    // This could trigger UI updates, notifications, etc.
    
    logger.info('Referral activated', {
      referrer: referrerTelegramId,
      referred: referredTelegramId,
      stars: totalStars,
      commission: commissionEarned
    });

    // Emit custom event for UI components to listen to
    window.dispatchEvent(new CustomEvent('referral-activated', {
      detail: event.data
    }));
  }

  // Handle transaction completion webhook
  private async handleTransactionCompleted(event: TransactionCompletedEvent): Promise<void> {
    const { telegramId, type, amount, stars, commission } = event.data;

    logger.info('Transaction completed', {
      user: telegramId,
      type,
      amount,
      stars,
      commission
    });

    // Emit custom event for UI components
    window.dispatchEvent(new CustomEvent('transaction-completed', {
      detail: event.data
    }));
  }

  // Handle user registration webhook
  private async handleUserRegistered(event: UserRegisteredEvent): Promise<void> {
    const { telegramId, username, referredBy } = event.data;

    logger.info('User registered', {
      user: telegramId,
      username,
      referredBy
    });

    // Emit custom event for UI components
    window.dispatchEvent(new CustomEvent('user-registered', {
      detail: event.data
    }));
  }

  // Register webhook with Star Store
  async registerWebhook(): Promise<boolean> {
    try {
      const events = [
        'referral_activated',
        'transaction_completed',
        'user_registered'
      ];

      const response = await starStoreService.registerWebhook(this.webhookUrl, events);
      
      if (response.success) {
        logger.info('Webhook registered successfully', { url: this.webhookUrl, events });
        return true;
      } else {
        logger.error('Failed to register webhook', { error: response.error });
        return false;
      }
    } catch (error) {
      logger.error('Webhook registration error', {}, error as Error);
      return false;
    }
  }

  // Test webhook connection
  async testWebhook(): Promise<boolean> {
    try {
      // Send a test event
      const testEvent: WebhookEvent = {
        event: 'test',
        timestamp: new Date().toISOString(),
        data: { test: true },
        source: 'starstore'
      };

      await this.processWebhook(testEvent as SupportedWebhookEvent);
      return true;
    } catch (error) {
      logger.error('Webhook test failed', {}, error as Error);
      return false;
    }
  }

  // Get webhook URL for registration
  getWebhookUrl(): string {
    return this.webhookUrl;
  }
}

export const webhookService = new WebhookService();

// React hook for listening to webhook events
export function useWebhookEvents() {
  const addEventListener = (eventType: string, handler: (event: CustomEvent) => void) => {
    window.addEventListener(eventType, handler as EventListener);
    return () => window.removeEventListener(eventType, handler as EventListener);
  };

  return {
    onReferralActivated: (handler: (data: ReferralActivatedEvent['data']) => void) =>
      addEventListener('referral-activated', (e) => handler(e.detail)),
    
    onTransactionCompleted: (handler: (data: TransactionCompletedEvent['data']) => void) =>
      addEventListener('transaction-completed', (e) => handler(e.detail)),
    
    onUserRegistered: (handler: (data: UserRegisteredEvent['data']) => void) =>
      addEventListener('user-registered', (e) => handler(e.detail))
  };
}