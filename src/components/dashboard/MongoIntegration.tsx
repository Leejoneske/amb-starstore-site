import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, 
  RefreshCw, 
  Users, 
  Link2, 
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Send
} from 'lucide-react';
import { useMongoUsers, useMongoReferrals, useMongoTransactions, useDataSync, useCombinedReferralStats } from '@/hooks/useMongoIntegration';
import { mongoService } from '@/services/mongoService';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { TELEGRAM_CONFIG } from '@/config/telegram';

interface MongoIntegrationProps {
  ambassadorId?: string;
  referralCode?: string;
  isAdmin?: boolean;
}

export const MongoIntegration = ({ ambassadorId, referralCode, isAdmin = false }: MongoIntegrationProps) => {
  const [botUsername] = useState(TELEGRAM_CONFIG.BOT_USERNAME);
  const { toast } = useToast();
  
  const { data: mongoUsers, isLoading: usersLoading, refetch: refetchUsers } = useMongoUsers();
  const { data: mongoReferrals, isLoading: referralsLoading } = useMongoReferrals();
  const { data: mongoTransactions, isLoading: transactionsLoading } = useMongoTransactions();
  const { data: combinedStats } = useCombinedReferralStats(ambassadorId);
  const { syncData, isSyncing, syncResults } = useDataSync();

  const telegramReferralLink = referralCode ? mongoService.generateTelegramReferralLink(referralCode, botUsername) : '';

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const shareToTelegram = (link: string) => {
    const shareText = encodeURIComponent(`🌟 Join StarStore and start earning! Use my referral link: ${link}`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${shareText}`);
  };

  const isLoading = usersLoading || referralsLoading || transactionsLoading;

  return (
    <div className="space-y-6">
      {/* Integration Status */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Telegram Miniapp Integration</h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Connected
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetchUsers();
                syncData();
              }}
              disabled={isSyncing}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          </div>
        </div>

        {/* Connection Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 mb-1">
              <Database className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">MongoDB</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {mongoUsers?.data?.length || 0} users synced
            </div>
          </div>
          
          <div className="p-3 rounded-lg bg-success/5 border border-success/20">
            <div className="flex items-center gap-2 mb-1">
              <Link2 className="h-4 w-4 text-success" />
              <span className="text-sm font-medium">Telegram Bot</span>
            </div>
            <div className="text-xs text-muted-foreground">
              @{botUsername}
            </div>
          </div>
          
          <div className="p-3 rounded-lg bg-info/5 border border-info/20">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-info" />
              <span className="text-sm font-medium">Server</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Railway.app
            </div>
          </div>
        </div>
      </Card>

      {/* Enhanced Referral Links */}
      {referralCode && (
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Enhanced Referral Links</h3>
            <p className="text-sm text-muted-foreground">
              Share these links to track referrals across both web and Telegram platforms
            </p>
          </div>

          <div className="space-y-4">
            {/* Telegram Bot Link */}
            <div className="p-4 rounded-lg border bg-blue-50 border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Telegram Bot Link</span>
                  <Badge variant="outline" className="text-xs">Recommended</Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(telegramReferralLink, 'Telegram referral link')}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => shareToTelegram(telegramReferralLink)}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="text-sm font-mono bg-white p-2 rounded border">
                {telegramReferralLink}
              </div>
              <div className="text-xs text-blue-700 mt-2">
                ✨ Opens your Telegram miniapp directly with referral tracking
              </div>
            </div>

            {/* Web Link */}
            <div className="p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-primary" />
                  <span className="font-medium">Web Dashboard Link</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(`${window.location.origin}?ref=${referralCode}`, 'Web referral link')}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="text-sm font-mono bg-muted p-2 rounded">
                {window.location.origin}?ref={referralCode}
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                🌐 Opens the web ambassador dashboard
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Combined Statistics */}
      {combinedStats && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Cross-Platform Referral Stats</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="text-2xl font-bold text-primary">{combinedStats.totalReferrals}</div>
              <div className="text-sm text-muted-foreground">Total Referrals</div>
              <div className="text-xs text-primary mt-1">All platforms combined</div>
            </div>
            
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{combinedStats.telegramReferrals}</div>
              <div className="text-sm text-muted-foreground">Telegram Referrals</div>
              <div className="text-xs text-blue-600 mt-1">From miniapp</div>
            </div>
            
            <div className="p-4 rounded-lg bg-success/5 border border-success/20">
              <div className="text-2xl font-bold text-success">{combinedStats.webReferrals}</div>
              <div className="text-sm text-muted-foreground">Web Referrals</div>
              <div className="text-xs text-success mt-1">From dashboard</div>
            </div>
            
            <div className="p-4 rounded-lg bg-warning/5 border border-warning/20">
              <div className="text-2xl font-bold text-warning">{combinedStats.activeReferrals}</div>
              <div className="text-sm text-muted-foreground">Active Referrals</div>
              <div className="text-xs text-warning mt-1">Currently earning</div>
            </div>
          </div>
        </Card>
      )}

      {/* Data Sync Results */}
      {syncResults && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Last Sync Results</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm font-medium">Users Synced</span>
              <Badge variant="outline">{syncResults.users.synced}</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm font-medium">Referrals Synced</span>
              <Badge variant="outline">{syncResults.referrals.synced}</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm font-medium">Transactions Synced</span>
              <Badge variant="outline">{syncResults.transactions.synced}</Badge>
            </div>
          </div>

          {/* Show errors if any */}
          {(syncResults.users.errors.length > 0 || syncResults.referrals.errors.length > 0 || syncResults.transactions.errors.length > 0) && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="text-sm">
                  <strong>Sync Errors:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    {[...syncResults.users.errors, ...syncResults.referrals.errors, ...syncResults.transactions.errors].map((error, index) => (
                      <li key={index} className="text-xs">{error}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </Card>
      )}

      {/* MongoDB Data Preview */}
      {isAdmin && (
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">MongoDB Users</TabsTrigger>
            <TabsTrigger value="referrals">MongoDB Referrals</TabsTrigger>
            <TabsTrigger value="transactions">MongoDB Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Telegram Users</h3>
                <Badge variant="outline">{mongoUsers?.data?.length || 0} users</Badge>
              </div>
              
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {mongoUsers?.data?.slice(0, 10).map((user) => (
                    <div key={user._id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <div className="font-medium">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          @{user.username} • ID: {user.telegramId}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{user.totalReferrals || 0} referrals</div>
                        <div className="text-xs text-muted-foreground">
                          ${(user.totalEarnings || 0).toFixed(2)} earned
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="referrals">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Telegram Referrals</h3>
                <Badge variant="outline">{mongoReferrals?.data?.length || 0} referrals</Badge>
              </div>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {mongoReferrals?.data?.slice(0, 10).map((referral) => (
                  <div key={referral._id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <div className="font-medium">Code: {referral.referralCode}</div>
                      <div className="text-sm text-muted-foreground">
                        Referrer: {referral.referrerId}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={referral.status === 'completed' ? 'default' : 'secondary'}>
                        {referral.status}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(referral.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Telegram Transactions</h3>
                <Badge variant="outline">{mongoTransactions?.data?.length || 0} transactions</Badge>
              </div>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {mongoTransactions?.data?.slice(0, 10).map((transaction) => (
                  <div key={transaction._id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <div className="font-medium">
                        {transaction.type.toUpperCase()} - {transaction.stars} stars
                      </div>
                      <div className="text-sm text-muted-foreground">
                        User: {transaction.userId}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${transaction.amount.toFixed(2)}</div>
                      <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};