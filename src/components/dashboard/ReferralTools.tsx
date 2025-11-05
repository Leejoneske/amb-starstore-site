import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Share2, Check, ExternalLink, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
import { generateTelegramReferralLink, TELEGRAM_CONFIG } from "@/config/telegram";

interface ReferralToolsProps {
  referralCode: string;
}

export const ReferralTools = ({ referralCode }: ReferralToolsProps) => {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const { toast } = useToast();
  
  const webReferralUrl = `${window.location.origin}?ref=${referralCode}`;
  const telegramReferralUrl = generateTelegramReferralLink(referralCode);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(label);
      toast({
        title: "Copied! 📋",
        description: `${label} copied to clipboard`,
      });
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      logger.error('Copy to clipboard failed', { label }, err as Error);
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const shareReferral = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join StarStore',
          text: `Join StarStore using my referral code: ${referralCode}`,
          url: telegramReferralUrl,
        });
      } catch (err) {
        logger.info('Share operation cancelled by user');
      }
    } else {
      copyToClipboard(telegramReferralUrl, 'Telegram referral link');
    }
  };

  return (
    <Card className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base md:text-lg font-semibold font-serif">Referral Tools</h3>
        <Button variant="ghost" size="sm" onClick={shareReferral} className="h-8 w-8 p-0">
          <Share2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {/* Referral Code */}
        <div>
          <label className="text-xs sm:text-sm font-medium text-muted-foreground mb-2 block">
            Your Referral Code
          </label>
          <div className="flex gap-2">
            <Input 
              value={referralCode} 
              readOnly 
              className="font-mono font-semibold text-base sm:text-lg h-10 sm:h-11 bg-muted text-center"
            />
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => copyToClipboard(referralCode, 'Referral code')}
              className="h-10 w-10 sm:h-11 sm:w-11 shrink-0"
            >
              {copiedItem === 'Referral code' ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Telegram Referral Link */}
        <div>
          <label className="text-xs sm:text-sm font-medium text-muted-foreground mb-2 block flex items-center gap-1">
            <MessageCircle className="h-3 w-3" />
            Telegram Referral Link
          </label>
          <div className="flex gap-2">
            <Input 
              value={telegramReferralUrl} 
              readOnly 
              className="text-xs sm:text-sm h-10 sm:h-11 truncate bg-muted"
            />
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => copyToClipboard(telegramReferralUrl, 'Telegram referral link')}
              className="h-10 w-10 sm:h-11 sm:w-11 shrink-0"
            >
              {copiedItem === 'Telegram referral link' ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => window.open(telegramReferralUrl, '_blank')}
              className="h-10 w-10 sm:h-11 sm:w-11 shrink-0"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Web Referral Link */}
        <div>
          <label className="text-xs sm:text-sm font-medium text-muted-foreground mb-2 block">
            Web Referral Link
          </label>
          <div className="flex gap-2">
            <Input 
              value={webReferralUrl} 
              readOnly 
              className="text-xs sm:text-sm h-10 sm:h-11 truncate bg-muted"
            />
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => copyToClipboard(webReferralUrl, 'Web referral link')}
              className="h-10 w-10 sm:h-11 sm:w-11 shrink-0"
            >
              {copiedItem === 'Web referral link' ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Info Section */}
        <div className="pt-3 sm:pt-4 border-t border-border">
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Share your referral code or link to earn commissions on every transaction your referrals make!
          </p>
        </div>
      </div>
    </Card>
  );
};
