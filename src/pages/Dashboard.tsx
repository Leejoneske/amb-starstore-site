import { useEffect, useState, lazy, Suspense } from "react";
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
import { TransactionsList } from "@/components/dashboard/TransactionsList";
import { PayoutHistory } from "@/components/dashboard/PayoutHistory";
import { BottomNav } from "@/components/dashboard/BottomNav";
import { SideNav } from "@/components/dashboard/SideNav";
import { ReferralDashboard } from "@/components/dashboard/ReferralDashboard";
import { PerformanceGoals } from "@/components/dashboard/PerformanceGoals";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { TierLevelsDisplay } from "@/components/dashboard/TierLevelsDisplay";
import { LiveActivityFeed } from "@/components/dashboard/LiveActivityFeed";
import { Settings } from "@/components/dashboard/Settings";
import { Link, useNavigate } from "react-router-dom";
import { getTierInfo, getNextTier, getTierBadgeClass } from "@/lib/tier-utils";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { logger } from "@/lib/logger";
import { ADMIN_EMAIL } from "@/config/env";

const AmbassadorAnalytics = lazy(() =>
  import("@/components/dashboard/AmbassadorAnalytics").then((module) => ({
    default: module.AmbassadorAnalytics,
  }))
);

const AnalyticsFallback = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {[...Array(2)].map((_, index) => (
      <Card key={index} className="p-6">
        <div className="space-y-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-48 w-full" />
        </div>
      </Card>
    ))}
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("home");
  const { data: userRole } = useUserRole(user?.id);
  const { ambassadorProfile, tierConfig, isLoading: profileLoading } = useAmbassadorProfile(user?.id);
  const { data: transactions, isLoading: transactionsLoading } = useTransactions(ambassadorProfile?.id);
  const { data: payouts } = usePayouts(ambassadorProfile?.id);
  const { data: analyticsData, isLoading: analyticsLoading } = useAmbassadorAnalytics(ambassadorProfile?.id);
  
  // Track first login for new ambassadors
  useFirstLoginTracker();
  
  const isAdmin = userRole === 'admin';

  // Redirect admin to admin dashboard
  useEffect(() => {
    if (user?.email === ADMIN_EMAIL || isAdmin) {
      navigate("/admin");
      return;
    }

    if (ambassadorProfile && !profileLoading) {
      // If user hasn't completed onboarding (missing telegram_id or referral_code), redirect to onboarding
      if (!ambassadorProfile.telegram_id || !ambassadorProfile.referral_code) {
        navigate("/onboarding");
        return;
      }
    }
  }, [ambassadorProfile, profileLoading, isAdmin, navigate, user]);

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

  const renderView = () => {
    switch (activeView) {
      case "home":
        return (
          <div className="space-y-4 md:space-y-6">
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="p-4 md:p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-warning/10">
                    <Star className="h-4 w-4 md:h-5 md:w-5 text-warning" />
                  </div>
                  <div>
                    <div className="text-xl md:text-2xl font-bold">{ambassadorProfile.quality_transaction_rate?.toFixed(1) || 0}%</div>
                    <div className="text-xs md:text-sm text-muted-foreground">Quality Rate</div>
                  </div>
                </div>
                <Progress value={ambassadorProfile.quality_transaction_rate || 0} className="h-2" />
              </Card>

              <Card className="p-4 md:p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-success/10">
                    <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-success" />
                  </div>
                  <div>
                    <div className="text-xl md:text-2xl font-bold">{ambassadorProfile.active_referrals}</div>
                    <div className="text-xs md:text-sm text-muted-foreground">Active Referrals</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4 md:p-5 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-info/10">
                    <Calendar className="h-4 w-4 md:h-5 md:w-5 text-info" />
                  </div>
                  <div>
                    <div className="text-xl md:text-2xl font-bold">{ambassadorProfile.social_posts_this_month}</div>
                    <div className="text-xs md:text-sm text-muted-foreground">Social Posts</div>
                  </div>
                </div>
                <Progress value={(ambassadorProfile.social_posts_this_month / currentTierInfo.requirements.socialPosts) * 100} className="h-2" />
              </Card>
            </div>

            {/* Tier Progress & Referral Tools */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <Card className="p-4 md:p-6">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <h3 className="text-base md:text-lg font-semibold font-serif">Tier Progress</h3>
                    <Badge variant="outline" className={`text-white border-none text-xs md:text-sm ${getTierBadgeClass(ambassadorProfile.current_tier)}`}>
                      {currentTierInfo.icon} {currentTierInfo.displayName}
                    </Badge>
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground mb-4">
                    {nextTierInfo ? (
                      <>{ambassadorProfile.total_referrals} / {nextTierInfo.requirements.referrals} referrals to {nextTierInfo.displayName}</>
                    ) : (
                      "Maximum tier achieved! 🎉"
                    )}
                  </div>
                  <Progress value={tierProgress} className="h-3" />
                </div>
                <div className="grid grid-cols-2 gap-3 md:gap-4 pt-4 border-t border-border">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Base Earnings</div>
                    <div className="text-lg md:text-xl font-semibold text-primary">${currentTierInfo.benefits.baseEarnings}+</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Commission Rate</div>
                    <div className="text-lg md:text-xl font-semibold">{currentTierInfo.benefits.commissionRate}%</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Quality Bonus</div>
                    <div className="text-lg md:text-xl font-semibold">{currentTierInfo.benefits.qualityBonus}%</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Social Posts</div>
                    <div className="text-lg md:text-xl font-semibold">{ambassadorProfile.social_posts_this_month}/{currentTierInfo.requirements.socialPosts}</div>
                  </div>
                </div>
              </Card>

              <ReferralTools referralCode={ambassadorProfile.referral_code} />
            </div>

            <TransactionsList transactions={transactions} isLoading={transactionsLoading} />
            {payouts && payouts.length > 0 && <PayoutHistory payouts={payouts} />}
          </div>
        );
      
      case "referrals":
        return <ReferralDashboard ambassadorId={ambassadorProfile.id} />;
      
      case "tiers":
        return <TierLevelsDisplay ambassadorId={ambassadorProfile.id} />;
      
      case "analytics":
        return (
          <Suspense fallback={<AnalyticsFallback />}>
            <AmbassadorAnalytics data={analyticsData} isLoading={analyticsLoading} />
          </Suspense>
        );
      
      case "goals":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <PerformanceGoals ambassadorProfile={ambassadorProfile} />
            <LiveActivityFeed isAdmin={isAdmin} limit={10} />
          </div>
        );
      
      case "actions":
        return <QuickActions referralCode={ambassadorProfile.referral_code} isAdmin={isAdmin} />;
      
      case "settings":
        return <Settings user={user!} tier={ambassadorProfile.current_tier} isAdmin={isAdmin} />;
      
      default:
        return null;
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background pb-20 lg:pb-6">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-6">
            <DashboardHeader 
              user={user!} 
              tier={ambassadorProfile.current_tier}
              isAdmin={isAdmin}
            />

            {activeView === "home" && (
              <DashboardStats 
                ambassadorProfile={ambassadorProfile}
                analyticsData={analyticsData}
              />
            )}

            <div className="flex gap-6">
              <SideNav activeView={activeView} onViewChange={setActiveView} />
              
              <div className="flex-1 min-w-0 overflow-hidden">
                {renderView()}
              </div>
            </div>
          </div>
        </div>

        <BottomNav activeView={activeView} onViewChange={setActiveView} />
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;
