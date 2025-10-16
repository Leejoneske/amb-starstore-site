// Telegram Bot Configuration
// Update this with your actual bot username

export const TELEGRAM_CONFIG = {
  // Replace 'StarStoreBot' with your actual bot username (without @)
  BOT_USERNAME: 'StarStoreBot', // 👈 CHANGE THIS TO YOUR BOT USERNAME
  
  // Your MongoDB database name (if different from 'tg-star-store')
  DATABASE_NAME: 'tg-star-store', // 👈 CHANGE THIS IF YOUR DB NAME IS DIFFERENT
  
  // Your main StarStore app URL (MongoDB connected)
  SERVER_URL: 'https://starstore.site',
  
  // MongoDB connection string (this will be set in environment variables)
  MONGO_CONNECTION_STRING: 'mongodb+srv://LeeJonesKE:rxov9FDs8LIxoOOZ@tg-star-store.l1jsj.mongodb.net/?retryWrites=true&w=majority&appName=Tg-Star-Store'
};

// Generate Telegram bot referral link
export const generateTelegramReferralLink = (referralCode: string): string => {
  return `https://t.me/${TELEGRAM_CONFIG.BOT_USERNAME}?start=${referralCode}`;
};

// Validate referral code format (assuming 8-digit codes)
export const isValidReferralCode = (code: string): boolean => {
  return /^\d{8}$/.test(code);
};