import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Zap,
  ArrowRight,
  Sparkles,
  BarChart3,
  Users,
  DollarSign
} from "lucide-react"

interface InsightData {
  totalEarnings: number
  monthlyEarnings: number
  totalReferrals: number
  monthlyReferrals: number
  conversionRate: number
  avgTransactionValue: number
  tier: string
  socialPosts: number
  qualityRate: number
}

interface AIInsightsProps {
  data: InsightData
  isAdmin?: boolean
  className?: string
}

interface Insight {
  id: string
  type: "opportunity" | "warning" | "success" | "tip"
  title: string
  description: string
  impact: "high" | "medium" | "low"
  actionable: boolean
  recommendation?: string
  metric?: {
    current: number
    target: number
    unit: string
  }
}

export function AIInsights({ data, isAdmin = false, className = "" }: AIInsightsProps) {
  const [insights, setInsights] = useState<Insight[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate AI analysis
    const generateInsights = () => {
      const newInsights: Insight[] = []

      // Conversion Rate Analysis
      if (data.conversionRate < 15) {
        newInsights.push({
          id: "conversion-low",
          type: "opportunity",
          title: "Conversion Rate Below Average",
          description: `Your conversion rate of ${data.conversionRate.toFixed(1)}% is below the platform average of 18%.`,
          impact: "high",
          actionable: true,
          recommendation: "Focus on targeting users who are more likely to make purchases. Consider refining your referral strategy.",
          metric: {
            current: data.conversionRate,
            target: 18,
            unit: "%"
          }
        })
      } else if (data.conversionRate > 25) {
        newInsights.push({
          id: "conversion-excellent",
          type: "success",
          title: "Excellent Conversion Performance",
          description: `Your ${data.conversionRate.toFixed(1)}% conversion rate is exceptional! You're in the top 10% of ambassadors.`,
          impact: "high",
          actionable: false
        })
      }

      // Social Media Activity
      if (data.socialPosts < 8) {
        newInsights.push({
          id: "social-posts-low",
          type: "warning",
          title: "Social Media Activity Below Requirement",
          description: `You've posted ${data.socialPosts} times this month. Your tier requires at least 10 posts.`,
          impact: "medium",
          actionable: true,
          recommendation: "Increase your social media presence to maintain your current tier and unlock higher commission rates.",
          metric: {
            current: data.socialPosts,
            target: 10,
            unit: "posts"
          }
        })
      }

      // Earnings Growth Opportunity
      const monthlyGrowthRate = (data.monthlyEarnings / (data.totalEarnings - data.monthlyEarnings)) * 100
      if (monthlyGrowthRate > 20) {
        newInsights.push({
          id: "earnings-growth",
          type: "success",
          title: "Strong Monthly Growth",
          description: `Your earnings grew by ${monthlyGrowthRate.toFixed(1)}% this month. You're on track for tier advancement!`,
          impact: "high",
          actionable: true,
          recommendation: "Maintain this momentum by continuing your current referral strategies."
        })
      }

      // Quality Rate Analysis
      if (data.qualityRate < 70) {
        newInsights.push({
          id: "quality-improvement",
          type: "opportunity",
          title: "Quality Score Improvement Needed",
          description: `Your quality rate of ${data.qualityRate}% could be improved. Focus on referring engaged users.`,
          impact: "medium",
          actionable: true,
          recommendation: "Target users who are more likely to engage deeply with the platform for better quality scores.",
          metric: {
            current: data.qualityRate,
            target: 85,
            unit: "%"
          }
        })
      }

      // Tier Advancement Opportunity
      const tierAdvancement = getTierAdvancementInsight(data.tier, data.totalReferrals, data.totalEarnings)
      if (tierAdvancement) {
        newInsights.push(tierAdvancement)
      }

      // Transaction Value Optimization
      if (data.avgTransactionValue < 150) {
        newInsights.push({
          id: "transaction-value",
          type: "tip",
          title: "Optimize Transaction Values",
          description: "Your average transaction value could be increased by targeting premium product categories.",
          impact: "medium",
          actionable: true,
          recommendation: "Focus on promoting higher-value items or bundles to increase your commission per referral."
        })
      }

      // Seasonal Opportunities (simulated)
      const currentMonth = new Date().getMonth()
      if ([10, 11, 0].includes(currentMonth)) { // Nov, Dec, Jan
        newInsights.push({
          id: "seasonal-opportunity",
          type: "opportunity",
          title: "Holiday Season Opportunity",
          description: "Holiday shopping season is here! This is typically the highest-earning period for ambassadors.",
          impact: "high",
          actionable: true,
          recommendation: "Increase your posting frequency and focus on gift-related content to maximize holiday earnings."
        })
      }

      return newInsights.slice(0, 6) // Limit to 6 insights
    }

    setTimeout(() => {
      setInsights(generateInsights())
      setIsLoading(false)
    }, 1500) // Simulate AI processing time
  }, [data])

  const getTierAdvancementInsight = (currentTier: string, referrals: number, earnings: number): Insight | null => {
    const tierRequirements = {
      explorer: { referrals: 10, earnings: 100, next: "pioneer" },
      pioneer: { referrals: 25, earnings: 500, next: "champion" },
      champion: { referrals: 50, earnings: 2000, next: "legend" },
      legend: { referrals: Infinity, earnings: Infinity, next: null }
    }

    const current = tierRequirements[currentTier as keyof typeof tierRequirements]
    if (!current || !current.next) return null

    const referralsNeeded = current.referrals - referrals
    const earningsNeeded = current.earnings - earnings

    if (referralsNeeded <= 5 || earningsNeeded <= 200) {
      return {
        id: "tier-advancement",
        type: "opportunity",
        title: `${current.next.charAt(0).toUpperCase() + current.next.slice(1)} Tier Within Reach!`,
        description: `You're close to advancing to ${current.next} tier. Only ${Math.max(referralsNeeded, 0)} more referrals or $${Math.max(earningsNeeded, 0)} more earnings needed.`,
        impact: "high",
        actionable: true,
        recommendation: `Focus on ${referralsNeeded > 0 ? 'acquiring new referrals' : 'increasing transaction values'} to unlock higher commission rates and exclusive benefits.`
      }
    }

    return null
  }

  const getInsightIcon = (type: Insight["type"]) => {
    switch (type) {
      case "opportunity": return <Target className="h-4 w-4" />
      case "warning": return <AlertTriangle className="h-4 w-4" />
      case "success": return <CheckCircle2 className="h-4 w-4" />
      case "tip": return <Lightbulb className="h-4 w-4" />
    }
  }

  const getInsightColor = (type: Insight["type"]) => {
    switch (type) {
      case "opportunity": return "text-primary bg-primary/10 border-primary/20"
      case "warning": return "text-warning bg-warning/10 border-warning/20"
      case "success": return "text-success bg-success/10 border-success/20"
      case "tip": return "text-info bg-info/10 border-info/20"
    }
  }

  const getImpactBadge = (impact: Insight["impact"]) => {
    const colors = {
      high: "bg-destructive text-destructive-foreground",
      medium: "bg-warning text-warning-foreground",
      low: "bg-muted text-muted-foreground"
    }
    return (
      <Badge className={`text-xs ${colors[impact]}`}>
        {impact} impact
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center gap-2 mb-6">
          <Brain className="h-5 w-5 text-primary animate-pulse" />
          <h3 className="font-semibold">AI Performance Insights</h3>
          <Badge variant="outline" className="ml-auto">
            <Sparkles className="h-3 w-3 mr-1" />
            Analyzing...
          </Badge>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-full mb-1" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
          ))}
        </div>
      </Card>
    )
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <Brain className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">AI Performance Insights</h3>
        <Badge variant="outline" className="ml-auto">
          <Sparkles className="h-3 w-3 mr-1" />
          {insights.length} insights
        </Badge>
      </div>

      <div className="space-y-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {getInsightIcon(insight.type)}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{insight.title}</h4>
                  {getImpactBadge(insight.impact)}
                </div>
                <p className="text-sm opacity-90">{insight.description}</p>
                
                {insight.metric && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Progress to target</span>
                      <span>{insight.metric.current.toFixed(1)}{insight.metric.unit} / {insight.metric.target}{insight.metric.unit}</span>
                    </div>
                    <Progress 
                      value={(insight.metric.current / insight.metric.target) * 100} 
                      className="h-2"
                    />
                  </div>
                )}
                
                {insight.recommendation && (
                  <div className="mt-3 p-3 bg-background/50 rounded border">
                    <div className="flex items-start gap-2">
                      <Zap className="h-4 w-4 mt-0.5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Recommendation</p>
                        <p className="text-xs opacity-80 mt-1">{insight.recommendation}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {insights.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No insights available at the moment.</p>
            <p className="text-xs mt-1">Keep engaging to generate personalized recommendations!</p>
          </div>
        )}
      </div>

      {insights.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border/50">
          <Button variant="outline" size="sm" className="w-full">
            <BarChart3 className="h-4 w-4 mr-2" />
            View Detailed Analytics
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </Card>
  )
}