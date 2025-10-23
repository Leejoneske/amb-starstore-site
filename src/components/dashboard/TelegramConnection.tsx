import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAmbassadorProfile } from '@/hooks/useAmbassadorProfile';
import { Loader2, MessageCircle, CheckCircle2, AlertCircle, Copy, ExternalLink } from 'lucide-react';
import { generateTelegramReferralLink, TELEGRAM_CONFIG } from '@/config/telegram';

interface TelegramConnectionProps {
  ambassadorId?: string;
}

export const TelegramConnection = ({ ambassadorId }: TelegramConnectionProps) => {
  const [telegramId, setTelegramId] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();
  const { data: profile, refetch } = useAmbassadorProfile();

  useEffect(() => {
    if (profile) {
      setTelegramId(profile.telegram_id || '');
      setTelegramUsername(profile.telegram_username || '');
      setIsConnected(!!profile.telegram_id);
    }
  }, [profile]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!telegramId.trim()) return;

    setLoading(true);
    try {
      // First, verify the Telegram ID exists in Star Store
      const { starStoreService } = await import('@/services/starStoreService');
      const verificationResponse = await starStoreService.verifyTelegramUser(telegramId.trim());
      
      if (!verificationResponse.success || !verificationResponse.data) {
        throw new Error('Telegram ID not found in Star Store. Please make sure you have used the Star Store bot first.');
      }

      // Update ambassador profile with Telegram connection
      const { error } = await supabase
        .from('ambassador_profiles')
        .update({
          telegram_id: telegramId.trim(),
          telegram_username: telegramUsername.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', ambassadorId || profile?.id);

      if (error) throw error;

      // Sync ambassador data with Star Store
      if (profile) {
        await starStoreService.syncAmbassadorData(telegramId.trim(), {
          email: profile.profiles?.email || '',
          fullName: profile.profiles?.full_name || '',
          tier: profile.current_tier,
          referralCode: profile.referral_code
        });
      }

      setIsConnected(true);
      await refetch();
      
      toast({
        title: "Telegram Connected! 🎉",
        description: "Your Telegram account has been successfully linked and verified with Star Store.",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect Telegram account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('ambassador_profiles')
        .update({
          telegram_id: null,
          telegram_username: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', ambassadorId || profile?.id);

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