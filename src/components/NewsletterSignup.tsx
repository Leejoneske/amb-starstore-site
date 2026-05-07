import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, CheckCircle2, Loader2 } from "lucide-react";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";

const NewsletterSignup = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    if (!supabase) {
      setError("Newsletter signup is temporarily unavailable. Please try again later.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Check if email already subscribed using secure RPC (no public SELECT)
      const { data: alreadySubscribed, error: rpcError } = await supabase
        .rpc("check_newsletter_email", { p_email: email.toLowerCase().trim() });

      if (rpcError) throw rpcError;

      if (alreadySubscribed) {
        setError("This email is already subscribed!");
        setLoading(false);
        return;
      }

      const { error: insertError } = await supabase
        .from("newsletter_subscribers")
        .insert({ email: email.toLowerCase().trim() } as never);

      if (insertError) throw insertError;

      setSubmitted(true);
      setEmail("");
    } catch (err: unknown) {
      console.error("Newsletter signup error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="newsletter" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-6">
          <Mail className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4" style={{ fontFamily: "'Libre Baskerville', serif", lineHeight: 1.15 }}>
          Stay in the Loop
        </h2>
        <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto" style={{ textWrap: "pretty" as never }}>
          Get the latest program updates, earning tips, new level announcements, and exclusive ambassador resources delivered straight to your inbox.
        </p>

        {submitted ? (
          <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 py-4 px-6 rounded-xl animate-fade-in">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">You're subscribed! Check your inbox soon.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              disabled={!isSupabaseConfigured || loading}
              required
              className="flex-1 h-12"
            />
            <Button type="submit" size="lg" className="h-12 px-8 active:scale-[0.97] transition-transform" disabled={!isSupabaseConfigured || loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subscribe"}
            </Button>
          </form>
        )}
        {error && (
          <p className="text-sm text-destructive mt-3">{error}</p>
        )}
        <p className="text-xs text-muted-foreground mt-4">
          No spam. Unsubscribe anytime. We respect your privacy.
        </p>
      </div>
    </section>
  );
};

export default NewsletterSignup;
