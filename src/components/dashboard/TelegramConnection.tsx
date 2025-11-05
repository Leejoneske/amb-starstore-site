import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAmbassadorProfile } from '@/hooks/useAmbassadorProfile';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, MessageCircle, CheckCircle2, AlertCircle, Copy, ExternalLink } from 'lucide-react';
import { generateTelegramReferralLink, TELEGRAM_CONFIG } from '@/config/telegram';
import { starStoreService } from '@/services/starStoreService';
import { logger } from '@/lib/logger';

interface TelegramConnectionProps {
  ambassadorId?: string;
}

export const TelegramConnection = ({ ambassadorId }: TelegramConnectionProps) => {
  const [telegramId, setTelegramId] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: profile, refetch } = useAmbassadorProfile(user?.id);

  useEffect(() => {
    logger.info('TelegramConnection - Profile data updated', {
      hasProfile: !!profile,
      userId: user?.id,
      ambassadorIdProp: ambassadorId
    });
    
    if (profile) {
      setTelegramId(profile.telegram_id || '');
      setTelegramUsername(profile.telegram_username || '');
      setIsConnected(!!profile.telegram_id);
    }
  }, [profile, user?.id, ambassadorId]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!telegramId.trim()) return;

    // Basic format validation
    const telegramIdTrimmed = telegramId.trim();
    if (!/^\d+$/.test(telegramIdTrimmed) || telegramIdTrimmed.length < 5) {
      toast({
        title: "Invalid Telegram ID",
        description: "Telegram ID must be numeric and at least 5 digits long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    // FORCE CACHE CHECK - If you see this message, you have the latest code
    logger.info('Telegram connection starting', { telegramId: telegramIdTrimmed });
    
    try {

      // Skip external verification - go directly to secure function
      logger.info('Using secure function to connect Telegram', { telegramId: telegramIdTrimmed });
      
      const { data: functionResult, error: functionError } = await supabase
        .rpc('update_ambassador_telegram_info', {
          p_telegram_id: telegramIdTrimmed,
          p_telegram_username: telegramUsername.trim() || null
        });

      if (functionError) {
        logger.error('Telegram connection function error', { telegramId: telegramIdTrimmed }, functionError);
        
        // If function doesn't exist, show helpful error
        if (functionError.message?.includes('function') && functionError.message?.includes('does not exist')) {
          logger.error('Database function missing', { telegramId: telegramIdTrimmed }, functionError);
          console.error(`
-- TELEGRAM CONNECTION FIX - Copy and run this in Supabase SQL Editor
CREATE OR REPLACE FUNCTION update_ambassador_telegram_info(
  p_telegram_id text,
  p_telegram_username text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_ambassador_id uuid;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  SELECT id INTO v_ambassador_id FROM ambassador_profiles WHERE user_id = v_user_id;
  IF v_ambassador_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Ambassador profile not found');
  END IF;
  
  IF p_telegram_id IS NULL OR p_telegram_id = '' THEN
    RETURN json_build_object('success', false, 'error', 'Telegram ID is required');
  END IF;
  
  IF NOT (p_telegram_id ~ '^\\d+$' AND length(p_telegram_id) >= 5) THEN
    RETURN json_build_object('success', false, 'error', 'Invalid Telegram ID format');
  END IF;
  
  UPDATE ambassador_profiles 
  SET telegram_id = p_telegram_id, telegram_username = p_telegram_username, updated_at = now()
  WHERE id = v_ambassador_id;
  
  RETURN json_build_object('success', true, 'ambassador_id', v_ambassador_id, 'telegram_id', p_telegram_id);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', 'Database error: ' || SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION update_ambassador_telegram_info(text, text) TO authenticated;
          `);
          throw new Error('Database function not found. Please run the SQL fix in your Supabase dashboard first. Check the console above for the SQL code to copy and paste.');
        }
        
        throw new Error(`Failed to update Telegram info: ${functionError.message}`);
      }

      if (!functionResult || typeof functionResult !== 'object' || !(functionResult as any).success) {
        logger.error('Function returned error', { telegramId: telegramIdTrimmed, result: functionResult });
        throw new Error((functionResult as any)?.error || 'Failed to update Telegram information');
      }

      logger.info('Profile updated successfully via secure function', { telegramId: telegramIdTrimmed });

      // Try to sync ambassador data with Star Store (non-blocking)
      if (profile && typeof profile === 'object') {
        try {
          logger.info('Attempting StarStore sync', { telegramId: telegramIdTrimmed });
          const profileData = profile as any;
          await starStoreService.syncAmbassadorData(telegramIdTrimmed, {
            email: profileData.email || '',
            fullName: profileData.full_name || '',
            tier: profile.current_tier,
            referralCode: profile.referral_code
          });
          logger.info('StarStore sync completed', { telegramId: telegramIdTrimmed });
        } catch (syncError) {
          // Log but don't fail the connection if sync fails
          logger.warn('StarStore sync failed (non-critical)', { telegramId: telegramIdTrimmed, error: syncError });
        }
      }

      setIsConnected(true);
      await refetch();
      
      toast({
        title: "Telegram Connected! 🎉",
        description: "Your Telegram account has been successfully linked.",
      });
    } catch (error) {
      logger.error('Telegram connection error', { telegramId: telegramIdTrimmed }, error as Error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect Telegram account. Please check your Telegram ID and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      // Determine which ID to use for the update
      const profileId = ambassadorId || profile?.id;
      const userId = user?.id;

      if (!profileId && !userId) {
        throw new Error('Unable to identify ambassador profile. Please refresh the page and try again.');
      }

      // Use secure function to disconnect Telegram
      logger.info('Disconnecting Telegram using secure function');
      
      const { data: functionResult, error: functionError } = await supabase
        .rpc('disconnect_ambassador_telegram');

      if (functionError) {
        logger.error('Disconnect function error', {}, functionError);
        throw functionError;
      }

      if (!functionResult || typeof functionResult !== 'object' || !(functionResult as any).success) {
        logger.error('Disconnect function returned error', { result: functionResult });
        throw new Error((functionResult as any)?.error || 'Failed to disconnect Telegram');
      }

      logger.info('Telegram disconnected successfully');
      const error = null; // No error if we got here

      if (error) throw error;

      setTelegramId('');
      setTelegramUsername('');
      setIsConnected(false);
      await refetch();
      
      toast({
        title: "Telegram Disconnected",
        description: "Your Telegram account has been disconnected.",
      });
    } catch (error) {
      toast({
        title: "Disconnection Failed",
        description: error instanceof Error ? error.message : "Failed to disconnect Telegram account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (!profile?.referral_code) return;
    
    const referralLink = generateTelegramReferralLink(profile.referral_code);
    navigator.clipboard.writeText(referralLink);
    
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
  };

  const openTelegramBot = () => {
    const botUrl = `https://t.me/${TELEGRAM_CONFIG.BOT_USERNAME}`;
    window.open(botUrl, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-500" />
          Telegram Integration
        </CardTitle>
        <CardDescription>
          Connect your Telegram account to sync referrals and track earnings from the StarStore bot
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Status */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            {isConnected ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Connected</p>
                  <p className="text-sm text-muted-foreground">
                    ID: {telegramId} {telegramUsername && `(@${telegramUsername})`}
                  </p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="font-medium">Not Connected</p>
                  <p className="text-sm text-muted-foreground">
                    Connect to sync your Telegram referrals
                  </p>
                </div>
              </>
            )}
          </div>
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? "Active" : "Inactive"}
          </Badge>
        </div>

        {/* Connection Form */}
        {!isConnected && (
          <form onSubmit={handleConnect} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="telegram-id">Telegram User ID *</Label>
              <Input
                id="telegram-id"
                type="text"
                placeholder="123456789"
                value={telegramId}
                onChange={(e) => setTelegramId(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Your numeric Telegram user ID (not username). Get it from @userinfobot
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="telegram-username">Telegram Username (Optional)</Label>
              <Input
                id="telegram-username"
                type="text"
                placeholder="username"
                value={telegramUsername}
                onChange={(e) => setTelegramUsername(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Your @username (without the @)
              </p>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect Telegram Account"
              )}
            </Button>
          </form>
        )}

        {/* Connected Actions */}
        {isConnected && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={copyReferralLink}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy Referral Link
              </Button>
              <Button 
                variant="outline" 
                onClick={openTelegramBot}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open StarStore Bot
              </Button>
            </div>
            <Button 
              variant="destructive" 
              onClick={handleDisconnect}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Disconnecting...
                </>
              ) : (
                "Disconnect Telegram"
              )}
            </Button>
          </div>
        )}

        {/* Instructions */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            How to find your Telegram ID:
          </h4>
          <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
            <li>Open Telegram and search for @userinfobot</li>
            <li>Start a chat with the bot</li>
            <li>Send any message to get your user information</li>
            <li>Copy the "Id" number (not the username)</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};