// Telegram Bot Configuration
// Update this with your actual bot username

export const TELEGRAM_CONFIG = {
  // Replace 'StarStoreBot' with your actual bot username (without @)
  BOT_USERNAME: 'TgStarStore_bot', // 👈 Updated to correct bot username
  
  // Your MongoDB database name (if different from 'tg-star-store')
  DATABASE_NAME: 'tg-star-store', // 👈 CHANGE THIS IF YOUR DB NAME IS DIFFERENT
  
  // Your main StarStore app URL (MongoDB connected)
  SERVER_URL: 'https://starstore.site',
  
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