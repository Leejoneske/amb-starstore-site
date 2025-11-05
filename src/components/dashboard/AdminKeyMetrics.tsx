import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown,
  Users,
  DollarSign,
  Target,
  Award,
  Zap,
  Star
} from 'lucide-react';

interface Metric {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon: any;
  color: string;
  bgColor: string;
}

interface AdminKeyMetricsProps {
  totalAmbassadors?: number;
  activeAmbassadors?: number;
  totalRevenue?: number;
  monthlyRevenue?: number;
  avgQualityRate?: number;
  conversionRate?: number;
}

export const AdminKeyMetrics = ({
  totalAmbassadors = 0,
  activeAmbassadors = 0,
  totalRevenue = 0,
  monthlyRevenue = 0,
  avgQualityRate = 0,
  conversionRate = 0
}: AdminKeyMetricsProps) => {
  const metrics: Metric[] = [
    {
      label: 'Total Ambassadors',
      value: totalAmbassadors,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-950',
      change: 12,
      trend: 'up'
    },
    {
      label: 'Active This Month',
      value: activeAmbassadors,
      icon: Zap,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-950',
      change: 8,
      trend: 'up'
    },
    {
      label: 'Total Revenue',
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-950',
      change: 15,
      trend: 'up'
    },
    {
      label: 'Monthly Revenue',
      value: `$${monthlyRevenue.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100 dark:bg-emerald-950',
      change: 23,
      trend: 'up'
    },
    {
      label: 'Avg Quality Rate',
      value: `${avgQualityRate.toFixed(1)}%`,
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-950',
      change: 5,
      trend: 'up'
    },
    {
      label: 'Conversion Rate',
      value: `${conversionRate.toFixed(1)}%`,
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-950',
      change: -2,
      trend: 'down'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </div>
              {metric.change !== undefined && (
                <Badge 
                  variant={metric.trend === 'up' ? 'default' : 'destructive'} 
                  className="text-xs"
                >
                  {metric.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(metric.change)}%
                </Badge>
              )}
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="text-xs text-muted-foreground">{metric.label}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
