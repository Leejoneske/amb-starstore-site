import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Activity, Zap, Award, Users, Crown } from "lucide-react";
import { AmbassadorAnalytics } from "@/components/dashboard/AmbassadorAnalytics";
import { MongoIntegration } from "@/components/dashboard/MongoIntegration";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { PerformanceGoals } from "@/components/dashboard/PerformanceGoals";
import { LiveActivityFeed } from "@/components/dashboard/LiveActivityFeed";
import { ReferralDashboard } from "@/components/dashboard/ReferralDashboard";
import { TierLevelsDisplay } from "@/components/dashboard/TierLevelsDisplay";
import { TelegramConnection } from "@/components/dashboard/TelegramConnection";
import { StarStoreConnection } from "@/components/dashboard/StarStoreConnection";
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
      <TabsList className="grid w-full grid-cols-7">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="referrals" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Referrals
        </TabsTrigger>
        <TabsTrigger value="tiers" className="flex items-center gap-2">
          <Crown className="h-4 w-4" />
          Tiers
        </TabsTrigger>
        <TabsTrigger value="analytics" className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Analytics
        </TabsTrigger>
        <TabsTrigger value="telegram" className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Telegram
        </TabsTrigger>
        <TabsTrigger value="actions" className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Actions
        </TabsTrigger>
        <TabsTrigger value="performance" className="flex items-center gap-2">
          <Award className="h-4 w-4" />
          Performance
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

      <TabsContent value="telegram" className="space-y-6">
        <StarStoreConnection />
        <TelegramConnectionSimple />
        <MongoIntegration 
          ambassadorId={ambassadorProfile.id}
          referralCode={ambassadorProfile.referral_code}
          isAdmin={isAdmin}
        />
      </TabsContent>

      <TabsContent value="actions">
        <QuickActions referralCode={ambassadorProfile.referral_code} isAdmin={isAdmin} />
      </TabsContent>

      <TabsContent value="performance" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PerformanceGoals ambassadorProfile={ambassadorProfile} />
          <LiveActivityFeed isAdmin={isAdmin} limit={10} />
        </div>
      </TabsContent>
    </Tabs>
  );
};