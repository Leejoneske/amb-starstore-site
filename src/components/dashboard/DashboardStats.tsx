import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users, Clock, Star } from "lucide-react";
import type { Ambassador, AnalyticsData } from "@/types";

interface DashboardStatsProps {
  ambassadorProfile: Ambassador;
  analyticsData?: AnalyticsData | null;
}

export const DashboardStats = ({ ambassadorProfile, analyticsData }: DashboardStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-lg bg-primary/20">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
          <Badge variant="secondary" className="text-xs">
            {analyticsData?.monthlyEarnings && analyticsData.monthlyEarnings > 0 ? 'Growing' : 'Stable'}
          </Badge>
        </div>
        <div className="text-3xl font-bold mb-1">
          ${ambassadorProfile.total_earnings.toFixed(2)}
        </div>
        <div className="text-sm text-muted-foreground">Total Earnings</div>
        {analyticsData?.monthlyEarnings && (
          <div className="text-xs text-primary mt-2">
            +${analyticsData.monthlyEarnings.toFixed(2)} this month
          </div>
        )}
      </Card>

      <Card className="p-6 bg-gradient-to-br from-success/10 to-success/5 border-success/20">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-lg bg-success/20">
            <Users className="h-6 w-6 text-success" />
          </div>
          <Badge variant="secondary" className="text-xs">
            {analyticsData?.conversionRate && analyticsData.conversionRate > 50 ? 'Excellent' : 'Good'}
          </Badge>
        </div>
        <div className="text-3xl font-bold mb-1">
          {ambassadorProfile.total_referrals}
        </div>
        <div className="text-sm text-muted-foreground">Total Referrals</div>
        {analyticsData?.conversionRate && (
          <div className="text-xs text-success mt-2">
            {analyticsData.conversionRate.toFixed(1)}% conversion rate
          </div>
        )}
      </Card>

      <Card className="p-6 bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-lg bg-warning/20">
            <Clock className="h-6 w-6 text-warning" />
          </div>
          <Badge variant="secondary" className="text-xs">Pending</Badge>
        </div>
        <div className="text-3xl font-bold mb-1">
          ${ambassadorProfile.pending_earnings.toFixed(2)}
        </div>
        <div className="text-sm text-muted-foreground">Pending Earnings</div>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-info/10 to-info/5 border-info/20">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-lg bg-info/20">
            <Star className="h-6 w-6 text-info" />
          </div>
          <Badge variant="secondary" className="text-xs">
            {ambassadorProfile.avg_stars_per_transaction && ambassadorProfile.avg_stars_per_transaction >= 400 ? 'Elite' : 'Good'}
          </Badge>
        </div>
        <div className="text-3xl font-bold mb-1">
          {ambassadorProfile.lifetime_stars.toLocaleString()}
        </div>
        <div className="text-sm text-muted-foreground">Lifetime Stars</div>
        <div className="text-xs text-info mt-2">
          Avg: {ambassadorProfile.avg_stars_per_transaction?.toFixed(0) || 0} per transaction
        </div>
      </Card>
    </div>
  );
};