import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle2, 
  Send, 
  ExternalLink, 
  User, 
  Mail, 
  Phone, 
  MessageCircle,
  Share2,
  FileText,
  Target,
  Sparkles,
  ArrowRight,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";
import { cn } from "@/lib/utils";

const applicationSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  phone: z.string().trim().optional(),
  telegram: z.string().trim().optional(),
  telegramId: z.string().trim().min(5, "Telegram ID must be at least 5 digits").regex(/^\d+$/, "Telegram ID must be numeric"),
  socialLinks: z.string().trim().max(1000).optional(),
  experience: z.string().trim().min(10, "Please provide more detail").max(2000),
  whyJoin: z.string().trim().min(10, "Please provide more detail").max(2000),
  strategy: z.string().trim().min(10, "Please provide more detail").max(2000),
});

const Apply = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [telegram, setTelegram] = useState("");
  const [telegramId, setTelegramId] = useState("");
  const [socialLinks, setSocialLinks] = useState("");
  const [experience, setExperience] = useState("");
  const [whyJoin, setWhyJoin] = useState("");
  const [strategy, setStrategy] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const validatedData = applicationSchema.parse({
        fullName, email, phone, telegram, telegramId,
        socialLinks, experience, whyJoin, strategy,
      });

      const { data: existing } = await supabase
        .from('applications')
        .select('id')
        .eq('email', validatedData.email)
        .eq('status', 'pending')
        .maybeSingle();

      if (existing) {
        toast({
          title: "Application Already Exists",
          description: "You have already submitted an application. Please wait for review.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      let parsedSocialLinks = null;
      if (validatedData.socialLinks) {
        const links = validatedData.socialLinks.split('\n').filter(l => l.trim());
        parsedSocialLinks = { links };
      }

      const { error } = await supabase.from('applications').insert({
        user_id: user?.id || null,
        full_name: validatedData.fullName,
        email: validatedData.email,
        phone: validatedData.phone || null,
        telegram_username: validatedData.telegram || null,
        telegram_id: validatedData.telegramId,
        referral_code: validatedData.telegramId,
        social_media_links: parsedSocialLinks,
        experience: validatedData.experience,
        why_join: validatedData.whyJoin,
        referral_strategy: validatedData.strategy,
      });

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: "Application Submitted!",
        description: "We'll review your application and get back to you soon.",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
        });
        setErrors(fieldErrors);
        toast({
          title: "Validation Error",
          description: "Please check the form for errors.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to submit application.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-lg border-0 shadow-xl">
          <CardContent className="pt-12 pb-8 text-center">
            <div className="relative mx-auto w-fit mb-6">
              <div className="absolute inset-0 animate-pulse rounded-full bg-success/20 blur-xl" />
              <div className="relative p-5 rounded-full bg-success/10 ring-4 ring-success/20">
                <CheckCircle2 className="h-14 w-14 text-success" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold mb-3">Application Submitted!</h1>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              Thank you for applying to become a StarStore Ambassador. We'll review your application and contact you within 48 hours.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/">
                <Button size="lg" className="gap-2">
                  Back to Home
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              {user && (
                <Link to="/dashboard">
                  <Button size="lg" variant="outline">Go to Dashboard</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const InputField = ({ 
    id, label, icon: Icon, value, onChange, type = "text", 
    placeholder, required = false, error 
  }: { 
    id: string; label: string; icon: React.ElementType; 
    value: string; onChange: (v: string) => void; 
    type?: string; placeholder: string; required?: boolean; error?: string;
  }) => (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center gap-2 text-sm font-medium">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={cn("h-11", error && "border-destructive")}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-background py-8 sm:py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            Ambassador Program
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold">Become an Ambassador</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Join our program and start earning up to 75% commission on every referral
          </p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Info Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  <User className="h-4 w-4" />
                  Personal Information
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <InputField
                    id="fullName"
                    label="Full Name"
                    icon={User}
                    value={fullName}
                    onChange={setFullName}
                    placeholder="John Doe"
                    required
                    error={errors.fullName}
                  />
                  <InputField
                    id="email"
                    label="Email"
                    icon={Mail}
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="you@example.com"
                    required
                    error={errors.email}
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <InputField
                    id="phone"
                    label="Phone Number"
                    icon={Phone}
                    type="tel"
                    value={phone}
                    onChange={setPhone}
                    placeholder="+1 (555) 000-0000"
                  />
                  <InputField
                    id="telegram"
                    label="Telegram Username"
                    icon={MessageCircle}
                    value={telegram}
                    onChange={setTelegram}
                    placeholder="@username"
                  />
                </div>
              </div>

              {/* Telegram ID Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  <MessageCircle className="h-4 w-4" />
                  Telegram Integration
                </div>
                
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-4">
                  <div className="flex gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 h-fit">
                      <MessageCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium text-sm">Your Telegram ID is required</p>
                      <p className="text-xs text-muted-foreground">
                        This will be your unique referral code. To find your Telegram ID, message{" "}
                        <a 
                          href="https://t.me/userinfobot" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center gap-1 font-medium"
                        >
                          @userinfobot
                          <ExternalLink className="h-3 w-3" />
                        </a>{" "}
                        on Telegram.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telegramId" className="text-sm font-medium">
                      Telegram ID <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="telegramId"
                      value={telegramId}
                      onChange={(e) => setTelegramId(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456789"
                      required
                      className={cn("h-11 font-mono", errors.telegramId && "border-destructive")}
                    />
                    {errors.telegramId && (
                      <p className="text-sm text-destructive">{errors.telegramId}</p>
                    )}
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Badge variant="secondary" className="text-xs">Note</Badge>
                      This number will also be your referral code
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Media Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  <Share2 className="h-4 w-4" />
                  Social Presence
                </div>
                <div className="space-y-2">
                  <Label htmlFor="socialLinks">Social Media Links</Label>
                  <Textarea
                    id="socialLinks"
                    value={socialLinks}
                    onChange={(e) => setSocialLinks(e.target.value)}
                    placeholder={"Instagram: @yourhandle\nTikTok: @yourhandle\nYouTube: channel link"}
                    rows={3}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    List your social media profiles (one per line)
                  </p>
                </div>
              </div>

              {/* Experience Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  <FileText className="h-4 w-4" />
                  Your Experience
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="experience">
                    Previous Marketing Experience <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="experience"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="Tell us about your experience with affiliate marketing, social media promotion, or similar activities..."
                    rows={4}
                    required
                    className={cn("resize-none", errors.experience && "border-destructive")}
                  />
                  {errors.experience && <p className="text-sm text-destructive">{errors.experience}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whyJoin">
                    Why do you want to join? <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="whyJoin"
                    value={whyJoin}
                    onChange={(e) => setWhyJoin(e.target.value)}
                    placeholder="Share your motivation for becoming a StarStore Ambassador..."
                    rows={4}
                    required
                    className={cn("resize-none", errors.whyJoin && "border-destructive")}
                  />
                  {errors.whyJoin && <p className="text-sm text-destructive">{errors.whyJoin}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="strategy" className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    How would you promote StarStore? <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="strategy"
                    value={strategy}
                    onChange={(e) => setStrategy(e.target.value)}
                    placeholder="Describe your promotional strategy..."
                    rows={4}
                    required
                    className={cn("resize-none", errors.strategy && "border-destructive")}
                  />
                  {errors.strategy && <p className="text-sm text-destructive">{errors.strategy}</p>}
                </div>
              </div>

              {/* Submit */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="flex-1 gap-2" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit Application
                    </>
                  )}
                </Button>
                <Link to="/" className="flex-1">
                  <Button type="button" variant="outline" size="lg" className="w-full">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link to="/auth" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Apply;
