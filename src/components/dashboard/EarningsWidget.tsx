import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, TrendingUp, Clock, Wallet, ArrowUpRight, ChevronRight, AlertCircle
} from "lucide-react";
import { WithdrawModal } from "@/components/dashboard/WithdrawModal";
import { useWithdrawalRequests } from "@/hooks/useWithdrawals";
import { getTierInfo } from "@/lib/tier-utils";
import type { Ambassador } from "@/types";

const TIER_MINIMUMS: Record<string, number> = {
  entry: 10,
  growing: 20,
  advanced: 15,
  elite: 10,
};

interface EarningsWidgetProps {
  ambassadorProfile: Ambassador;
}

export const EarningsWidget = ({ ambassadorProfile }: EarningsWidgetProps) => {
  const [showWithdraw, setShowWithdraw] = useState(false);
  const { data: requests = [] } = useWithdrawalRequests(ambassadorProfile.id);

  const tier = ambassadorProfile.current_tier || "entry";
  const tierInfo = getTierInfo(tier);
  const minWithdraw = TIER_MINIMUMS[tier] ?? 10;

  const pendingInFlight = requests
    .filter(r => ["pending", "under_review", "approved", "processing"].includes(r.status))
    .reduce((s, r) => s + r.amount, 0);

  const totalEarned = ambassadorProfile.total_earnings ?? 0;
  const pendingBalance = ambassadorProfile.pending_earnings ?? 0;
  const availableNow = Math.max(0, pendingBalance - pendingInFlight);
  const canWithdraw = availableNow >= minWithdraw;

  const activeRequest = requests.find(r =>
    ["pending", "under_review", "approved", "processing"].includes(r.status)
  );

  const nextMinProgress = minWithdraw > 0 ? Math.min(100, (availableNow / minWithdraw) * 100) : 100;

  return (
    <>
      <Card className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold font-serif flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Earnings & Withdrawals
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">Your balance overview</p>
          </div>
          <Badge variant="outline" className="text-xs">
            {tierInfo.icon} {tierInfo.displayName}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/10">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-3 w-3 text-primary" />
            </div>
            <div className="text-lg font-bold text-primary">${totalEarned.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">Total Earned</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-success/5 border border-success/10">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Wallet className="h-3 w-3 text-success" />
            </div>
            <div className="text-lg font-bold text-success">${availableNow.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">Available</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-orange-500/5 border border-orange-500/10">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="h-3 w-3 text-orange-500" />
            </div>
            <div className="text-lg font-bold text-orange-500">${pendingInFlight.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">In-Flight</div>
          </div>
        </div>

        {/* Progress to minimum */}
        {!canWithdraw && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>Progress to min withdrawal</span>
              <span>${availableNow.toFixed(2)} / ${minWithdraw}</span>
            </div>
            <Progress value={nextMinProgress} className="h-1.5" />
            <p className="text-xs text-muted-foreground mt-1">
              Earn ${(minWithdraw - availableNow).toFixed(2)} more to unlock withdrawals
            </p>
          </div>
        )}

        {/* Active request notice */}
        {activeRequest && (
          <div className="mb-4 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0" />
            <div className="text-xs">
              <p className="font-medium text-orange-600">Active Withdrawal</p>
              <p className="text-muted-foreground">
                ${activeRequest.amount.toFixed(2)} is {activeRequest.status}
              </p>
            </div>
          </div>
        )}

        <Button
          className="w-full"
          onClick={() => setShowWithdraw(true)}
          disabled={!canWithdraw}
          variant={canWithdraw ? "default" : "outline"}
        >
          <ArrowUpRight className="h-4 w-4 mr-2" />
          {canWithdraw
            ? `Withdraw Earnings`
            : `Min. $${minWithdraw} Required`}
          <ChevronRight className="h-4 w-4 ml-auto" />
        </Button>

        <p className="text-xs text-center text-muted-foreground mt-2">
          Min withdrawal: <strong>${minWithdraw}</strong> for your tier
        </p>
      </Card>

      <WithdrawModal
        open={showWithdraw}
        onOpenChange={setShowWithdraw}
        ambassadorProfile={ambassadorProfile}
      />
    </>
  );
};
