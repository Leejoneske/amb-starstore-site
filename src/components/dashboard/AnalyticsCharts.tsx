import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, Star, Target } from 'lucide-react';

interface AnalyticsChartsProps {
  data: {
    revenueByMonth: Array<{
      month: string;
      revenue: number;
      transactions: number;
    }>;
    tierDistribution: Array<{
      tier: string;
      count: number;
      percentage: number;
    }>;
    performanceMetrics: {
      avgTransactionValue: number;
      avgCommissionRate: number;
      totalTransactions: number;
      activeAmbassadors: number;
    };
    topPerformers: Array<{
      id: string;
      name: string;
      earnings: number;
      referrals: number;
    }>;
  };
  isLoading?: boolean;
}

const TIER_COLORS = {
  explorer: '#A78BFA',
  connector: '#34D399',
  pioneer: '#60A5FA',
  elite: '#F59E0B',
};

export const AnalyticsCharts = ({ data, isLoading }: AnalyticsChartsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-1/3 mb-4" />
              <div className="h-64 bg-muted rounded" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const chartConfig = {
    revenue: {
      label: 'Revenue',
      color: 'hsl(var(--primary))',
    },
    transactions: {
      label: 'Transactions',
      color: 'hsl(var(--secondary))',
    },
    earnings: {
      label: 'Earnings',
      color: 'hsl(var(--success))',
    },
    referrals: {
      label: 'Referrals',
      color: 'hsl(var(--info))',
    },
  };

  // Calculate trends
  const currentMonth = data.revenueByMonth[data.revenueByMonth.length - 1];
  const previousMonth = data.revenueByMonth[data.revenueByMonth.length - 2];
  const revenueTrend = previousMonth ? 
    ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100 : 0;
  const transactionTrend = previousMonth ? 
    ((currentMonth.transactions - previousMonth.transactions) / previousMonth.transactions) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                ${data.performanceMetrics.avgTransactionValue.toFixed(0)}
              </div>
              <div className="text-sm text-muted-foreground">Avg Transaction</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <Users className="h-5 w-5 text-success" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {data.performanceMetrics.activeAmbassadors}
              </div>
              <div className="text-sm text-muted-foreground">Active Ambassadors</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <Target className="h-5 w-5 text-warning" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {data.performanceMetrics.avgCommissionRate.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Avg Commission</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-info/10">
              <Star className="h-5 w-5 text-info" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {data.performanceMetrics.totalTransactions}
              </div>
              <div className="text-sm text-muted-foreground">Total Transactions</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Revenue Trend</h3>
              <p className="text-sm text-muted-foreground">Monthly revenue over time</p>
            </div>
            <div className="flex items-center gap-2">
              {revenueTrend >= 0 ? (
                <TrendingUp className="h-4 w-4 text-success" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
              <Badge variant={revenueTrend >= 0 ? 'default' : 'destructive'}>
                {revenueTrend >= 0 ? '+' : ''}{revenueTrend.toFixed(1)}%
              </Badge>
            </div>
          </div>
          <ChartContainer config={chartConfig} className="h-64">
            <AreaChart data={data.revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--color-revenue)"
                fill="var(--color-revenue)"
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
            <div className="flex items-center gap-2">
              {transactionTrend >= 0 ? (
                <TrendingUp className="h-4 w-4 text-success" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
              <Badge variant={transactionTrend >= 0 ? 'default' : 'destructive'}>
                {transactionTrend >= 0 ? '+' : ''}{transactionTrend.toFixed(1)}%
              </Badge>
            </div>
          </div>
          <ChartContainer config={chartConfig} className="h-64">
            <BarChart data={data.revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="transactions" fill="var(--color-transactions)" />
            </BarChart>
          </ChartContainer>
        </Card>

        {/* Tier Distribution */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Ambassador Tiers</h3>
            <p className="text-sm text-muted-foreground">Distribution by tier level</p>
          </div>
          <ChartContainer config={chartConfig} className="h-64">
            <PieChart>
              <Pie
                data={data.tierDistribution}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="count"
                label={({ tier, percentage }) => `${tier} (${percentage.toFixed(1)}%)`}
              >
                {data.tierDistribution.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={TIER_COLORS[entry.tier as keyof typeof TIER_COLORS] || '#8884d8'}
                  />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
        </Card>

        {/* Top Performers */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Top Performers</h3>
            <p className="text-sm text-muted-foreground">Highest earning ambassadors</p>
          </div>
          <div className="space-y-3">
            {data.topPerformers.map((performer, index) => (
              <div key={performer.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{performer.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {performer.referrals} referrals
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-success">
                    ${performer.earnings.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};