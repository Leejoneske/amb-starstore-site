import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Zap, 
  Award,
  Users,
  DollarSign,
  Star,
  Calendar,
  Activity,
  BarChart3,
  PieChart,
  LineChart
} from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, LineChart as RechartsLineChart, Line } from "recharts"

interface PerformanceData {
  totalEarnings: number
  monthlyEarnings: number
  totalReferrals: number
  monthlyReferrals: number
  conversionRate: number
  avgTransactionValue: number
  growthRate: number
  topTier: string
  earningsHistory: Array<{ month: string; earnings: number }>
  referralHistory: Array<{ month: string; referrals: number }>
  tierDistribution: Array<{ tier: string; count: number; color: string }>
  weeklyActivity: Array<{ day: string; transactions: number; referrals: number }>
}

interface PerformanceWidgetsProps {
  data: PerformanceData
  isAdmin?: boolean
  className?: string
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1']

export function PerformanceWidgets({ data, isAdmin = false, className = "" }: PerformanceWidgetsProps) {
  const isPositiveGrowth = data.growthRate >= 0

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {/* Earnings Overview */}
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/20">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Total Earnings</h3>
              <p className="text-xs text-muted-foreground">All time revenue</p>
            </div>
          </div>
          <Badge variant={isPositiveGrowth ? "default" : "destructive"} className="text-xs">
            {isPositiveGrowth ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            {Math.abs(data.growthRate).toFixed(1)}%
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="text-2xl font-bold">${data.totalEarnings.toFixed(2)}</div>
          <div className="text-sm text-muted-foreground">
            +${data.monthlyEarnings.toFixed(2)} this month
          </div>
          <Progress 
            value={Math.min(100, (data.monthlyEarnings / (data.totalEarnings || 1)) * 100)} 
            className="h-2" 
          />
        </div>
      </Card>

      {/* Referral Performance */}
      <Card className="p-6 bg-gradient-to-br from-success/10 to-success/5 border-success/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-success/20">
              <Users className="h-5 w-5 text-success" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Referral Network</h3>
              <p className="text-xs text-muted-foreground">Total referrals</p>
            </div>
          </div>
          <Badge variant="outline" className="text-success border-success">
            {data.conversionRate.toFixed(1)}% CVR
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="text-2xl font-bold">{data.totalReferrals}</div>
          <div className="text-sm text-muted-foreground">
            +{data.monthlyReferrals} this month
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-success/10 rounded-full h-2">
              <div 
                className="bg-success h-2 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, data.conversionRate)}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{data.conversionRate.toFixed(1)}%</span>
          </div>
        </div>
      </Card>

      {/* Transaction Metrics */}
      <Card className="p-6 bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-warning/20">
              <Target className="h-5 w-5 text-warning" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Avg Transaction</h3>
              <p className="text-xs text-muted-foreground">Per transaction value</p>
            </div>
          </div>
          <Badge variant="outline" className="text-warning border-warning">
            {data.topTier}
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="text-2xl font-bold">${data.avgTransactionValue.toFixed(0)}</div>
          <div className="text-sm text-muted-foreground">
            Current tier: {data.topTier}
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-warning/5 rounded p-2">
              <div className="text-xs font-medium">${(data.avgTransactionValue * 0.8).toFixed(0)}</div>
              <div className="text-xs text-muted-foreground">Min</div>
            </div>
            <div className="bg-warning/10 rounded p-2">
              <div className="text-xs font-medium">${data.avgTransactionValue.toFixed(0)}</div>
              <div className="text-xs text-muted-foreground">Avg</div>
            </div>
            <div className="bg-warning/5 rounded p-2">
              <div className="text-xs font-medium">${(data.avgTransactionValue * 1.2).toFixed(0)}</div>
              <div className="text-xs text-muted-foreground">Max</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Earnings Trend Chart */}
      <Card className="p-6 lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <LineChart className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Earnings Trend</h3>
          </div>
          <Badge variant="outline">Last 6 months</Badge>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.earningsHistory}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                className="text-xs"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                className="text-xs"
                tickFormatter={(value) => `$${value}`}
              />
              <Area
                type="monotone"
                dataKey="earnings"
                stroke="#8884d8"
                fill="url(#earningsGradient)"
                strokeWidth={2}
              />
              <defs>
                <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Tier Distribution */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-info" />
            <h3 className="font-semibold">Tier Distribution</h3>
          </div>
          {isAdmin && <Badge variant="outline">All Ambassadors</Badge>}
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={data.tierDistribution}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="count"
              >
                {data.tierDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {data.tierDistribution.map((tier, index) => (
            <div key={tier.tier} className="flex items-center gap-2 text-xs">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: tier.color }}
              />
              <span className="capitalize">{tier.tier}</span>
              <span className="text-muted-foreground">({tier.count})</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Weekly Activity */}
      <Card className="p-6 lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-success" />
            <h3 className="font-semibold">Weekly Activity</h3>
          </div>
          <Badge variant="outline">Last 7 days</Badge>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="day" 
                axisLine={false}
                tickLine={false}
                className="text-xs"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                className="text-xs"
              />
              <Bar dataKey="transactions" fill="#8884d8" radius={[2, 2, 0, 0]} />
              <Bar dataKey="referrals" fill="#82ca9d" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded bg-[#8884d8]" />
            <span>Transactions</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded bg-[#82ca9d]" />
            <span>Referrals</span>
          </div>
        </div>
      </Card>

      {/* Quick Stats Grid */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Quick Stats</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-warning" />
              <span className="text-sm">Quality Rate</span>
            </div>
            <Badge variant="outline">85%</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm">Response Time</span>
            </div>
            <Badge variant="outline">2.3h</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-success" />
              <span className="text-sm">Success Rate</span>
            </div>
            <Badge variant="outline">92%</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-info" />
              <span className="text-sm">Active Days</span>
            </div>
            <Badge variant="outline">28/30</Badge>
          </div>
        </div>
      </Card>
    </div>
  )
}