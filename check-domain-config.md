# Supabase Domain Configuration Check

## 🔍 Domain Whitelist Configuration

To ensure your Vercel domain is properly configured in Supabase, you need to check and update the following settings:

### 1. **Authentication Settings**
Go to: **Supabase Dashboard → Authentication → URL Configuration**

**Site URL:** `https://amb-starstore.vercel.app`

**Redirect URLs:** Add these URLs:
- `https://amb-starstore.vercel.app`
- `https://amb-starstore.vercel.app/auth`
- `https://amb-starstore.vercel.app/dashboard`
- `http://localhost:8080` (for development)

### 2. **API Settings**
Go to: **Supabase Dashboard → Settings → API**

**Project URL:** `https://amb-starstore.vercel.app`

### 3. **CORS Settings**
Make sure CORS is configured to allow your domain:
- `https://amb-starstore.vercel.app`
- `http://localhost:8080` (for development)

## 🗑️ Database Reset Commands

### Option 1: Using Supabase Dashboard
1. Go to **Supabase Dashboard → Table Editor**
2. Select each table and click "Delete all rows"
3. Tables to clear (in this order):
   - `analytics_events`
   - `payouts`
   - `transactions`
   - `social_posts`
   - `referrals`
   - `applications`
   - `ambassador_profiles`
   - `user_roles`
   - `profiles`

### Option 2: Using SQL Editor
1. Go to **Supabase Dashboard → SQL Editor**
2. Run the `reset-database.sql` script provided

### Option 3: Using Supabase CLI
```bash
# If you have Supabase CLI installed
supabase db reset
```

## 🔧 Environment Variables for Vercel

Add these to your Vercel project settings:

**VITE_SUPABASE_URL:** `https://jrtqbntwwkqxpexpplly.supabase.co`
**VITE_SUPABASE_ANON_KEY:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydHFibnR3d2txeHBleHBwbGx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTQ5NzEsImV4cCI6MjA3NTQ3MDk3MX0.eVCHDu9w_mOxE0PH_yb0lH1WpmZkmz6AKLC5XBbLeUE`

## ✅ Verification Steps

1. **Check domain configuration** in Supabase Dashboard
2. **Clear all database data** using one of the methods above
3. **Redeploy** your Vercel project
4. **Test authentication** at `https://amb-starstore.vercel.app/auth`
5. **Test application submission** at `https://amb-starstore.vercel.app/apply`

## 🚨 Important Notes

- **Backup data** before clearing if you have important information
- **Domain configuration** is crucial for authentication to work
- **CORS settings** must include your production domain
- **Environment variables** must be set in Vercel for production