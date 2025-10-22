import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, Users, DollarSign } from "lucide-react";
import type { Application, Ambassador, AdminAnalyticsData } from "@/types";

interface AdminStatsProps {
  applications?: Application[];
  ambassadors?: Ambassador[];
  analyticsData?: AdminAnalyticsData | null;
}

export const AdminStats = ({ applications, ambassadors, analyticsData }: AdminStatsProps) => {
  const stats = {
    totalApplications: applications?.length || 0,
    pendingApplications: applications?.filter(app => app.status === 'pending').length || 0,
    totalAmbassadors: ambassadors?.length || 0,
    totalEarnings: ambassadors?.reduce((sum, amb) => sum + amb.total_earnings, 0) || 0
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/20">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.totalApplications}</div>
            <div className="text-sm text-muted-foreground">Total Applications</div>
            {stats.pendingApplications > 0 && (
              <div className="text-xs text-primary mt-1">
                {stats.pendingApplications} pending review
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-warning/20">
            <Clock className="h-6 w-6 text-warning" />
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.pendingApplications}</div>
            <div className="text-sm text-muted-foreground">Pending Review</div>
            {stats.pendingApplications > 0 && (
              <Badge variant="outline" className="text-xs mt-1">
                Action Required
              </Badge>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-success/10 to-success/5 border-success/20">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-success/20">
            <Users className="h-6 w-6 text-success" />
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.totalAmbassadors}</div>
            <div className="text-sm text-muted-foreground">Active Ambassadors</div>
            {analyticsData?.performanceMetrics.activeAmbassadors && (
              <div className="text-xs text-success mt-1">
                {analyticsData.performanceMetrics.activeAmbassadors} currently active
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-info/10 to-info/5 border-info/20">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-info/20">
            <DollarSign className="h-6 w-6 text-info" />
          </div>
          <div>
            <div className="text-2xl font-bold">
              ${analyticsData?.totalRevenue.toFixed(2) || stats.totalEarnings.toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">Total Revenue</div>
            {analyticsData?.monthlyRevenue && (
              <div className="text-xs text-info mt-1">
                +${analyticsData.monthlyRevenue.toFixed(2)} this month
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};