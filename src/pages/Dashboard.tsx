import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Star, 
  Copy, 
  Download,
  Award,
  Calendar,
  Link as LinkIcon,
  Sparkles,
  BarChart3,
  MessageSquare,
  CheckCircle2,
  ArrowUpRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { toast } = useToast();

  const ambassador = {
    name: "Alex Johnson",
    currentTier: 2,
    tierName: "Growing Ambassador",
    tierProgress: 68,
    nextTier: "Advanced Ambassador",
    nextTierThreshold: 70,
    currentReferrals: 34,
    referralCode: "ALEX2025",
    referralLink: "https://starstore.site?ref=ALEX2025",
    avgStars: 412,
    qualityRate: 82,
  };

  const stats = {
    totalEarnings: 2847.50,
    monthlyEarnings: 425.30,
    referrals: 34,
    monthlyTransactions: 34,
    avgStarsPerTransaction: 412,
    qualityTransactions: 28,
    conversionRate: 12.5,
    nextPayout: "2025-11-01",
    pendingAmount: 425.30,
    currentCommissionRate: "70%",
    socialPostsThisMonth: 5,
    socialPostsRequired: 4,
  };

  const tierInfo = [
    { level: 1, name: "Entry Level", threshold: 30, commission: "6%", baseEarnings: 13, qualityBonus: 30, socialPosts: 0 },
    { level: 2, name: "Growing Ambassador", threshold: 50, commission: "70%", baseEarnings: 35, qualityBonus: 25, socialPosts: 4 },
    { level: 3, name: "Advanced Ambassador", threshold: 70, commission: "75%", baseEarnings: 52.5, qualityBonus: 28.5, socialPosts: 6 },
    { level: 4, name: "Elite Ambassador", threshold: 100, commission: "30%", baseEarnings: 30, qualityBonus: 30, socialPosts: 8 },
  ];

  const currentTierData = tierInfo.find(t => t.level === ambassador.currentTier);

  const recentReferrals = [
    { id: 1, date: "2025-10-25", amount: 15.75, stars: 485, status: "Completed" },
    { id: 2, date: "2025-10-24", amount: 31.50, stars: 392, status: "Completed" },
    { id: 3, date: "2025-10-23", amount: 7.88, stars: 198, status: "Pending" },
    { id: 4, date: "2025-10-22", amount: 23.62, stars: 512, status: "Completed" },
  ];

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  return (
    <div className="min-h-screen py-8 px-4 bg-background">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {ambassador.name}</h1>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="gap-1">Level {ambassador.currentTier}: {ambassador.tierName}</Badge>
                <Badge variant="outline" className="gap-1"><Star className="h-3 w-3" />{ambassador.avgStars} avg stars</Badge>
              </div>
            </div>
            <Link to="/"><Button variant="outline">← Home</Button></Link>
          </div>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Progress to {ambassador.nextTier}</p>
                <p className="text-2xl font-bold">{ambassador.currentReferrals} / {ambassador.nextTierThreshold} referrals</p>
              </div>
              <Award className="h-8 w-8 text-primary" />
            </div>
            <Progress value={ambassador.tierProgress} className="h-3 mb-2" />
            <p className="text-sm text-muted-foreground">{ambassador.nextTierThreshold - ambassador.currentReferrals} more to reach {ambassador.nextTier}</p>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6"><div className="flex items-center justify-between mb-2"><p className="text-sm text-muted-foreground">Total Earnings</p><DollarSign className="h-5 w-5 text-success" /></div><p className="text-3xl font-bold">${stats.totalEarnings.toFixed(2)}</p><p className="text-sm text-muted-foreground mt-1">All time</p></Card>
          <Card className="p-6"><div className="flex items-center justify-between mb-2"><p className="text-sm text-muted-foreground">Commission Rate</p><Award className="h-5 w-5 text-primary" /></div><p className="text-3xl font-bold">{stats.currentCommissionRate}</p><p className="text-sm text-muted-foreground mt-1">Level {ambassador.currentTier}</p></Card>
          <Card className="p-6"><div className="flex items-center justify-between mb-2"><p className="text-sm text-muted-foreground">Avg Stars</p><Star className="h-5 w-5 text-warning" /></div><p className="text-3xl font-bold">{stats.avgStarsPerTransaction}</p><div className="flex items-center gap-1 mt-1"><ArrowUpRight className="h-4 w-4 text-success" /><p className="text-sm text-success">Above 392</p></div></Card>
          <Card className="p-6"><div className="flex items-center justify-between mb-2"><p className="text-sm text-muted-foreground">Quality Rate</p><Sparkles className="h-5 w-5 text-primary" /></div><p className="text-3xl font-bold">{ambassador.qualityRate}%</p><p className="text-sm text-muted-foreground mt-1">{stats.qualityTransactions}/{stats.monthlyTransactions} above 250★</p></Card>
        </div>
        
        {ambassador.qualityRate >= 75 && <Card className="p-6 mb-8 bg-success/5 border-success/20"><div className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5 text-success mt-0.5" /><div><div className="font-semibold text-success mb-1">Quality Bonus Eligible! 🎉</div><p className="text-sm text-muted-foreground">Eligible for ${currentTierData?.qualityBonus} quality bonus this month.</p></div></div></Card>}

        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Your Referral Tools</h2>
          <div className="space-y-4">
            <div><Label className="text-sm font-medium mb-2 block">Referral Code</Label><div className="flex gap-2"><Input value={ambassador.referralCode} readOnly className="font-mono text-lg" /><Button onClick={() => copyToClipboard(ambassador.referralCode, "Referral code")} variant="outline"><Copy className="h-4 w-4" /></Button></div></div>
            <div><Label className="text-sm font-medium mb-2 block">Referral Link</Label><div className="flex gap-2"><Input value={ambassador.referralLink} readOnly /><Button onClick={() => copyToClipboard(ambassador.referralLink, "Referral link")} variant="outline"><Copy className="h-4 w-4" /></Button></div></div>
            <div className="flex gap-4 pt-2"><Button className="flex-1"><Download className="h-4 w-4 mr-2" />Download Marketing Kit</Button><Button variant="outline" className="flex-1"><LinkIcon className="h-4 w-4 mr-2" />Create Custom Link</Button></div>
          </div>
        </Card>

        {/* Activity Tabs */}
        <Tabs defaultValue="referrals" className="space-y-6">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3 gap-2">
            <TabsTrigger value="referrals">Recent Referrals</TabsTrigger>
            <TabsTrigger value="earnings">Earnings History</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="referrals">
            <Card className="shadow-card">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">Recent Referrals</h3>
                <div className="space-y-3">
                  {recentReferrals.map((referral) => (
                    <div key={referral.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                      <div>
                        <p className="font-medium">Sale #{referral.id}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-sm text-muted-foreground">{referral.date}</p>
                          <div className="flex items-center gap-1"><Star className="h-3 w-3 text-warning" /><span className="text-xs font-medium">{referral.stars}</span></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">${referral.amount.toFixed(2)}</p>
                        <Badge variant={referral.status === "Completed" ? "default" : "secondary"} className="mt-1">{referral.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="earnings">
            <Card className="shadow-card p-6">
              <h3 className="text-xl font-semibold mb-4">Earnings History</h3>
              <p className="text-muted-foreground">
                Detailed earnings history and payout records will appear here.
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="resources">
            <Card className="shadow-card p-6">
              <h3 className="text-xl font-semibold mb-4">Ambassador Resources</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <ResourceCard 
                  title="Brand Guidelines"
                  description="Logo files, color codes, and usage guidelines"
                />
                <ResourceCard 
                  title="Social Media Templates"
                  description="Ready-to-use graphics for Instagram, Twitter, and more"
                />
                <ResourceCard 
                  title="Email Templates"
                  description="Pre-written email campaigns for your audience"
                />
                <ResourceCard 
                  title="Success Stories"
                  description="Case studies and testimonials you can share"
                />
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const ResourceCard = ({ title, description }: { title: string; description: string }) => (
  <div className="p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
    <h4 className="font-semibold mb-1">{title}</h4>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

export default Dashboard;
