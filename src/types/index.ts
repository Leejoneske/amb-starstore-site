// Central type definitions for the application
export interface Application {
  id: string;
  full_name: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at?: string;
  experience: string;
  why_join: string;
  referral_strategy: string;
  rejection_reason?: string;
}

export interface Ambassador {
  id: string;
  user_id: string;
  referral_code: string;
  current_tier: string;
  total_referrals: number;
  total_earnings: number;
  pending_earnings: number;
  lifetime_stars: number;
  avg_stars_per_transaction?: number | null;
  quality_transaction_rate?: number | null;
  active_referrals: number;
  social_posts_this_month: number;
  status: string;
  telegram_id?: string | null;
  telegram_username?: string | null;
  tier_progress?: number;
  first_login_at?: string | null;
  password_change_required?: boolean | null;
  approved_at?: string | null;
  approved_by?: string | null;
  created_at: string;
  updated_at?: string;
  // profiles may be a SelectQueryError shape at runtime; keep loose
  profiles?: {
    full_name?: string | null;
    email?: string;
  } | null | unknown;
}

export interface Transaction {
  id: string;
  ambassador_id: string;
  amount: number;
  commission_amount: number;
  commission_rate: number;
  transaction_date: string;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  stars_awarded: number;
  tier_at_transaction: string;
  order_id?: string | null;
  referral_id?: string | null;
  qualifies_for_bonus?: boolean;
  notes?: string | null;
  created_at?: string;
}

export interface Payout {
  id: string;
  ambassador_id: string;
  amount: number;
  total_amount: number;
  quality_bonus?: number | null;
  period_start: string;
  period_end: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  payment_method?: string | null;
  payment_reference?: string | null;
  notes?: string | null;
  paid_at?: string | null;
  created_at?: string;
}

export interface AnalyticsData {
  monthlyEarnings: number;
  monthlyTransactions: number;
  avgStarsPerTransaction: number;
  earningsByMonth: Array<{
    month: string;
    earnings: number;
    transactions: number;
    stars: number;
  }>;
  conversionRate: number;
  totalReferrals: number;
  convertedReferrals: number;
  recentActivity: ActivityEvent[];
}

export interface AdminAnalyticsData extends AnalyticsData {
  totalRevenue: number;
  monthlyRevenue: number;
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
    activeAmbassadors: number;
    avgTransactionValue: number;
    avgCommissionRate: number;
    totalTransactions: number;
  };
  topPerformers: Array<{
    id: string;
    name: string;
    earnings: number;
    referrals: number;
  }>;
}

export interface ActivityEvent {
  id: string;
  type: 'transaction' | 'referral' | 'payout' | 'application' | 'profile_update';
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
  ambassador_id?: string;
  amount?: number;
}

export interface UserAuthStatus {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  is_activated: boolean;
  days_since_approval: number;
  password_changed: boolean;
}

export interface FilterConfig {
  search?: string;
  status?: string;
  tier?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  amountRange?: {
    min: number;
    max: number;
  };
}

export interface ExportConfig {
  format: 'csv' | 'json';
  dataType: 'applications' | 'ambassadors' | 'transactions' | 'analytics';
  dateRange?: {
    from: Date;
    to: Date;
  };
  includeFields?: string[];
}

// MongoDB types
export interface MongoUser {
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

export interface MongoReferral {
  _id: string;
  referrerId: string;
  referredUserId: string;
  referralCode: string;
  status: 'pending' | 'active' | 'completed';
  earnings?: number;
  createdAt: Date;
}

export interface MongoTransaction {
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

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

// Notification types
export interface NotificationData {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

// Theme types
export type Theme = 'light' | 'dark' | 'system';

// User role types
export type UserRole = 'admin' | 'ambassador' | 'user';

// Tier types
export type TierLevel = 'explorer' | 'pioneer' | 'trailblazer' | 'legend';

export interface TierConfig {
  tier: TierLevel;
  displayName: string;
  icon: string;
  requirements: {
    referrals: number;
    socialPosts: number;
    qualityRate: number;
  };
  benefits: {
    minEarnings: number;
    nftLevel: number;
    freeStars: number;
    commissionRate: number;
  };
}