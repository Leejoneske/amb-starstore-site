import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, CheckCircle2 } from "lucide-react";

const NewsletterSignup = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // Placeholder — no real DB save yet
    console.log("Newsletter signup:", email);
    setSubmitted(true);
    setEmail("");
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
        <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto" style={{ textWrap: "pretty" }}>
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
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 h-12"
            />
            <Button type="submit" size="lg" className="h-12 px-8 active:scale-[0.97] transition-transform">
              Subscribe
            </Button>
          </form>
        )}
        <p className="text-xs text-muted-foreground mt-4">
          No spam. Unsubscribe anytime. We respect your privacy.
        </p>
      </div>
    </section>
  );
};

export default NewsletterSignup;
