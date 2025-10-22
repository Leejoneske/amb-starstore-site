// Zod validation schemas for API responses and form data
import { z } from 'zod';

// Environment validation
export const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  VITE_SUPABASE_FUNCTIONS_URL: z.string().url().optional(),
  VITE_TELEGRAM_BOT_USERNAME: z.string().optional(),
  VITE_TELEGRAM_SERVER_URL: z.string().url().optional(),
  VITE_MONGO_CONNECTION_STRING: z.string().optional(),
  VITE_APP_NAME: z.string().optional(),
  VITE_APP_VERSION: z.string().optional(),
  VITE_ENVIRONMENT: z.enum(['development', 'production', 'staging']).optional(),
  VITE_ENABLE_TELEGRAM: z.string().optional(),
  VITE_ENABLE_ANALYTICS: z.string().optional(),
  VITE_ENABLE_REALTIME: z.string().optional(),
});

// User and Authentication schemas
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  full_name: z.string().min(1),
  created_at: z.string().datetime(),
  last_sign_in_at: z.string().datetime().nullable(),
  email_confirmed_at: z.string().datetime().nullable(),
});

// Application schema
export const applicationSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  status: z.enum(['pending', 'approved', 'rejected']),
  created_at: z.string().datetime(),
  reviewed_at: z.string().datetime().optional(),
  experience: z.string().min(10, 'Experience must be at least 10 characters'),
  why_join: z.string().min(10, 'Reason must be at least 10 characters'),
  referral_strategy: z.string().min(10, 'Strategy must be at least 10 characters'),
  rejection_reason: z.string().optional(),
});

// Ambassador schema
export const ambassadorSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  referral_code: z.string().min(6),
  current_tier: z.enum(['explorer', 'pioneer', 'trailblazer', 'legend']),
  total_referrals: z.number().min(0),
  total_earnings: z.number().min(0),
  pending_earnings: z.number().min(0),
  lifetime_stars: z.number().min(0),
  avg_stars_per_transaction: z.number().min(0).optional(),
  quality_transaction_rate: z.number().min(0).max(100).optional(),
  active_referrals: z.number().min(0),
  social_posts_this_month: z.number().min(0),
  status: z.enum(['active', 'inactive', 'suspended']),
  created_at: z.string().datetime(),
  approved_at: z.string().datetime().optional(),
  profiles: z.object({
    full_name: z.string(),
    email: z.string().email(),
  }).optional(),
});

// Transaction schema
export const transactionSchema = z.object({
  id: z.string().uuid(),
  ambassador_id: z.string().uuid(),
  commission_amount: z.number().min(0),
  commission_rate: z.number().min(0).max(100),
  transaction_date: z.string().datetime(),
  status: z.enum(['pending', 'completed', 'failed']),
  stars_awarded: z.number().min(0),
  tier_at_transaction: z.string(),
});

// Payout schema
export const payoutSchema = z.object({
  id: z.string().uuid(),
  ambassador_id: z.string().uuid(),
  total_amount: z.number().min(0),
  period_start: z.string().datetime(),
  period_end: z.string().datetime(),
  status: z.enum(['pending', 'completed', 'failed']),
  payment_method: z.string().optional(),
  processed_at: z.string().datetime().optional(),
});

// Analytics data schema
export const analyticsDataSchema = z.object({
  monthlyEarnings: z.number().min(0),
  monthlyTransactions: z.number().min(0),
  avgStarsPerTransaction: z.number().min(0),
  earningsByMonth: z.array(z.object({
    month: z.string(),
    earnings: z.number().min(0),
    transactions: z.number().min(0),
    stars: z.number().min(0),
  })),
  conversionRate: z.number().min(0).max(100),
  totalReferrals: z.number().min(0),
  convertedReferrals: z.number().min(0),
  recentActivity: z.array(z.object({
    id: z.string(),
    type: z.enum(['transaction', 'referral', 'payout', 'application', 'profile_update']),
    title: z.string(),
    description: z.string(),
    timestamp: z.string().datetime(),
    metadata: z.record(z.unknown()).optional(),
    ambassador_id: z.string().uuid().optional(),
    amount: z.number().optional(),
  })),
});

// MongoDB schemas
export const mongoUserSchema = z.object({
  _id: z.string(),
  telegramId: z.string(),
  username: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  referredBy: z.string().optional(),
  referralCode: z.string().optional(),
  totalEarnings: z.number().min(0).optional(),
  totalReferrals: z.number().min(0).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const mongoReferralSchema = z.object({
  _id: z.string(),
  referrerId: z.string(),
  referredUserId: z.string(),
  referralCode: z.string(),
  status: z.enum(['pending', 'active', 'completed']),
  earnings: z.number().min(0).optional(),
  createdAt: z.date(),
});

export const mongoTransactionSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  type: z.enum(['buy', 'sell']),
  amount: z.number().min(0),
  stars: z.number().min(0),
  status: z.enum(['pending', 'completed', 'failed']),
  referrerId: z.string().optional(),
  commission: z.number().min(0).optional(),
  createdAt: z.date(),
});

// API Response schemas
export const apiResponseSchema = <T extends z.ZodType>(dataSchema: T) => z.object({
  data: dataSchema.optional(),
  error: z.string().optional(),
  message: z.string().optional(),
  success: z.boolean(),
});

// Form validation schemas
export const applicationFormSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  experience: z.string().min(50, 'Please provide at least 50 characters describing your experience'),
  why_join: z.string().min(50, 'Please provide at least 50 characters explaining why you want to join'),
  referral_strategy: z.string().min(50, 'Please provide at least 50 characters describing your referral strategy'),
});

export const loginFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const socialPostSchema = z.object({
  platform: z.enum(['twitter', 'facebook', 'instagram', 'linkedin', 'tiktok', 'other']),
  post_url: z.string().url('Invalid URL'),
  post_content: z.string().max(500).optional(),
});

// Filter schemas
export const filterConfigSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  tier: z.string().optional(),
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }).optional(),
  amountRange: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
  }).optional(),
});

// Export config schema
export const exportConfigSchema = z.object({
  format: z.enum(['csv', 'json']),
  dataType: z.enum(['applications', 'ambassadors', 'transactions', 'analytics']),
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }).optional(),
  includeFields: z.array(z.string()).optional(),
});

// Validation utility functions
export const validateEnv = (env: Record<string, string | undefined>) => {
  try {
    return envSchema.parse(env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingFields = error.errors.map(err => err.path.join('.')).join(', ');
      throw new Error(`Environment validation failed. Missing or invalid fields: ${missingFields}`);
    }
    throw error;
  }
};

export const validateApiResponse = <T>(data: unknown, schema: z.ZodType<T>): T => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`API response validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
};

// Safe parse wrapper that returns validation result
export const safeValidate = <T>(data: unknown, schema: z.ZodType<T>) => {
  const result = schema.safeParse(data);
  return {
    success: result.success,
    data: result.success ? result.data : undefined,
    error: result.success ? undefined : result.error,
  };
};

// Type exports
export type ApplicationFormData = z.infer<typeof applicationFormSchema>;
export type LoginFormData = z.infer<typeof loginFormSchema>;
export type SignupFormData = z.infer<typeof signupFormSchema>;
export type PasswordChangeData = z.infer<typeof passwordChangeSchema>;
export type SocialPostData = z.infer<typeof socialPostSchema>;
export type FilterConfigData = z.infer<typeof filterConfigSchema>;
export type ExportConfigData = z.infer<typeof exportConfigSchema>;