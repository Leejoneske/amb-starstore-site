# 🔧 Admin Dashboard Setup Guide

## 🚨 Problem
You're seeing a regular user dashboard instead of admin dashboard because the admin role assignment isn't working properly.

## 🛠️ Solution Steps

### Step 1: Clear All Data
1. Go to **Supabase Dashboard → SQL Editor**
2. Run the `fix-admin-account.sql` script to clear everything
3. This will remove all users, profiles, and data

### Step 2: Fix Admin Trigger
1. In **Supabase Dashboard → SQL Editor**
2. Run the `fix-admin-trigger.sql` script
3. This fixes the admin assignment to work properly

### Step 3: Create Admin Account
1. Go to your website: `https://amb-starstore.vercel.app/auth`
2. Click **"Sign Up"** tab
3. Use email: `johnwanderi202@gmail.com`
4. Set any password (6+ characters)
5. Enter your full name
6. Click **"Create Account"**

### Step 4: Verify Admin Setup
1. After signup, you should automatically be assigned admin role
2. Go to `https://amb-starstore.vercel.app/dashboard`
3. You should see **"Admin"** badge in your profile
4. You should have full access to all features

### Step 5: Manual Fix (If Automatic Doesn't Work)
If the automatic assignment still doesn't work:

1. Go to **Supabase Dashboard → SQL Editor**
2. Run this query to find your user ID:
   ```sql
   SELECT id, email FROM auth.users WHERE email = 'johnwanderi202@gmail.com';
   ```
3. Copy the user ID and run the `manual-admin-setup.sql` script
4. Replace `USER_ID_HERE` with your actual user ID

## 🔍 Verification Queries

### Check if you're admin:
```sql
SELECT 
    p.email,
    p.full_name,
    ur.role,
    ap.status as ambassador_status
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.user_id
LEFT JOIN public.ambassador_profiles ap ON p.id = ap.user_id
WHERE p.email = 'johnwanderi202@gmail.com';
```

### Check all users and their roles:
```sql
SELECT 
    p.email,
    ur.role,
    ap.status
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.user_id
LEFT JOIN public.ambassador_profiles ap ON p.id = ap.user_id
ORDER BY p.created_at DESC;
```

## 🎯 Expected Result

After completing these steps:
- ✅ You should see "Admin" badge in dashboard
- ✅ You should have access to all ambassador data
- ✅ You should be able to view applications
- ✅ You should have full admin privileges

## 🚨 If Still Not Working

If you're still seeing regular user dashboard:

1. **Check browser console** for errors
2. **Clear browser cache** and cookies
3. **Try incognito/private mode**
4. **Check Supabase logs** for any errors
5. **Verify the trigger is working** by checking the verification queries

The issue was that the admin assignment trigger was on the wrong table (`profiles` instead of `auth.users`). The fix should resolve this completely!