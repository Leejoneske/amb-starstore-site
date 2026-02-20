import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Wallet, Clock, CheckCircle2, XCircle, Loader2, RefreshCw, 
  Ban, DollarSign, Filter, Search
} from "lucide-react";
import { useAllWithdrawalRequests, useProcessWithdrawal, type WithdrawalRequest } from "@/hooks/useWithdrawals";
import { formatDistanceToNow } from "date-fns";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Pending", color: "text-orange-500", icon: <Clock className="h-3.5 w-3.5" /> },
  under_review: { label: "Under Review", color: "text-blue-500", icon: <RefreshCw className="h-3.5 w-3.5" /> },
  approved: { label: "Approved", color: "text-green-600", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  processing: { label: "Processing", color: "text-purple-500", icon: <Loader2 className="h-3.5 w-3.5 animate-spin" /> },
  completed: { label: "Completed", color: "text-success", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  rejected: { label: "Rejected", color: "text-destructive", icon: <XCircle className="h-3.5 w-3.5" /> },
  cancelled: { label: "Cancelled", color: "text-muted-foreground", icon: <Ban className="h-3.5 w-3.5" /> },
};

const METHOD_LABELS: Record<string, string> = {
  usdt_ton: "USDT (TON)",
  paypal: "PayPal",
  airtm: "AirTM",
  bank_transfer: "Bank Transfer",
  crypto_other: "Crypto",
};

type AugmentedRequest = WithdrawalRequest & {
  ambassador_profiles?: {
    referral_code: string;
    current_tier: string;
    profiles?: { full_name: string | null; email: string } | null;
  } | null;
};

export const AdminWithdrawals = () => {
  const [selectedRequest, setSelectedRequest] = useState<AugmentedRequest | null>(null);
  const [action, setAction] = useState<string>("");
  const [paymentRef, setPaymentRef] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const { data: requests = [], isLoading } = useAllWithdrawalRequests();
  const processWithdrawal = useProcessWithdrawal();

  const filtered = requests.filter(r => {
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    const profile = r.ambassador_profiles;
    const name = profile?.profiles?.full_name?.toLowerCase() || "";
    const email = profile?.profiles?.email?.toLowerCase() || "";
    const matchesSearch = !search || name.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Summary stats
  const stats = {
    pending: requests.filter(r => r.status === "pending").length,
    approved: requests.filter(r => r.status === "approved").length,
    processing: requests.filter(r => r.status === "processing").length,
    totalPaid: requests
      .filter(r => r.status === "completed")
      .reduce((s, r) => s + r.amount, 0),
  };

  const handleProcess = async () => {
    if (!selectedRequest || !action) return;
    await processWithdrawal.mutateAsync({
      requestId: selectedRequest.id,
      action: action as "approve" | "reject" | "complete" | "set_processing",
      paymentReference: paymentRef || undefined,
      adminNotes: adminNotes || undefined,
      rejectionReason: rejectionReason || undefined,
    });
    setSelectedRequest(null);
    setAction("");
    setPaymentRef("");
    setAdminNotes("");
    setRejectionReason("");
  };

  const getAvailableActions = (status: string) => {
    switch (status) {
      case "pending": return [
        { value: "approve", label: "✅ Approve" },
        { value: "reject", label: "❌ Reject" },
      ];
      case "approved": return [
        { value: "set_processing", label: "🔄 Set Processing" },
        { value: "reject", label: "❌ Reject" },
      ];
      case "processing": return [
        { value: "complete", label: "💰 Mark as Paid" },
        { value: "reject", label: "❌ Reject" },
      ];
      case "under_review": return [
        { value: "approve", label: "✅ Approve" },
        { value: "reject", label: "❌ Reject" },
      ];
      default: return [];
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-0">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-orange-500" />
            <span className="text-xs text-muted-foreground">Pending</span>
          </div>
          <div className="text-2xl font-bold text-orange-500">{stats.pending}</div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 border-0">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-xs text-muted-foreground">Approved</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-0">
          <div className="flex items-center gap-2 mb-1">
            <Loader2 className="h-4 w-4 text-purple-500" />
            <span className="text-xs text-muted-foreground">Processing</span>
          </div>
          <div className="text-2xl font-bold text-purple-500">{stats.processing}</div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/20 border-0">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Total Paid</span>
          </div>
          <div className="text-2xl font-bold text-primary">${stats.totalPaid.toFixed(2)}</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Requests List */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <Wallet className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Withdrawal Requests</h3>
          <Badge variant="outline" className="ml-auto">{filtered.length} requests</Badge>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Wallet className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No withdrawal requests found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((req) => {
              const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
              const profile = req.ambassador_profiles;
              const ambassadorName = profile?.profiles?.full_name || "Unknown";
              const ambassadorEmail = profile?.profiles?.email || "—";
              const details = req.method_details as Record<string, string>;
              const firstDetailValue = Object.values(details)[0] || "";
              const availableActions = getAvailableActions(req.status);

              return (
                <div
                  key={req.id}
                  className="border border-border rounded-xl p-4 hover:bg-accent/20 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-sm">{ambassadorName}</span>
                        <Badge variant="outline" className="text-xs capitalize">{profile?.current_tier || "—"}</Badge>
                        <span className={`flex items-center gap-1 text-xs font-medium ${cfg.color}`}>
                          {cfg.icon} {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{ambassadorEmail}</p>
                      <div className="flex flex-wrap gap-3 text-sm">
                        <span className="font-bold text-primary">${req.amount.toFixed(2)} {req.currency}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{METHOD_LABELS[req.method_type] || req.method_type}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground truncate max-w-[200px]">{firstDetailValue}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(req.created_at), { addSuffix: true })}
                        {req.payment_reference && (
                          <span className="ml-2 font-mono">• Ref: {req.payment_reference}</span>
                        )}
                      </p>
                    </div>
                    {availableActions.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setSelectedRequest(req as AugmentedRequest); setAction(""); }}
                        className="flex-shrink-0"
                      >
                        Manage
                      </Button>
                    )}
                  </div>

                  {req.rejection_reason && (
                    <div className="mt-3 p-2 rounded bg-destructive/10 border border-destructive/20 text-xs text-destructive">
                      Reason: {req.rejection_reason}
                    </div>
                  )}
                  {req.admin_notes && (
                    <div className="mt-2 p-2 rounded bg-muted/50 text-xs text-muted-foreground">
                      Note: {req.admin_notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Manage Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Withdrawal</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 py-2">
              {/* Summary */}
              <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-bold text-primary">${selectedRequest.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method</span>
                  <span>{METHOD_LABELS[selectedRequest.method_type] || selectedRequest.method_type}</span>
                </div>
                {Object.entries(selectedRequest.method_details as Record<string, string>).map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-muted-foreground capitalize">{k.replace(/_/g, " ")}</span>
                    <span className="max-w-[60%] text-right break-all">{v}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ambassador</span>
                  <span>{selectedRequest.ambassador_profiles?.profiles?.full_name || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tier</span>
                  <span className="capitalize">{selectedRequest.tier_at_request}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Action</Label>
                <Select value={action} onValueChange={setAction}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select action..." />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableActions(selectedRequest.status).map(a => (
                      <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(action === "complete" || action === "set_processing") && (
                <div className="space-y-1.5">
                  <Label>Payment Reference (optional)</Label>
                  <Input
                    value={paymentRef}
                    onChange={e => setPaymentRef(e.target.value)}
                    placeholder="Tx hash, PayPal ID, etc."
                  />
                </div>
              )}

              {action === "reject" && (
                <div className="space-y-1.5">
                  <Label>Rejection Reason</Label>
                  <Textarea
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                    placeholder="Explain why this request is rejected..."
                    rows={3}
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label>Admin Notes (optional)</Label>
                <Textarea
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  placeholder="Internal notes..."
                  rows={2}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedRequest(null)}>Cancel</Button>
            <Button
              onClick={handleProcess}
              disabled={!action || processWithdrawal.isPending}
              variant={action === "reject" ? "destructive" : "default"}
            >
              {processWithdrawal.isPending ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
