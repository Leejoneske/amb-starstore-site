import { useAuth } from "@/contexts/AuthContext";
import { useAmbassadorProfile } from "@/hooks/useAmbassadorProfile";
import { useTransactions } from "@/hooks/useTransactions";
import { usePayouts } from "@/hooks/usePayouts";
import { useUserRole } from "@/hooks/useUserRole";
import { useAmbassadorAnalytics } from "@/hooks/useAnalytics";
import { useFirstLoginTracker } from "@/hooks/useFirstLoginTracker";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  CheckCircle2,
  AlertCircle,
  Star,
  Calendar
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ReferralTools } from "@/components/dashboard/ReferralTools";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { TransactionsList } from "@/components/dashboard/TransactionsList";
import { PayoutHistory } from "@/components/dashboard/PayoutHistory";
import { StarStoreConnection } from "@/components/dashboard/StarStoreConnection";
import { Link } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import { getTierInfo, getNextTier, getTierBadgeClass } from "@/lib/tier-utils";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { logger } from "@/lib/logger";
import type { Transaction, Payout } from "@/types";

const Dashboard = () => {
  const { user } = useAuth();
  const { data: userRole } = useUserRole(user?.id);
  const { ambassadorProfile, tierConfig, isLoading: profileLoading } = useAmbassadorProfile(user?.id);
  const { data: transactions, isLoading: transactionsLoading } = useTransactions(ambassadorProfile?.id);
  const { data: payouts } = usePayouts(ambassadorProfile?.id);
  const { data: analyticsData, isLoading: analyticsLoading } = useAmbassadorAnalytics(ambassadorProfile?.id);
  
  // Track first login for new ambassadors
  useFirstLoginTracker();
  
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

  // Log user dashboard access
  logger.userAction('dashboard_access', user?.id, { 
    tier: ambassadorProfile.current_tier,
    isAdmin 
  });

  const overviewContent = (
    <>
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-warning/10">
              <Star className="h-5 w-5 text-warning" />
            </div>
            <div>
              <div className="text-2xl font-bold">{ambassadorProfile.quality_transaction_rate?.toFixed(1) || 0}%</div>
              <div className="text-sm text-muted-foreground">Quality Rate</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            250+ stars threshold
          </div>
          <Progress 
            value={ambassadorProfile.quality_transaction_rate || 0} 
            className="h-2 mt-3" 
          />
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

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-info/10">
              <Calendar className="h-5 w-5 text-info" />
            </div>
            <div>
              <div className="text-2xl font-bold">{ambassadorProfile.social_posts_this_month}</div>
              <div className="text-sm text-muted-foreground">Social Posts</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {currentTierInfo.requirements.socialPosts} required monthly
          </div>
          <Progress 
            value={(ambassadorProfile.social_posts_this_month / currentTierInfo.requirements.socialPosts) * 100} 
            className="h-2 mt-3" 
          />
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
      <TransactionsList transactions={transactions} isLoading={transactionsLoading} />

      {/* Payout History */}
      {payouts && payouts.length > 0 && <PayoutHistory payouts={payouts} />}
    </>
  );

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <DashboardHeader 
            user={user!} 
            tier={ambassadorProfile.current_tier}
            isAdmin={isAdmin}
          />

          <DashboardStats 
            ambassadorProfile={ambassadorProfile}
            analyticsData={analyticsData}
          />

          <DashboardTabs 
            ambassadorProfile={ambassadorProfile}
            analyticsData={analyticsData}
            analyticsLoading={analyticsLoading}
            isAdmin={isAdmin}
            overviewContent={overviewContent}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;
