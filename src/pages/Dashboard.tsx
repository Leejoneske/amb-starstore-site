import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Bell,
  Plus,
  ArrowLeftRight,
  Copy,
  TrendingUp,
  DollarSign,
  Star,
  Loader2,
  ArrowUpRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useAmbassadorProfile } from "@/hooks/useAmbassadorProfile";
import { useTransactions } from "@/hooks/useTransactions";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const { ambassadorProfile, tierConfig, isLoading } = useAmbassadorProfile(user?.id);
  const { data: transactions } = useTransactions(ambassadorProfile?.id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!ambassadorProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <Card className="p-12 text-center max-w-md border-border">
          <h2 className="text-2xl font-bold mb-2">No Ambassador Profile</h2>
          <p className="text-muted-foreground mb-6">
            You haven't been approved as an ambassador yet.
          </p>
          <Link to="/apply">
            <Button>Apply to Become an Ambassador</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const userName = user?.user_metadata?.full_name || 'User';
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase();

  const copyReferralCode = () => {
    navigator.clipboard.writeText(ambassadorProfile.referral_code);
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard",
    });
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 bg-gradient-to-br from-primary to-accent">
              <AvatarFallback className="text-lg font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{userName}</h1>
              <Badge variant="secondary" className="mt-1">
                {tierConfig?.name || ambassadorProfile.current_tier}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
          </Button>
        </div>

        {/* Balance Card */}
        <Card className="p-8 text-center border-border bg-card">
          <p className="text-muted-foreground mb-4 text-sm">Total Earnings</p>
          <h2 className="text-5xl font-bold mb-6">
            ${ambassadorProfile.total_earnings.toFixed(2)}
          </h2>
          <div className="flex gap-3">
            <Button className="flex-1 gap-2">
              <Plus className="h-4 w-4" />
              Withdraw
            </Button>
            <Button variant="secondary" className="flex-1 gap-2">
              <ArrowLeftRight className="h-4 w-4" />
              Transfer
            </Button>
          </div>
        </Card>

        {/* Verify ID Card */}
        <Card className="p-6 bg-gradient-to-r from-accent/20 to-primary/20 border-accent/30 overflow-hidden relative">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">Referral Code</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Share your code to earn commissions
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-background/50 backdrop-blur px-4 py-3 rounded-lg font-mono text-lg">
                {ambassadorProfile.referral_code}
              </code>
              <Button size="icon" variant="secondary" onClick={copyReferralCode}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Stats Section */}
        <div>
          <h3 className="text-xl font-bold mb-4">Performance</h3>
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-success/20 rounded-full">
                  <DollarSign className="h-4 w-4 text-success" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-success" />
              </div>
              <p className="text-2xl font-bold">{tierConfig ? (tierConfig.commission_rate * 100).toFixed(0) : 0}%</p>
              <p className="text-xs text-muted-foreground">Commission Rate</p>
            </Card>

            <Card className="p-4 border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-warning/20 rounded-full">
                  <Star className="h-4 w-4 text-warning" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-success" />
              </div>
              <p className="text-2xl font-bold">{ambassadorProfile.avg_stars_per_transaction?.toFixed(0) || 0}</p>
              <p className="text-xs text-muted-foreground">Avg Stars</p>
            </Card>

            <Card className="p-4 border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-accent/20 rounded-full">
                  <TrendingUp className="h-4 w-4 text-accent" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-success" />
              </div>
              <p className="text-2xl font-bold">{ambassadorProfile.total_referrals}</p>
              <p className="text-xs text-muted-foreground">Total Referrals</p>
            </Card>

            <Card className="p-4 border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-primary/20 rounded-full">
                  <Star className="h-4 w-4 text-primary" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-success" />
              </div>
              <p className="text-2xl font-bold">{ambassadorProfile.quality_transaction_rate?.toFixed(0) || 0}%</p>
              <p className="text-xs text-muted-foreground">Quality Rate</p>
            </Card>
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Recent Activity</h3>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          <div className="space-y-3">
            {transactions && transactions.length > 0 ? (
              transactions.slice(0, 3).map((transaction) => (
                <Card key={transaction.id} className="p-4 border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-success/20 rounded-full">
                        <DollarSign className="h-4 w-4 text-success" />
                      </div>
                      <div>
                        <p className="font-medium">Commission</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.transaction_date).toLocaleDateString()}
                          </p>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-warning" />
                            <span className="text-xs">{transaction.stars_awarded}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="font-bold">${transaction.commission_amount.toFixed(2)}</p>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-8 text-center border-border">
                <p className="text-muted-foreground">No transactions yet</p>
                <p className="text-sm text-muted-foreground mt-1">Start sharing your referral code!</p>
              </Card>
            )}
          </div>
        </div>

        {/* Sign Out Button */}
        <Button variant="outline" className="w-full" onClick={signOut}>
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
