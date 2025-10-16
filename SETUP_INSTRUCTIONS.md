# 🚀 Complete Setup Instructions

## Step 1: Update Your Bot Username

**Edit this file**: `src/config/telegram.ts`

```typescript
export const TELEGRAM_CONFIG = {
  // 👇 CHANGE THIS TO YOUR ACTUAL BOT USERNAME
  BOT_USERNAME: 'YourActualBotUsername', // Remove @ symbol, just the username
  
  // 👇 CHANGE THIS IF YOUR DATABASE NAME IS DIFFERENT
  DATABASE_NAME: 'your-database-name',
  
  // These should be correct already
  SERVER_URL: 'https://tg-star-store-production.up.railway.app',
  MONGO_CONNECTION_STRING: 'mongodb+srv://LeeJonesKE:rxov9FDs8LIxoOOZ@tg-star-store.l1jsj.mongodb.net/?retryWrites=true&w=majority&appName=Tg-Star-Store'
};
```

## Step 2: Environment Variables in Supabase

1. **Go to your Supabase Dashboard**
2. **Navigate to**: Settings → Edge Functions → Environment Variables
3. **Add these variables**:

```
RESEND_API_KEY=your_resend_api_key_here
MONGO_CONNECTION_STRING=mongodb+srv://LeeJonesKE:rxov9FDs8LIxoOOZ@tg-star-store.l1jsj.mongodb.net/?retryWrites=true&w=majority&appName=Tg-Star-Store
```

## Step 3: Deploy Edge Functions

### Option A: Via Supabase Dashboard (Easiest)

1. **Go to**: Edge Functions → Create Function
2. **Create Function 1**: `mongo-proxy`
   - Copy the code from `supabase/functions/mongo-proxy/index.ts`
   - Paste it in the dashboard
   - Click Deploy

3. **Update Function 2**: `send-approval-email`
   - Go to existing `send-approval-email` function
   - Replace with updated code from `supabase/functions/send-approval-email/index.ts`
   - Click Deploy

### Option B: Install Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy functions
supabase functions deploy mongo-proxy
supabase functions deploy send-approval-email
```

## Step 4: Test the Setup

1. **Test Email Function**:
   - Try approving an ambassador application
   - Check if email is sent successfully
   - If it fails, check the function logs in Supabase

2. **Test MongoDB Integration**:
   - Go to Dashboard → Telegram tab
   - Click "Sync Now" button
   - Check if it connects to your MongoDB

## Step 5: Update Database Name (if needed)

If your MongoDB database name is NOT `tg-star-store`, update it in:

1. **File**: `supabase/functions/mongo-proxy/index.ts`
   ```typescript
   // Line 55: Change 'tg-star-store' to your database name
   const db = client.database('your-actual-database-name');
   ```

2. **File**: `src/config/telegram.ts`
   ```typescript
   DATABASE_NAME: 'your-actual-database-name',
   ```

## Step 6: Your MongoDB Collections

Make sure your MongoDB has these collections with this structure:

### `users` Collection
```javascript
{
  _id: ObjectId,
  telegramId: "123456789",
  username: "user123",
  firstName: "John",
  lastName: "Doe",
  referralCode: "12345678",
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
  referrerId: "123456789",
  referredUserId: "987654321", 
  referralCode: "12345678",
  status: "active",
  createdAt: ISODate
}
```

### `transactions` Collection
```javascript
{
  _id: ObjectId,
  userId: "123456789",
  type: "buy",
  amount: 100.00,
  stars: 1000,
  status: "completed",
  referrerId: "87654321",
  commission: 5.00,
  createdAt: ISODate
}
```

## Step 7: API Endpoints (Optional)

If you want better integration, add these endpoints to your Railway server:

```javascript
// GET /api/users - Return all users
// GET /api/users/:telegramId - Return specific user
// GET /api/referrals - Return all referrals
// GET /api/transactions - Return all transactions
// POST /api/referrals - Create new referral
```

## 🎯 Quick Test Checklist

- [ ] Updated bot username in `src/config/telegram.ts`
- [ ] Added environment variables in Supabase
- [ ] Deployed both edge functions
- [ ] Tested email function (approve an application)
- [ ] Tested MongoDB sync (click "Sync Now" in Telegram tab)
- [ ] Generated Telegram referral links work
- [ ] Cross-platform analytics show data

## 🆘 Troubleshooting

### Email Not Working?
- Check `RESEND_API_KEY` is set correctly
- Check function logs in Supabase dashboard
- Try the manual email sender as backup

### MongoDB Not Connecting?
- Check `MONGO_CONNECTION_STRING` is set correctly
- Verify your MongoDB collections exist
- Check function logs for connection errors

### Referral Links Not Working?
- Verify bot username is correct (no @ symbol)
- Test the Telegram link manually
- Check if your bot handles the `/start` command

## 🎉 Success!

Once everything is set up, you'll have:
- ✅ Automatic emails for new ambassadors
- ✅ Telegram referral links that work with your bot
- ✅ Cross-platform analytics
- ✅ Real-time data sync between MongoDB and Supabase

Need help? The system includes error messages and fallbacks to guide you! 🚀