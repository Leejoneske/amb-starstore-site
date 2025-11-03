import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Share2, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

interface ReferralToolsProps {
  referralCode: string;
}

export const ReferralTools = ({ referralCode }: ReferralToolsProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const referralUrl = `${window.location.origin}?ref=${referralCode}`;

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareReferral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join StarStore',
          text: 'Sign up with my referral code!',
          url: referralUrl,
        });
      } catch (err) {
        logger.info('Share operation cancelled by user');
      }
    } else {
      copyToClipboard(referralUrl);
    }
  };

  return (
    <Card className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base md:text-lg font-semibold">Referral Tools</h3>
        <Button variant="ghost" size="sm" onClick={shareReferral} className="h-8 w-8 p-0">
          <Share2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <div>
          <label className="text-xs sm:text-sm text-muted-foreground mb-2 block">Your Referral Code</label>
          <div className="flex gap-2">
            <Input 
              value={referralCode} 
              readOnly 
              className="font-mono font-semibold text-base sm:text-lg h-10 sm:h-11"
            />
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => copyToClipboard(referralCode)}
              className="h-10 w-10 sm:h-11 sm:w-11 shrink-0"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div>
          <label className="text-xs sm:text-sm text-muted-foreground mb-2 block">Referral Link</label>
          <div className="flex gap-2">
            <Input 
              value={referralUrl} 
              readOnly 
              className="text-xs sm:text-sm h-10 sm:h-11 truncate"
            />
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => copyToClipboard(referralUrl)}
              className="h-10 w-10 sm:h-11 sm:w-11 shrink-0"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="pt-3 sm:pt-4 border-t border-border">
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Share your referral code or link to earn commissions on every transaction your referrals make!
          </p>
        </div>
      </div>
    </Card>
  );
};
