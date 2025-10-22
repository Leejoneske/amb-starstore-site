import { Card } from "@/components/ui/card";
import { TrendingUp, BarChart3, Award, CheckCircle2 } from "lucide-react";
import type { AdminAnalyticsData } from "@/types";

interface AdminPerformanceMetricsProps {
  analyticsData?: AdminAnalyticsData | null;
}

export const AdminPerformanceMetrics = ({ analyticsData }: AdminPerformanceMetricsProps) => {
  if (!analyticsData) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Conversion Rate</span>
        </div>
        <div className="text-2xl font-bold text-primary">
          {analyticsData.conversionRate.toFixed(1)}%
        </div>
        <div className="text-xs text-muted-foreground">
          Referral to transaction
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-4 w-4 text-success" />
          <span className="text-sm font-medium">Avg Transaction</span>
        </div>
        <div className="text-2xl font-bold text-success">
          ${analyticsData.performanceMetrics.avgTransactionValue.toFixed(0)}
        </div>
        <div className="text-xs text-muted-foreground">
          Per transaction value
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Award className="h-4 w-4 text-warning" />
          <span className="text-sm font-medium">Commission Rate</span>
        </div>
        <div className="text-2xl font-bold text-warning">
          {analyticsData.performanceMetrics.avgCommissionRate.toFixed(1)}%
        </div>
        <div className="text-xs text-muted-foreground">
          Average across all tiers
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="h-4 w-4 text-info" />
          <span className="text-sm font-medium">Total Transactions</span>
        </div>
        <div className="text-2xl font-bold text-info">
          {analyticsData.performanceMetrics.totalTransactions.toLocaleString()}
        </div>
        <div className="text-xs text-muted-foreground">
          All time completed
        </div>
      </Card>
    </div>
  );
};