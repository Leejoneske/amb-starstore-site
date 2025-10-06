import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Star, 
  Copy, 
  Download,
  Award,
  Target,
  Calendar,
  Link as LinkIcon
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { toast } = useToast();

  // Mock data - will be replaced with real data from backend
  const ambassador = {
    name: "Alex Johnson",
    tier: "Super Star",
    tierProgress: 65,
    nextTier: "Elite Star",
    referralCode: "ALEX2025",
    referralLink: "https://starstore.site?ref=ALEX2025",
  };

  const stats = {
    totalEarnings: 2847.50,
    monthlyEarnings: 425.30,
    referrals: 48,
    conversionRate: 12.5,
    nextPayout: "2025-11-01",
    pendingAmount: 425.30,
  };

  const recentReferrals = [
    { id: 1, date: "2025-10-25", amount: 15.75, status: "Completed" },
    { id: 2, date: "2025-10-24", amount: 31.50, status: "Completed" },
    { id: 3, date: "2025-10-23", amount: 7.88, status: "Pending" },
    { id: 4, date: "2025-10-22", amount: 23.62, status: "Completed" },
  ];

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Welcome back, {ambassador.name}!</h1>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-sm font-semibold">
                  {ambassador.tier}
                </span>
              </div>
            </div>
            <Link to="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>

          {/* Tier Progress */}
          <Card className="p-6 glass-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Progress to {ambassador.nextTier}</p>
                <p className="text-2xl font-bold">{ambassador.tierProgress}%</p>
              </div>
              <Award className="h-8 w-8 text-gold" />
            </div>
            <Progress value={ambassador.tierProgress} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">
              {100 - ambassador.tierProgress}% more to reach {ambassador.nextTier} tier
            </p>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 glass-card">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Earnings</p>
              <DollarSign className="h-5 w-5 text-success" />
            </div>
            <p className="text-3xl font-bold">${stats.totalEarnings.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground mt-1">All time</p>
          </Card>

          <Card className="p-6 glass-card">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">This Month</p>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <p className="text-3xl font-bold">${stats.monthlyEarnings.toFixed(2)}</p>
            <p className="text-sm text-success mt-1">+15% from last month</p>
          </Card>

          <Card className="p-6 glass-card">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Referrals</p>
              <Users className="h-5 w-5 text-accent" />
            </div>
            <p className="text-3xl font-bold">{stats.referrals}</p>
            <p className="text-sm text-muted-foreground mt-1">Conversion: {stats.conversionRate}%</p>
          </Card>

          <Card className="p-6 glass-card">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Next Payout</p>
              <Calendar className="h-5 w-5 text-gold" />
            </div>
            <p className="text-3xl font-bold">${stats.pendingAmount.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground mt-1">{stats.nextPayout}</p>
          </Card>
        </div>

        {/* Referral Tools */}
        <Card className="p-6 glass-card mb-8">
          <h2 className="text-2xl font-bold mb-6">Your Referral Tools</h2>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Referral Code</Label>
              <div className="flex gap-2">
                <Input 
                  value={ambassador.referralCode} 
                  readOnly 
                  className="font-mono text-lg"
                />
                <Button 
                  onClick={() => copyToClipboard(ambassador.referralCode, "Referral code")}
                  variant="outline"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Referral Link</Label>
              <div className="flex gap-2">
                <Input 
                  value={ambassador.referralLink} 
                  readOnly 
                />
                <Button 
                  onClick={() => copyToClipboard(ambassador.referralLink, "Referral link")}
                  variant="outline"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <Button className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download Marketing Kit
              </Button>
              <Button variant="outline" className="flex-1">
                <LinkIcon className="h-4 w-4 mr-2" />
                Create Custom Link
              </Button>
            </div>
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
            <Card className="glass-card">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">Recent Referrals</h3>
                <div className="space-y-4">
                  {recentReferrals.map((referral) => (
                    <div 
                      key={referral.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/30"
                    >
                      <div>
                        <p className="font-medium">Sale #{referral.id}</p>
                        <p className="text-sm text-muted-foreground">{referral.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">${referral.amount.toFixed(2)}</p>
                        <span className={`text-sm ${
                          referral.status === "Completed" ? "text-success" : "text-accent"
                        }`}>
                          {referral.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="earnings">
            <Card className="glass-card p-6">
              <h3 className="text-xl font-semibold mb-4">Earnings History</h3>
              <p className="text-muted-foreground">
                Detailed earnings history and payout records will appear here.
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="resources">
            <Card className="glass-card p-6">
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

const Label = ({ children, className = "", ...props }: any) => (
  <label className={`text-sm font-medium ${className}`} {...props}>
    {children}
  </label>
);

const Input = ({ className = "", ...props }: any) => (
  <input 
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

const ResourceCard = ({ title, description }: { title: string; description: string }) => (
  <div className="p-4 rounded-lg border border-border hover:border-primary transition-colors cursor-pointer">
    <h4 className="font-semibold mb-2">{title}</h4>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

export default Dashboard;
