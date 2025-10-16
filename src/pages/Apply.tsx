import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";

// Validation schema
const applicationSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  phone: z.string().trim().optional(),
  telegram: z.string().trim().optional(),
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
      // Validate input
      const validatedData = applicationSchema.parse({
        fullName,
        email,
        phone,
        telegram,
        socialLinks,
        experience,
        whyJoin,
        strategy,
      });

      // Check for existing application
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

      // Parse social links safely
      let parsedSocialLinks = null;
      if (validatedData.socialLinks) {
        try {
          // Split by newlines and create object
          const links = validatedData.socialLinks.split('\n').filter(l => l.trim());
          parsedSocialLinks = { links };
        } catch {
          parsedSocialLinks = { raw: validatedData.socialLinks };
        }
      }

      const { error } = await supabase
        .from('applications')
        .insert({
          user_id: user?.id || null,
          full_name: validatedData.fullName,
          email: validatedData.email,
          phone: validatedData.phone || null,
          telegram_username: validatedData.telegram || null,
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
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
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
          description: error?.message || "Failed to submit application. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
        <Card className="w-full max-w-md p-12 text-center">
          <div className="inline-flex p-4 rounded-full bg-success/10 mb-6">
            <CheckCircle2 className="h-12 w-12 text-success" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Application Submitted!</h1>
          <p className="text-muted-foreground mb-8">
            Thank you for applying to become a StarStore Ambassador. We'll review your application and contact you within 48 hours.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/">
              <Button>Back to Home</Button>
            </Link>
            {user && (
              <Link to="/dashboard">
                <Button variant="outline">Go to Dashboard</Button>
              </Link>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Become an Ambassador</h1>
          <p className="text-muted-foreground">
            Join our program and start earning up to 75% commission
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="John Doe"
                  aria-invalid={errors.fullName ? 'true' : 'false'}
                  aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                />
                {errors.fullName && (
                  <p id="fullName-error" className="text-sm text-destructive mt-1">{errors.fullName}</p>
                )}
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="text-sm text-destructive mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div>
                <Label htmlFor="telegram">Telegram Username</Label>
                <Input
                  id="telegram"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  placeholder="@username"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="socialLinks">Social Media Links</Label>
              <Textarea
                id="socialLinks"
                value={socialLinks}
                onChange={(e) => setSocialLinks(e.target.value)}
                placeholder="Instagram: @yourhandle&#10;TikTok: @yourhandle&#10;YouTube: channel link"
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">
                List your social media profiles (one per line)
              </p>
            </div>

            <div>
              <Label htmlFor="experience">Previous Marketing Experience *</Label>
              <Textarea
                id="experience"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                required
                placeholder="Tell us about your experience with affiliate marketing, social media promotion, or similar activities..."
                rows={4}
                aria-invalid={errors.experience ? 'true' : 'false'}
                aria-describedby={errors.experience ? 'experience-error' : undefined}
              />
              {errors.experience && (
                <p id="experience-error" className="text-sm text-destructive mt-1">{errors.experience}</p>
              )}
            </div>

            <div>
              <Label htmlFor="whyJoin">Why do you want to join our program? *</Label>
              <Textarea
                id="whyJoin"
                value={whyJoin}
                onChange={(e) => setWhyJoin(e.target.value)}
                required
                placeholder="Share your motivation for becoming a StarStore Ambassador..."
                rows={4}
                aria-invalid={errors.whyJoin ? 'true' : 'false'}
                aria-describedby={errors.whyJoin ? 'whyJoin-error' : undefined}
              />
              {errors.whyJoin && (
                <p id="whyJoin-error" className="text-sm text-destructive mt-1">{errors.whyJoin}</p>
              )}
            </div>

            <div>
              <Label htmlFor="strategy">How would you promote StarStore? *</Label>
              <Textarea
                id="strategy"
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                required
                placeholder="Describe your promotional strategy, target audience, and planned activities..."
                rows={4}
                aria-invalid={errors.strategy ? 'true' : 'false'}
                aria-describedby={errors.strategy ? 'strategy-error' : undefined}
              />
              {errors.strategy && (
                <p id="strategy-error" className="text-sm text-destructive mt-1">{errors.strategy}</p>
              )}
            </div>

            <div className="border-t pt-6">
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-4">
                By submitting, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </form>
        </Card>

        <div className="text-center mt-6">
          <Link to="/" className="text-primary hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Apply;