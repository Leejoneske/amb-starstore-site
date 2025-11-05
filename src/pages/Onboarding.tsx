// @ts-nocheck
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAmbassadorProfile } from "@/hooks/useAmbassadorProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  CheckCircle2, 
  MessageCircle, 
  Share2, 
  Copy, 
  ExternalLink,
  ArrowRight,
  Sparkles,
  Users,
  DollarSign
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { generateTelegramReferralLink, generateReferralCode, TELEGRAM_CONFIG } from "@/config/telegram";
import { starStoreService } from "@/services/starStoreService";
import { ADMIN_EMAIL } from "@/config/env";

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [telegramId, setTelegramId] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");
  const [referralCodeInput, setReferralCodeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();
  const { ambassadorProfile, isLoading: profileLoading, refetch } = useAmbassadorProfile(user?.id);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if user has already completed onboarding
  useEffect(() => {
    // Redirect admin to admin dashboard
    if (user?.email === ADMIN_EMAIL) {
      navigate("/admin");
      return;
    }

    if (ambassadorProfile && !profileLoading) {
      // If user has telegram_id and referral_code, they've completed onboarding
      if (ambassadorProfile.telegram_id && ambassadorProfile.referral_code) {
        navigate("/dashboard");
        return;
      }

      // If they have referral code but no telegram, start at telegram step
      if (ambassadorProfile.referral_code && !ambassadorProfile.telegram_id) {
        setCurrentStep(1);
        return;
      }

      // If they have telegram but no referral code, start at referral step
      if (ambassadorProfile.telegram_id && !ambassadorProfile.referral_code) {
        setCurrentStep(2);
        setTelegramId(ambassadorProfile.telegram_id);
        setTelegramUsername(ambassadorProfile.telegram_username || "");
        return;
      }
    }
  }, [ambassadorProfile, profileLoading, navigate, user]);

  const steps = [
    {
      title: "Welcome to StarStore!",
      description: "Let's get you set up as an ambassador",
      icon: <Sparkles className="h-6 w-6" />,
    },
    {
      title: "Connect Telegram",
      description: "Link your Telegram account to track referrals",
      icon: <MessageCircle className="h-6 w-6" />,
    },
    {
      title: "Your Referral Tools",
      description: "Get your unique referral code and start earning",
      icon: <Share2 className="h-6 w-6" />,
    },
  ];

  const handleTelegramConnection = async () => {
    if (!telegramId.trim()) {
      toast({
        title: "Telegram ID Required",
        description: "Please enter your Telegram user ID to continue.",
        variant: "destructive",
      });
      return;
    }

    // Basic format validation
    const telegramIdTrimmed = telegramId.trim();
    if (!/^\d+$/.test(telegramIdTrimmed) || telegramIdTrimmed.length < 5) {
      toast({
        title: "Invalid Telegram ID",
        description: "Telegram ID must be numeric and at least 5 digits long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Verify the Telegram ID format and optionally with Star Store
      const verificationResponse = await starStoreService.verifyTelegramUser(telegramIdTrimmed);
      
      if (!verificationResponse.success) {
        throw new Error(verificationResponse.error || 'Invalid Telegram ID format');
      }

      // Update ambassador profile with Telegram connection using secure function
      console.log('🚀 ONBOARDING: Using secure function to connect Telegram ID:', telegramIdTrimmed);
      
      const { data: functionResult, error: functionError } = await supabase
        .rpc('update_ambassador_telegram_info', {
          p_telegram_id: telegramIdTrimmed,
          p_telegram_username: telegramUsername.trim() || null
        });

      if (functionError) {
        console.error('Onboarding: Function error:', functionError);
        
        if (functionError.message?.includes('function') && functionError.message?.includes('does not exist')) {
          throw new Error('Database function not found. Please contact support - the system needs to be configured.');
        }
        
        throw functionError;
      }

      if (!functionResult?.success) {
        console.error('Onboarding: Function returned error:', functionResult);
        throw new Error(functionResult?.error || 'Failed to connect Telegram account');
      }

      console.log('✅ Onboarding: Telegram connected successfully:', functionResult);

      // Try to sync ambassador data with Star Store (non-blocking)
      if (ambassadorProfile) {
        try {
          await starStoreService.syncAmbassadorData(telegramIdTrimmed, {
            email: ambassadorProfile.profiles?.email || '',
            fullName: ambassadorProfile.profiles?.full_name || '',
            tier: ambassadorProfile.current_tier,
            referralCode: ambassadorProfile.referral_code
          });
        } catch (syncError) {
          // Log but don't fail the connection if sync fails
          console.warn('StarStore sync failed:', syncError);
        }
      }

      await refetch();
      
      toast({
        title: "Telegram Connected! 🎉",
        description: "Your Telegram account has been successfully linked.",
      });

      // Move to next step
      setCurrentStep(2);
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect Telegram account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetReferralCode = async (code: string) => {
    if (!ambassadorProfile) return;
    if (!code.trim()) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid referral code",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Update ambassador profile with user's referral code
      const { error } = await supabase
        .from('ambassador_profiles')
        .update({
          referral_code: code.trim().toUpperCase(),
          updated_at: new Date().toISOString()
        })
        .eq('id', ambassadorProfile.id);

      if (error) throw error;

      // Sync with Star Store if telegram is connected
      if (ambassadorProfile.telegram_id) {
        await starStoreService.syncAmbassadorData(ambassadorProfile.telegram_id, {
          email: ambassadorProfile.profiles?.email || '',
          fullName: ambassadorProfile.profiles?.full_name || '',
          tier: ambassadorProfile.current_tier,
          referralCode: code.trim().toUpperCase()
        });
      }

      await refetch();
      
      toast({
        title: "Referral Code Set! 🚀",
        description: "Your StarStore referral code has been connected.",
      });

    } catch (error) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to set referral code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const finishOnboarding = async () => {
    // Mark onboarding as complete by setting first_login_at
    if (ambassadorProfile?.id && !ambassadorProfile.first_login_at) {
      await supabase
        .from('ambassador_profiles')
        .update({ 
          first_login_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', ambassadorProfile.id);
    }
    
    toast({
      title: "Welcome to StarStore! 🎉",
      description: "You're all set up and ready to start earning commissions!",
    });
    navigate("/dashboard");
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <img 
              src="/favicon.ico" 
              alt="StarStore" 
              className="w-8 h-8"
            />
            <h1 className="text-3xl font-bold">StarStore Ambassador</h1>
          </div>
          <p className="text-muted-foreground">Let's get you set up in just a few steps</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Step {currentStep + 1} of {steps.length}</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
              {steps[currentStep].icon}
            </div>
            <CardTitle>{steps[currentStep].title}</CardTitle>
            <CardDescription>{steps[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Step 0: Welcome */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold">Refer Users</h3>
                    <p className="text-sm text-muted-foreground">Share your unique referral code</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <DollarSign className="h-8 w-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold">Earn Commissions</h3>
                    <p className="text-sm text-muted-foreground">Get paid for every transaction</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <Sparkles className="h-8 w-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold">Level Up</h3>
                    <p className="text-sm text-muted-foreground">Unlock higher commission rates</p>
                  </div>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Welcome {ambassadorProfile?.profiles?.full_name || 'Ambassador'}! 👋
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    You've been approved as a StarStore ambassador. Let's connect your Telegram account 
                    and set up your referral tools so you can start earning commissions right away!
                  </p>
                </div>

                <Button onClick={() => setCurrentStep(1)} className="w-full" size="lg">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Step 1: Telegram Connection */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="telegram-id">Telegram User ID *</Label>
                    <Input
                      id="telegram-id"
                      type="text"
                      placeholder="123456789"
                      value={telegramId}
                      onChange={(e) => setTelegramId(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Your numeric Telegram user ID (not username). Get it from @userinfobot
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telegram-username">Telegram Username (Optional)</Label>
                    <Input
                      id="telegram-username"
                      type="text"
                      placeholder="username"
                      value={telegramUsername}
                      onChange={(e) => setTelegramUsername(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Your @username (without the @)
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    How to find your Telegram ID:
                  </h4>
                  <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                    <li>Open Telegram and search for @userinfobot</li>
                    <li>Start a chat with the bot</li>
                    <li>Send any message to get your user information</li>
                    <li>Copy the "Id" number (not the username)</li>
                  </ol>
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep(0)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleTelegramConnection}
                    disabled={loading || !telegramId.trim()}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        Connect Telegram
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Referral Setup */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {/* Connection Status */}
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium text-green-900 dark:text-green-100">Telegram Connected</p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        ID: {ambassadorProfile?.telegram_id} 
                        {ambassadorProfile?.telegram_username && ` (@${ambassadorProfile.telegram_username})`}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                    Connected
                  </Badge>
                </div>

                {/* Referral Code Setup */}
                {!ambassadorProfile?.referral_code ? (
                  <div className="space-y-4">
                    <div className="text-center p-6 bg-muted/50 rounded-lg">
                      <Share2 className="h-12 w-12 text-primary mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Enter Your StarStore Referral Code</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Use the same referral code from your StarStore app
                      </p>
                      <div className="max-w-sm mx-auto space-y-3">
                        <Input
                          placeholder="Enter your referral code"
                          value={referralCodeInput}
                          onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
                          className="text-center text-lg font-mono"
                        />
                        <Button 
                          onClick={() => handleSetReferralCode(referralCodeInput)}
                          disabled={loading || !referralCodeInput.trim()}
                          size="lg"
                          className="w-full"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Setting Code...
                            </>
                          ) : (
                            <>
                              Set Referral Code
                              <Sparkles className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Referral Code */}
                    <div className="space-y-2">
                      <Label>Your Referral Code</Label>
                      <div className="flex gap-2">
                        <Input 
                          value={ambassadorProfile.referral_code} 
                          readOnly 
                          className="font-mono font-semibold text-lg"
                        />
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => copyToClipboard(ambassadorProfile.referral_code, "Referral code")}
                        >
                          {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    {/* Telegram Referral Link */}
                    <div className="space-y-2">
                      <Label>Telegram Referral Link</Label>
                      <div className="flex gap-2">
                        <Input 
                          value={generateTelegramReferralLink(ambassadorProfile.referral_code)} 
                          readOnly 
                          className="text-sm"
                        />
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => copyToClipboard(
                            generateTelegramReferralLink(ambassadorProfile.referral_code), 
                            "Telegram referral link"
                          )}
                        >
                          {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    {/* Web Referral Link */}
                    <div className="space-y-2">
                      <Label>Web Referral Link</Label>
                      <div className="flex gap-2">
                        <Input 
                          value={`${window.location.origin}?ref=${ambassadorProfile.referral_code}`} 
                          readOnly 
                          className="text-sm"
                        />
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => copyToClipboard(
                            `${window.location.origin}?ref=${ambassadorProfile.referral_code}`, 
                            "Web referral link"
                          )}
                        >
                          {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => window.open(`https://t.me/${TELEGRAM_CONFIG.BOT_USERNAME}`, '_blank')}
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Open StarStore Bot
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => copyToClipboard(
                          generateTelegramReferralLink(ambassadorProfile.referral_code), 
                          "Referral link"
                        )}
                        className="flex items-center gap-2"
                      >
                        <Copy className="h-4 w-4" />
                        Copy Telegram Link
                      </Button>
                    </div>

                    {/* Success Message */}
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                      <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                        🎉 You're All Set!
                      </h4>
                      <p className="text-sm text-green-800 dark:text-green-200">
                        Your referral tools are ready! Share your referral code or links to start earning 
                        commissions on every transaction your referrals make.
                      </p>
                    </div>

                    {/* Finish Button */}
                    <Button onClick={finishOnboarding} className="w-full" size="lg">
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step Indicators */}
        <div className="flex justify-center space-x-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${
                index <= currentStep 
                  ? 'bg-primary' 
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;