import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  DollarSign, Wallet, AlertCircle, ChevronRight, 
  Bitcoin, CreditCard, Globe, Building, CheckCircle2 
} from "lucide-react";
import { useCreateWithdrawal, usePayoutMethods } from "@/hooks/useWithdrawals";
import { getTierInfo } from "@/lib/tier-utils";
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
  email: "Email / Account",
  account_name: "Account Holder Name",
  account_number: "Account Number",
  bank_name: "Bank Name",
  routing_number: "Routing / SWIFT / IBAN",
  network: "Network (e.g. TRC20, ERC20)",
  coin: "Coin (e.g. USDT, ETH)",
};

const TIER_MINIMUMS: Record<string, number> = {
  entry: 10,
  growing: 20,
  advanced: 15,
  elite: 10,
};

interface WithdrawModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ambassadorProfile: Ambassador;
}

export const WithdrawModal = ({ open, onOpenChange, ambassadorProfile }: WithdrawModalProps) => {
  const [step, setStep] = useState<"amount" | "method" | "confirm">("amount");
  const [amount, setAmount] = useState("");
  const [selectedMethodType, setSelectedMethodType] = useState<keyof typeof METHOD_CONFIG | "">("");
  const [selectedSavedMethodId, setSelectedSavedMethodId] = useState<string>("");
  const [methodDetails, setMethodDetails] = useState<Record<string, string>>({});

  const tier = ambassadorProfile.current_tier || "entry";
  const minAmount = TIER_MINIMUMS[tier] ?? 10;
  const tierInfo = getTierInfo(tier);

  const { data: savedMethods = [] } = usePayoutMethods(ambassadorProfile.id);
  const createWithdrawal = useCreateWithdrawal(ambassadorProfile.id);

  // Available = pending_earnings minus any already in-flight (UI side)
  const available = ambassadorProfile.pending_earnings ?? 0;

  const amountNum = parseFloat(amount) || 0;
  const isAmountValid = amountNum >= minAmount && amountNum <= available;

  const selectedConfig = selectedMethodType ? METHOD_CONFIG[selectedMethodType] : null;
  const selectedSaved = savedMethods.find(m => m.id === selectedSavedMethodId);

  const effectiveMethodType = selectedSaved?.method_type || selectedMethodType;
  const effectiveDetails = selectedSaved ? selectedSaved.details : methodDetails;

  const isMethodReady = selectedSaved
    ? true
    : selectedMethodType && selectedConfig
      ? selectedConfig.fields.every(f => (methodDetails[f] || "").trim() !== "")
      : false;

  const handleFieldChange = (field: string, value: string) => {
    setMethodDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectSaved = (methodId: string) => {
    setSelectedSavedMethodId(methodId);
    setSelectedMethodType("");
    setMethodDetails({});
  };

  const handleSelectNew = (type: string) => {
    setSelectedSavedMethodId("");
    setSelectedMethodType(type as keyof typeof METHOD_CONFIG);
    setMethodDetails({});
  };

  const handleSubmit = async () => {
    await createWithdrawal.mutateAsync({
      amount: amountNum,
      method_type: effectiveMethodType as string,
      method_details: effectiveDetails as Record<string, string>,
      payout_method_id: selectedSavedMethodId || undefined,
    });
    onOpenChange(false);
    setStep("amount");
    setAmount("");
    setSelectedMethodType("");
    setSelectedSavedMethodId("");
    setMethodDetails({});
  };

  const renderStep = () => {
    if (step === "amount") {
      return (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-xs text-muted-foreground mb-1">Available Balance</p>
              <p className="text-2xl font-bold text-primary">${available.toFixed(2)}</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground mb-1">Your Tier</p>
              <p className="text-lg font-bold">{tierInfo.icon} {tierInfo.displayName}</p>
              <p className="text-xs text-muted-foreground">Min: ${minAmount}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="withdraw-amount">Withdrawal Amount (USD)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="withdraw-amount"
                type="number"
                step="0.01"
                min={minAmount}
                max={available}
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder={`Min $${minAmount}`}
                className="pl-9"
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Minimum: ${minAmount}</span>
              <button
                type="button"
                className="text-primary hover:underline font-medium"
                onClick={() => setAmount(available.toFixed(2))}
              >
                Withdraw All
              </button>
            </div>
          </div>

          {amountNum > 0 && !isAmountValid && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {amountNum < minAmount
                  ? `Minimum withdrawal is $${minAmount} for your tier.`
                  : `Amount exceeds available balance of $${available.toFixed(2)}.`}
              </AlertDescription>
            </Alert>
          )}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Withdrawals are processed within 2–5 business days. Your tier minimum is <strong>${minAmount}</strong>.
              Higher tiers unlock lower minimums.
            </AlertDescription>
          </Alert>

          <Button
            className="w-full"
            disabled={!isAmountValid}
            onClick={() => setStep("method")}
          >
            Continue <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      );
    }

    if (step === "method") {
      return (
        <div className="space-y-5">
          {savedMethods.length > 0 && (
            <>
              <div>
                <Label className="text-sm font-semibold mb-3 block">Saved Methods</Label>
                <div className="space-y-2">
                  {savedMethods.map(m => {
                    const cfg = METHOD_CONFIG[m.method_type as keyof typeof METHOD_CONFIG];
                    const Icon = cfg?.icon || Wallet;
                    const isSelected = selectedSavedMethodId === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleSelectSaved(m.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                          isSelected ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${cfg?.color}`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{m.label}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {Object.values(m.details)[0] || cfg?.label}
                          </p>
                        </div>
                        {m.is_default && <Badge variant="outline" className="text-xs">Default</Badge>}
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
              <Separator />
              <p className="text-sm font-semibold text-muted-foreground">Or use a new method</p>
            </>
          )}

          <div>
            <Label className="text-sm font-semibold mb-3 block">Select Payout Method</Label>
            <Select value={selectedMethodType} onValueChange={handleSelectNew}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a method..." />
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

          {selectedMethodType && selectedConfig && (
            <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border">
              <p className="text-sm font-medium">Enter {selectedConfig.label} Details</p>
              {selectedConfig.fields.map(field => (
                <div key={field} className="space-y-1">
                  <Label className="text-xs">{FIELD_LABELS[field] || field}</Label>
                  <Input
                    value={methodDetails[field] || ""}
                    onChange={e => handleFieldChange(field, e.target.value)}
                    placeholder={FIELD_LABELS[field]}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setStep("amount")} className="flex-1">
              Back
            </Button>
            <Button disabled={!isMethodReady} onClick={() => setStep("confirm")} className="flex-1">
              Review <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      );
    }

    if (step === "confirm") {
      const methodLabel = selectedSaved?.label
        || (selectedMethodType ? METHOD_CONFIG[selectedMethodType]?.label : "—");
      return (
        <div className="space-y-5">
          <div className="p-5 rounded-xl bg-primary/5 border border-primary/20 text-center">
            <p className="text-sm text-muted-foreground mb-1">You are withdrawing</p>
            <p className="text-4xl font-bold text-primary">${amountNum.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">USD</p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Method</span>
              <span className="font-medium">{methodLabel}</span>
            </div>
            {Object.entries(effectiveDetails).map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">{FIELD_LABELS[k] || k}</span>
                <span className="font-medium max-w-[60%] text-right break-all">{v}</span>
              </div>
            ))}
            <div className="flex justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Remaining Balance</span>
              <span className="font-medium text-success">${(available - amountNum).toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Est. Processing</span>
              <span className="font-medium">2–5 Business Days</span>
            </div>
          </div>

          <Alert>
            <CheckCircle2 className="h-4 w-4 text-success" />
            <AlertDescription className="text-xs">
              By confirming, you authorize this withdrawal. Funds will be sent after admin review and confirmation.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep("method")} className="flex-1">
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createWithdrawal.isPending}
              className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
            >
              {createWithdrawal.isPending ? "Submitting..." : "Confirm Withdrawal"}
            </Button>
          </div>
        </div>
      );
    }
  };

  const stepLabels = ["Amount", "Method", "Confirm"];
  const stepIndex = step === "amount" ? 0 : step === "method" ? 1 : 2;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Withdraw Earnings
          </DialogTitle>
          <DialogDescription>
            Transfer your earnings to your preferred payout method
          </DialogDescription>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-2">
          {stepLabels.map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-colors ${
                i <= stepIndex ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {i + 1}
              </div>
              <span className={`text-xs ${i === stepIndex ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                {label}
              </span>
              {i < stepLabels.length - 1 && (
                <div className={`h-0.5 flex-1 rounded ${i < stepIndex ? "bg-primary" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>

        {renderStep()}
      </DialogContent>
    </Dialog>
  );
};
