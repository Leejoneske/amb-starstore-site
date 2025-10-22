import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { ActivityEvent } from '@/types';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Star, 
  Target,
  Calendar,
  Award
} from 'lucide-react';

interface AmbassadorAnalyticsProps {
  data: {
    monthlyEarnings: number;
    monthlyTransactions: number;
    avgStarsPerTransaction: number;
    earningsByMonth: Array<{
      month: string;
      earnings: number;
      transactions: number;
      stars: number;
    }>;
    conversionRate: number;
    totalReferrals: number;
    convertedReferrals: number;
    recentActivity: ActivityEvent[];
  } | null;
  isLoading?: boolean;
}

export const AmbassadorAnalytics = ({ data, isLoading }: AmbassadorAnalyticsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-1/3 mb-4" />
              <div className="h-48 bg-muted rounded" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="p-8 text-center">
        <div className="text-muted-foreground">
          <Star className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p>No analytics data available yet</p>
          <p className="text-sm mt-1">Start making transactions to see your performance</p>
        </div>
      </Card>
    );
  }

  const chartConfig = {
    earnings: {
      label: 'Earnings',
      color: 'hsl(var(--primary))',
    },
    transactions: {
      label: 'Transactions',
      color: 'hsl(var(--secondary))',
    },
    stars: {
      label: 'Stars',
      color: 'hsl(var(--warning))',
    },
  };

  // Calculate trends
  const currentMonth = data.earningsByMonth[data.earningsByMonth.length - 1];
  const previousMonth = data.earningsByMonth[data.earningsByMonth.length - 2];
  const earningsTrend = previousMonth && previousMonth.earnings > 0 ? 
    ((currentMonth.earnings - previousMonth.earnings) / previousMonth.earnings) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                ${data.monthlyEarnings.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">This Month</div>
              {earningsTrend !== 0 && (
                <div className="flex items-center gap-1 mt-1">
                  {earningsTrend >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-success" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-destructive" />
                  )}
                  <span className={`text-xs ${earningsTrend >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {earningsTrend >= 0 ? '+' : ''}{earningsTrend.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <Calendar className="h-5 w-5 text-success" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {data.monthlyTransactions}
              </div>
              <div className="text-sm text-muted-foreground">Transactions</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <Star className="h-5 w-5 text-warning" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {data.avgStarsPerTransaction.toFixed(0)}
              </div>
              <div className="text-sm text-muted-foreground">Avg Stars</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-info/10">
              <Target className="h-5 w-5 text-info" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {data.conversionRate.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Conversion</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings Trend */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Earnings Trend</h3>
              <p className="text-sm text-muted-foreground">Your monthly earnings over time</p>
            </div>
            <Badge variant="outline">Last 6 months</Badge>
          </div>
          <ChartContainer config={chartConfig} className="h-64">
            <AreaChart data={data.earningsByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="earnings"
                stroke="var(--color-earnings)"
                fill="var(--color-earnings)"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ChartContainer>
        </Card>

        {/* Transaction Volume */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Transaction Volume</h3>
              <p className="text-sm text-muted-foreground">Monthly transaction count</p>
            </div>
            <Badge variant="outline">Last 6 months</Badge>
          </div>
          <ChartContainer config={chartConfig} className="h-64">
            <BarChart data={data.earningsByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="transactions" fill="var(--color-transactions)" />
            </BarChart>
          </ChartContainer>
        </Card>

        {/* Stars Performance */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Stars Performance</h3>
              <p className="text-sm text-muted-foreground">Stars earned monthly</p>
            </div>
            <Badge variant="outline">Quality metric</Badge>
          </div>
          <ChartContainer config={chartConfig} className="h-64">
            <LineChart data={data.earningsByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="stars"
                stroke="var(--color-stars)"
                strokeWidth={3}
                dot={{ fill: 'var(--color-stars)', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ChartContainer>
        </Card>

        {/* Referral Conversion Funnel */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Referral Funnel</h3>
            <p className="text-sm text-muted-foreground">Your referral conversion performance</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-info" />
                <span className="text-sm">Total Referrals</span>
              </div>
              <span className="font-bold">{data.totalReferrals}</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Converted to Active</span>
                <span>{data.convertedReferrals} / {data.totalReferrals}</span>
              </div>
              <Progress value={data.conversionRate} className="h-2" />
              <div className="text-right">
                <Badge variant={data.conversionRate >= 50 ? 'default' : 'secondary'}>
                  {data.conversionRate.toFixed(1)}% conversion rate
                </Badge>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-success">
                    {data.convertedReferrals}
                  </div>
                  <div className="text-xs text-muted-foreground">Active</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-muted-foreground">
                    {data.totalReferrals - data.convertedReferrals}
                  </div>
                  <div className="text-xs text-muted-foreground">Pending</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Performance Insights</h3>
          <p className="text-sm text-muted-foreground">AI-powered insights based on your data</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Quality Score</span>
            </div>
            <div className="text-2xl font-bold text-primary mb-1">
              {data.avgStarsPerTransaction >= 400 ? 'Excellent' : 
               data.avgStarsPerTransaction >= 300 ? 'Good' : 
               data.avgStarsPerTransaction >= 200 ? 'Fair' : 'Needs Improvement'}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on average stars per transaction
            </p>
          </div>

          <div className="p-4 rounded-lg bg-success/5 border border-success/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-success" />
              <span className="font-medium text-sm">Growth Trend</span>
            </div>
            <div className="text-2xl font-bold text-success mb-1">
              {earningsTrend >= 20 ? 'Accelerating' :
               earningsTrend >= 0 ? 'Growing' :
               earningsTrend >= -10 ? 'Stable' : 'Declining'}
            </div>
            <p className="text-xs text-muted-foreground">
              Month-over-month earnings trend
            </p>
          </div>

          <div className="p-4 rounded-lg bg-info/5 border border-info/20">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-info" />
              <span className="font-medium text-sm">Conversion</span>
            </div>
            <div className="text-2xl font-bold text-info mb-1">
              {data.conversionRate >= 70 ? 'Excellent' :
               data.conversionRate >= 50 ? 'Good' :
               data.conversionRate >= 30 ? 'Average' : 'Low'}
            </div>
            <p className="text-xs text-muted-foreground">
              Referral to active conversion rate
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};