import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Star } from "lucide-react";
import type { Transaction } from "@/types";

interface TransactionsListProps {
  transactions?: Transaction[] | null;
  isLoading: boolean;
}

export const TransactionsList = ({ transactions, isLoading }: TransactionsListProps) => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Recent Transactions</h3>
        <Badge variant="outline">Last 5</Badge>
      </div>
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : transactions && transactions.length > 0 ? (
        <div className="space-y-3">
          {transactions.slice(0, 5).map((transaction) => (
            <div 
              key={transaction.id} 
              className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${
                  transaction.status === 'completed' ? 'bg-success/10' : 'bg-warning/10'
                }`}>
                  <DollarSign className={`h-5 w-5 ${
                    transaction.status === 'completed' ? 'text-success' : 'text-warning'
                  }`} />
                </div>
                <div>
                  <div className="font-medium mb-1">
                    Commission - {transaction.tier_at_transaction}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{new Date(transaction.transaction_date).toLocaleDateString()}</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-warning" />
                      <span>{transaction.stars_awarded} stars</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-success">
                  +${transaction.commission_amount.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {transaction.commission_rate}% rate
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Star className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p>No transactions yet</p>
          <p className="text-sm mt-1">Share your referral code to start earning!</p>
        </div>
      )}
    </Card>
  );
};