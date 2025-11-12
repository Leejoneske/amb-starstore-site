import { Card } from "@/components/ui/card";
import { FileText, Users, DollarSign, TrendingUp } from "lucide-react";
import type { Application, Ambassador, AdminAnalyticsData } from "@/types";

interface AdminStatsProps {
  applications?: Application[] | null;
  ambassadors?: Ambassador[] | null;
  analyticsData?: AdminAnalyticsData | null;
}

export const AdminStats = ({ applications, ambassadors, analyticsData }: AdminStatsProps) => {
  const pendingApps = applications?.filter(a => a.status === 'pending').length || 0;
  const totalAmbassadors = ambassadors?.length || 0;
  const totalEarnings = ambassadors?.reduce((sum, a) => sum + (a.total_earnings || 0), 0) || 0;
  const totalReferrals = ambassadors?.reduce((sum, a) => sum + (a.total_referrals || 0), 0) || 0;

  const stats = [
    {
      title: "Pending Applications",
      value: pendingApps,
      icon: FileText,
      trend: applications?.length ? `${applications.length} total` : "0 total",
      gradient: "from-blue-500/20 to-blue-600/20",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600",
    },
    {
      title: "Active Ambassadors",
      value: totalAmbassadors,
      icon: Users,
      trend: ambassadors?.filter(a => a.status === 'active').length + " active",
      gradient: "from-green-500/20 to-green-600/20",
      iconBg: "bg-green-500/10",
      iconColor: "text-green-600",
    },
    {
      title: "Total Earnings",
      value: `$${totalEarnings.toFixed(2)}`,
      icon: DollarSign,
      trend: analyticsData?.performanceMetrics?.avgTransactionValue 
        ? `$${analyticsData.performanceMetrics.avgTransactionValue.toFixed(2)} avg`
        : "No data",
      gradient: "from-purple-500/20 to-purple-600/20",
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-600",
    },
    {
      title: "Total Referrals",
      value: totalReferrals,
      icon: TrendingUp,
      trend: totalAmbassadors ? `${(totalReferrals / totalAmbassadors).toFixed(1)} per ambassador` : "0 avg",
      gradient: "from-orange-500/20 to-orange-600/20",
      iconBg: "bg-orange-500/10",
      iconColor: "text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className={`p-4 md:p-6 bg-gradient-to-br ${stat.gradient} border-0 shadow-sm hover:shadow-md transition-shadow`}>
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
              <stat.icon className={`h-5 w-5 md:h-6 md:w-6 ${stat.iconColor}`} />
            </div>
          </div>
          <div>
            <p className="text-xs md:text-sm text-muted-foreground mb-1">{stat.title}</p>
            <p className="text-2xl md:text-3xl font-bold mb-1">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.trend}</p>
          </div>
        </Card>
      ))}
    </div>
  );
};
