// ============================================================================
// AMBASSADOR DASHBOARD INTEGRATION ENDPOINTS
// Copy this entire block and paste it into your main Star Store server.js
// Add it after your existing API endpoints (around line 7500+)
// ============================================================================

// Get user information by Telegram ID (for Ambassador app)
app.get('/api/users/:telegramId', async (req, res) => {
    try {
        const { telegramId } = req.params;
        
        // Find user in MongoDB
        const user = await User.findOne({ id: telegramId }).lean();
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get additional user stats
        const totalReferrals = await Referral.countDocuments({ referrerUserId: telegramId });
        const totalEarnings = await ReferralWithdrawal.aggregate([
            { $match: { userId: telegramId, status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const userData = {
            id: user.id,
            username: user.username,
            telegramId: user.id,
            totalReferrals,
            totalEarnings: totalEarnings[0]?.total || 0,
            createdAt: user.createdAt,
            updatedAt: user.lastActive || user.createdAt
        };
        
        res.json(userData);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Sync ambassador data (called from Ambassador app)
app.post('/api/ambassador/sync', async (req, res) => {
    try {
        const { telegramId, email, fullName, tier, referralCode } = req.body;
        
        if (!telegramId) {
            return res.status(400).json({ error: 'Telegram ID is required' });
        }

        // Store ambassador info in the User collection with additional fields
        await User.findOneAndUpdate(
            { id: telegramId },
            { 
                $set: {
                    ambassadorEmail: email,
                    ambassadorFullName: fullName,
                    ambassadorTier: tier,
                    ambassadorReferralCode: referralCode,
                    ambassadorSyncedAt: new Date()
                }
            },
            { upsert: false } // Don't create if user doesn't exist
        );

        res.json({ success: true, message: 'Ambassador data synced successfully' });
    } catch (error) {
        console.error('Error syncing ambassador data:', error);
        res.status(500).json({ error: 'Failed to sync ambassador data' });
    }
});

// Register webhook endpoint (for Ambassador app to register for updates)
app.post('/api/webhook/register', async (req, res) => {
    try {
        const { url, events, source } = req.body;
        
        if (!url || !events || !Array.isArray(events)) {
            return res.status(400).json({ error: 'URL and events array are required' });
        }

        // Log webhook registration (you can enhance this to store in DB if needed)
        console.log(`🔗 Webhook registered: ${url} for events: ${events.join(', ')} from ${source}`);
        
        res.json({ 
            success: true, 
            message: 'Webhook registered successfully',
            url,
            events,
            registeredAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error registering webhook:', error);
        res.status(500).json({ error: 'Failed to register webhook' });
    }
});

// Health check endpoint for Ambassador app connection testing
app.get('/api/health', async (req, res) => {
    try {
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'StarStore',
            version: '1.0.0'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

// ============================================================================
// END OF AMBASSADOR DASHBOARD INTEGRATION ENDPOINTS
// ============================================================================