import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, FileText, Users, TrendingUp, Settings, Database } from "lucide-react";
import { AnalyticsCharts } from "@/components/dashboard/AnalyticsCharts";
import { AmbassadorStatusList } from "@/components/dashboard/AmbassadorStatusList";
import { SetupChecker } from "@/components/dashboard/SetupChecker";
import { StarStoreDataViewer } from "@/components/dashboard/StarStoreDataViewer";
import type { AdminAnalyticsData } from "@/types";

interface AdminTabsProps {
  analyticsData?: AdminAnalyticsData | null;
  analyticsLoading: boolean;
  overviewContent: React.ReactNode;
  applicationsContent: React.ReactNode;
  settingsContent: React.ReactNode;
}

export const AdminTabs = ({ 
  analyticsData, 
  analyticsLoading, 
  overviewContent,
  applicationsContent,
  settingsContent
}: AdminTabsProps) => {
  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="applications" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Applications
        </TabsTrigger>
        <TabsTrigger value="ambassadors" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Ambassadors
        </TabsTrigger>
        <TabsTrigger value="starstore" className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          Star Store Data
        </TabsTrigger>
        <TabsTrigger value="analytics" className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Analytics
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Settings
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        {overviewContent}
      </TabsContent>

      <TabsContent value="analytics" id="admin-analytics">
        {analyticsData && (
          <AnalyticsCharts data={analyticsData} isLoading={analyticsLoading} />
        )}
      </TabsContent>

      <TabsContent value="applications" className="space-y-6" data-tab="applications">
        {applicationsContent}
      </TabsContent>

      <TabsContent value="ambassadors" className="space-y-6">
        <AmbassadorStatusList isAdmin={true} />
      </TabsContent>

      <TabsContent value="starstore" className="space-y-6">
        <StarStoreDataViewer />
      </TabsContent>

      <TabsContent value="settings" className="space-y-6">
        <SetupChecker />
        {settingsContent}
      </TabsContent>
    </Tabs>
  );
};