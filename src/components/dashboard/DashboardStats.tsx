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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <Card className="p-4 sm:p-5 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 sm:p-2.5 rounded-lg bg-primary/20">
            <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
          <Badge variant="secondary" className="text-xs px-2 py-0.5">
            {analyticsData?.monthlyEarnings && analyticsData.monthlyEarnings > 0 ? 'Growing' : 'Stable'}
          </Badge>
        </div>
        <div className="text-2xl sm:text-3xl font-bold mb-1">
          ${ambassadorProfile.total_earnings.toFixed(2)}
        </div>
        <div className="text-xs sm:text-sm text-muted-foreground">Total Earnings</div>
        {analyticsData?.monthlyEarnings && analyticsData.monthlyEarnings > 0 && (
          <div className="text-xs text-primary mt-2">
            +${analyticsData.monthlyEarnings.toFixed(2)} this month
          </div>
        )}
      </Card>

      <Card className="p-4 sm:p-5 bg-gradient-to-br from-success/10 to-success/5 border-success/20">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 sm:p-2.5 rounded-lg bg-success/20">
            <Users className="h-5 w-5 sm:h-6 sm:w-6 text-success" />
          </div>
          <Badge variant="secondary" className="text-xs px-2 py-0.5">
            {analyticsData?.conversionRate && analyticsData.conversionRate > 50 ? 'Excellent' : 'Good'}
          </Badge>
        </div>
        <div className="text-2xl sm:text-3xl font-bold mb-1">
          {ambassadorProfile.total_referrals}
        </div>
        <div className="text-xs sm:text-sm text-muted-foreground">Total Referrals</div>
        {analyticsData?.conversionRate && (
          <div className="text-xs text-success mt-2">
            {analyticsData.conversionRate.toFixed(1)}% conversion
          </div>
        )}
      </Card>

      <Card className="p-4 sm:p-5 bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 sm:p-2.5 rounded-lg bg-warning/20">
            <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-warning" />
          </div>
          <Badge variant="secondary" className="text-xs px-2 py-0.5">Pending</Badge>
        </div>
        <div className="text-2xl sm:text-3xl font-bold mb-1">
          ${ambassadorProfile.pending_earnings.toFixed(2)}
        </div>
        <div className="text-xs sm:text-sm text-muted-foreground">Pending Earnings</div>
      </Card>

      <Card className="p-4 sm:p-5 bg-gradient-to-br from-info/10 to-info/5 border-info/20">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 sm:p-2.5 rounded-lg bg-info/20">
            <Star className="h-5 w-5 sm:h-6 sm:w-6 text-info" />
          </div>
          <Badge variant="secondary" className="text-xs px-2 py-0.5">
            {ambassadorProfile.avg_stars_per_transaction && ambassadorProfile.avg_stars_per_transaction >= 400 ? 'Elite' : 'Good'}
          </Badge>
        </div>
        <div className="text-2xl sm:text-3xl font-bold mb-1">
          {ambassadorProfile.lifetime_stars.toLocaleString()}
        </div>
        <div className="text-xs sm:text-sm text-muted-foreground">Lifetime Stars</div>
        <div className="text-xs text-info mt-2">
          Avg: {ambassadorProfile.avg_stars_per_transaction?.toFixed(0) || 0}/tx
        </div>
      </Card>
    </div>
  );
};