import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Payout } from "@/types";

interface PayoutHistoryProps {
  payouts: Payout[];
}

export const PayoutHistory = ({ payouts }: PayoutHistoryProps) => {
  // Add null safety check
  if (!payouts || payouts.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Payout History</h3>
          <Badge variant="outline">No Payouts</Badge>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <p>No payout history yet</p>
          <p className="text-sm mt-1">Your payouts will appear here once processed</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Payout History</h3>
        <Badge variant="outline">Recent Payouts</Badge>
      </div>
      <div className="space-y-3">
        {payouts.slice(0, 5).map((payout) => (
          <div 
            key={payout.id}
            className="flex items-center justify-between p-4 border border-border rounded-lg"
          >
            <div>
              <div className="font-medium mb-1">
                {payout.status === 'completed' ? '✓' : '○'} Payout - {new Date(payout.period_start).toLocaleDateString()} to {new Date(payout.period_end).toLocaleDateString()}
              </div>
              <div className="text-sm text-muted-foreground">
                {payout.payment_method || 'Bank Transfer'} • {payout.status}
              </div>
            </div>
            <div className="text-xl font-bold">
              ${payout.total_amount.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};