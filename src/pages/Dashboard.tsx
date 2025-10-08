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
  Star, 
  Copy, 
  Download,
  Award,
  LinkIcon,
  Sparkles,
  CheckCircle2,
  ArrowUpRight,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAmbassadorProfile } from "@/hooks/useAmbassadorProfile";
import { useTransactions } from "@/hooks/useTransactions";
import { usePayouts } from "@/hooks/usePayouts";

const NewDashboard = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { ambassadorProfile, tierConfig, isLoading } = useAmbassadorProfile(user?.id);
  const { data: transactions } = useTransactions(ambassadorProfile?.id);
  const { data: payouts } = usePayouts(ambassadorProfile?.id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!ambassadorProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="p-12 text-center max-w-md">
          <Sparkles className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Ambassador Profile</h2>
          <p className="text-muted-foreground mb-6">
            You haven't been approved as an ambassador yet. Please apply first or wait for approval.
          </p>
          <Link to="/apply">
            <Button>Apply to Become an Ambassador</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const tierLevels = [
    { tier: 'entry', threshold: 30 },
    { tier: 'growing', threshold: 50 },
    { tier: 'advanced', threshold: 70 },
    { tier: 'elite', threshold: 100 },
  ];

  const currentTierIndex = tierLevels.findIndex(t => t.tier === ambassadorProfile.current_tier);
  const nextTier = tierLevels[currentTierIndex + 1];
  const tierProgress = nextTier 
    ? (ambassadorProfile.total_referrals / nextTier.threshold) * 100
    : 100;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const referralLink = `${window.location.origin}?ref=${ambassadorProfile.referral_code}`;

  return (
    <div className="min-h-screen py-8 px-4 bg-background">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.user_metadata?.full_name || 'Ambassador'}</h1>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="gap-1">
                  {tierConfig?.name || ambassadorProfile.current_tier}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Star className="h-3 w-3" />
                  {ambassadorProfile.avg_stars_per_transaction?.toFixed(0) || 0} avg stars
                </Badge>
              </div>
            </div>
            <Link to="/"><Button variant="outline">← Home</Button></Link>
          </div>

          {nextTier && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Progress to {tierLevels[currentTierIndex + 1]?.tier || 'Next Tier'}
                  </p>
                  <p className="text-2xl font-bold">
                    {ambassadorProfile.total_referrals} / {nextTier.threshold} referrals
                  </p>
                </div>
                <Award className="h-8 w-8 text-primary" />
              </div>
              <Progress value={tierProgress} className="h-3 mb-2" />
              <p className="text-sm text-muted-foreground">
                {nextTier.threshold - ambassadorProfile.total_referrals} more to reach next tier
              </p>
            </Card>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Earnings</p>
              <DollarSign className="h-5 w-5 text-success" />
            </div>
            <p className="text-3xl font-bold">${ambassadorProfile.total_earnings.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground mt-1">All time</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Commission Rate</p>
              <Award className="h-5 w-5 text-primary" />
            </div>
            <p className="text-3xl font-bold">
              {tierConfig ? (tierConfig.commission_rate * 100).toFixed(0) : 0}%
            </p>
            <p className="text-sm text-muted-foreground mt-1">{tierConfig?.name}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Avg Stars</p>
              <Star className="h-5 w-5 text-warning" />
            </div>
            <p className="text-3xl font-bold">
              {ambassadorProfile.avg_stars_per_transaction?.toFixed(0) || 0}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-4 w-4 text-success" />
              <p className="text-sm text-success">Quality metric</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Quality Rate</p>
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <p className="text-3xl font-bold">
              {ambassadorProfile.quality_transaction_rate?.toFixed(0) || 0}%
            </p>
            <p className="text-sm text-muted-foreground mt-1">Transactions above 250★</p>
          </Card>
        </div>
        
        {(ambassadorProfile.quality_transaction_rate || 0) >= 75 && (
          <Card className="p-6 mb-8 bg-success/5 border-success/20">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
              <div>
                <div className="font-semibold text-success mb-1">Quality Bonus Eligible! 🎉</div>
                <p className="text-sm text-muted-foreground">
                  Eligible for ${tierConfig?.quality_bonus.toFixed(2)} quality bonus this month.
                </p>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Your Referral Tools</h2>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Referral Code</Label>
              <div className="flex gap-2">
                <Input 
                  value={ambassadorProfile.referral_code} 
                  readOnly 
                  className="font-mono text-lg" 
                />
                <Button 
                  onClick={() => copyToClipboard(ambassadorProfile.referral_code, "Referral code")} 
                  variant="outline"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Referral Link</Label>
              <div className="flex gap-2">
                <Input value={referralLink} readOnly />
                <Button 
                  onClick={() => copyToClipboard(referralLink, "Referral link")} 
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

        <Tabs defaultValue="referrals" className="space-y-6">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3 gap-2">
            <TabsTrigger value="referrals">Recent Transactions</TabsTrigger>
            <TabsTrigger value="earnings">Payouts</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="referrals">
            <Card className="shadow-card">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">Recent Transactions</h3>
                <div className="space-y-3">
                  {transactions && transactions.length > 0 ? (
                    transactions.map((transaction) => (
                      <div 
                        key={transaction.id} 
                        className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                      >
                        <div>
                          <p className="font-medium">Transaction #{transaction.order_id || transaction.id.substring(0, 8)}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-sm text-muted-foreground">
                              {new Date(transaction.transaction_date).toLocaleDateString()}
                            </p>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-warning" />
                              <span className="text-xs font-medium">{transaction.stars_awarded}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">${transaction.commission_amount.toFixed(2)}</p>
                          <Badge 
                            variant={transaction.status === "completed" ? "default" : "secondary"} 
                            className="mt-1"
                          >
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No transactions yet. Start sharing your referral link!
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="earnings">
            <Card className="shadow-card p-6">
              <h3 className="text-xl font-semibold mb-4">Payout History</h3>
              {payouts && payouts.length > 0 ? (
                <div className="space-y-3">
                  {payouts.map((payout) => (
                    <div 
                      key={payout.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border"
                    >
                      <div>
                        <p className="font-medium">
                          {new Date(payout.period_start).toLocaleDateString()} - {new Date(payout.period_end).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {payout.status === 'completed' ? `Paid ${new Date(payout.paid_at!).toLocaleDateString()}` : `Status: ${payout.status}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">${payout.total_amount.toFixed(2)}</p>
                        {payout.quality_bonus > 0 && (
                          <p className="text-sm text-success">+${payout.quality_bonus.toFixed(2)} bonus</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No payouts yet. Keep earning commissions!
                </p>
              )}
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

export default NewDashboard;