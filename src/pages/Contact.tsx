import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Send, CheckCircle2, Loader2, ArrowLeft, MessageCircle } from "lucide-react";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";

const subjectOptions = [
  "General Inquiry",
  "Ambassador Application",
  "Payout Issue",
  "Technical Support",
  "Opt-Out Request",
  "Partnership Proposal",
  "Report Abuse",
  "Other",
];

const Contact = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", subject: "General Inquiry", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!supabase) {
      setError("Contact form is temporarily unavailable. Please email us directly at support@starstore.app");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error: fnError } = await supabase.functions.invoke("send-contact-email", {
        body: {
          name: form.name.trim(),
          email: form.email.trim(),
          subject: form.subject,
          message: form.message.trim(),
        },
      });

      if (fnError) throw fnError;
      setSent(true);
    } catch (err) {
      console.error("Contact form error:", err);
      setError("Failed to send message. Please try again or email us directly at support@starstore.app");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-28 pb-20 md:pt-36 md:pb-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Guide
          </button>

          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-6">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <h1
              className="text-3xl md:text-4xl font-bold text-foreground mb-4"
              style={{ fontFamily: "'Libre Baskerville', serif", lineHeight: 1.15 }}
            >
              Contact Us
            </h1>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto">
              Have a question, concern, or need help? Reach out to our support team and we'll get back to you as soon as possible.
            </p>
          </div>

          {/* Quick contact info */}
          <div className="grid sm:grid-cols-2 gap-4 mb-10">
            <div className="bg-card border border-border rounded-xl p-5 text-center">
              <Mail className="w-5 h-5 text-primary mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-foreground mb-1">Email Us</h3>
              <a href="mailto:support@starstore.app" className="text-sm text-primary hover:underline">
                support@starstore.app
              </a>
            </div>
            <div className="bg-card border border-border rounded-xl p-5 text-center">
              <MessageCircle className="w-5 h-5 text-primary mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-foreground mb-1">Telegram</h3>
              <a href="https://t.me/TgStarStore_bot" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                Open Telegram Bot
              </a>
            </div>
          </div>

          {!isSupabaseConfigured && (
            <div className="mb-8 rounded-xl border border-border bg-secondary/60 px-4 py-3 text-sm text-muted-foreground">
              The contact form is disabled until the Supabase environment variables are configured in deployment.
            </div>
          )}

          {sent ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center animate-fade-in">
              <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: "'Libre Baskerville', serif" }}>
                Message Sent!
              </h2>
              <p className="text-muted-foreground mb-6">
                Thank you for reaching out. Our team will respond to your email within 1–3 business days.
              </p>
              <Button variant="outline" onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "General Inquiry", message: "" }); }}>
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
                  Your Name <span className="text-destructive">*</span>
                </label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  required
                  maxLength={100}
                  className="h-11"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                  Your Email <span className="text-destructive">*</span>
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  maxLength={255}
                  className="h-11"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-1.5">
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {subjectOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1.5">
                  Message <span className="text-destructive">*</span>
                </label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Describe your question or concern..."
                  value={form.message}
                  onChange={handleChange}
                  required
                  maxLength={2000}
                  rows={6}
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">{form.message.length}/2000</p>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button type="submit" size="lg" className="w-full h-12" disabled={loading || !isSupabaseConfigured}>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Your message will be sent to our support team at support@starstore.app. We typically respond within 1–3 business days.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <p className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Libre Baskerville', serif" }}>
            StarStore Ambassador Program
          </p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} StarStore. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Contact;
