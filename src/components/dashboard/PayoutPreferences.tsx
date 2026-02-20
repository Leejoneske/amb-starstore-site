import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, Trash2, Star, Bitcoin, Globe, CreditCard, Building, Wallet
} from "lucide-react";
import { 
  usePayoutMethods, useAddPayoutMethod, useDeletePayoutMethod, useSetDefaultPayoutMethod,
  type PayoutMethod
} from "@/hooks/useWithdrawals";
import type { Ambassador } from "@/types";

const METHOD_CONFIG = {
  usdt_ton: { label: "USDT (TON Network)", icon: Bitcoin, color: "text-green-500", fields: ["wallet_address"] },
  paypal: { label: "PayPal", icon: Globe, color: "text-blue-500", fields: ["email"] },
  airtm: { label: "AirTM", icon: CreditCard, color: "text-purple-500", fields: ["email"] },
  bank_transfer: { label: "Bank Transfer", icon: Building, color: "text-orange-500", fields: ["account_name", "account_number", "bank_name", "routing_number"] },
  crypto_other: { label: "Other Crypto", icon: Bitcoin, color: "text-yellow-500", fields: ["wallet_address", "network", "coin"] },
};

const FIELD_LABELS: Record<string, string> = {
  wallet_address: "Wallet Address",
  email: "Email / Account ID",
  account_name: "Account Holder Name",
  account_number: "Account Number",
  bank_name: "Bank Name",
  routing_number: "Routing / SWIFT / IBAN",
  network: "Network (e.g. TRC20, ERC20)",
  coin: "Coin (e.g. USDT, ETH)",
};

interface PayoutPreferencesProps {
  ambassadorProfile: Ambassador;
}

export const PayoutPreferences = ({ ambassadorProfile }: PayoutPreferencesProps) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newMethodType, setNewMethodType] = useState<keyof typeof METHOD_CONFIG | "">("");
  const [newLabel, setNewLabel] = useState("");
  const [newDetails, setNewDetails] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data: methods = [], isLoading } = usePayoutMethods(ambassadorProfile.id);
  const addMethod = useAddPayoutMethod();
  const deleteMethod = useDeletePayoutMethod(ambassadorProfile.id);
  const setDefault = useSetDefaultPayoutMethod(ambassadorProfile.id);

  const selectedConfig = newMethodType ? METHOD_CONFIG[newMethodType] : null;

  const canAdd = newMethodType && newLabel.trim() && selectedConfig
    && selectedConfig.fields.every(f => (newDetails[f] || "").trim() !== "");

  const handleAdd = async () => {
    if (!canAdd) return;
    await addMethod.mutateAsync({
      ambassador_id: ambassadorProfile.id,
      method_type: newMethodType as PayoutMethod["method_type"],
      label: newLabel.trim(),
      details: newDetails,
      is_default: methods.length === 0, // auto-default if first method
    });
    setShowAddDialog(false);
    setNewMethodType("");
    setNewLabel("");
    setNewDetails({});
  };

  const handleTypeChange = (type: string) => {
    setNewMethodType(type as keyof typeof METHOD_CONFIG);
    setNewDetails({});
  };

  if (isLoading) {
    return (
      <Card className="p-6 space-y-3">
        <div className="h-5 bg-muted animate-pulse rounded w-40" />
        <div className="h-16 bg-muted animate-pulse rounded" />
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-semibold font-serif flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Payout Methods
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage where your earnings are sent
            </p>
          </div>
          <Button size="sm" onClick={() => setShowAddDialog(true)} variant="outline">
            <Plus className="h-4 w-4 mr-1" />
            Add Method
          </Button>
        </div>

        {methods.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground border border-dashed border-border rounded-xl">
            <Wallet className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className="font-medium">No payout methods yet</p>
            <p className="text-sm mt-1">Add a method to enable withdrawals</p>
            <Button size="sm" variant="outline" className="mt-4" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add First Method
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {methods.map(method => {
              const cfg = METHOD_CONFIG[method.method_type as keyof typeof METHOD_CONFIG];
              const Icon = cfg?.icon || Wallet;
              return (
                <div
                  key={method.id}
                  className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-accent/30 transition-colors"
                >
                  <div className={`p-2 rounded-lg bg-muted`}>
                    <Icon className={`h-5 w-5 ${cfg?.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{method.label}</span>
                      {method.is_default && (
                        <Badge variant="outline" className="text-xs py-0 border-primary/30 text-primary">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          Default
                        </Badge>
                      )}
                      {method.is_verified && (
                        <Badge variant="outline" className="text-xs py-0 border-success/30 text-success">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {cfg?.label} • {Object.values(method.details)[0] || "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!method.is_default && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs h-8"
                        onClick={() => setDefault.mutate({ methodId: method.id })}
                        disabled={setDefault.isPending}
                      >
                        Set Default
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive h-8 w-8 p-0"
                      onClick={() => setDeleteTarget(method.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Add Method Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Payout Method</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Method Type</Label>
              <Select value={newMethodType} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(METHOD_CONFIG).map(([key, cfg]) => {
                    const Icon = cfg.icon;
                    return (
                      <SelectItem key={key} value={key}>
                        <span className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${cfg.color}`} />
                          {cfg.label}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Label (e.g. "My PayPal")</Label>
              <Input
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                placeholder="Friendly name for this method"
                maxLength={60}
              />
            </div>

            {selectedConfig && (
              <>
                <Separator />
                <div className="space-y-3">
                  <p className="text-sm font-medium">{selectedConfig.label} Details</p>
                  {selectedConfig.fields.map(field => (
                    <div key={field} className="space-y-1.5">
                      <Label className="text-xs">{FIELD_LABELS[field] || field}</Label>
                      <Input
                        value={newDetails[field] || ""}
                        onChange={e => setNewDetails(prev => ({ ...prev, [field]: e.target.value }))}
                        placeholder={FIELD_LABELS[field]}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!canAdd || addMethod.isPending}>
              {addMethod.isPending ? "Saving..." : "Add Method"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove Method?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This payout method will be permanently removed. Active withdrawal requests using this method won't be affected.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => { deleteMethod.mutate(deleteTarget!); setDeleteTarget(null); }}
              disabled={deleteMethod.isPending}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
