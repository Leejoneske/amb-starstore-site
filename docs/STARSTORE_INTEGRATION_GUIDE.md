# Star Store Integration Guide

## 🏗️ **New Architecture Overview**

The system has been restructured with **Star Store** as the **primary system** and the **Ambassador Dashboard** as a **secondary system** that fetches and displays data from Star Store.

### **System Roles**

#### **Primary System: Star Store (https://starstore.site)**
- ✅ Handles all user registrations and transactions
- ✅ Manages referral links and tracking
- ✅ Processes star purchases/sales
- ✅ Stores all data in MongoDB
- ✅ Provides APIs for Ambassador Dashboard

#### **Secondary System: Ambassador Dashboard**
- ✅ Connects ambassadors via Telegram ID
- ✅ Fetches referral data from Star Store APIs
- ✅ Displays analytics and performance metrics
- ✅ Manages ambassador applications and tiers
- ✅ Provides dashboard interface for ambassadors

## 🔄 **Data Flow**

```
User clicks referral link → Star Store Bot → MongoDB (primary data)
                                    ↓
Ambassador Dashboard ← Star Store APIs ← MongoDB
```

## 🔧 **Integration Components**

### **1. Star Store Service (`/src/services/starStoreService.ts`)**
- Handles all API calls to Star Store
- Fetches user data, referrals, and transactions
- Manages connection testing and health checks

### **2. Webhook Service (`/src/services/webhookService.ts`)**
- Listens for real-time updates from Star Store
- Handles events like referral activations and transactions
- Provides React hooks for event listening

### **3. Telegram Connection (`/src/components/dashboard/TelegramConnection.tsx`)**
- Allows ambassadors to connect their Telegram accounts
- Verifies Telegram ID exists in Star Store
- Syncs ambassador data between systems

### **4. Star Store Connection (`/src/components/dashboard/StarStoreConnection.tsx`)**
- Shows connection status with Star Store
- Tests API connectivity and latency
- Manages webhook registration

## 📡 **API Endpoints Added to Star Store**

### **New Endpoints in Star Store Server:**

```javascript
// Get user by Telegram ID
GET /api/users/:telegramId

// Sync ambassador data
POST /api/ambassador/sync

// Register webhook for real-time updates
POST /api/webhook/register
```

## 🚀 **Setup Instructions**

### **1. Ambassador Dashboard Setup**

1. **Update Configuration:**
   ```typescript
   // src/config/telegram.ts
   export const TELEGRAM_CONFIG = {
     BOT_USERNAME: 'TgStarStore_bot',
     SERVER_URL: 'https://starstore.site', // Your Star Store URL
     // ... other config
   };
   ```

2. **Connect Telegram Account:**
   - Go to Dashboard → Telegram tab
   - Enter your Telegram ID (get from @userinfobot)
   - System will verify you exist in Star Store
   - Connection will be established

3. **Test Integration:**
   - Check "Star Store Connection" status
   - Should show "Connected" with low latency
   - Enable real-time updates if needed

### **2. Star Store Server Setup**

The new API endpoints have been added to your Star Store server. Make sure your server is running the updated version with the new endpoints.

## 📊 **How Referrals Work Now**

### **1. Referral Creation**
- Ambassador gets referral link: `https://t.me/TgStarStore_bot?start=REFERRAL_CODE`
- User clicks link and starts using Star Store bot
- Star Store creates referral record in MongoDB

### **2. Referral Tracking**
- Ambassador Dashboard fetches referral data from Star Store APIs
- Real-time updates via webhooks (optional)
- All calculations done by Star Store system

### **3. Referral Activation**
- When user reaches 100 stars in Star Store
- Star Store automatically activates referral
- Commission calculated and recorded
- Ambassador Dashboard shows updated stats

## 🔍 **Monitoring & Debugging**

### **Connection Status**
- Dashboard → Telegram tab → "Star Store Connection"
- Shows connection status, latency, and errors
- Test connection button for troubleshooting

### **Real-time Updates**
- Webhook registration for live updates
- Event listeners for referral activations
- Custom events for UI updates

### **Data Verification**
- Compare data between Star Store and Dashboard
- Check Telegram ID mapping
- Verify API responses

## 🛠️ **Troubleshooting**

### **Common Issues:**

1. **"User not found in Star Store"**
   - Ambassador hasn't used the Star Store bot yet
   - Need to interact with @TgStarStore_bot first

2. **Connection Failed**
   - Check if Star Store server is running
   - Verify API endpoints are accessible
   - Check network connectivity

3. **No Referral Data**
   - Verify Telegram ID is correctly connected
   - Check if referrals exist in Star Store MongoDB
   - Test API endpoints manually

4. **Real-time Updates Not Working**
   - Check webhook registration status
   - Verify webhook URL is accessible
   - Check browser console for errors

## 📈 **Benefits of New Architecture**

✅ **Single Source of Truth**: All referral data managed by Star Store
✅ **Real-time Sync**: Automatic updates when referrals activate
✅ **Simplified Management**: No dual database issues
✅ **Better Performance**: Direct API calls instead of database sync
✅ **Easier Maintenance**: Clear separation of concerns

## 🔮 **Future Enhancements**

- [ ] Real-time notifications for referral activations
- [ ] Advanced analytics from Star Store data
- [ ] Automated webhook retry mechanisms
- [ ] Enhanced error handling and logging
- [ ] Performance optimization for large datasets

---

**Note**: This integration makes Star Store the authoritative system for all referral data, while the Ambassador Dashboard provides a user-friendly interface for ambassadors to view their performance and manage their accounts.