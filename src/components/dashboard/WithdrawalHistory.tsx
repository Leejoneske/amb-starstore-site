import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Clock, CheckCircle2, XCircle, Loader2, Wallet, Ban, ChevronDown, ChevronUp, RefreshCw
} from "lucide-react";
import { useWithdrawalRequests, useCancelWithdrawal, type WithdrawalRequest } from "@/hooks/useWithdrawals";
import { formatDistanceToNow } from "date-fns";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode; bg: string }> = {
  pending: {
    label: "Pending Review",
    color: "text-orange-500",
    icon: <Clock className="h-3.5 w-3.5" />,
    bg: "bg-orange-500/10 border-orange-500/20",
  },
  under_review: {
    label: "Under Review",
    color: "text-blue-500",
    icon: <RefreshCw className="h-3.5 w-3.5" />,
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  approved: {
    label: "Approved",
    color: "text-green-600",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    bg: "bg-green-500/10 border-green-500/20",
  },
  processing: {
    label: "Processing",
    color: "text-purple-500",
    icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
    bg: "bg-purple-500/10 border-purple-500/20",
  },
  completed: {
    label: "Completed",
    color: "text-success",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    bg: "bg-success/10 border-success/20",
  },
  rejected: {
    label: "Rejected",
    color: "text-destructive",
    icon: <XCircle className="h-3.5 w-3.5" />,
    bg: "bg-destructive/10 border-destructive/20",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-muted-foreground",
    icon: <Ban className="h-3.5 w-3.5" />,
    bg: "bg-muted/50 border-border",
  },
};

const METHOD_LABELS: Record<string, string> = {
  usdt_ton: "USDT (TON)",
  paypal: "PayPal",
  airtm: "AirTM",
  bank_transfer: "Bank Transfer",
  crypto_other: "Crypto",
};

interface WithdrawalHistoryProps {
  ambassadorId: string;
}

export const WithdrawalHistory = ({ ambassadorId }: WithdrawalHistoryProps) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const { data: requests = [], isLoading } = useWithdrawalRequests(ambassadorId);
  const cancelWithdrawal = useCancelWithdrawal(ambassadorId);

  if (isLoading) {
    return (
      <Card className="p-6 space-y-3">
        <div className="h-5 bg-muted animate-pulse rounded w-48" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded" />
        ))}
      </Card>
    );
  }

  const pending = requests.filter(r => ["pending", "under_review", "approved", "processing"].includes(r.status));
  const history = requests.filter(r => ["completed", "rejected", "cancelled"].includes(r.status));

  const renderRequest = (req: WithdrawalRequest) => {
    const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
    const isExpanded = expanded === req.id;
    const details = req.method_details as Record<string, string>;
    const firstDetailValue = Object.values(details)[0] || "";

    return (
      <div key={req.id} className={`rounded-xl border p-4 transition-all ${cfg.bg}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`flex items-center gap-1.5 ${cfg.color}`}>
              {cfg.icon}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm">${req.amount.toFixed(2)}</span>
                <span className="text-xs text-muted-foreground">via {METHOD_LABELS[req.method_type] || req.method_type}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {firstDetailValue} · {formatDistanceToNow(new Date(req.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <Badge variant="outline" className={`text-xs ${cfg.color} border-current`}>
              {cfg.label}
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={() => setExpanded(isExpanded ? null : req.id)}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-border/50 space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(details).map(([k, v]) => (
                <div key={k}>
                  <p className="text-xs text-muted-foreground capitalize">{k.replace(/_/g, " ")}</p>
                  <p className="font-medium break-all">{v}</p>
                </div>
              ))}
              <div>
                <p className="text-xs text-muted-foreground">Tier at Request</p>
                <p className="font-medium capitalize">{req.tier_at_request}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Requested</p>
                <p className="font-medium">{new Date(req.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {req.payment_reference && (
              <div>
                <p className="text-xs text-muted-foreground">Payment Reference</p>
                <p className="font-mono text-xs break-all bg-muted/50 p-2 rounded mt-1">{req.payment_reference}</p>
              </div>
            )}

            {req.rejection_reason && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-xs text-muted-foreground mb-0.5">Rejection Reason</p>
                <p className="text-sm text-destructive">{req.rejection_reason}</p>
              </div>
            )}

            {req.admin_notes && (
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground mb-0.5">Admin Note</p>
                <p className="text-sm">{req.admin_notes}</p>
              </div>
            )}

            {req.status === "pending" && (
              <Button
                size="sm"
                variant="outline"
                className="text-destructive border-destructive/30 hover:bg-destructive/10 mt-2"
                onClick={() => cancelWithdrawal.mutate(req.id)}
                disabled={cancelWithdrawal.isPending}
              >
                <Ban className="h-3.5 w-3.5 mr-1.5" />
                Cancel Request
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-5">
        <Wallet className="h-5 w-5 text-primary" />
        <div>
          <h3 className="text-lg font-semibold font-serif">Withdrawal History</h3>
          <p className="text-sm text-muted-foreground">{requests.length} total requests</p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground border border-dashed border-border rounded-xl">
          <Clock className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="font-medium">No withdrawals yet</p>
          <p className="text-sm mt-1">Your withdrawal history will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.length > 0 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active</p>
              <div className="space-y-3">{pending.map(renderRequest)}</div>
            </>
          )}
          {pending.length > 0 && history.length > 0 && <Separator />}
          {history.length > 0 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">History</p>
              <div className="space-y-3">{history.map(renderRequest)}</div>
            </>
          )}
        </div>
      )}
    </Card>
  );
};
