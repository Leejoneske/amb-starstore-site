// Telegram Bot Configuration
// Update this with your actual bot username

export const TELEGRAM_CONFIG = {
  // Your actual bot username (without @)
  BOT_USERNAME: 'TgStarStore_bot',
  
  // Your MongoDB database name
  DATABASE_NAME: 'tg-star-store',
  
  // Your main StarStore app URL (PRIMARY SYSTEM)
  SERVER_URL: 'https://starstore.site',
  
  // API endpoints for fetching data from Star Store
  API_ENDPOINTS: {
    REFERRAL_STATS: '/api/referral-stats',
    USER_REFERRALS: '/api/referrals',
    TRANSACTIONS: '/api/transactions',
    USER_INFO: '/api/users',
    WEBHOOK_REGISTER: '/api/webhook/register'
  },
  
  // MongoDB connection string (this will be set in environment variables)
  MONGO_CONNECTION_STRING: 'mongodb+srv://LeeJonesKE:rxov9FDs8LIxoOOZ@tg-star-store.l1jsj.mongodb.net/?retryWrites=true&w=majority&appName=Tg-Star-Store'
};

// Generate Telegram bot referral link with enhanced format
export const generateTelegramReferralLink = (referralCode: string): string => {
  return `https://t.me/${TELEGRAM_CONFIG.BOT_USERNAME}?start=${referralCode}`;
};

// Generate unique referral code (alphanumeric, 10 characters)
export const generateReferralCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Validate referral code format (10 character alphanumeric)
export const isValidReferralCode = (code: string): boolean => {
  return /^[A-Z0-9]{10}$/.test(code);
};

// Constants for activation tracking
export const ACTIVATION_THRESHOLD = 100; // 100 stars minimum for activation