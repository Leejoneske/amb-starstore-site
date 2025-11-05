import { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
// Removed Tabs import - simplified to direct rendering for better performance
import { useToast } from '@/hooks/use-toast';
import { useAmbassadorProfile } from '@/hooks/useAmbassadorProfile';
import { useAuth } from '@/contexts/AuthContext';
import { useReferralStats } from '@/hooks/useReferralTracking';
import { generateTelegramReferralLink, ACTIVATION_THRESHOLD } from '@/config/telegram';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Copy, 
  ExternalLink, 
  RefreshCw,
  Star,
  CheckCircle2,
  AlertCircle,
  Target
} from 'lucide-react';

interface ReferralDashboardProps {
  ambassadorId?: string;
}

// Memoized stats card component for better performance
const StatsCard = memo(({ title, value, subtitle, icon: Icon, iconColor, valueColor }: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: any;
  iconColor: string;
  valueColor?: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className={`h-4 w-4 ${iconColor}`} />
    </CardHeader>
    <CardContent>
      <div className={`text-2xl font-bold ${valueColor || ''}`}>{value}</div>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </CardContent>
  </Card>
));

StatsCard.displayName = 'StatsCard';

export const ReferralDashboard = ({ ambassadorId }: ReferralDashboardProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: profile } = useAmbassadorProfile(user?.id);
  const { data: stats, refetch: refetchStats, isLoading, error } = useReferralStats(ambassadorId || profile?.id);
  
  // Disabled automatic activation checking to prevent errors
  // This feature requires mongo-proxy edge function which may not be available
  // const { checkActivations, isChecking } = useReferralActivationTracking();

  const copyReferralLink = () => {
    if (!profile?.referral_code) return;
    
    const referralLink = generateTelegramReferralLink(profile.referral_code);
    navigator.clipboard.writeText(referralLink);
    
    toast({
      title: "Copied! 📋",
      description: "Referral link copied to clipboard",
    });
  };

  const copyReferralCode = () => {
    if (!profile?.referral_code) return;
    
    navigator.clipboard.writeText(profile.referral_code);
    
    toast({
      title: "Copied! 📋",
      description: "Referral code copied to clipboard",
    });
  };

  const handleRefresh = async () => {
    await refetchStats();
    toast({
      title: "Refreshed! 🔄",
      description: "Referral data has been updated",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Error Loading Referral Data
          </CardTitle>
          <CardDescription>
            {error instanceof Error ? error.message : 'Failed to fetch referral statistics'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => refetchStats()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const referralLink = profile?.referral_code ? generateTelegramReferralLink(profile.referral_code) : '';

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Referral Dashboard
              </CardTitle>
              <CardDescription>
                Track your referrals and earnings. Users become active after {ACTIVATION_THRESHOLD} stars.
              </CardDescription>
            </div>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Referral Code */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Referral Code</label>
              <div className="flex gap-2">
                <div className="flex-1 p-3 bg-muted rounded-lg font-mono text-center">
                  {profile?.referral_code || 'Loading...'}
                </div>
                <Button onClick={copyReferralCode} variant="outline" size="sm">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Referral Link */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Referral Link</label>
              <div className="flex gap-2">
                <div className="flex-1 p-3 bg-muted rounded-lg text-sm truncate">
                  {referralLink || 'Loading...'}
                </div>
                <Button onClick={copyReferralLink} variant="outline" size="sm">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={() => window.open(referralLink, '_blank')} 
                  variant="outline" 
                  size="sm"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards - Memoized for better performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Referrals"
          value={stats?.totalReferrals || 0}
          subtitle={`+${stats?.thisMonthReferrals || 0} this month`}
          icon={Users}
          iconColor="text-muted-foreground"
        />
        <StatsCard
          title="Active Referrals"
          value={stats?.activeReferrals || 0}
          subtitle={`${stats?.conversionRate?.toFixed(1) || 0}% conversion rate`}
          icon={CheckCircle2}
          iconColor="text-green-500"
          valueColor="text-green-600"
        />
        <StatsCard
          title="Pending Referrals"
          value={stats?.pendingReferrals || 0}
          subtitle={`Need ${ACTIVATION_THRESHOLD}+ stars to activate`}
          icon={Clock}
          iconColor="text-orange-500"
          valueColor="text-orange-600"
        />
        <StatsCard
          title="Total Earnings"
          value={`$${stats?.totalEarnings?.toFixed(2) || '0.00'}`}
          subtitle={`+$${stats?.thisMonthEarnings?.toFixed(2) || '0.00'} this month`}
          icon={DollarSign}
          iconColor="text-green-500"
          valueColor="text-green-600"
        />
      </div>

      {/* Recent Referrals - Always Visible */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Referrals</CardTitle>
          <CardDescription>Your latest referrals and their activation status</CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.recentReferrals && stats.recentReferrals.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentReferrals.map((referral) => (
                    <div 
                      key={referral.id} 
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          referral.isActive ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                        }`}>
                          {referral.isActive ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {referral.telegramId ? `User ${referral.telegramId}` : 'Anonymous User'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Referred {new Date(referral.referredAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={referral.isActive ? "default" : "secondary"}>
                          {referral.status}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {referral.totalStars} stars
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No referrals yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start sharing your referral link to track your first referrals!
                  </p>
                  <Button onClick={copyReferralLink} variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Referral Link
                  </Button>
                </div>
              )}
        </CardContent>
      </Card>

      {/* Analytics Section - Simplified */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-4">Conversion Funnel</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Referrals</span>
                    <span>{stats?.totalReferrals || 0}</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Active Users ({ACTIVATION_THRESHOLD}+ stars)</span>
                    <span>{stats?.activeReferrals || 0}</span>
                  </div>
                  <Progress 
                    value={stats?.totalReferrals ? (stats.activeReferrals / stats.totalReferrals) * 100 : 0} 
                    className="h-2" 
                  />
                </div>

                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">
                    Conversion Rate: <span className="font-medium">{stats?.conversionRate?.toFixed(1) || 0}%</span>
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Monthly Performance</h4>
              <div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">This Month Referrals</span>
                    <span className="font-medium">{stats?.thisMonthReferrals || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">This Month Earnings</span>
                    <span className="font-medium text-green-600">
                      ${stats?.thisMonthEarnings?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average per Referral</span>
                    <span className="font-medium">
                      ${stats?.thisMonthReferrals ? (stats.thisMonthEarnings / stats.thisMonthReferrals).toFixed(2) : '0.00'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How It Works - Simplified */}
      <Card>
        <CardHeader>
          <CardTitle>How Referral Tracking Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                      <Target className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium">1. Share Your Link</h4>
                      <p className="text-sm text-muted-foreground">
                        Share your unique referral link with potential users
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 text-green-600 rounded-full">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium">2. User Joins</h4>
                      <p className="text-sm text-muted-foreground">
                        When someone clicks your link, they're tracked as your referral
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-full">
                      <Star className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium">3. User Activates</h4>
                      <p className="text-sm text-muted-foreground">
                        When they reach {ACTIVATION_THRESHOLD} stars through purchases, you earn commission
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                      💡 Pro Tips
                    </h4>
                    <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                      <li>• Share your link on social media</li>
                      <li>• Explain the benefits of StarStore</li>
                      <li>• Help new users get started</li>
                      <li>• Stay active to maintain your tier</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                      📊 Activation Threshold
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Users need to accumulate {ACTIVATION_THRESHOLD} stars total from buying/selling 
                      to count as "active" and trigger your commission.
                    </p>
                  </div>
                </div>
              </div>
        </CardContent>
      </Card>
    </div>
  );
};