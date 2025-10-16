import { useAuth } from "@/contexts/AuthContext";
import { useAmbassadorProfile } from "@/hooks/useAmbassadorProfile";
import { useTransactions } from "@/hooks/useTransactions";
import { usePayouts } from "@/hooks/usePayouts";
import { useUserRole } from "@/hooks/useUserRole";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Star,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileSection } from "@/components/dashboard/ProfileSection";
import { ReferralTools } from "@/components/dashboard/ReferralTools";
import { Link, Navigate } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import { getTierInfo, getNextTier, getTierBadgeClass } from "@/lib/tier-utils";

const Dashboard = () => {
  const { user } = useAuth();
  const { data: userRole } = useUserRole(user?.id);
  const { ambassadorProfile, tierConfig, isLoading: profileLoading } = useAmbassadorProfile(user?.id);
  const { data: transactions, isLoading: transactionsLoading } = useTransactions(ambassadorProfile?.id);
  const { data: payouts } = usePayouts(ambassadorProfile?.id);
  
  const isAdmin = userRole === 'admin';

  // Redirect admins to admin dashboard
  if (isAdmin) {
    return <AdminDashboard />;
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  if (!ambassadorProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="p-8 max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-warning mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Application Pending</h2>
          <p className="text-muted-foreground mb-4">
            Your ambassador application is being reviewed. You'll receive an email once approved!
          </p>
          <Badge variant="outline" className="mt-2">Status: Pending Review</Badge>
          <div className="mt-6">
            <Link to="/apply">
              <Button variant="outline">Check Application</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const currentTierInfo = getTierInfo(ambassadorProfile?.current_tier || 'explorer');
  const nextTierInfo = getNextTier(ambassadorProfile?.current_tier || 'explorer');
  const tierProgress = nextTierInfo ? 
    Math.min(100, ((ambassadorProfile?.total_referrals || 0) / nextTierInfo.requirements.referrals) * 100) : 100;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Profile Header */}
        <ProfileSection 
          user={user!} 
          tier={ambassadorProfile.current_tier}
          isAdmin={isAdmin}
        />

        {/* Earnings Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-primary/5 border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-primary/20">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">
              ${ambassadorProfile.total_earnings.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">Total Earnings</div>
          </Card>

          <Card className="p-6 bg-success/5 border-success/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-success/20">
                <Users className="h-6 w-6 text-success" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">
              {ambassadorProfile.total_referrals}
            </div>
            <div className="text-sm text-muted-foreground">Total Referrals</div>
          </Card>

          <Card className="p-6 bg-warning/5 border-warning/20">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-warning/20">
                <Clock className="h-6 w-6 text-warning" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">
              ${ambassadorProfile.pending_earnings.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-warning/10">
                <Star className="h-5 w-5 text-warning" />
              </div>
              <div>
                <div className="text-2xl font-bold">{ambassadorProfile.lifetime_stars.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Lifetime Stars</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Avg: {ambassadorProfile.avg_stars_per_transaction?.toFixed(0) || 0} per transaction
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-info/10">
                <TrendingUp className="h-5 w-5 text-info" />
              </div>
              <div>
                <div className="text-2xl font-bold">{ambassadorProfile.quality_transaction_rate?.toFixed(1) || 0}%</div>
                <div className="text-sm text-muted-foreground">Quality Rate</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              250+ stars threshold
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold">{ambassadorProfile.active_referrals}</div>
                <div className="text-sm text-muted-foreground">Active Referrals</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Currently generating revenue
            </div>
          </Card>
        </div>

        {/* Tier Progress & Referral Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold font-serif">Tier Progress</h3>
                <Badge 
                  variant="outline" 
                  className={`text-white border-none ${getTierBadgeClass(ambassadorProfile.current_tier)}`}
                >
                  {currentTierInfo.icon} {currentTierInfo.displayName}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground mb-4">
                {nextTierInfo ? (
                  <>
                    {ambassadorProfile.total_referrals} / {nextTierInfo.requirements.referrals} referrals to {nextTierInfo.displayName}
                  </>
                ) : (
                  "Maximum tier achieved! 🎉"
                )}
              </div>
              <Progress value={tierProgress} className="h-3" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Min Earnings</div>
                <div className="text-xl font-semibold text-primary">${currentTierInfo.benefits.minEarnings}+</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">NFT Level</div>
                <div className="text-xl font-semibold">Level {currentTierInfo.benefits.nftLevel}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Free Stars</div>
                <div className="text-xl font-semibold">{currentTierInfo.benefits.freeStars}/month</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Social Posts</div>
                <div className="text-xl font-semibold">{ambassadorProfile.social_posts_this_month}/{currentTierInfo.requirements.socialPosts}</div>
              </div>
            </div>
          </Card>

          <ReferralTools referralCode={ambassadorProfile.referral_code} />
        </div>

        {/* Recent Transactions */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Recent Transactions</h3>
            <Badge variant="outline">Last 5</Badge>
          </div>
          {transactionsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : transactions && transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      transaction.status === 'completed' ? 'bg-success/10' : 'bg-warning/10'
                    }`}>
                      <DollarSign className={`h-5 w-5 ${
                        transaction.status === 'completed' ? 'text-success' : 'text-warning'
                      }`} />
                    </div>
                    <div>
                      <div className="font-medium mb-1">
                        Commission - {transaction.tier_at_transaction}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{new Date(transaction.transaction_date).toLocaleDateString()}</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-warning" />
                          <span>{transaction.stars_awarded} stars</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-success">
                      +${transaction.commission_amount.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {transaction.commission_rate}% rate
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Star className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No transactions yet</p>
              <p className="text-sm mt-1">Share your referral code to start earning!</p>
            </div>
          )}
        </Card>

        {/* Payout History */}
        {payouts && payouts.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Payout History</h3>
              <Badge variant="outline">Recent Payouts</Badge>
            </div>
            <div className="space-y-3">
              {payouts.slice(0, 5).map((payout) => (
                <div 
                  key={payout.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div>
                    <div className="font-medium mb-1">
                      {payout.status === 'completed' ? '✓' : '○'} Payout - {new Date(payout.period_start).toLocaleDateString()} to {new Date(payout.period_end).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {payout.payment_method || 'Bank Transfer'} • {payout.status}
                    </div>
                  </div>
                  <div className="text-xl font-bold">
                    ${payout.total_amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
