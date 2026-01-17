import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle2, 
  Send, 
  ExternalLink, 
  User, 
  Mail, 
  MessageCircle,
  ArrowRight,
  Loader2,
  Sparkles,
  Shield,
  Clock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";
import { cn } from "@/lib/utils";

const applicationSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  telegram: z.string().trim().optional(),
  telegramId: z.string().trim().min(5, "Telegram ID must be at least 5 digits").regex(/^\d+$/, "Telegram ID must be numeric"),
  experience: z.string().trim().min(10, "Please provide more detail").max(2000),
  whyJoin: z.string().trim().min(10, "Please provide more detail").max(2000),
});

// InputField component defined OUTSIDE the main component to prevent re-creation
interface InputFieldProps {
  id: string;
  label: string;
  icon: React.ElementType;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder: string;
  required?: boolean;
  error?: string;
}

const InputField = ({ 
  id, label, icon: Icon, value, onChange, type = "text", 
  placeholder, required = false, error 
}: InputFieldProps) => (
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

const Apply = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [telegram, setTelegram] = useState("");
  const [telegramId, setTelegramId] = useState("");
  const [experience, setExperience] = useState("");
  const [whyJoin, setWhyJoin] = useState("");
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
        fullName, email, telegram, telegramId, experience, whyJoin,
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

      const { data: applicationData, error } = await supabase.from('applications').insert({
        user_id: user?.id || null,
        full_name: validatedData.fullName,
        email: validatedData.email,
        telegram_username: validatedData.telegram || null,
        telegram_id: validatedData.telegramId,
        referral_code: validatedData.telegramId,
        experience: validatedData.experience,
        why_join: validatedData.whyJoin,
      }).select('id').single();

      if (error) throw error;

      // Send welcome email asynchronously (don't block submission)
      try {
        await supabase.functions.invoke('send-welcome-email', {
          body: {
            to: validatedData.email,
            fullName: validatedData.fullName,
            applicationId: applicationData?.id
          }
        });
        console.log('Welcome email sent successfully');
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
      }

      setSubmitted(true);
      toast({
        title: "Application Submitted!",
        description: "We'll review your application and get back to you soon. Check your email for confirmation.",
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-muted/30 to-background p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl">
          <CardContent className="pt-12 pb-10 text-center">
            <div className="relative mx-auto w-fit mb-8">
              <div className="absolute inset-0 animate-pulse rounded-full bg-emerald-500/20 blur-xl" />
              <div className="relative p-5 rounded-full bg-emerald-500/10 ring-4 ring-emerald-500/20">
                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold mb-3">Application Submitted!</h1>
            <p className="text-muted-foreground mb-8 text-sm max-w-xs mx-auto leading-relaxed">
              Thank you for applying. We'll review your application and contact you within 24-48 hours.
            </p>
            
            <div className="flex flex-col gap-3">
              <Link to="/">
                <Button size="lg" className="w-full gap-2">
                  Back to Home
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              {user && (
                <Link to="/dashboard">
                  <Button size="lg" variant="outline" className="w-full">
                    Go to Dashboard
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background py-10 px-4">
      <div className="container mx-auto max-w-lg">
        {/* Header */}
        <div className="text-center mb-8 space-y-3">
          <Badge variant="outline" className="px-4 py-1.5">
            <Sparkles className="h-3.5 w-3.5 mr-2" />
            Ambassador Program
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold">Join StarStore</h1>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Apply to become an ambassador and start earning commissions
          </p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <InputField
                  id="fullName"
                  label="Full Name"
                  icon={User}
                  value={fullName}
                  onChange={setFullName}
                  placeholder="Your full name"
                  required
                  error={errors.fullName}
                />
                <InputField
                  id="email"
                  label="Email Address"
                  icon={Mail}
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="you@example.com"
                  required
                  error={errors.email}
                />
                <InputField
                  id="telegram"
                  label="Telegram Username"
                  icon={MessageCircle}
                  value={telegram}
                  onChange={setTelegram}
                  placeholder="@username (optional)"
                />
              </div>

              {/* Telegram ID */}
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-4">
                <div className="flex gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 h-fit">
                    <MessageCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm mb-1">Telegram ID Required</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Your Telegram ID becomes your referral code. Find it by messaging{" "}
                      <a 
                        href="https://t.me/userinfobot" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1 font-medium"
                      >
                        @userinfobot
                        <ExternalLink className="h-3 w-3" />
                      </a>
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
                </div>
              </div>

              {/* Experience */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-sm font-medium">
                    Tell us about yourself <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="experience"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="Share your experience with marketing, social media, or community building..."
                    rows={3}
                    required
                    className={cn("resize-none", errors.experience && "border-destructive")}
                  />
                  {errors.experience && <p className="text-sm text-destructive">{errors.experience}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whyJoin" className="text-sm font-medium">
                    Why do you want to join? <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="whyJoin"
                    value={whyJoin}
                    onChange={(e) => setWhyJoin(e.target.value)}
                    placeholder="What motivates you to become a StarStore Ambassador?"
                    rows={3}
                    required
                    className={cn("resize-none", errors.whyJoin && "border-destructive")}
                  />
                  {errors.whyJoin && <p className="text-sm text-destructive">{errors.whyJoin}</p>}
                </div>
              </div>

              {/* Submit */}
              <Button 
                type="submit" 
                size="lg" 
                className="w-full gap-2 shadow-lg shadow-primary/20" 
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

              {/* Trust indicators */}
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
                <div className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Secure</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-blue-500" />
                  <span>24-48h Review</span>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Back link */}
        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Apply;
