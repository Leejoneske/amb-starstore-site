# 🔧 Production Environment Variables Setup

## Your Production Architecture:
- **Main App**: `starstore.site` (MongoDB connected)
- **Ambassador App**: `https://amb-starstore.vercel.app/` (production)
- **Email Domain**: `starstore.site` (verified in Resend)

## Supabase Environment Variables

**Go to Supabase Dashboard → Settings → Edge Functions → Environment Variables**

### Required Variables:
```bash
# Email Configuration
RESEND_API_KEY=your_resend_api_key_here

# Site Configuration  
SITE_URL=https://amb-starstore.vercel.app

# MongoDB Configuration (connects to your main app)
MONGO_CONNECTION_STRING=mongodb+srv://LeeJonesKE:rxov9FDs8LIxoOOZ@tg-star-store.l1jsj.mongodb.net/?retryWrites=true&w=majority&appName=Tg-Star-Store

# Main App URL (for API calls)
MAIN_APP_URL=https://starstore.site
```

## Vercel Environment Variables

**Go to Vercel Dashboard → Your Project → Settings → Environment Variables**

### Required Variables:
```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Production URLs
VITE_APP_URL=https://amb-starstore.vercel.app
VITE_MAIN_APP_URL=https://starstore.site

# Email Configuration (for frontend)
VITE_SUPPORT_EMAIL=support@starstore.site
```

## 🔄 When You Add Subdomain (Future):

### Update These URLs:
1. **Supabase Environment Variables:**
   ```bash
   SITE_URL=https://amb.starstore.site
   ```

2. **Vercel Environment Variables:**
   ```bash
   VITE_APP_URL=https://amb.starstore.site
   ```

3. **Email Function:**
   ```typescript
   // Update login URL in email template
   href="https://amb.starstore.site/auth"
   ```

## 🎯 Current Production Setup:

### ✅ **Email Flow:**
1. User applies on `amb-starstore.vercel.app`
2. Admin approves in dashboard
3. Email sent from `noreply@starstore.site`
4. User clicks link → goes to `https://amb-starstore.vercel.app/auth`
5. User logs in and uses dashboard

### ✅ **Integration:**
- Ambassador app connects to your main MongoDB
- Data syncs between ambassador program and main app
- Unified user experience across platforms

### ✅ **Branding:**
- All emails from your verified domain
- Professional business communications
- Consistent StarStore branding

## 🚀 **Ready for Production!**

Your setup is now production-ready with:
- ✅ Professional email system
- ✅ Proper domain configuration  
- ✅ MongoDB integration with main app
- ✅ Scalable architecture for future subdomain

Deploy the updated email function and you're all set! 🎯