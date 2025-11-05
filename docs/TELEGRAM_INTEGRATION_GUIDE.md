# 🚀 Telegram Miniapp Integration Guide

## Overview
This integration connects your existing Telegram miniapp (MongoDB) with the StarStore Ambassador system (Supabase), enabling:

- **Cross-platform referral tracking** (Telegram + Web)
- **Enhanced referral links** pointing to your Telegram bot
- **Unified analytics** across both platforms
- **Real-time data synchronization**

## 🔧 Setup Instructions

### 1. Environment Variables
Add these to your Supabase Edge Functions:

```bash
# In Supabase Dashboard → Settings → Edge Functions → Environment Variables
MONGO_CONNECTION_STRING=mongodb+srv://LeeJonesKE:rxov9FDs8LIxoOOZ@tg-star-store.l1jsj.mongodb.net/?retryWrites=true&w=majority&appName=Tg-Star-Store
```

### 2. Deploy MongoDB Proxy Function
```bash
supabase functions deploy mongo-proxy
```

### 3. Update Your Telegram Bot
Replace `StarStoreBot` with your actual bot username in the integration component.

## 🎯 How It Works

### Enhanced Referral Flow
```
Ambassador Dashboard → Generate Links → User Clicks → Telegram Bot → Records in MongoDB → Syncs to Supabase
```

### Referral Link Types
1. **Telegram Bot Link**: `https://t.me/YourBot?start=REFERRAL_CODE`
   - Opens Telegram miniapp directly
   - Records referral in MongoDB
   - Syncs to Supabase dashboard

2. **Web Dashboard Link**: `https://yoursite.com?ref=REFERRAL_CODE`
   - Opens web ambassador dashboard
   - Records directly in Supabase

### Data Synchronization
- **Real-time**: New referrals sync automatically
- **Manual**: Admin can trigger sync anytime
- **Bi-directional**: Data flows both ways

## 📊 MongoDB Collections Expected

Based on your structure, the system expects these collections:

### `users` Collection
```javascript
{
  _id: ObjectId,
  telegramId: "123456789",
  username: "user123",
  firstName: "John",
  lastName: "Doe",
  referredBy: "87654321", // Referrer's referral code
  referralCode: "12345678", // User's own referral code
  totalEarnings: 150.50,
  totalReferrals: 5,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### `referrals` Collection
```javascript
{
  _id: ObjectId,
  referrerId: "123456789", // Telegram ID of referrer
  referredUserId: "987654321", // Telegram ID of referred user
  referralCode: "12345678",
  status: "active", // pending, active, completed
  earnings: 25.00,
  createdAt: ISODate
}
```

### `transactions` Collection
```javascript
{
  _id: ObjectId,
  userId: "123456789", // Telegram ID
  type: "buy", // buy, sell
  amount: 100.00, // USD amount
  stars: 1000, // Telegram stars
  status: "completed", // pending, completed, failed
  referrerId: "87654321", // If this was a referred transaction
  commission: 5.00, // Commission earned by referrer
  createdAt: ISODate
}
```

## 🔄 API Endpoints Needed

Your Railway server should expose these endpoints:

### GET `/api/users`
Returns all users from MongoDB

### GET `/api/users/:telegramId`
Returns specific user by Telegram ID

### GET `/api/users/:userId/referrals`
Returns referrals for a specific user

### GET `/api/referrals`
Returns all referrals

### POST `/api/referrals`
Creates a new referral

### GET `/api/transactions`
Returns all transactions

### PATCH `/api/users/:userId`
Updates user statistics

## 🎨 Features Added

### For Ambassadors
- **Enhanced Referral Links**: Both Telegram and web links
- **Cross-Platform Stats**: Combined analytics from both sources
- **Telegram Integration Tab**: Dedicated section for Telegram features
- **Real-Time Sync**: Live updates from both platforms

### For Admins
- **MongoDB Data Preview**: View Telegram users, referrals, transactions
- **Sync Management**: Manual sync controls and status
- **Combined Analytics**: Unified view of all referral sources
- **Error Monitoring**: Track sync issues and resolve them

## 🔗 Integration Benefits

### Unified Referral System
- Single referral code works across platforms
- Consistent tracking and attribution
- Combined earnings and statistics

### Better User Experience
- Telegram users get direct bot links
- Web users get dashboard links
- Seamless cross-platform experience

### Enhanced Analytics
- Total referrals = Telegram + Web
- Platform-specific insights
- Combined earnings tracking

## 🛠️ Technical Implementation

### Database Schema Extensions
- Added MongoDB-specific fields to Supabase tables
- Created cross-platform views and functions
- Implemented sync mechanisms

### Real-Time Features
- Live data synchronization
- Cross-platform notifications
- Unified analytics updates

### Security
- Authenticated API calls only
- Secure MongoDB connections
- RLS policies for data access

## 🚀 Next Steps

1. **Deploy the functions** to Supabase
2. **Update bot username** in the integration component
3. **Test referral links** from both platforms
4. **Monitor sync status** in admin dashboard
5. **Verify data flow** between MongoDB and Supabase

## 📈 Expected Results

After integration:
- ✅ Telegram referrals appear in web dashboard
- ✅ Web referrals sync to MongoDB (if needed)
- ✅ Combined statistics show total performance
- ✅ Enhanced referral links work seamlessly
- ✅ Real-time updates across platforms

This creates a powerful, unified referral system that works across your Telegram miniapp and web dashboard! 🎉