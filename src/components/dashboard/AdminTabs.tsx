import { lazy, Suspense, ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, FileText, Users, TrendingUp, Settings, Database, Mail } from "lucide-react";
import { AmbassadorStatusList } from "@/components/dashboard/AmbassadorStatusList";
import { SetupChecker } from "@/components/dashboard/SetupChecker";
import { MessageCenter } from "@/components/dashboard/MessageCenter";
import { ManualMessageSender } from "@/components/dashboard/ManualMessageSender";
import type { AdminAnalyticsData } from "@/types";

const AnalyticsCharts = lazy(() =>
  import("@/components/dashboard/AnalyticsCharts").then((module) => ({
    default: module.AnalyticsCharts,
  }))
);

const StarStoreDataViewer = lazy(() =>
  import("@/components/dashboard/StarStoreDataViewer").then((module) => ({
    default: module.StarStoreDataViewer,
  }))
);

const ChartsFallback = () => (
  <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
    Loading analytics...
  </div>
);

const DataViewerFallback = () => (
  <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
    Loading Star Store data tools...
  </div>
);

interface AdminTabsProps {
  analyticsData?: AdminAnalyticsData | null;
  analyticsLoading: boolean;
  overviewContent: ReactNode;
  applicationsContent: ReactNode;
  settingsContent: ReactNode;
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
      <TabsList className="grid w-full grid-cols-7">
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
        <TabsTrigger value="messages" className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Messages
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
          <Suspense fallback={<ChartsFallback />}>
            <AnalyticsCharts data={analyticsData} isLoading={analyticsLoading} />
          </Suspense>
        )}
      </TabsContent>

      <TabsContent value="applications" className="space-y-6" data-tab="applications">
        {applicationsContent}
      </TabsContent>

      <TabsContent value="ambassadors" className="space-y-6">
        <AmbassadorStatusList isAdmin={true} />
      </TabsContent>

      <TabsContent value="messages" className="space-y-6">
        <MessageCenter />
        <ManualMessageSender />
      </TabsContent>

      <TabsContent value="starstore" className="space-y-6">
        <Suspense fallback={<DataViewerFallback />}>
          <StarStoreDataViewer />
        </Suspense>
      </TabsContent>

      <TabsContent value="settings" className="space-y-6">
        <SetupChecker />
        {settingsContent}
      </TabsContent>
    </Tabs>
  );
};