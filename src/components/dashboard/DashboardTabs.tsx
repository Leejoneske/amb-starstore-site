import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Zap, Award, Users, Crown } from "lucide-react";
import { AmbassadorAnalytics } from "@/components/dashboard/AmbassadorAnalytics";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { PerformanceGoals } from "@/components/dashboard/PerformanceGoals";
import { LiveActivityFeed } from "@/components/dashboard/LiveActivityFeed";
import { ReferralDashboard } from "@/components/dashboard/ReferralDashboard";
import { TierLevelsDisplay } from "@/components/dashboard/TierLevelsDisplay";
import type { Ambassador, AnalyticsData } from "@/types";

interface DashboardTabsProps {
  ambassadorProfile: Ambassador;
  analyticsData?: AnalyticsData | null;
  analyticsLoading: boolean;
  isAdmin: boolean;
  overviewContent: React.ReactNode;
}

export const DashboardTabs = ({ 
  ambassadorProfile, 
  analyticsData, 
  analyticsLoading, 
  isAdmin, 
  overviewContent 
}: DashboardTabsProps) => {
  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1">
        <TabsTrigger value="overview" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
          <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Overview</span>
          <span className="sm:hidden">Home</span>
        </TabsTrigger>
        <TabsTrigger value="referrals" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
          <Users className="h-3 w-3 sm:h-4 sm:w-4" />
          Referrals
        </TabsTrigger>
        <TabsTrigger value="tiers" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
          <Crown className="h-3 w-3 sm:h-4 sm:w-4" />
          Tiers
        </TabsTrigger>
        <TabsTrigger value="analytics" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
          Analytics
        </TabsTrigger>
        <TabsTrigger value="actions" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
          <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
          Actions
        </TabsTrigger>
        <TabsTrigger value="performance" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
          <Award className="h-3 w-3 sm:h-4 sm:w-4" />
          Goals
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        {overviewContent}
      </TabsContent>

      <TabsContent value="referrals">
        <ReferralDashboard ambassadorId={ambassadorProfile.id} />
      </TabsContent>

      <TabsContent value="tiers">
        <TierLevelsDisplay ambassadorId={ambassadorProfile.id} />
      </TabsContent>

      <TabsContent value="analytics" id="analytics-section">
        <AmbassadorAnalytics data={analyticsData} isLoading={analyticsLoading} />
      </TabsContent>

      <TabsContent value="actions">
        <QuickActions referralCode={ambassadorProfile.referral_code} isAdmin={isAdmin} />
      </TabsContent>

      <TabsContent value="performance" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <PerformanceGoals ambassadorProfile={ambassadorProfile} />
          <LiveActivityFeed isAdmin={isAdmin} limit={10} />
        </div>
      </TabsContent>
    </Tabs>
  );
};